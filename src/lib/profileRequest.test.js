import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchProfileRecord } from './profileRequest.js'

const requestContext = {
  supabaseUrl: 'https://project.supabase.co',
  publishableKey: 'public-key',
  accessToken: 'session-token',
  userId: 'customer-1',
}

test('uses the supplied session token for the RLS-protected profile request', async () => {
  let requestUrl
  let requestOptions

  const result = await fetchProfileRecord({
    ...requestContext,
    request: async (url, options) => {
      requestUrl = url
      requestOptions = options
      return {
        ok: true,
        async json() {
          return [{ id: 'customer-1', role: 'customer', full_name: 'Customer' }]
        },
      }
    },
  })

  assert.equal(requestUrl.pathname, '/rest/v1/profiles')
  assert.equal(requestUrl.searchParams.get('id'), 'eq.customer-1')
  assert.equal(requestOptions.headers.Authorization, 'Bearer session-token')
  assert.equal(requestOptions.headers.apikey, 'public-key')
  assert.deepEqual(result, {
    data: { id: 'customer-1', role: 'customer', full_name: 'Customer' },
    error: null,
  })
})

for (const status of [401, 429]) {
  test(`returns a ${status} profile response without retrying`, async () => {
    let requestCount = 0
    const result = await fetchProfileRecord({
      ...requestContext,
      request: async () => {
        requestCount += 1
        return {
          ok: false,
          status,
          async json() {
            return { code: `http_${status}`, message: 'Profile request failed.' }
          },
        }
      },
    })

    assert.equal(requestCount, 1)
    assert.equal(result.error.status, status)
    assert.equal(result.error.code, `http_${status}`)
  })
}

test('does not request a profile without a session token', async () => {
  let requestCount = 0
  const result = await fetchProfileRecord({
    ...requestContext,
    accessToken: null,
    request: async () => {
      requestCount += 1
      return { ok: true, async json() { return [] } }
    },
  })

  assert.equal(requestCount, 0)
  assert.match(result.error.message, /authenticated session is required/i)
})

test('aborts and returns a visible error when the profile request times out', async () => {
  let requestSignal
  const result = await fetchProfileRecord({
    ...requestContext,
    timeoutMs: 10,
    request: (_url, options) => {
      requestSignal = options.signal
      return new Promise(() => {})
    },
  })

  assert.equal(requestSignal.aborted, true)
  assert.equal(result.data, null)
  assert.equal(result.error.code, 'PROFILE_REQUEST_TIMEOUT')
  assert.match(result.error.message, /timed out/i)
})
