const secretValuePatterns = [
  /\bBearer\s+[^\s,;]+/gi,
  /\b(?:access_token|refresh_token|api[_-]?key)\b\s*[:=]\s*["']?[^,\s"']+/gi,
  /\b(?:password|email)\b\s*[:=]\s*["']?[^,\s"']+/gi,
  /\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
  /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]+/gi,
]

export function getSafeAuthErrorDetails(error) {
  const code = typeof error?.code === 'string' && /^[\w.-]{1,100}$/.test(error.code)
    ? error.code
    : null
  const message = typeof error?.message === 'string'
    ? secretValuePatterns.reduce(
      (safeMessage, pattern) => safeMessage.replace(pattern, '[REDACTED]'),
      error.message,
    ).slice(0, 300)
    : 'Unknown authentication error'
  const status = Number(error?.status ?? error?.statusCode)

  return {
    code,
    message,
    status: Number.isFinite(status) ? status : null,
  }
}

export function logAuthDiagnostic(level, event, details = {}) {
  const logger = level === 'error'
    ? console.error
    : level === 'warn'
      ? console.warn
      : console.info

  logger(`[NPX auth] ${event}`, details)
}
