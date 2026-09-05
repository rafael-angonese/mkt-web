import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { ApiError } from '@/lib/api'
import {
  type MagicLinkInput,
  type MagicLinkResult,
  type ProviderProfileInput,
  type UpdateProfileInput,
  type User,
  authApi,
} from '@/lib/auth'
import { authStorage } from '@/lib/auth-storage'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  status: AuthStatus
  user: User | null
  token: string | null
  requestMagicLink: (input: MagicLinkInput) => Promise<MagicLinkResult>
  verifyMagicLink: (token: string) => Promise<User>
  signOut: () => Promise<void>
  updateProfile: (input: UpdateProfileInput) => Promise<User>
  updateProvider: (input: ProviderProfileInput) => Promise<User>
  updateAvatar: (file: File) => Promise<User>
  removeAvatar: () => Promise<User>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = authStorage.get()

    if (!stored) {
      setStatus('unauthenticated')
      return
    }

    const controller = new AbortController()

    authApi
      .profile(stored, controller.signal)
      .then((profile) => {
        setUser(profile)
        setToken(stored)
        setStatus('authenticated')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        if (error instanceof ApiError && error.status === 401) {
          authStorage.clear()
        }

        setStatus('unauthenticated')
      })

    return () => controller.abort()
  }, [])

  const startSession = useCallback((session: { user: User; token: string }) => {
    authStorage.set(session.token)
    setToken(session.token)
    setUser(session.user)
    setStatus('authenticated')
    return session.user
  }, [])

  const requestMagicLink = useCallback(
    (input: MagicLinkInput) => authApi.requestMagicLink(input),
    [],
  )

  const verifyMagicLink = useCallback(
    async (magicToken: string) =>
      startSession(await authApi.verifyMagicLink(magicToken)),
    [startSession],
  )

  const signOut = useCallback(async () => {
    if (token) {
      await authApi.signOut(token).catch(() => undefined)
    }

    authStorage.clear()
    setToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [token])

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      if (!token) {
        throw new Error('updateProfile requires an authenticated session')
      }

      const updated = await authApi.updateProfile(token, input)
      setUser(updated)
      return updated
    },
    [token],
  )

  const updateProvider = useCallback(
    async (input: ProviderProfileInput) => {
      if (!token) {
        throw new Error('updateProvider requires an authenticated session')
      }

      const updated = await authApi.updateProvider(token, input)
      setUser(updated)
      return updated
    },
    [token],
  )

  const updateAvatar = useCallback(
    async (file: File) => {
      if (!token) {
        throw new Error('updateAvatar requires an authenticated session')
      }

      const updated = await authApi.updateAvatar(token, file)
      setUser(updated)
      return updated
    },
    [token],
  )

  const removeAvatar = useCallback(async () => {
    if (!token) {
      throw new Error('removeAvatar requires an authenticated session')
    }

    const updated = await authApi.removeAvatar(token)
    setUser(updated)
    return updated
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      requestMagicLink,
      verifyMagicLink,
      signOut,
      updateProfile,
      updateProvider,
      updateAvatar,
      removeAvatar,
    }),
    [
      status,
      user,
      token,
      requestMagicLink,
      verifyMagicLink,
      signOut,
      updateProfile,
      updateProvider,
      updateAvatar,
      removeAvatar,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
