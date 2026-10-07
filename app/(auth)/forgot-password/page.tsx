'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, MailCheck } from 'lucide-react'
import { authService, AuthError } from '@/lib/services/authService'
import { AuthCard } from '@/components/auth/auth-card'
import { FormField } from '@/components/auth/form-field'
import { Button } from '@/components/shared/button'
import { EMAIL_PATTERN } from '@/components/auth/use-auth-redirect'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!EMAIL_PATTERN.test(email)) {
      setError('Enter the email you signed up with.')
      return
    }
    setPending(true)
    setError(undefined)
    try {
      await authService.requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard
      title={sent ? 'Check your inbox' : 'Reset your password'}
      subtitle={sent ? `We sent a reset link to ${email}. It expires in 30 minutes.` : 'Enter your email and we’ll send you a link to get back in.'}
      footer={
        <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-white underline-offset-4 hover:text-brand hover:underline">
          <ArrowLeft className="size-3.5" /> Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center animate-fade-up">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <MailCheck className="size-7" />
          </span>
          <p className="text-sm text-white/55">Didn’t get it? Check your spam folder, or</p>
          <Button variant="secondary" onClick={() => setSent(false)}>
            Try a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Email" type="email" name="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" size="lg" fullWidth loading={pending} trailingIcon={<ArrowRight />}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
