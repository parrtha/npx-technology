import assert from 'node:assert/strict'
import test from 'node:test'
import { getSafeAuthErrorDetails } from './authDiagnostics.js'

test('preserves useful auth error details while redacting credentials', () => {
  const details = getSafeAuthErrorDetails(Object.assign(
    new Error(
      'Invalid password=customer-secret email=customer@example.com '
      + 'Bearer eyJhbGci.eyJzdWI.dG9rZW4 access_token=another-secret',
    ),
    { code: 'invalid_credentials', status: 401 },
  ))

  assert.deepEqual(details, {
    code: 'invalid_credentials',
    message: 'Invalid [REDACTED] [REDACTED] [REDACTED] [REDACTED]',
    status: 401,
  })
})

test('does not pass through invalid error codes or non-finite statuses', () => {
  assert.deepEqual(getSafeAuthErrorDetails({
    code: 'sensitive code value',
    status: 'not-a-status',
  }), {
    code: null,
    message: 'Unknown authentication error',
    status: null,
  })
})
