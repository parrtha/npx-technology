export const PROFILE_REQUEST_TIMEOUT_MS = 15_000

export async function fetchProfileRecord({
  supabaseUrl,
  publishableKey,
  accessToken,
  userId,
  request,
  timeoutMs = PROFILE_REQUEST_TIMEOUT_MS,
}) {
  if (!accessToken) {
    return {
      data: null,
      error: new Error('An authenticated session is required to load your profile.'),
    }
  }

  const url = new URL(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/profiles`)
  url.searchParams.set('select', 'id,role,full_name')
  url.searchParams.set('id', `eq.${userId}`)
  url.searchParams.set('limit', '1')

  const controller = new AbortController()
  let timeoutId
  const timeoutError = new Error('The profile request timed out. Please try again.')
  timeoutError.code = 'PROFILE_REQUEST_TIMEOUT'

  const requestPromise = (async () => {
    const response = await request(url, {
      method: 'GET',
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    let body = null
    try {
      body = await response.json()
    } catch {
      if (response.ok) {
        return {
          data: null,
          error: new Error('Supabase returned an unreadable profile response.'),
        }
      }
    }

    if (!response.ok) {
      const error = new Error(
        typeof body?.message === 'string'
          ? body.message
          : `Profile request failed with status ${response.status}.`,
      )
      error.status = response.status
      if (typeof body?.code === 'string') {
        error.code = body.code
      }
      return { data: null, error }
    }

    return {
      data: Array.isArray(body) ? body[0] ?? null : null,
      error: null,
    }
  })()

  try {
    return await Promise.race([
      requestPromise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort()
          reject(timeoutError)
        }, timeoutMs)
      }),
    ])
  } catch (error) {
    if (error === timeoutError || controller.signal.aborted) {
      return { data: null, error: timeoutError }
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
