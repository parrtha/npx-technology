import assert from 'node:assert/strict'
import test from 'node:test'
import { subscribeToAuthSession } from './authSessionSubscription.js'
import { createProfileResultCache } from './profileResultCache.js'

function createAuthStub() {
  let listener
  let unsubscribeCount = 0
  let getSessionCount = 0

  return {
    auth: {
      onAuthStateChange(callback) {
        listener = callback
        return {
          data: {
            subscription: {
              unsubscribe() {
                unsubscribeCount += 1
              },
            },
          },
        }
      },
      async getSession() {
        getSessionCount += 1
        throw new Error('getSession should not be called by the subscription')
      },
    },
    emit(event, session) {
      listener(event, session)
    },
    get unsubscribeCount() {
      return unsubscribeCount
    },
    get getSessionCount() {
      return getSessionCount
    },
  }
}

function createScheduler() {
  let nextId = 0
  const timers = new Map()

  return {
    schedule(callback) {
      nextId += 1
      timers.set(nextId, callback)
      return nextId
    },
    cancel(id) {
      timers.delete(id)
    },
    async runNext() {
      const callback = this.takeNext()
      if (!callback) {
        return false
      }
      await callback()
      return true
    },
    takeNext() {
      const firstTimer = timers.entries().next().value
      if (!firstTimer) {
        return null
      }
      const [id, callback] = firstTimer
      timers.delete(id)
      return callback
    },
    get pendingCount() {
      return timers.size
    },
  }
}

const customerSession = {
  access_token: 'customer-session-token',
  user: { id: 'customer-1' },
}

test('uses auth events for initial state and defers the profile lookup', async () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  const events = []
  const profiles = []

  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession: (event, session) => events.push([event, session]),
    loadProfile: async (userId) => ({ profile: { id: userId }, error: null }),
    onProfile: (userId, result) => profiles.push([userId, result]),
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('INITIAL_SESSION', customerSession)
  auth.emit('TOKEN_REFRESHED', customerSession)

  assert.deepEqual(events, [
    ['INITIAL_SESSION', customerSession],
    ['TOKEN_REFRESHED', customerSession],
  ])
  assert.equal(scheduler.pendingCount, 1)
  assert.equal(auth.getSessionCount, 0)

  await scheduler.runNext()

  assert.deepEqual(profiles, [
    ['customer-1', { profile: { id: 'customer-1' }, error: null }],
  ])
  unsubscribe()
})

test('keeps a failed initial session restore signed out without retrying', () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  const sessions = []
  let profileLoadCount = 0

  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession: (event, session) => sessions.push([event, session]),
    loadProfile: async () => {
      profileLoadCount += 1
      return { profile: null, error: null }
    },
    onProfile() {},
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('INITIAL_SESSION', null)

  assert.deepEqual(sessions, [['INITIAL_SESSION', null]])
  assert.equal(profileLoadCount, 0)
  assert.equal(scheduler.pendingCount, 0)
  assert.equal(auth.getSessionCount, 0)
  unsubscribe()
})

test('does not request a profile when an auth event has no access token', () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  let profileLoadCount = 0

  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession() {},
    loadProfile: async () => {
      profileLoadCount += 1
      return { profile: null, error: null }
    },
    onProfile() {},
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('INITIAL_SESSION', { user: { id: 'customer-1' } })

  assert.equal(profileLoadCount, 0)
  assert.equal(scheduler.pendingCount, 0)
  unsubscribe()
})

test('cancels stale profile work and unsubscribes on cleanup', async () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  const loadedUsers = []
  const sessions = []

  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession: (event, session) => sessions.push([event, session]),
    loadProfile: async (userId) => {
      loadedUsers.push(userId)
      return { profile: { id: userId }, error: null }
    },
    onProfile() {},
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('INITIAL_SESSION', customerSession)
  auth.emit('SIGNED_OUT', null)

  assert.equal(scheduler.pendingCount, 0)
  assert.equal(await scheduler.runNext(), false)
  assert.deepEqual(loadedUsers, [])
  assert.deepEqual(sessions.map(([event]) => event), ['INITIAL_SESSION', 'SIGNED_OUT'])

  unsubscribe()
  unsubscribe()
  auth.emit('TOKEN_REFRESHED', customerSession)

  assert.equal(auth.unsubscribeCount, 1)
  assert.equal(scheduler.pendingCount, 0)
  assert.equal(loadedUsers.length, 0)
})

for (const status of [401, 429]) {
  test(`blocks repeat profile reads after a ${status} response`, async () => {
    const auth = createAuthStub()
    const scheduler = createScheduler()
    const profileError = Object.assign(new Error('profile request failed'), { status })
    const profileResults = []
    const expiredSessions = []
    let loadCount = 0

    const unsubscribe = subscribeToAuthSession(auth.auth, {
      onSession() {},
      loadProfile: async () => {
        loadCount += 1
        return { profile: null, error: profileError }
      },
      onProfile: (userId, result) => profileResults.push([userId, result]),
      onSessionExpired: (...args) => expiredSessions.push(args),
    }, {
      schedule: scheduler.schedule,
      cancel: scheduler.cancel,
    })

    auth.emit('INITIAL_SESSION', customerSession)
    await scheduler.runNext()
    auth.emit('TOKEN_REFRESHED', customerSession)

    assert.equal(loadCount, 1)
    assert.equal(auth.getSessionCount, 0)
    assert.equal(scheduler.pendingCount, 0)
    assert.equal(profileResults.length, 2)
    assert.deepEqual(expiredSessions, status === 401
      ? [['customer-1', customerSession.access_token, profileError]]
      : [])
    unsubscribe()
  })
}

test('allows profile loading after a new session replaces a failed session', async () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  const loadedTokens = []
  const nextSession = {
    access_token: 'new-session-token',
    user: { id: 'customer-1' },
  }

  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession() {},
    loadProfile: async (_userId, accessToken) => {
      loadedTokens.push(accessToken)
      return accessToken === customerSession.access_token
        ? { profile: null, error: Object.assign(new Error('expired'), { status: 401 }) }
        : { profile: { id: 'customer-1' }, error: null }
    },
    onProfile() {},
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('INITIAL_SESSION', customerSession)
  await scheduler.runNext()
  auth.emit('SIGNED_OUT', null)
  auth.emit('SIGNED_IN', nextSession)
  await scheduler.runNext()

  assert.deepEqual(loadedTokens, [
    customerSession.access_token,
    nextSession.access_token,
  ])
  assert.equal(auth.getSessionCount, 0)
  unsubscribe()
})

test('ignores a profile result that completes after session cleanup', async () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  let resolveProfile
  let profileLoadCount = 0
  const profileResults = []

  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession() {},
    loadProfile: () => {
      profileLoadCount += 1
      return new Promise((resolve) => {
        resolveProfile = resolve
      })
    },
    onProfile: (userId, result) => profileResults.push([userId, result]),
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('INITIAL_SESSION', customerSession)
  const runProfileLoad = scheduler.takeNext()
  const pendingLoad = runProfileLoad()

  assert.equal(profileLoadCount, 1)
  unsubscribe()
  resolveProfile({ profile: { id: 'customer-1' }, error: null })
  await pendingLoad

  assert.deepEqual(profileResults, [])
  assert.equal(auth.unsubscribeCount, 1)
})

test('does not reload or clear a completed profile for repeated SIGNED_IN events', async () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  let loadCount = 0
  const profileResults = []
  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession() {},
    loadProfile: async (userId) => {
      loadCount += 1
      return { profile: { id: userId }, error: null }
    },
    onProfile: (...args) => profileResults.push(args),
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('INITIAL_SESSION', customerSession)
  await scheduler.runNext()
  auth.emit('SIGNED_IN', customerSession)

  assert.equal(scheduler.pendingCount, 0)
  assert.equal(loadCount, 1)
  assert.equal(profileResults.length, 2)
  assert.deepEqual(profileResults[1][1], profileResults[0][1])
  unsubscribe()
})

test('reuses the completed profile result fetched by the sign-in path', async () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  let loadCount = 0
  const cache = createProfileResultCache(async (userId) => {
    loadCount += 1
    return { profile: { id: userId }, error: null }
  })
  const signInResult = await cache.load('customer-1', customerSession.access_token)
  const profileResults = []
  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession() {},
    loadProfile: cache.load,
    getProfileResult: cache.get,
    invalidateProfileCache: cache.invalidate,
    onProfile: (...args) => profileResults.push(args),
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('SIGNED_IN', customerSession)

  assert.equal(loadCount, 1)
  assert.equal(scheduler.pendingCount, 0)
  assert.deepEqual(profileResults, [
    ['customer-1', signInResult, customerSession.access_token],
  ])
  unsubscribe()
})

test('does not reload a profile on TOKEN_REFRESHED for the same user', async () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  let loadCount = 0
  const refreshedSession = {
    access_token: 'refreshed-session-token',
    user: customerSession.user,
  }
  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession() {},
    loadProfile: async (userId) => {
      loadCount += 1
      return { profile: { id: userId }, error: null }
    },
    onProfile() {},
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('INITIAL_SESSION', customerSession)
  await scheduler.runNext()
  auth.emit('TOKEN_REFRESHED', refreshedSession)

  assert.equal(loadCount, 1)
  assert.equal(scheduler.pendingCount, 0)
  unsubscribe()
})

test('loads a profile when a different user signs in', async () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  const loadedUsers = []
  const nextSession = {
    access_token: 'admin-session-token',
    user: { id: 'admin-1' },
  }
  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession() {},
    loadProfile: async (userId) => {
      loadedUsers.push(userId)
      return { profile: { id: userId }, error: null }
    },
    onProfile() {},
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('INITIAL_SESSION', customerSession)
  await scheduler.runNext()
  auth.emit('SIGNED_IN', nextSession)
  await scheduler.runNext()

  assert.deepEqual(loadedUsers, ['customer-1', 'admin-1'])
  unsubscribe()
})

test('invalidates cached profile results on logout and ignores the stale response', async () => {
  const auth = createAuthStub()
  const scheduler = createScheduler()
  let resolveProfile
  const cache = createProfileResultCache(() => new Promise((resolve) => {
    resolveProfile = resolve
  }))
  const profileResults = []
  const unsubscribe = subscribeToAuthSession(auth.auth, {
    onSession() {},
    loadProfile: cache.load,
    getProfileResult: cache.get,
    invalidateProfileCache: cache.invalidate,
    onProfile: (...args) => profileResults.push(args),
  }, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
  })

  auth.emit('INITIAL_SESSION', customerSession)
  const runProfileLoad = scheduler.takeNext()
  const pendingLoad = runProfileLoad()
  await Promise.resolve()
  auth.emit('SIGNED_OUT', null)
  resolveProfile({ profile: { id: 'customer-1' }, error: null })
  await pendingLoad

  assert.equal(cache.get('customer-1'), null)
  assert.deepEqual(profileResults, [])
  unsubscribe()
})
