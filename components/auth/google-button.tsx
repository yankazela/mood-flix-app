'use client'

import { Button, type ButtonProps } from '@/components/shared/button'

export function GoogleButton({ children = 'Continue with Google', ...props }: Omit<ButtonProps, 'variant' | 'leadingIcon'>) {
  return (
    <Button variant="secondary" size="lg" fullWidth leadingIcon={<GoogleGlyph />} {...props}>
      {children}
    </Button>
  )
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.3-.98 2.4-2.08 3.13l3.36 2.6c1.96-1.8 3.09-4.46 3.09-7.6 0-.73-.07-1.43-.19-2.1H12z" />
      <path fill="#34A853" d="M12 22c2.8 0 5.15-.93 6.87-2.52l-3.36-2.6c-.93.62-2.12 1-3.51 1-2.7 0-4.98-1.82-5.8-4.27l-3.47 2.68C4.44 19.73 7.94 22 12 22z" />
      <path fill="#4A90E2" d="M6.2 13.61A6.1 6.1 0 0 1 5.88 12c0-.56.1-1.1.27-1.61L2.68 7.71A10 10 0 0 0 2 12c0 1.6.38 3.12 1.05 4.47l3.15-2.86z" />
      <path fill="#FBBC05" d="M12 6.12c1.52 0 2.88.52 3.96 1.55l2.97-2.97C17.14 3.02 14.8 2 12 2 7.94 2 4.44 4.27 2.68 7.71l3.47 2.68C6.97 7.94 9.3 6.12 12 6.12z" />
    </svg>
  )
}
