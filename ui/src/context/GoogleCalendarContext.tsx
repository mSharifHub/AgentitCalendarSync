import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react'
import { SERVER_URL } from '../types'

interface GoogleCalendarState {
  isConnected: boolean
  connecting: boolean    // setup/token exchange in progress
  polling: boolean       // waiting for user to complete OAuth in browser tab
  error: string
}

interface GoogleCalendarContextType extends GoogleCalendarState {
  /** Store Google app credentials and return the auth URL. Opens the URL in a new tab. */
  setup: (clientId: string, clientSecret: string) => Promise<void>
  disconnect: () => Promise<void>
  refresh: () => Promise<void>
}

const GoogleCalendarContext = createContext<GoogleCalendarContextType | null>(null)

export function GoogleCalendarProvider({ children }: { children: ReactNode }) {
  const [isConnected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [polling, setPolling]       = useState(false)
  const [error, setError]           = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/calendars/status`)
      if (res.ok) {
        const data = await res.json()
        setConnected(!!data.google)
      }
    } catch { /* backend unreachable */ }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Stop polling once connected or on unmount
  useEffect(() => {
    if (!polling) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${SERVER_URL}/calendars/status`)
        const data = await res.json()
        if (data.google) {
          clearInterval(pollRef.current!)
          pollRef.current = null
          setPolling(false)
          setConnected(true)
        }
      } catch { /* ignore */ }
    }, 2000)
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
  }, [polling])

  const setup = async (clientId: string, clientSecret: string) => {
    setConnecting(true)
    setError('')
    try {
      const res = await fetch(`${SERVER_URL}/auth/google/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Setup failed')
      const { auth_url } = await res.json()
      window.open(auth_url, '_blank', 'width=600,height=700')
      setConnecting(false)
      setPolling(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Setup failed')
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    setPolling(false)
    setConnecting(true)
    setError('')
    try {
      await fetch(`${SERVER_URL}/auth/google/disconnect`, { method: 'POST' })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Disconnect failed')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <GoogleCalendarContext.Provider value={{ isConnected, connecting, polling, error, setup, disconnect, refresh }}>
      {children}
    </GoogleCalendarContext.Provider>
  )
}

export function useGoogleCalendar(): GoogleCalendarContextType {
  const ctx = useContext(GoogleCalendarContext)
  if (!ctx) throw new Error('useGoogleCalendar must be used inside GoogleCalendarProvider')
  return ctx
}
