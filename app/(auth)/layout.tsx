import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { PosterWall } from '@/components/auth/poster-wall'
import { Logo } from '@/components/shared/logo'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-ink">
      <PosterWall />
      <div className="relative z-10 mx-auto grid min-h-dvh max-w-[1400px] lg:grid-cols-[1.1fr_1fr]">
        <aside className="hidden flex-col justify-between p-12 lg:flex xl:p-16">
          <Logo size="lg" href="" />
          <div className="max-w-lg animate-fade-up">
            <p className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
              <Sparkles className="size-3.5" /> Movies that match your mood
            </p>
            <h2 className="text-5xl font-medium leading-[1.02] tracking-[-0.05em] text-white text-balance xl:text-6xl">
              Stop scrolling.
              <br />
              Start <span className="font-display italic text-brand">feeling</span> something.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/55">
              Tell MoodFlix how your day went. It understands what you need tonight and finds it on the services you already pay for.
            </p>
          </div>
          <p className="text-xs text-white/35">© {new Date().getFullYear()} MoodFlix. Movie data and artwork via TMDB.</p>
        </aside>
        <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  )
}
