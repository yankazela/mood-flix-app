import type { AxiosResponse } from 'axios'
import { endpoints } from '@/app/api/endpoints'
import { postRequest } from '@/app/api/requests'
import { EbaseUrls } from '@/app/api/requests/types'
import type { AuthResponse } from '@/app/(auth)/signup/store/state'
import type { SignInInput } from '@/lib/services/auth-types'

export async function authenticateWithBackend(input: Pick<SignInInput, 'email' | 'password'>): Promise<AuthResponse> {
  const path = endpoints.login()
  const response: AxiosResponse<AuthResponse> = await postRequest(
    {
      path: path.endpoint,
      auth: path.auth,
      headers: path.headers,
      data: { email: input.email.trim().toLowerCase(), password: input.password },
    },
    EbaseUrls.MOOD_BE,
  )
  return response.data
}