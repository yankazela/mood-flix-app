# MoodFlix

Tell us how you feel. We'll find the perfect movie for this moment.

MoodFlix is a cinematic, mood-driven movie discovery app. Users describe their evening in plain language ("Long day at work, I want something funny and easy to watch"), optionally tap a few mood chips, and get a personalised, explainable catalog of movies available on the streaming services they already pay for.

This repository is the MVP front-end. Authentication, the recommendation engine and the catalog are **mocked** but structured behind service interfaces so TMDB, an AI provider and a real auth provider can be dropped in without touching the UI.

## Running it

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Use the **demo account** (`demo@moodflix.app` / `moodflix`) to see a pre-populated library and history, or sign up to walk through onboarding.

Type-check with `pnpm exec tsc --noEmit`.

## Screens

| Route | Screen |
| --- | --- |
| `/login`, `/signup`, `/forgot-password` | Auth pages on a drifting poster-wall background |
| `/onboarding` | Three steps: streaming services + country, favourite genres, maximum content rating |
| `/` | Discover: mood prompt, quick moods, filters, loading experience, recommendation catalog |
| `/my-movies` | Saved / Liked / Watched |
| `/history` | Every past request with moods, recommendations, selection and feedback |
| `/movie/[id]` | Deep-linkable movie details page (the same view opens as a modal from any card) |

## Architecture

```
app/
  (auth)/            Login, sign up, forgot password  (route group, no app chrome)
  (app)/             Discover, My Movies, History, Movie page  (wrapped in AppShell)
  onboarding/        Streaming services + region
  api/recommendations/route.ts   POST endpoint: the only place the engine (and later AI/TMDB keys) run
components/
  movies/            MovieCard, MovieRow, MovieCatalog, MovieGrid, MovieDetails(+Modal),
                     EmotionalProfile, RecommendationReason, badges, PosterImage
  discover/          HeroSection, PromptInput, MoodSelector, FiltersPanel, LoadingRecommendations, IdleShowcase
  feedback/          FeedbackPanel
  layout/            Header, UserMenu, MobileNav, SearchOverlay, RequireAuth, AppShell
  auth/, onboarding/, shared/
lib/
  types/             Movie, MovieGenre, StreamingProvider, UserMood, EmotionalProfile,
                     Recommendation, RecommendationRequest/Response, UserPreference, HistoryEntry …
  data/              Mock catalog (real titles + real TMDB artwork paths), providers, moods, countries
  recommendation/    Pure, deterministic rules engine standing in for the AI pipeline
  services/          authService, movieService, recommendationService, libraryService
  store/             React contexts: auth, preferences, library (saved/liked/watched/history), discovery
  hooks/             useMovieActions, useScrollLock, useMediaQuery
```

Business logic lives in `lib/`; components in `components/` are presentational and talk to the contexts/services only.

### Recommendation contract

`POST /api/recommendations`

```json
{
  "prompt": "I had a stressful day. I want something funny and easy to watch.",
  "moods": ["stressed", "tired"],
  "streamingProviders": ["netflix", "prime"],
  "country": "CA",
  "favouriteGenres": ["comedy", "thriller"],
  "maxContentRating": "PG-13",
  "filters": { "maxRuntime": 120 }
}
```

```json
{
  "id": "rec_…",
  "interpretation": {
    "currentMood": ["stressed", "tired"],
    "desiredMood": ["funny", "relaxing", "easy to watch"],
    "intensity": "low",
    "cognitiveLoad": "low",
    "summary": "something funny, relaxing and easy to watch",
    "targetProfile": { "funny": 100, "comforting": 100, "exciting": 32, "dark": 0, "romantic": 30, "intensity": 0 },
    "keywords": ["funny", "relaxing", "stressed"]
  },
  "recommendations": [{ "movie": { … }, "matchScore": 97, "reason": "You said you …", "highlights": ["Under 2 hours", "On Netflix"] }],
  "sections": [{ "id": "more-for-mood", "title": "More movies for your mood", "layout": "row", "recommendations": [] }]
}
```

The route validates input and never trusts client-supplied scores. `favouriteGenres` nudge scoring and drive the "Because you like …" row; `maxContentRating` is a hard ceiling (G < PG < PG-13 < R) that only relaxes when the catalog would otherwise return fewer than six titles. No API keys exist in the client bundle; when TMDB/AI are wired up they stay in this route via `process.env`.

## Authentication (Cognito + Google)

Auth state lives in Redux (`store/auth`, `app/(auth)/signup/store`) and is driven by redux-saga. Sagas only call the `AuthProvider` interface in `lib/services/auth-types.ts`:

- **No Cognito env vars** → the built-in mock provider (demo account, no email verification).
- **Cognito env vars set** → `CognitoAuthProvider` (AWS Amplify v6).

Copy `.env.example` to `.env.local` and fill it in. Values are inlined at build time, so restart `pnpm dev` or rebuild after changing them.

**Flows**

| Flow | What happens |
| --- | --- |
| Email sign-up | `submitUser` → Cognito `SignUp` → 6-digit code step → `confirmUser` → auto sign-in → `POST /user` → onboarding |
| Unverified log-in | Login shows a banner linking to `/signup?verify=<email>`, which resends the code |
| Google | `googleSignInRequested` → Cognito Hosted UI → Google → `/auth/callback` → Amplify exchanges the code → `POST /user` → onboarding for new users |
| Sign-out | `signOutRequested` → Cognito sign-out → `RequireAuth` returns the user to `/login` |

After Cognito creates the identity, the saga registers the user with the MoodFlix backend (`POST /user` on `EbaseUrls.MOOD_BE`) with the Cognito ID token as `Authorization: Bearer`. For Google the body is `{ userId, email, fullName, provider, country }`, where `country` is the ISO 3166-1 alpha-2 code picked on the sign-up page (e.g. `"CA"`), carried across the redirect in localStorage. The email form sends `country` in its `submitUser` payload. A backend failure is logged and stored in `state.auth.profileError` but does not block sign-in. Because it runs after every Google sign-in, the endpoint should behave as an upsert.

**AWS setup**

1. **User pool**: sign-in with email, email as a required attribute, `name` enabled as a standard attribute, verification by email code.
2. **App client**: public client with **no client secret**. Auth flows: `ALLOW_USER_SRP_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH` (and `ALLOW_USER_AUTH` if enabled in your pool).
3. **Domain**: add a Cognito or custom domain; this is `NEXT_PUBLIC_COGNITO_DOMAIN`.
4. **Google**: create an OAuth client in Google Cloud with authorized redirect URI `https://<your-cognito-domain>/oauth2/idpresponse`. Add Google as an identity provider in the pool (scopes `openid email profile`) and map `email → email`, `name → name`, `picture → picture`.
5. **Hosted UI on the app client**: enable Google and the Cognito user pool as identity providers, OAuth grant *Authorization code*, scopes `openid email profile`, callback URL `http://localhost:3000/auth/callback` (plus production), sign-out URL `http://localhost:3000/login` (plus production).

## Swapping the mocks

| Mock | Where | Replace with |
| --- | --- | --- |
| Auth | `lib/services/authService.ts` | Cognito is built in: set the env vars in `.env.example` (see Authentication above) |
| Catalog | `lib/services/movieService.ts` | Fetch from a server route that proxies TMDB (`/movie`, `/watch/providers`) |
| Engine | `lib/recommendation/engine.ts`, called from `app/api/recommendations/route.ts` | Send `prompt` + `moods` to the AI API for `MoodInterpretation`, query TMDB, keep the response shape |
| Library & preferences | `lib/services/libraryService.ts` (localStorage) | Backend persistence; the context stores keep the same interface |
| Images | `lib/tmdb.ts` | Already uses real TMDB image CDN paths, no key required |

## Design

Dark, cinematic, poster-first. Lime (`--color-brand`) is the only accent. Tokens live in `app/globals.css`; motion uses the `fade-up`, `scale-in`, `shimmer` and `drift` keyframes with a reduced-motion fallback. Cards use 2:3 posters, hover lift + gradient + quick actions on pointer devices, and a bottom tab bar on phones for one-handed use.
