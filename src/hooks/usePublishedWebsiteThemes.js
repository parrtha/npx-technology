import { useEffect, useState } from 'react'
import { listPublishedWebsiteThemes } from '../lib/websiteThemes.js'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js'

function usePublishedWebsiteThemes() {
  const [result, setResult] = useState({ status: 'loading', themes: [], error: null })
  const [retryVersion, setRetryVersion] = useState(0)

  useEffect(() => {
    let active = true

    async function loadThemes() {
      try {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured.')
        }
        const client = await getSupabaseClient()
        if (!client) {
          throw new Error('Supabase is not configured.')
        }
        const themes = await listPublishedWebsiteThemes(client)
        if (active) {
          setResult({ status: 'success', themes, error: null })
        }
      } catch (error) {
        if (active) {
          setResult({
            status: 'error',
            themes: [],
            error: error instanceof Error ? error.message : 'Website themes could not be loaded.',
          })
        }
      }
    }

    void loadThemes()

    return () => {
      active = false
    }
  }, [retryVersion])

  return {
    ...result,
    retry: () => {
      setResult({ status: 'loading', themes: [], error: null })
      setRetryVersion((version) => version + 1)
    },
  }
}

export default usePublishedWebsiteThemes
