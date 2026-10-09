'use client'
import { signInWithRedirect } from 'aws-amplify/auth';
import { Suspense, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check, MailWarning } from 'lucide-react'
import { authService, DEMO_CREDENTIALS } from '@/lib/services/authService'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { authErrorCleared, googleSignInRequested, signInRequested } from '@/store/auth/slice'
import { AuthCard, AuthDivider } from '@/components/auth/auth-card'
import { FormField, PasswordInput } from '@/components/auth/form-field'
import { GoogleButton } from '@/components/auth/google-button'
import { Button } from '@/components/shared/button'
import { EMAIL_PATTERN, useRedirectIfAuthenticated } from '@/components/auth/use-auth-redirect'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  // Redirects to `?next=` (or /) as soon as the auth slice reports a session.
  const status = useRedirectIfAuthenticated()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const { pending, error, unconfirmedEmail } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const redirectError = searchParams.get('error')
  const justVerified = searchParams.get('verified') === '1'
  const formError = error ?? redirectError

  useEffect(() => {
    dispatch(authErrorCleared())
  }, [dispatch])

  const validate = () => {
    const next: typeof fieldErrors = {}
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(email)) next.email = 'That doesn’t look like a valid email.'
    if (!password) next.password = 'Enter your password.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    dispatch(signInRequested({ email, password, remember }))
  }

  const handleGoogleSignIn = () => {
    // dispatch(googleSignInRequested())
    signInWithRedirect({ provider: 'Google' })
  }

  const useDemo = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setFieldErrors({})
  }

  if (status === 'authenticated') return null

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to pick up where your mood left off."
      footer={
        <>
          New to MoodFlix?{' '}
          <Link href="/signup" className="font-semibold text-white underline-offset-4 hover:text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {authService.googleEnabled && (
        <>
          <GoogleButton onClick={handleGoogleSignIn} loading={pending === 'google'} disabled={pending === 'password'} />
          <AuthDivider label="or log in with email" />
        </>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {justVerified && !formError && !unconfirmedEmail && (
          <p role="status" className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand animate-fade-in">
            Your email is verified. Log in to continue.
          </p>
        )}
        {unconfirmedEmail && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200 animate-fade-in">
            <MailWarning className="mt-0.5 size-4 shrink-0" />
            <p>
              You haven’t verified this email yet.{' '}
              <Link href={`/signup?verify=${encodeURIComponent(unconfirmedEmail)}`} className="font-semibold text-white underline underline-offset-4">
                Send me a new code
              </Link>
            </p>
          </div>
        )}
        {formError && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
            {formError}
          </p>
        )}
        <FormField label="Email" type="email" name="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint={
            <Link href="/forgot-password" className="text-brand underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          }
        />
        <label className="flex cursor-pointer items-center gap-3 text-sm text-white/70">
          <span className="relative flex size-5 items-center justify-center">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer sr-only" />
            <span className={cn('absolute inset-0 rounded-md border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-brand/70', remember ? 'border-brand bg-brand' : 'border-white/20 bg-white/4')} aria-hidden />
            {remember && <Check className="relative size-3.5 text-brand-foreground" strokeWidth={3} aria-hidden />}
          </span>
          Remember me on this device
        </label>
        <Button type="submit" size="lg" fullWidth loading={pending === 'password'} disabled={pending === 'google'} trailingIcon={<ArrowRight />}>
          Log in
        </Button>
      </form>

      {authService.kind === 'mock' && (
        <button type="button" onClick={useDemo} className="mt-5 w-full rounded-xl border border-dashed border-white/12 px-4 py-2.5 text-xs text-white/45 transition hover:border-brand/40 hover:text-white">
          Just exploring? <span className="font-semibold text-brand">Use the demo account</span>
        </button>
      )}
    </AuthCard>
  )
}
