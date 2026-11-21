export function subscribeToAuthSession(
  auth,
  {
    onSession,
    loadProfile,
    getProfileResult = () => null,
    invalidateProfileCache = () => {},
    onProfile,
    onSessionExpired = () => {},
  },
  { schedule = globalThis.setTimeout, cancel = globalThis.clearTimeout } = {},
) {
  let isActive = true
  let eventSequence = 0
  let profileTimer = null
  let activeUserId = null
  let lastProfileResult = null
  let expiredUserId = null

  const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
    if (!isActive) {
      return
    }

    const currentSequence = ++eventSequence
    if (profileTimer !== null) {
      cancel(profileTimer)
      profileTimer = null
    }

    const userId = session?.user?.id
    const accessToken = session?.access_token
    if (event === 'SIGNED_OUT' || !userId || !accessToken) {
      if (activeUserId !== null || event === 'SIGNED_OUT') {
        invalidateProfileCache()
      }
      activeUserId = null
      lastProfileResult = null
      expiredUserId = null
      onSession(event, event === 'SIGNED_OUT' ? null : session)
      return
    }

    const userChanged = activeUserId !== userId
    if (userChanged) {
      if (activeUserId !== null) {
        invalidateProfileCache()
      }
      activeUserId = userId
      lastProfileResult = null
      expiredUserId = null
    } else if (event === 'USER_UPDATED') {
      invalidateProfileCache()
      lastProfileResult = null
    }

    onSession(event, session)

    const deliverProfile = async (result) => {
      if (!isActive || eventSequence !== currentSequence) {
        return
      }
      lastProfileResult = result
      onProfile(userId, result, accessToken)
      const status = Number(result.error?.status ?? result.error?.statusCode)
      if (status === 401 && expiredUserId !== userId) {
        expiredUserId = userId
        await onSessionExpired(userId, accessToken, result.error)
      }
    }

    if (lastProfileResult) {
      void deliverProfile(lastProfileResult)
      return
    }

    const cachedResult = event === 'USER_UPDATED' ? null : getProfileResult(userId)
    if (cachedResult) {
      void deliverProfile(cachedResult)
      return
    }

    profileTimer = schedule(async () => {
      profileTimer = null
      let result
      try {
        result = await loadProfile(userId, accessToken)
      } catch (error) {
        result = { profile: null, error }
      }

      if (isActive && eventSequence === currentSequence) {
        await deliverProfile(result)
      }
    }, 0)
  })

  return () => {
    if (!isActive) {
      return
    }

    isActive = false
    eventSequence += 1
    activeUserId = null
    lastProfileResult = null
    if (profileTimer !== null) {
      cancel(profileTimer)
      profileTimer = null
    }
    subscription?.unsubscribe()
  }
}
