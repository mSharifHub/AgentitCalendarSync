import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { ChatProvider, useChat } from './context/ChatContext'
import { CalendarProvider, useCalendars } from './context/CalendarContext'
import SettingsPanel from './components/SettingsPanel'
import ChatPanel from './components/ChatPanel'
import Sidebar from './components/Sidebar'
import CalendarProviders from './components/CalendarProviders'

function AppContent() {
  const { view, initDone, threads, activeThreadId, liveSessionIds } = useChat()
  const { isAnyConnected } = useCalendars()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!initDone) return null

  // Force providers screen if no calendar is connected, regardless of the stored view
  if (!isAnyConnected || view === 'providers') {
    return <CalendarProviders />
  }

  // If in chat view but no active thread or the thread's session is not live on backend
  const isChatSessionValid = activeThreadId && liveSessionIds.has(activeThreadId)
  if (view === 'chat' && !isChatSessionValid) {
    return <SettingsPanel />
  }

  if (view === 'settings' && threads.length === 0) {
    return <SettingsPanel />
  }

  const showSidebar = sidebarOpen && view === 'chat'

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Sidebar — only visible in chat view */}
      <div
        className={`flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out
          ${showSidebar ? 'w-64' : 'w-0'}`}
      >
        <Sidebar onToggle={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Show sidebar toggle only in chat view when sidebar is closed */}
        {!sidebarOpen && view === 'chat' && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 p-2 rounded-full text-gray-400 hover:text-gray-700
                       hover:bg-gray-100 transition-all cursor-pointer"
            title="Show history"
          >
            <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
          </button>
        )}

        {view === 'settings' ? <SettingsPanel /> : <ChatPanel />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ChatProvider>
      <CalendarProvider>
        <AppContent />
      </CalendarProvider>
    </ChatProvider>
  )
}
