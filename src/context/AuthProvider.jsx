import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchProfileRecord,
  getSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase.js'
import { AuthContext } from './AuthContext.jsx'
import { subscribeToAuthSession } from './authSessionSubscription.js'
import { createProfileResultCache } from './profileResultCache.js'
import { getSafeAuthErrorDetails, logAuthDiagnostic } from '../utils/authDiagnostics.js'

async function fetchProfile(userId, accessToken) {
  if (!accessToken) {
    return {
      profile: null,
      error: new Error('An authenticated session is required to load your profile.'),
    }
  }

  logAuthDiagnostic('info', 'profile_request_started', {
    userId,
    hasAccessToken: true,
  })

  const { data, error } = await fetchProfileRecord(userId, accessToken)

  if (error) {
    logAuthDiagnostic('warn', 'profile_request_failed', {
      userId,
      ...getSafeAuthErrorDetails(error),
    })
    return { profile: null, error }
  }

  if (!data) {
    return {
      profile: null,
      error: new Error(
        'Your profile is unavailable. Confirm the Supabase database migration has been applied.',
      ),
    }
  }

  return { profile: data, error: null }
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isSessionLoading, setIsSessionLoading] = useState(isSupabaseConfigured)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const activeUserId = useRef(null)
  const activeAccessToken = useRef(null)
  const [profileCache] = useState(() => createProfileResultCache(fetchProfile))

  const handleExpiredSession = useCallback(async (userId, accessToken, error) => {
    if (
      activeUserId.current !== userId
      || activeAccessToken.current !== accessToken
    ) {
      return
    }

    logAuthDiagnostic('warn', 'expired_session_detected', {
      userId,
      ...getSafeAuthErrorDetails(error),
    })

    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        return
      }

      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })
      if (signOutError) {
        logAuthDiagnostic('warn', 'expired_session_local_sign_out_failed', {
          userId,
          ...getSafeAuthErrorDetails(signOutError),
        })
      }
    } catch (signOutError) {
      logAuthDiagnostic('error', 'expired_session_local_sign_out_failed', {
        userId,
        ...getSafeAuthErrorDetails(signOutError),
      })
    }
  }, [])

  const fetchProfileOnce = useCallback(
    (userId, accessToken) => profileCache.load(userId, accessToken),
    [profileCache],
  )

  useEffect(() => {
    let isMounted = true
    let unsubscribeAuthState

    if (!isSupabaseConfigured) {
      return () => {
        isMounted = false
      }
    }

    getSupabaseClient()
      .then((supabase) => {
        if (!isMounted) {
          return
        }
        if (!supabase) {
          setIsSessionLoading(false)
          return
        }

        logAuthDiagnostic('info', 'auth_subscription_started')
        unsubscribeAuthState = subscribeToAuthSession(supabase.auth, {
          onSession: (event, nextSession) => {
            const userId = nextSession?.user?.id ?? null
            const hasAccessToken = Boolean(nextSession?.access_token)
            const previousUserId = activeUserId.current
            const userChanged = previousUserId !== userId
            const shouldClearProfile = !userId || userChanged || event === 'USER_UPDATED'

            activeUserId.current = userId
            activeAccessToken.current = nextSession?.access_token ?? null
            logAuthDiagnostic('info', 'auth_event_received', {
              event,
              hasSession: Boolean(nextSession),
              userId,
              hasAccessToken,
            })
            setSession(nextSession)
            setIsSessionLoading(false)
            if (shouldClearProfile) {
              setProfile(null)
              setProfileError(
                userId && !hasAccessToken
                  ? new Error('An authenticated session is required to load your profile.')
                  : null,
              )
            }

            const cachedResult = userId && hasAccessToken
              ? profileCache.get(userId)
              : null
            if (cachedResult) {
              setProfile(cachedResult.profile)
              setProfileError(cachedResult.error)
              setIsProfileLoading(false)
            } else {
              setIsProfileLoading(Boolean(userId && hasAccessToken))
            }
          },
          loadProfile: fetchProfileOnce,
          getProfileResult: (userId) => profileCache.get(userId),
          invalidateProfileCache: () => profileCache.invalidate(),
          onSessionExpired: handleExpiredSession,
          onProfile: (userId, result, accessToken) => {
            if (
              isMounted
              && activeUserId.current === userId
              && activeAccessToken.current === accessToken
            ) {
              setProfile(result.profile)
              setProfileError(result.error)
              setIsProfileLoading(false)
            }
          },
        })
      })
      .catch((error) => {
        if (isMounted) {
          setProfileError(error)
          setIsSessionLoading(false)
          setIsProfileLoading(false)
        }
      })

    return () => {
      isMounted = false
      activeUserId.current = null
      activeAccessToken.current = null
      unsubscribeAuthState?.()
      logAuthDiagnostic('info', 'auth_subscription_cleaned_up')
    }
  }, [fetchProfileOnce, handleExpiredSession, profileCache])

  const signIn = useCallback(async ({ email, password }) => {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase is not configured. Set the required VITE_SUPABASE environment variables.')
    }

    logAuthDiagnostic('info', 'password_sign_in_started')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      logAuthDiagnostic('warn', 'password_sign_in_failed', getSafeAuthErrorDetails(error))
      return { data: null, profile: null, error }
    }

    const userId = data?.user?.id ?? null
    const accessToken = data?.session?.access_token
    logAuthDiagnostic('info', 'password_sign_in_completed', {
      hasUser: Boolean(userId),
      hasSession: Boolean(data?.session),
      hasAccessToken: Boolean(accessToken),
      userId,
    })

    if (!userId || !accessToken || data.session.user.id !== userId) {
      const sessionError = new Error('Supabase did not return a valid authenticated session.')
      logAuthDiagnostic('warn', 'password_sign_in_missing_session', {
        hasUser: Boolean(userId),
        hasSession: Boolean(data?.session),
        hasAccessToken: Boolean(accessToken),
        userId,
      })
      return {
        data,
        profile: null,
        error: sessionError,
      }
    }

    const result = await fetchProfileOnce(userId, accessToken)
    return { data, ...result }
  }, [fetchProfileOnce])

  const signUp = useCallback(async ({ email, password, fullName }) => {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase is not configured. Set the required VITE_SUPABASE environment variables.')
    }

    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
  }, [])

  const signOut = useCallback(async () => {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        return { error: new Error('Supabase is not configured.') }
      }

      return await supabase.auth.signOut()
    } catch (error) {
      return { error }
    }
  }, [])

  const requestPasswordReset = useCallback(async (email) => {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase is not configured. Set the required VITE_SUPABASE environment variables.')
    }

    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  }, [])

  const updatePassword = useCallback(async (password) => {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase is not configured. Set the required VITE_SUPABASE environment variables.')
    }

    return supabase.auth.updateUser({ password })
  }, [])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    profileError,
    loading: isSessionLoading || (Boolean(session) && isProfileLoading),
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    updatePassword,
  }), [
    isProfileLoading,
    isSessionLoading,
    profile,
    profileError,
    requestPasswordReset,
    session,
    signIn,
    signOut,
    signUp,
    updatePassword,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
