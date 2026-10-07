'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, MailCheck, ShieldCheck } from 'lucide-react'
import { authService } from '@/lib/services/authService'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { authErrorCleared, googleSignInRequested } from '@/store/auth/slice'
import { confirmUser, resendCode, resetSignup, startConfirmation, submitUser } from './store/slice'
import { AuthCard, AuthDivider } from '@/components/auth/auth-card'
import { FormField, PasswordInput, PasswordStrength } from '@/components/auth/form-field'
import { GoogleButton } from '@/components/auth/google-button'
import { Button, buttonStyles } from '@/components/shared/button'
import { EMAIL_PATTERN, useRedirectIfAuthenticated } from '@/components/auth/use-auth-redirect'
import { CountryCombobox } from '@/components/auth/country-combobox'
import { detectCountryCode, findWorldCountry } from '@/lib/data/world-countries'
import { savePendingSignup } from '@/lib/auth/pending-signup'

const RESEND_COOLDOWN_S = 30

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUp />
    </Suspense>
  )
}

function SignUp() {
  // Once the saga signs the new user in, this sends them on; RequireAuth then routes new users to onboarding.
  const status = useRedirectIfAuthenticated()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const step = useAppSelector((state) => state.signup.step)

  useEffect(() => {
    dispatch(resetSignup())
    dispatch(authErrorCleared())
    const verify = searchParams.get('verify')
    if (verify && EMAIL_PATTERN.test(verify)) dispatch(startConfirmation(verify.trim().toLowerCase()))
  }, [dispatch, searchParams])

  if (status === 'authenticated') return null
  if (step === 'confirm') return <ConfirmStep />
  if (step === 'verified') return <VerifiedStep />
  return <DetailsStep />
}

// ─────────────────────────────── Step 1: details ───────────────────────────────

function DetailsStep() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { isSubmitting, isSuccess, error } = useAppSelector((state) => state.signup)
  const googlePending = useAppSelector((state) => state.auth.pending === 'google')
  const googleError = useAppSelector((state) => state.auth.error)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', country: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})

  useEffect(() => {
    if (isSuccess) router.replace('/onboarding')
  }, [isSuccess, router])

  // Pre-select the browser's region after mount (keeps server and client HTML identical).
  useEffect(() => {
    const detected = detectCountryCode()
    if (detected) setForm((current) => (current.country ? current : { ...current, country: detected }))
  }, [])

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const setCountry = (country: string) => {
    setForm((current) => ({ ...current, country }))
    if (errors.country) setErrors((current) => ({ ...current, country: undefined }))
  }

  const handleGoogle = () => {
    // Remembered across the Google redirect and sent with the new user to POST /user.
    if (findWorldCountry(form.country)) savePendingSignup({ country: form.country })
    dispatch(googleSignInRequested())
  }

  const validate = () => {
    const next: typeof errors = {}
    if (form.name.trim().length < 2) next.name = 'Tell us your name.'
    if (!form.email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(form.email)) next.email = 'That doesn’t look like a valid email.'
    if (!findWorldCountry(form.country)) next.country = 'Choose your country.'
    if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (form.confirm !== form.password) next.confirm = 'Passwords don’t match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    dispatch(submitUser({ fullName: form.name.trim(), email: form.email, country: form.country, password: form.password }))
    
  }

  const formError = error ?? googleError

  return (
    <AuthCard
      title="Create your account"
      subtitle="Two minutes to set up. A lifetime of better movie nights."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-white underline-offset-4 hover:text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {authService.googleEnabled && (
        <>
          <GoogleButton onClick={handleGoogle} loading={googlePending} disabled={isSubmitting} />
          <AuthDivider label="or sign up with email" />
        </>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
            {formError}
          </p>
        )}
        <FormField label="Full name" name="name" autoComplete="name" placeholder="Jamie Rivera" value={form.name} onChange={update('name')} error={errors.name} />
        <FormField label="Email" type="email" name="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={form.email} onChange={update('email')} error={errors.email} />
        <CountryCombobox value={form.country} onChange={setCountry} error={errors.country} disabled={isSubmitting} />
        <div className="space-y-2">
          <PasswordInput label="Password" name="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update('password')} error={errors.password} />
          <PasswordStrength password={form.password} />
        </div>
        <PasswordInput label="Confirm password" name="confirm" autoComplete="new-password" placeholder="Type it once more" value={form.confirm} onChange={update('confirm')} error={errors.confirm} />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} disabled={googlePending} trailingIcon={<ArrowRight />}>
          Create account
        </Button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-white/40">
        By creating an account you agree to our{' '}
        <Link href="#" className="text-white/70 underline-offset-4 hover:text-brand hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="text-white/70 underline-offset-4 hover:text-brand hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthCard>
  )
}

// ─────────────────────────────── Step 2: verify email ───────────────────────────────

function ConfirmStep() {
  const dispatch = useAppDispatch()
  const { form, codeDestination, codeSentAt, isSubmitting, isResending, error } = useAppSelector((state) => state.signup)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string>()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const secondsLeft = codeSentAt ? Math.max(0, RESEND_COOLDOWN_S - Math.floor((now - codeSentAt) / 1000)) : 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit code from the email.')
      return
    }
    setCodeError(undefined)
    dispatch(confirmUser({ email: form.email, code }))
  }

  return (
    <AuthCard
      title="Check your inbox"
      subtitle={
        <>
          We sent a 6-digit code to <span className="font-medium text-white">{codeDestination ?? form.email}</span>. Enter it below to verify your email.
        </>
      }
      footer={
        <button type="button" onClick={() => dispatch(resetSignup())} className="inline-flex items-center gap-1.5 font-semibold text-white underline-offset-4 hover:text-brand hover:underline">
          <ArrowLeft className="size-3.5" /> Use a different email
        </button>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="flex justify-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <MailCheck className="size-7" />
          </span>
        </div>
        {error && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
            {error}
          </p>
        )}
        <FormField
          label="Verification code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          error={codeError}
          className="text-center text-2xl font-semibold tracking-[0.6em] placeholder:tracking-[0.6em]"
          autoFocus
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} trailingIcon={<ArrowRight />}>
          Verify and continue
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-white/50">
        Didn’t get it?{' '}
        <button
          type="button"
          onClick={() => dispatch(resendCode(form.email))}
          disabled={isResending || secondsLeft > 0}
          className="font-semibold text-brand underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-white/35 disabled:no-underline"
        >
          {isResending ? 'Sending…' : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Send a new code'}
        </button>
      </p>
    </AuthCard>
  )
}

// ─────────────────────────────── Verified, log in manually ───────────────────────────────

function VerifiedStep() {
  const email = useAppSelector((state) => state.signup.form.email)
  return (
    <AuthCard title="Email verified" subtitle="Your account is ready. Log in to finish setting up MoodFlix.">
      <div className="flex flex-col items-center gap-5 py-2 text-center animate-fade-up">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <ShieldCheck className="size-7" />
        </span>
        <Link href={`/login?verified=1&email=${encodeURIComponent(email)}`} className={buttonStyles({ size: 'lg', className: 'w-full' })}>
          Log in <ArrowRight className="size-4" />
        </Link>
      </div>
    </AuthCard>
  )
}
