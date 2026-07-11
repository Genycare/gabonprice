import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Sentry } from '../lib/sentry'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur non interceptée :', error, info.componentStack)
    Sentry.captureException(error, { contexts: { react: { componentStack: info.componentStack } } })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-app-bg p-6 text-center">
          <p className="text-lg font-semibold text-ink">Une erreur est survenue</p>
          <p className="text-sm text-muted">
            Essayez de recharger la page. Si le problème persiste, réinstallez l'application.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white"
          >
            Recharger
          </button>
          <p className="max-w-xs break-words text-xs text-muted/70">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
