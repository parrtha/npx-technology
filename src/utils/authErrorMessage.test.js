import assert from 'node:assert/strict'
import test from 'node:test'
import { AUTH_RATE_LIMIT_MESSAGE, getAuthErrorMessage } from './authErrorMessage.js'

test('maps HTTP 429 authentication responses to the friendly rate-limit message', () => {
  assert.equal(
    getAuthErrorMessage({ status: 429, message: 'raw provider detail' }, 'registration'),
    AUTH_RATE_LIMIT_MESSAGE,
  )
})

test('detects Supabase rate-limit error codes even without HTTP 429', () => {
  assert.equal(
    getAuthErrorMessage({ status: 400, code: 'over_email_send_rate_limit' }, 'registration'),
    AUTH_RATE_LIMIT_MESSAGE,
  )
})

test('detects Supabase retry-after wording without exposing the original detail', () => {
  assert.equal(
    getAuthErrorMessage({ status: 400, message: 'For security purposes, only request this after 59 seconds.' }, 'login'),
    AUTH_RATE_LIMIT_MESSAGE,
  )
})

test('returns a safe login message for invalid credentials', () => {
  assert.equal(
    getAuthErrorMessage({ code: 'invalid_credentials', message: 'Invalid login credentials' }, 'login'),
    'Email or password is incorrect.',
  )
})

test('never returns raw provider details for other auth errors', () => {
  const rawMessage = 'Database host, request id, and internal detail'
  assert.equal(
    getAuthErrorMessage({ status: 500, message: rawMessage }, 'registration'),
    "We couldn't create your account. Please check your details and try again.",
  )
})
