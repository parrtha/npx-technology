export const AUTH_RATE_LIMIT_MESSAGE =
  "We've received several requests. Please wait a few minutes before trying again."

const rateLimitPattern =
  /rate.?limit|too many (?:requests|attempts)|over_(?:email|sms|request)_rate_limit|only request this after/i

const safeMessages = {
  login: "We couldn't sign you in. Check your email and password, then try again.",
  registration: "We couldn't create your account. Please check your details and try again.",
  passwordRecovery: "We couldn't send a password reset email. Please try again later.",
  passwordReset: "We couldn't update your password. Check the reset link and try again.",
  logout: "We couldn't sign you out. Please try again.",
  profile: "We couldn't load your account details. Please try again later.",
  default: 'Something went wrong. Please try again.',
}

export function getAuthErrorMessage(error, context = 'default') {
  const status = Number(error?.status ?? error?.statusCode)
  const errorDetails = `${error?.code ?? ''} ${error?.message ?? ''}`

  if (status === 429 || rateLimitPattern.test(errorDetails)) {
    return AUTH_RATE_LIMIT_MESSAGE
  }

  if (
    context === 'login'
    && (
      error?.code === 'invalid_credentials'
      || /invalid login credentials/i.test(error?.message ?? '')
    )
  ) {
    return 'Email or password is incorrect.'
  }

  return safeMessages[context] ?? safeMessages.default
}
