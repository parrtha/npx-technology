
import { getSafeAuthErrorDetails, logAuthDiagnostic } from '../utils/authDiagnostics.js'
import { fetchProfileRecord as requestProfileRecord } from './profileRequest.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

let clientPromise
let diagnosticFetch

function createDiagnosticFetch() {
  const supabaseOrigin = new URL(supabaseUrl).origin

  return async function diagnosticFetch(input, init) {
    const requestUrl = input?.url ?? input
    let url
    try {
      url = new URL(requestUrl, supabaseUrl)
    } catch {
      return fetch(input, init)
    }

    if (url.origin !== supabaseOrigin) {
      return fetch(input, init)
    }

    const method = (init?.method ?? input?.method ?? 'GET').toUpperCase()
    const isAuthTokenRequest = url.pathname.endsWith('/auth/v1/token') && method === 'POST'
    const isProfilesRequest = url.pathname.endsWith('/rest/v1/profiles')
    if (!isAuthTokenRequest && !isProfilesRequest) {
      return fetch(input, init)
    }

    const grantType = url.searchParams.get('grant_type')
    const authFlow = ['password', 'refresh_token', 'pkce'].includes(grantType)
      ? grantType
      : 'other'
    const requestDetails = isAuthTokenRequest
      ? { service: 'auth', operation: 'token', authFlow, method }
      : { service: 'rest', operation: 'profiles', method }

    logAuthDiagnostic('info', 'supabase_request_started', requestDetails)

    let response
    try {
      response = await fetch(input, init)
    } catch (error) {
      logAuthDiagnostic('warn', 'supabase_request_failed', {
        ...requestDetails,
        ...getSafeAuthErrorDetails(error),
      })
      throw error
    }

    if (!response.ok) {
      void response.clone().json().then((body) => {
        logAuthDiagnostic('warn', 'supabase_request_failed', {
          ...requestDetails,
          ...getSafeAuthErrorDetails({
            code: body?.code ?? body?.error,
            message: body?.message ?? body?.error_description,
            status: response.status,
          }),
        })
      }).catch(() => {
        logAuthDiagnostic('warn', 'supabase_request_failed', {
          ...requestDetails,
          status: response.status,
          code: null,
          message: 'Supabase returned an error response without readable JSON details.',
        })
      })
    }

    return response
  }
}

function getDiagnosticFetch() {
  if (!diagnosticFetch) {
    diagnosticFetch = createDiagnosticFetch()
  }
  return diagnosticFetch
}

export async function fetchProfileRecord(userId, accessToken) {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Supabase is not configured.'),
    }
  }
  // Use the event's token directly instead of Supabase PostgREST's auth.getSession() wrapper.
  return requestProfileRecord({
    supabaseUrl,
    publishableKey: supabasePublishableKey,
    accessToken,
    userId,
    request: getDiagnosticFetch(),
  })
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return Promise.resolve(null)
  }

  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => (
      createClient(
        supabaseUrl,
        supabasePublishableKey,
        {
          auth: {
            autoRefreshToken: true,
            detectSessionInUrl: true,
            persistSession: true,
          },
          global: {
            fetch: getDiagnosticFetch(),
          },
        },
      )
    ))
  }

  return clientPromise
}
