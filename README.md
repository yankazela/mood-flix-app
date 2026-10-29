# UpMyMood

Tell us how you feel. We'll find the perfect movie for this moment.

UpMyMood is a cinematic, mood-driven movie discovery app. Users describe their evening in plain language ("Long day at work, I want something funny and easy to watch"), optionally tap a few mood chips, and get a personalised, explainable catalog of movies available on the streaming services they already pay for.

This repository is the front-end. It talks to the serverless MoodFlix API (`../MovieMood`): sign-in, the recommendation engine, the catalogue, search, history and each user's library all come from it. Nothing is mocked.

## Running it

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev
```

Open http://localhost:3000, sign up, and walk through onboarding.

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
  api/requests/      axios helpers: bearer token, silent refresh on expiry, one retry on 401
components/
  movies/            MovieCard, MovieRow, MovieCatalog, MovieGrid, MovieDetails(+Modal),
                     RecommendationReason, badges, PosterImage
  discover/          HeroSection, PromptInput, MoodSelector, ObjectiveToggle, FiltersPanel, LoadingRecommendations, IdleShowcase
  feedback/          FeedbackPanel
  layout/            Header, UserMenu, MobileNav, SearchOverlay, RequireAuth, AppShell
  auth/, onboarding/, shared/
lib/
  types/             Movie, StreamingProvider, UserMood, Recommendation, RecommendationRequest/Response, UserPreference, HistoryEntry …
  api/               Typed client for the MoodFlix API: types (the wire format), adapters (API item -> Movie),
                     movies, recommendations, user
  auth/              Session storage, token refresh
  data/              Streaming providers (with their catalogue slugs), moods, genres, countries, poster-wall backdrop
  services/          authService (Cognito via Amplify, plus the backend sign-in)
  store/             React contexts: auth, preferences (from the profile), library (saved/liked/watched/history), discovery
  hooks/             useMovieActions, useAsync, useScrollLock, useMediaQuery
```

Business logic lives in `lib/`; components in `components/` are presentational and talk to the contexts and `lib/api` only.

### Backend integration

Set `NEXT_PUBLIC_API_BASE_URL` (the API Gateway stage URL ending in `/api/v1/movie-mood`) and `NEXT_PUBLIC_POSTERS_BASE_URL` (the `PostersBaseUrl` stack output) in `.env.local`; both have defaults for the `dev` stage.

| Feature | API call | Where |
| --- | --- | --- |
| Sign in / sign up | `POST /auth/signin`, `POST /user` | `store/auth`, `app/(auth)/signup/store` |
| Session renewal | `POST /auth/refresh` | `lib/auth/token-refresh.ts` (before expiry, and on a 401) |
| Profile, services, genres, rating, country | `GET /user/me`, `PATCH /user` | onboarding, `preferences-context` |
| Recommendations | `POST /recommendations` | `discovery-context` |
| Saved, liked, watched, ratings | `PATCH /user` (`myMovies`, `votes`, `watched`, `ratings`) | `library-context` |
| History and per-request outcome | `GET /recommendations/history`, `PATCH /recommendations/{requestId}` | `library-context`, History page |
| Search | `GET /movies/search` | `SearchOverlay` |
| Popular / top rated rows | `GET /movies/popular` | `IdleShowcase` |
| Movie page, library hydration | `GET /movies/{itemId}`, `GET /movies?ids=` | `/movie/[id]`, `library-context` |

Library changes apply on screen first and are saved in order in the background; if a save fails the library reloads from the server and a toast says so.

### Recommendation contract

`POST /recommendations` (country, streaming services, content rating and taste come from the saved profile)

```json
{
  "text": "I had a stressful day. I want something funny and easy to watch.",
  "objective": "keep",
  "moods": ["stressed", "tired"],
  "mediaTypes": ["movie", "documentary"],
  "maxRuntimeMin": 120,
  "genres": ["comedy"],
  "releaseYearMin": 2010,
  "minRating": 7,
  "language": "en",
  "services": ["netflix"]
}
```

`objective` is `keep` (match the mood) or `improve` (lift it); the Discover page exposes it as a toggle. The reply holds `requestId`, the model's `moodProfile`, and up to eight `results` with `why`, `matchScore`, `availability`, `rating` and `details`. `lib/api/adapters.ts` turns it into a `RecommendationResponse`: the first three results are the top picks, the rest form a row. A `422` carries a supportive message (shown without a retry), a `429` means the daily limit was reached, and `notice: "few_matches"` is surfaced as a banner.

## Authentication (Cognito + Google)

Auth state lives in Redux (`store/auth`, `app/(auth)/signup/store`) and is driven by redux-saga. Email sign-in and sign-up go through the MoodFlix API (`POST /auth/signin`, `POST /user`); Google goes through Cognito's Hosted UI (`CognitoAuthProvider`, AWS Amplify v6) and the saga then loads the profile with `GET /user/me`. The id, access and refresh tokens are stored by `lib/auth/backend-session.ts`; `lib/auth/token-refresh.ts` renews them a minute before they expire, and signs the user out if the refresh token is rejected.

Copy `.env.example` to `.env.local` and fill it in. Values are inlined at build time, so restart `pnpm dev` or rebuild after changing them.

**Flows**

| Flow | What happens |
| --- | --- |
| Email sign-up | `submitUser` → Cognito `SignUp` → 6-digit code step → `confirmUser` → auto sign-in → `POST /user` → onboarding |
| Unverified log-in | Login shows a banner linking to `/signup?verify=<email>`, which resends the code |
| Google | `googleSignInRequested` → Cognito Hosted UI → Google → `/auth/callback` → Amplify exchanges the code → `POST /user` → onboarding for new users |
| Sign-out | `signOutRequested` → Cognito sign-out → `RequireAuth` returns the user to `/login` |

After Cognito creates the identity, the saga registers the user with the MoodFlix backend (`POST /user` on `EbaseUrls.MOOD_BE`) with the Cognito ID token as `Authorization: Bearer`. For Google the body is `{ userId, email, fullName, provider, country }`, where `country` is the ISO 3166-1 alpha-2 code picked on the sign-up page (e.g. `"CA"`), carried across the redirect in localStorage. The email form sends `country` in its `submitUser` payload. A backend failure is logged and stored in `state.auth.profileError` but does not block sign-in. Because it runs after every Google sign-in, the endpoint should behave as an upsert.

**Google in the iOS and Android apps.** Google refuses to sign people in inside an embedded WebView, and the
app's origin there (`https://localhost` on Android, `capacitor://localhost` on iOS) never matches a web callback
URL. So in the apps `lib/auth/native-oauth.ts` opens the Hosted UI in the system browser (a Custom Tab or
SFSafariViewController) with PKCE, Cognito sends the browser back to `upmymood://auth/callback`, the `appUrlOpen`
event delivers that URL, and the app exchanges the code at `/oauth2/token` itself. The tokens become the same backend
session a password sign-in creates. The scheme is registered in `AndroidManifest.xml` and `Info.plist`, and
`upmymood://auth/callback` must be among the app client's callback URLs (the auth stack in `../MovieMood` lists it).
Closing the browser without finishing clears the spinner; nothing is reported.

**AWS setup**

1. **User pool**: sign-in with email, email as a required attribute, `name` enabled as a standard attribute, verification by email code.
2. **App client**: public client with **no client secret**. Auth flows: `ALLOW_USER_SRP_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH` (and `ALLOW_USER_AUTH` if enabled in your pool).
3. **Domain**: add a Cognito or custom domain; this is `NEXT_PUBLIC_COGNITO_DOMAIN`.
4. **Google**: create an OAuth client in Google Cloud with authorized redirect URI `https://<your-cognito-domain>/oauth2/idpresponse`. Add Google as an identity provider in the pool (scopes `openid email profile`) and map `email → email`, `name → name`, `picture → picture`.
5. **Hosted UI on the app client**: enable Google and the Cognito user pool as identity providers, OAuth grant *Authorization code*, scopes `openid email profile`, callback URL `http://localhost:3000/auth/callback` (plus production), sign-out URL `http://localhost:3000/login` (plus production).

## Subscriptions

Two plans: **Free** (2 recommendation requests a day) and **Advanced** (15 a day, a monthly subscription). The
backend owns the plan and the daily counter; the app only sells and displays.

| Piece | Where |
| --- | --- |
| Plan, usage, paywall state, purchase/restore/sync | `lib/store/billing-context.tsx` (`useBilling`) |
| Store SDK (RevenueCat) behind a small adapter; no-op on the web | `lib/billing/store.ts` |
| Env, entitlement id, legal links, plan limits for the comparison | `lib/billing/config.ts` |
| Paywall sheet, usage pill, plan badge | `components/billing/` |
| `POST /billing/sync` after a purchase or restore | `lib/api/billing.ts` |

**How it flows**

1. After sign-in the store SDK is identified with the Cognito `sub` (`Purchases.logIn`), which is how the backend's
   webhook matches purchases to profiles. Sign-out detaches it.
2. The profile from `GET /user/me` carries `plan` and `usage`; every `POST /recommendations` answer carries `usage` too,
   and a `429` carries the plan, the limit and `resetsAt`. The usage pill under the prompt and the user menu read from
   these, so the count is right without reloading the profile.
3. Over the cap on the free plan, the Discover page offers the upgrade. The paywall buys through the App Store or
   Google Play, then calls `POST /billing/sync` so the profile flips to Advanced at once (the webhook catches up
   regardless). The paywall also restores purchases and shows the price from the store, the renewal terms and the
   Terms and Privacy links, which App Review checks for.
4. On the web the paywall explains that subscribing happens in the apps; the plan follows the account.

**Setup**

1. In RevenueCat, create the project with the iOS and Android apps, the entitlement `advanced`, a monthly product
   attached to it (App Store Connect and Google Play Console each need the product too) and a default offering with
   that package. Copy the public SDK keys into `NEXT_PUBLIC_REVENUECAT_IOS_KEY` and `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY`.
2. Set `NEXT_PUBLIC_PRIVACY_URL` (and `NEXT_PUBLIC_TERMS_URL` if you have your own terms). Apple rejects paywalls
   without both links.
3. `pnpm mobile` builds and syncs the native projects. In Xcode, add the **In-App Purchase** capability to the App
   target; on Android the plugin adds the billing permission itself.
4. Test with a sandbox tester (App Store Connect → Users and Access → Sandbox) or a StoreKit configuration file, and
   with Google Play licence testers. A promotional grant from the RevenueCat dashboard also flips the plan, which is
   the quickest way to see the Advanced state.

## Design

Dark, cinematic, poster-first. Lime (`--color-brand`) is the only accent. Tokens live in `app/globals.css`; motion uses the `fade-up`, `scale-in`, `shimmer` and `drift` keyframes with a reduced-motion fallback. Cards use 2:3 posters, hover lift + gradient + quick actions on pointer devices, and a bottom tab bar on phones for one-handed use.
