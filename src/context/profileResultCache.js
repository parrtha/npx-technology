export function createProfileResultCache(loadProfile) {
  const entries = new Map()
  let generation = 0

  return {
    load(userId, accessToken) {
      const existing = entries.get(userId)
      if (existing) {
        return existing.promise
      }

      const entry = { result: null, promise: null }
      const requestGeneration = generation
      entry.promise = Promise.resolve()
        .then(() => loadProfile(userId, accessToken))
        .catch((error) => ({ profile: null, error }))
        .then((result) => {
          if (generation === requestGeneration && entries.get(userId) === entry) {
            entry.result = result
          }
          return result
        })
      entries.set(userId, entry)
      return entry.promise
    },
    get(userId) {
      return entries.get(userId)?.result ?? null
    },
    invalidate() {
      generation += 1
      entries.clear()
    },
  }
}
