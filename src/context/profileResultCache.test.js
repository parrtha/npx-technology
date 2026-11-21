import assert from 'node:assert/strict'
import test from 'node:test'
import { createProfileResultCache } from './profileResultCache.js'

test('shares pending and completed profile results for the same user', async () => {
  let resolveProfile
  let loadCount = 0
  const cache = createProfileResultCache(() => {
    loadCount += 1
    return new Promise((resolve) => {
      resolveProfile = resolve
    })
  })

  const signInRequest = cache.load('customer-1', 'session-token')
  const subscriptionRequest = cache.load('customer-1', 'session-token')
  assert.equal(loadCount, 0)
  await Promise.resolve()
  assert.equal(loadCount, 1)

  const result = { profile: { id: 'customer-1', role: 'customer' }, error: null }
  resolveProfile(result)
  assert.deepEqual(await signInRequest, result)
  assert.deepEqual(await subscriptionRequest, result)
  assert.deepEqual(cache.get('customer-1'), result)
  assert.deepEqual(await cache.load('customer-1', 'refreshed-token'), result)
  assert.equal(loadCount, 1)
})

test('invalidating the cache prevents stale requests from repopulating it', async () => {
  let resolveProfile
  const cache = createProfileResultCache(() => new Promise((resolve) => {
    resolveProfile = resolve
  }))

  const request = cache.load('customer-1', 'session-token')
  await Promise.resolve()
  cache.invalidate()
  resolveProfile({ profile: { id: 'customer-1' }, error: null })

  await request
  assert.equal(cache.get('customer-1'), null)

  const nextResult = { profile: { id: 'customer-1', role: 'customer' }, error: null }
  const nextRequest = cache.load('customer-1', 'new-session-token')
  await Promise.resolve()
  resolveProfile(nextResult)
  assert.deepEqual(await nextRequest, nextResult)
  assert.deepEqual(cache.get('customer-1'), nextResult)
})
