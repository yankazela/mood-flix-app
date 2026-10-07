export interface User {
    email: string;
    password?: string;
    fullName: string;
    country: string;
}

/** details → (Cognito emails a code) confirm → done, or verified when a manual log-in is needed. */
export type SignupStep = 'details' | 'confirm' | 'verified' | 'done';

export interface SignupState {
    form: User;
    step: SignupStep;
    /** Masked address the verification code was sent to, e.g. "j***@g***". */
    codeDestination?: string;
    details?: UserDetails;
    error?: string;
    isSubmitting: boolean;
    isResending: boolean;
    /** Epoch ms of the last code (re)send, used for the resend cooldown. */
    codeSentAt?: number;
    isSuccess: boolean;
}

export interface ConfirmUserPayload {
    email: string;
    code: string;
}

export interface NeedsConfirmationPayload {
    email: string;
    destination?: string;
    sentAt: number;
}

/** Body of POST /user. Never includes the password: Cognito owns credentials. */
export interface CreateUserRequest {
    userId: string;
    email: string;
    fullName: string;
    provider: AuthProvider;
    /** ISO 3166-1 alpha-2, upper-case (e.g. "CA"). Absent if the user never chose one. */
    country?: string;
}

export interface UserResponse {
  user: User;
}

export interface UserDetails {
    userId: string;
    email: string;
    fullName: string;
    provider: AuthProvider;
    country: string;
    services: string[];
    ratingsAllowed: string[];
    genrePrefs: GenrePreferences;
    votes: Record<string, unknown>;
    createdAt: string;
    dailyCount: number;
    fullyOnboarded: boolean;
}

export interface AuthTokens {
    idToken: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}

export interface UpdateUserRequest {
    fullName?: string;
    country?: string;
    services?: string[];
    ratingsAllowed?: string[];
    genrePrefs?: Record<string, number>;
}

export interface AuthResponse {
    outcome: 'authenticated';
    tokens: AuthTokens;
    user: UserDetails;
}

export type AuthProvider = 'cognito' | 'google' | 'apple';

export interface GenrePreferences {
  [genre: string]: number;
}
