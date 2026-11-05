'use client'

import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
    if (!email.trim()) next.email = t('auth.validation.emailRequired')
    else if (!EMAIL_PATTERN.test(email)) next.email = t('auth.validation.emailInvalid')
    if (!password) next.password = t('auth.validation.passwordRequired')
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    dispatch(signInRequested({ email, password, remember }))
  }

  const handleGoogleSignIn = () => {
    dispatch(googleSignInRequested())
  }

  const useDemo = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setFieldErrors({})
  }

  if (status === 'authenticated') return null

  return (
    <AuthCard
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.login.newHere')}{' '}
          <Link href="/signup" className="font-semibold text-white underline-offset-4 hover:text-brand hover:underline">
            {t('auth.login.createAccount')}
          </Link>
        </>
      }
    >
      {authService.googleEnabled && (
        <>
          <GoogleButton onClick={handleGoogleSignIn} loading={pending === 'google'} disabled={pending === 'password'} />
          <AuthDivider label={t('auth.login.orEmail')} />
        </>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {justVerified && !formError && !unconfirmedEmail && (
          <p role="status" className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand animate-fade-in">
            {t('auth.login.verified')}
          </p>
        )}
        {unconfirmedEmail && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200 animate-fade-in">
            <MailWarning className="mt-0.5 size-4 shrink-0" />
            <p>
              {t('auth.login.unverified')}{' '}
              <Link href={`/signup?verify=${encodeURIComponent(unconfirmedEmail)}`} className="font-semibold text-white underline underline-offset-4">
                {t('auth.login.sendNewCode')}
              </Link>
            </p>
          </div>
        )}
        {formError && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
            {formError}
          </p>
        )}
        <FormField label={t('auth.fields.email')} type="email" name="email" autoComplete="email" inputMode="email" placeholder={t('auth.fields.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
        <PasswordInput
          label={t('auth.fields.password')}
          name="password"
          autoComplete="current-password"
          placeholder={t('auth.fields.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint={
            <Link href="/forgot-password" className="text-brand underline-offset-4 hover:underline">
              {t('auth.login.forgot')}
            </Link>
          }
        />
        <label className="flex cursor-pointer items-center gap-3 text-sm text-white/70">
          <span className="relative flex size-5 items-center justify-center">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer sr-only" />
            <span className={cn('absolute inset-0 rounded-md border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-brand/70', remember ? 'border-brand bg-brand' : 'border-white/20 bg-white/4')} aria-hidden />
            {remember && <Check className="relative size-3.5 text-brand-foreground" strokeWidth={3} aria-hidden />}
          </span>
          {t('auth.login.remember')}
        </label>
        <Button type="submit" size="lg" fullWidth loading={pending === 'password'} disabled={pending === 'google'} trailingIcon={<ArrowRight />}>
          {t('auth.login.submit')}
        </Button>
      </form>

      {authService.kind === 'mock' && (
        <button type="button" onClick={useDemo} className="mt-5 w-full rounded-xl border border-dashed border-white/12 px-4 py-2.5 text-xs text-white/45 transition hover:border-brand/40 hover:text-white">
          {t('auth.login.demo')} <span className="font-semibold text-brand">{t('auth.login.demoCta')}</span>
        </button>
      )}
    </AuthCard>
  )
}
