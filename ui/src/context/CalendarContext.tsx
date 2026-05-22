/**
 * CalendarContext — unified entry point for all calendar provider contexts.
 *
 * Usage:
 *   const { google, outlook, apple, calendly, refreshAll } = useCalendars()
 *
 * Individual provider hooks are also available:
 *   useGoogleCalendar()  /  useOutlookCalendar()  /  useAppleCalendar()  /  useCalendly()
 */
import { createContext, useContext, useCallback, ReactNode } from 'react'

import { GoogleCalendarProvider, useGoogleCalendar } from './GoogleCalendarContext'
import { OutlookCalendarProvider, useOutlookCalendar } from './OutlookCalendarContext'
import { AppleCalendarProvider, useAppleCalendar } from './AppleCalendarContext'
import { CalendlyProvider, useCalendly } from './CalendlyContext'

// Re-export individual hooks for direct consumption
export { useGoogleCalendar, useOutlookCalendar, useAppleCalendar, useCalendly }

// ---------- types ----------

interface CalendarContextType {
  google: ReturnType<typeof useGoogleCalendar>
  outlook: ReturnType<typeof useOutlookCalendar>
  apple: ReturnType<typeof useAppleCalendar>
  calendly: ReturnType<typeof useCalendly>
  /** Re-fetch status from all four providers simultaneously. */
  refreshAll: () => Promise<void>
  /** True if at least one provider is connected. */
  isAnyConnected: boolean
}

const CalendarContext = createContext<CalendarContextType | null>(null)

// ---------- inner aggregator (must be inside all four sub-providers) ----------

function CalendarAggregator({ children }: { children: ReactNode }) {
  const google  = useGoogleCalendar()
  const outlook = useOutlookCalendar()
  const apple   = useAppleCalendar()
  const calendly = useCalendly()

  const isAnyConnected = google.isConnected || outlook.isConnected || apple.isConnected || calendly.isConnected

  const refreshAll = useCallback(async () => {
    await Promise.all([
      google.refresh(),
      outlook.refresh(),
      apple.refresh(),
      calendly.refresh(),
    ])
  }, [google.refresh, outlook.refresh, apple.refresh, calendly.refresh])

  return (
    <CalendarContext.Provider value={{ google, outlook, apple, calendly, refreshAll, isAnyConnected }}>
      {children}
    </CalendarContext.Provider>
  )
}

// ---------- public provider (wrap at app root) ----------

export function CalendarProvider({ children }: { children: ReactNode }) {
  return (
    <GoogleCalendarProvider>
      <OutlookCalendarProvider>
        <AppleCalendarProvider>
          <CalendlyProvider>
            <CalendarAggregator>
              {children}
            </CalendarAggregator>
          </CalendlyProvider>
        </AppleCalendarProvider>
      </OutlookCalendarProvider>
    </GoogleCalendarProvider>
  )
}

// ---------- hook ----------

export function useCalendars(): CalendarContextType {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendars must be used inside CalendarProvider')
  return ctx
}
