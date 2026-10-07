import type { ReactNode } from 'react'
import { RequireAuth } from '@/components/layout/require-auth'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <RequireAuth requireOnboarding={false}>{children}</RequireAuth>
}
