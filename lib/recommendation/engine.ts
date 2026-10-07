import type {
  CountryCode,
  EmotionalAxis,
  EmotionalProfile,
  IntensityLevel,
  MoodInterpretation,
  Movie,
  MovieGenre,
  Recommendation,
  RecommendationRequest,
  RecommendationResponse,
  RecommendationSection,
  StreamingProviderId,
} from '@/lib/types'
import { MOOD_MAP } from '@/lib/data/moods'
import { PROVIDER_MAP } from '@/lib/data/providers'
import { getCountry } from '@/lib/data/countries'
import { CONTENT_RATINGS, contentRatingRank, isWithinContentRating } from '@/lib/data/content-ratings'
import { formatGenre, formatRating, formatRuntime, joinNatural } from '@/lib/format'
import { createId } from '@/lib/storage'

/**
 * Mock recommendation engine.
 *
 * This is a deterministic, rules-based stand-in for the future AI + backend
 * pipeline. It is intentionally pure (no I/O) so it can run inside the
 * `/api/recommendations` route handler today and be replaced by a call to an
 * LLM + TMDB without changing the response contract.
 */

export interface RecommendationContext {
  /** Movies the user has liked; drives the "Because you like …" section. */
  likedMovieIds?: string[]
  /** Movies the user has disliked or already watched; pushed down the ranking. */
  excludeMovieIds?: string[]
}

const AXES: EmotionalAxis[] = ['funny', 'comforting', 'exciting', 'dark', 'romantic', 'intensity']

const AXIS_WEIGHTS: Record<EmotionalAxis, number> = {
  funny: 1.2,
  comforting: 1.1,
  exciting: 1.1,
  dark: 1.4,
  romantic: 1.0,
  intensity: 1.2,
}

const NEUTRAL_PROFILE: EmotionalProfile = {
  funny: 50,
  comforting: 55,
  exciting: 50,
  dark: 25,
  romantic: 30,
  intensity: 45,
}

interface KeywordRule {
  keyword: string
  pattern: RegExp
  adjust: Partial<EmotionalProfile>
  desired?: string[]
  current?: string[]
  genres?: MovieGenre[]
  maxRuntime?: number
  cognitiveLoad?: IntensityLevel
}

const KEYWORD_RULES: KeywordRule[] = [
  {
    keyword: 'funny',
    pattern: /\b(funny|comedy|comedies|laugh|hilarious|humou?r|silly|goofy)\b/i,
    adjust: { funny: 35, dark: -15 },
    desired: ['funny'],
    genres: ['comedy'],
  },
  {
    keyword: 'relaxing',
    pattern: /\b(relax(ing|ed)?|chill|unwind|calm|easy|light|low[- ]key|mindless|cozy|cosy|comfort(ing|able)?|not too heavy|nothing heavy)\b/i,
    adjust: { comforting: 30, intensity: -30, dark: -10 },
    desired: ['relaxing', 'easy to watch'],
    cognitiveLoad: 'low',
  },
  {
    keyword: 'stressed',
    pattern: /\b(stress(ed|ful)?|long day|exhaust(ed|ing)|rough day|hard day|overwhelm(ed|ing)|burn(ed|t)[- ]out|anxious|work)\b/i,
    adjust: { comforting: 20, intensity: -20, dark: -15 },
    current: ['stressed'],
  },
  {
    keyword: 'tired',
    pattern: /\b(tired|sleepy|drained|worn out|no energy|late)\b/i,
    adjust: { comforting: 20, intensity: -25 },
    current: ['tired'],
    cognitiveLoad: 'low',
  },
  {
    keyword: 'sad',
    pattern: /\b(sad|down|blue|heartbroken|lonely|cry|crying|breakup|broke up|grief|grieving|miss(ing)? (him|her|them))\b/i,
    adjust: { comforting: 30, romantic: 10, dark: -10 },
    current: ['sad'],
    desired: ['uplifting'],
  },
  {
    keyword: 'happy',
    pattern: /\b(happy|great day|celebrat(e|ing|ion)|good mood|cheerful|excited about)\b/i,
    adjust: { funny: 20, exciting: 15 },
    current: ['happy'],
  },
  {
    keyword: 'bored',
    pattern: /\b(bored|boring|nothing to do|restless|surprise me)\b/i,
    adjust: { exciting: 30, intensity: 15 },
    current: ['bored'],
    desired: ['gripping'],
  },
  {
    keyword: 'romantic',
    pattern: /\b(romantic|romance|love story|date night|rom[- ]?com|swoon|fall in love|with my (partner|girlfriend|boyfriend|wife|husband))\b/i,
    adjust: { romantic: 45, comforting: 10 },
    desired: ['romantic'],
    genres: ['romance'],
  },
  {
    keyword: 'exciting',
    pattern: /\b(exciting|thrill(er|ers|ing)?|action|adrenaline|intense|edge of my seat|explosive|fast[- ]paced|high[- ]energy)\b/i,
    adjust: { exciting: 35, intensity: 25 },
    desired: ['thrilling'],
    genres: ['action', 'thriller'],
  },
  {
    keyword: 'dark',
    pattern: /\b(dark|scary|horror|creepy|disturbing|twisted|gritty|unsettling|terrifying)\b/i,
    adjust: { dark: 45, intensity: 20, comforting: -25, funny: -15 },
    desired: ['dark'],
    genres: ['horror', 'thriller'],
  },
  {
    keyword: 'mind-bending',
    pattern: /\b(mind[- ]?bending|twist(s|y)?|smart|clever|make me think|thought[- ]provoking|complex|sci[- ]?fi|science fiction|cerebral)\b/i,
    adjust: { intensity: 15, exciting: 10 },
    desired: ['thought-provoking'],
    genres: ['science-fiction', 'mystery'],
    cognitiveLoad: 'high',
  },
  {
    keyword: 'emotional',
    pattern: /\b(emotional|moving|heartfelt|heartwarming|tearjerker|touching|feel[- ]good|wholesome)\b/i,
    adjust: { comforting: 25, romantic: 10 },
    desired: ['heartwarming'],
  },
  {
    keyword: 'family',
    pattern: /\b(family|kids?|children|animated|animation|pixar|disney|with my (son|daughter|niece|nephew)s?)\b/i,
    adjust: { funny: 15, comforting: 20, dark: -30 },
    desired: ['family-friendly'],
    genres: ['animation', 'family'],
  },
  {
    keyword: 'short',
    pattern: /\b(short|quick|under (two|2) hours|90 min(ute)?s?|not too long|something brief)\b/i,
    adjust: {},
    maxRuntime: 115,
  },
  {
    keyword: 'epic',
    pattern: /\b(epic|big|blockbuster|spectacle|cinematic|visually stunning)\b/i,
    adjust: { exciting: 20, intensity: 10 },
    desired: ['big and cinematic'],
  },
  {
    keyword: 'mystery',
    pattern: /\b(mystery|mysteries|whodunit|detective|puzzle|murder)\b/i,
    adjust: { exciting: 15, dark: 10 },
    genres: ['mystery', 'crime'],
  },
  {
    keyword: 'nostalgic',
    pattern: /\b(nostalgi(a|c)|classic|old[- ]school|childhood|rewatch)\b/i,
    adjust: { comforting: 20 },
    desired: ['nostalgic'],
  },
  {
    keyword: 'weekend',
    pattern: /\b(friday|saturday|weekend|night out|party|movie night)\b/i,
    adjust: { exciting: 10, funny: 10 },
  },
]

const COGNITIVE_RANK: Record<IntensityLevel, number> = { low: 0, medium: 1, high: 2 }

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

/** "a comedy" / "an animation" */
function withArticle(noun: string): string {
  return `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`
}

function levelFor(value: number): IntensityLevel {
  if (value < 40) return 'low'
  if (value < 65) return 'medium'
  return 'high'
}

// ---------------------------------------------------------------------------
// Interpretation
// ---------------------------------------------------------------------------

export interface InterpretationDetails {
  interpretation: MoodInterpretation
  boostedGenres: MovieGenre[]
  maxRuntimeHint?: number
}

export function interpretRequest(request: RecommendationRequest): InterpretationDetails {
  const target: EmotionalProfile = { ...NEUTRAL_PROFILE }
  const currentMood: string[] = []
  const moodDesired: string[] = []
  const promptDesired: string[] = []
  const keywords: string[] = []
  const boostedGenres: MovieGenre[] = []
  let maxRuntimeHint: number | undefined
  let cognitiveLoad: IntensityLevel | undefined

  // 1. Blend the explicit mood chips into the target profile.
  const moods = request.moods.map((id) => MOOD_MAP[id]).filter(Boolean)
  if (moods.length > 0) {
    for (const axis of AXES) {
      const values = moods.map((mood) => mood.desired[axis]).filter((v): v is number => typeof v === 'number')
      if (values.length > 0) {
        target[axis] = values.reduce((sum, v) => sum + v, 0) / values.length
      }
    }
    for (const mood of moods) {
      currentMood.push(mood.id)
      moodDesired.push(...mood.descriptors)
    }
  }

  // 2. Parse the natural-language prompt.
  const prompt = request.prompt.trim()
  if (prompt) {
    for (const rule of KEYWORD_RULES) {
      if (!rule.pattern.test(prompt)) continue
      keywords.push(rule.keyword)
      for (const axis of AXES) {
        const delta = rule.adjust[axis]
        if (typeof delta === 'number') target[axis] = clamp(target[axis] + delta)
      }
      if (rule.current) currentMood.push(...rule.current)
      if (rule.desired) promptDesired.push(...rule.desired)
      if (rule.genres) boostedGenres.push(...rule.genres)
      if (rule.maxRuntime) maxRuntimeHint = Math.min(maxRuntimeHint ?? Infinity, rule.maxRuntime)
      if (rule.cognitiveLoad) {
        cognitiveLoad =
          !cognitiveLoad || COGNITIVE_RANK[rule.cognitiveLoad] > COGNITIVE_RANK[cognitiveLoad]
            ? rule.cognitiveLoad
            : cognitiveLoad
      }
    }
  }

  if (request.filters?.maxRuntime) {
    maxRuntimeHint = Math.min(maxRuntimeHint ?? Infinity, request.filters.maxRuntime)
  }

  const intensity = levelFor(target.intensity)
  const resolvedCognitiveLoad: IntensityLevel = cognitiveLoad ?? (intensity === 'low' ? 'low' : 'medium')

  const desired = unique([...promptDesired, ...moodDesired])
  const summary = desired.length > 0 ? `something ${joinNatural(desired.slice(0, 3))}` : 'something that fits this moment'

  return {
    interpretation: {
      currentMood: unique(currentMood),
      desiredMood: desired,
      intensity,
      cognitiveLoad: resolvedCognitiveLoad,
      summary,
      targetProfile: target,
      keywords: unique(keywords),
    },
    boostedGenres: unique(boostedGenres),
    maxRuntimeHint,
  }
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export function isAvailableOn(movie: Movie, providers: StreamingProviderId[], country: CountryCode): boolean {
  return movie.availability.some(
    (entry) => providers.includes(entry.providerId) && entry.countries.includes(country),
  )
}

export function availableProviders(movie: Movie, country: CountryCode, preferred?: StreamingProviderId[]): StreamingProviderId[] {
  const inCountry = movie.availability.filter((entry) => entry.countries.includes(country)).map((entry) => entry.providerId)
  if (!preferred || preferred.length === 0) return unique(inCountry)
  const mine = inCountry.filter((id) => preferred.includes(id))
  const others = inCountry.filter((id) => !preferred.includes(id))
  return unique([...mine, ...others])
}

function passesFilters(movie: Movie, request: RecommendationRequest): boolean {
  const filters = request.filters
  if (!filters) return true
  if (filters.maxRuntime && movie.runtimeMinutes > filters.maxRuntime) return false
  if (filters.mediaType && filters.mediaType !== 'all' && movie.mediaType !== filters.mediaType) return false
  if (filters.genres && filters.genres.length > 0 && !filters.genres.some((genre) => movie.genres.includes(genre))) return false
  if (filters.releaseYearMin && movie.releaseYear < filters.releaseYearMin) return false
  if (filters.minRating && movie.rating < filters.minRating) return false
  if (filters.providers && filters.providers.length > 0 && !isAvailableOn(movie, filters.providers, request.country)) return false
  if (filters.language && filters.language !== 'any' && movie.language !== filters.language) return false
  return true
}

function similarity(a: EmotionalProfile, b: EmotionalProfile): number {
  let weighted = 0
  let totalWeight = 0
  for (const axis of AXES) {
    weighted += Math.abs(a[axis] - b[axis]) * AXIS_WEIGHTS[axis]
    totalWeight += AXIS_WEIGHTS[axis]
  }
  return 100 - weighted / totalWeight
}

export function scoreMovie(
  movie: Movie,
  details: InterpretationDetails,
  request: RecommendationRequest,
  context: RecommendationContext = {},
): number {
  const { interpretation, boostedGenres, maxRuntimeHint } = details
  let score = similarity(movie.emotionalProfile, interpretation.targetProfile)

  // Genre intent from the prompt.
  const genreHits = boostedGenres.filter((genre) => movie.genres.includes(genre)).length
  score += Math.min(genreHits * 6, 12)

  // Standing taste: genres the user told us they love at onboarding.
  const favouriteHits = (request.favouriteGenres ?? []).filter((genre) => movie.genres.includes(genre)).length
  score += Math.min(favouriteHits * 4, 8)

  // Content rating ceiling. Normally a hard filter; only reached here when the
  // pool was too small and we had to fall back to the whole catalog.
  if (!isWithinContentRating(movie.contentRating, request.maxContentRating)) score -= 30

  // Quality signal.
  score += (movie.rating - 7) * 4

  // Runtime vs. energy.
  if (maxRuntimeHint && movie.runtimeMinutes > maxRuntimeHint) score -= 12
  if (interpretation.intensity === 'low' && movie.runtimeMinutes > 140) score -= 8
  if (interpretation.cognitiveLoad === 'low' && movie.tags.includes('demanding')) score -= 10

  // Availability on the user's services in their country.
  if (request.streamingProviders.length > 0) {
    score += isAvailableOn(movie, request.streamingProviders, request.country) ? 5 : -18
  }

  // Personal history.
  if (context.excludeMovieIds?.includes(movie.id)) score -= 25
  if (context.likedMovieIds?.includes(movie.id)) score -= 6 // already loved it; favour discovery

  return score
}

/** Map a raw score onto a believable 0–99 "match" percentage. */
function toMatchPercent(score: number, best: number): number {
  const relative = best > 0 ? score / best : 0
  return clamp(Math.round(62 + relative * 35), 38, 99)
}

// ---------------------------------------------------------------------------
// Copywriting
// ---------------------------------------------------------------------------

const AXIS_ADJECTIVES: Record<EmotionalAxis, string> = {
  funny: 'genuinely funny',
  comforting: 'warm and comforting',
  exciting: 'fast-paced and exciting',
  dark: 'dark and atmospheric',
  romantic: 'tender and romantic',
  intensity: 'intense',
}

const CURRENT_MOOD_PHRASES: Record<string, string> = {
  stressed: 'had a stressful day',
  tired: 'were feeling tired',
  sad: 'were feeling a little down',
  happy: 'were in a great mood',
  bored: 'were bored',
  romantic: 'were in a romantic mood',
  excited: 'wanted a big night',
  relax: 'needed to unwind',
}

function describeMovie(movie: Movie): string {
  const profile = movie.emotionalProfile
  const ranked = AXES.filter((axis) => axis !== 'intensity')
    .map((axis) => ({ axis, value: profile[axis] }))
    .filter(({ value }) => value >= 60)
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map(({ axis }) => AXIS_ADJECTIVES[axis])
  if (profile.intensity <= 35) ranked.push('easy to follow')
  else if (profile.intensity >= 75) ranked.push('relentlessly intense')
  return ranked.length > 0 ? joinNatural(ranked) : 'beautifully made'
}

export function buildReason(movie: Movie, interpretation: MoodInterpretation, request: RecommendationRequest): string {
  const sentences: string[] = []
  const currentPhrases = interpretation.currentMood.map((mood) => CURRENT_MOOD_PHRASES[mood]).filter(Boolean)

  if (currentPhrases.length > 0) {
    sentences.push(`You said you ${joinNatural(currentPhrases.slice(0, 2))} and wanted ${interpretation.summary}.`)
  } else {
    sentences.push(`You asked for ${interpretation.summary}.`)
  }

  const runtimePhrase =
    movie.runtimeMinutes <= 110
      ? `clocks in at a breezy ${formatRuntime(movie.runtimeMinutes)}`
      : movie.runtimeMinutes >= 150
        ? `gives you a full ${formatRuntime(movie.runtimeMinutes)} to sink into`
        : `runs ${formatRuntime(movie.runtimeMinutes)}`
  const genreLabel = movie.genres.slice(0, 2).map((genre) => formatGenre(genre).toLowerCase()).join(' ')
  sentences.push(
    `${movie.title} is ${describeMovie(movie)}, ${runtimePhrase}, and is rated ${formatRating(movie.rating)} by viewers who enjoy ${genreLabel} films.`,
  )

  const favourite = (request.favouriteGenres ?? []).find((genre) => movie.genres.includes(genre))
  if (favourite) {
    sentences.push(`It's also ${withArticle(formatGenre(favourite).toLowerCase())} film, one of the genres you told us you love.`)
  }

  const providers = availableProviders(movie, request.country, request.streamingProviders)
  if (providers.length > 0) {
    const country = getCountry(request.country)
    const onMine = request.streamingProviders.includes(providers[0])
    sentences.push(
      onMine
        ? `It's streaming on ${PROVIDER_MAP[providers[0]].name}, which you already have.`
        : `It's available on ${PROVIDER_MAP[providers[0]].name} in ${country.name}.`,
    )
  }

  return sentences.join(' ')
}

function buildHighlights(movie: Movie, request: RecommendationRequest): string[] {
  const highlights: string[] = []
  if (movie.runtimeMinutes < 120) highlights.push('Under 2 hours')
  if (movie.rating >= 8) highlights.push('Critically loved')
  const providers = availableProviders(movie, request.country, request.streamingProviders)
  if (providers.length > 0) highlights.push(`On ${PROVIDER_MAP[providers[0]].shortName}`)
  const favourite = (request.favouriteGenres ?? []).find((genre) => movie.genres.includes(genre))
  if (favourite) highlights.push(`${formatGenre(favourite)}, a favourite of yours`)
  const tag = movie.tags.find((t) => !['demanding'].includes(t))
  if (tag) highlights.push(tag.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()))
  return highlights.slice(0, 4)
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

export function recommend(
  request: RecommendationRequest,
  catalog: Movie[],
  context: RecommendationContext = {},
): RecommendationResponse {
  const details = interpretRequest(request)
  const { interpretation } = details

  // Respect the content-rating ceiling. If it leaves too few titles, relax it
  // one rung at a time (G → PG → PG-13 → R) rather than opening the whole catalog.
  const MIN_POOL = 6
  let withinRating = catalog.filter((movie) => isWithinContentRating(movie.contentRating, request.maxContentRating))
  if (withinRating.length < MIN_POOL && request.maxContentRating) {
    for (const rung of CONTENT_RATINGS.filter((r) => r.rank > contentRatingRank(request.maxContentRating!))) {
      withinRating = catalog.filter((movie) => isWithinContentRating(movie.contentRating, rung.id))
      if (withinRating.length >= MIN_POOL) break
    }
  }
  const eligible = withinRating.filter((movie) => passesFilters(movie, request))
  const pool = eligible.length >= MIN_POOL ? eligible : withinRating

  const scored = pool
    .map((movie) => ({ movie, score: scoreMovie(movie, details, request, context) }))
    .sort((a, b) => b.score - a.score)

  const best = scored[0]?.score ?? 1

  const toRecommendation = ({ movie, score }: { movie: Movie; score: number }): Recommendation => ({
    movie,
    matchScore: toMatchPercent(score, best),
    reason: buildReason(movie, interpretation, request),
    highlights: buildHighlights(movie, request),
  })

  const ranked = scored.map(toRecommendation)
  const topPicks = ranked.slice(0, 3)
  const topIds = new Set(topPicks.map((rec) => rec.movie.id))
  const rest = ranked.filter((rec) => !topIds.has(rec.movie.id))

  const sections: RecommendationSection[] = []
  const ROW_SIZE = 8

  // Each row should add something new. Track what has been shown and only
  // fall back to overlap when a pool is too small to fill a row on its own.
  const shown = new Set<string>(topIds)
  const MIN_FRESH = 3
  const take = (pool: Recommendation[]): { picked: Recommendation[]; fresh: number } => {
    const fresh = pool.filter((rec) => !shown.has(rec.movie.id))
    const repeats = pool.filter((rec) => shown.has(rec.movie.id) && !topIds.has(rec.movie.id))
    const picked = [...fresh, ...repeats].slice(0, ROW_SIZE)
    const freshCount = picked.filter((rec) => fresh.includes(rec)).length
    picked.forEach((rec) => shown.add(rec.movie.id))
    return { picked, fresh: freshCount }
  }

  sections.push({
    id: 'more-for-mood',
    title: 'More movies for your mood',
    subtitle: `Strong matches for ${interpretation.summary}.`,
    layout: 'row',
    recommendations: take(rest).picked,
  })

  // "Because you like …" — derived from liked history, falling back to the top pick.
  const likedGenres = (context.likedMovieIds ?? [])
    .map((id) => catalog.find((movie) => movie.id === id))
    .flatMap((movie) => movie?.genres ?? [])
  const genreCounts = new Map<MovieGenre, number>()
  for (const genre of likedGenres) genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1)
  const genreCandidates: MovieGenre[] = unique([
    ...Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre),
    ...(request.favouriteGenres ?? []),
    ...(topPicks[0]?.movie.genres ?? []),
  ])
  for (const favouriteGenre of genreCandidates) {
    const pool = ranked.filter((rec) => rec.movie.genres.includes(favouriteGenre))
    if (pool.filter((rec) => !shown.has(rec.movie.id)).length < MIN_FRESH) continue
    const byGenre = take(pool)
    sections.push({
      id: `because-${favouriteGenre}`,
      title: `Because you like ${formatGenre(favouriteGenre).toLowerCase()}`,
      subtitle: (request.favouriteGenres ?? []).includes(favouriteGenre) ? 'One of the genres you told us you love.' : 'Picked from what you’ve enjoyed before.',
      layout: 'row',
      recommendations: byGenre.picked,
    })
    break
  }

  const easy = take(ranked.filter((rec) => rec.movie.emotionalProfile.intensity <= 40 && rec.movie.runtimeMinutes <= 125))
  if (easy.fresh >= MIN_FRESH) {
    sections.push({
      id: 'easy-watches',
      title: 'Easy watches',
      subtitle: 'Low effort, high comfort. Nothing that demands your full attention.',
      layout: 'row',
      recommendations: easy.picked,
    })
  }

  const popular = take([...ranked].sort((a, b) => b.movie.popularity - a.movie.popularity))
  sections.push({
    id: 'popular-tonight',
    title: 'Popular tonight',
    subtitle: `What people in ${getCountry(request.country).name} are watching right now.`,
    layout: 'row',
    recommendations: popular.picked,
  })

  return {
    id: createId('rec'),
    createdAt: new Date().toISOString(),
    interpretation,
    recommendations: ranked.slice(0, 12),
    sections,
  }
}
