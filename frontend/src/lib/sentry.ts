import * as Sentry from '@sentry/react'

const DSN =
  import.meta.env.VITE_SENTRY_DSN ??
  'https://9b16f3768f90e681d168231483ee7e53@o4511358695636992.ingest.de.sentry.io/4511358707302480'

export function initSentry() {
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,
  })
}

export { Sentry }
