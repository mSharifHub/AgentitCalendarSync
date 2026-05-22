import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AgentConfig, Message, Thread, SERVER_URL } from '../types'
import { storageGet, storageSet } from '../storage'

export type View = 'providers' | 'settings' | 'chat'

interface ChatContextType {
  view: View
  setView: (v: View) => void
  threads: Thread[]
  activeThreadId: string | null
  activeThread: Thread | null
  loading: boolean
  initDone: boolean
  liveSessionIds: Set<string>
  userName: string
  userPicture: string
  handleConnect: (cfg: AgentConfig) => Promise<void>
  handleSend: (text: string) => Promise<void>
  switchThread: (id: string) => void
  deleteThread: (id: string) => void
  startNewChat: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

function makeTitle(messages: Message[]): string {
  const first = messages.find(m => m.role === 'user')
  if (!first) return 'New chat'
  return first.content.slice(0, 36) + (first.content.length > 36 ? '…' : '')
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [view, setView]               = useState<View>('providers')
  const [threads, setThreads]         = useState<Thread[]>([])
  const [activeThreadId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [initDone, setInitDone]       = useState(false)
  const [liveSessionIds, setLiveIds]  = useState<Set<string>>(new Set())
  const [userName, setUserName]       = useState('')
  const [userPicture, setUserPicture] = useState('')

  const activeThread = threads.find(t => t.id === activeThreadId) ?? null

  // Restore threads from storage, validate sessions against backend
  useEffect(() => {
    const init = async () => {
      const [savedThreads, savedActiveId] = await Promise.all([
        storageGet<Thread[]>('threads'),
        storageGet<string>('activeThreadId'),
      ])

      if (savedThreads?.length) {
        setThreads(savedThreads)

        // Find which sessions are still alive on the backend
        let liveIdsSet = new Set<string>()
        try {
          const [sessionsRes, userRes] = await Promise.all([
            fetch(`${SERVER_URL}/sessions`),
            fetch(`${SERVER_URL}/user`),
          ])
          if (sessionsRes.ok) {
            const sessionsData: { sessions: Record<string, unknown> } = await sessionsRes.json()
            liveIdsSet = new Set(Object.keys(sessionsData.sessions))
            setLiveIds(liveIdsSet)
          }
          if (userRes.ok) {
            const u = await userRes.json()
            setUserName(u.given_name || u.name || '')
            setUserPicture(u.picture || '')
          }
        } catch { /* backend unreachable */ }

        const restore = savedActiveId ?? savedThreads[0]?.id ?? null
        if (restore && liveIdsSet.has(restore)) {
          setActiveId(restore)
          // view will be decided by AppContent based on isAnyConnected and session validity
          setView('chat')
        } else if (restore) {
          // Thread exists but session is dead
          setActiveId(restore)
          setView('settings')
        }
      } else {
        // First launch or no threads
        const providersDone = localStorage.getItem('providersDone')
        setView(providersDone ? 'settings' : 'providers')
      }

      // Always try to fetch user info
      try {
        const userRes = await fetch(`${SERVER_URL}/user`)
        if (userRes.ok) {
          const u = await userRes.json()
          setUserName(u.given_name || u.name || '')
          setUserPicture(u.picture || '')
        }
      } catch { /* ignore */ }

      setInitDone(true)
    }
    init()
  }, [])

  // Persist threads + active ID on every change
  useEffect(() => {
    if (initDone) {
      storageSet('threads', threads)
      storageSet('activeThreadId', activeThreadId)
    }
  }, [threads, activeThreadId, initDone])

  const updateActiveMessages = (updater: (prev: Message[]) => Message[]) => {
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId
        ? { ...t, messages: updater(t.messages), title: makeTitle(updater(t.messages)) }
        : t
    ))
  }

  const handleConnect = async (cfg: AgentConfig) => {
    // Fetch user name first so the greeting can use it
    let name = userName
    if (!name) {
      try {
        const res = await fetch(`${SERVER_URL}/user`)
        if (res.ok) {
          const u = await res.json()
          name = u.given_name || u.name || ''
          setUserName(name)
          setUserPicture(u.picture || '')
        }
      } catch { /* ignore */ }
    }

    const greeting = name
      ? `${name}, how can I help with your calendar?`
      : 'How can I help with your calendar?'

    const welcome: Message = { id: crypto.randomUUID(), role: 'assistant', content: greeting }
    const thread: Thread = {
      id: cfg.sessionId,
      title: 'New chat',
      messages: [welcome],
      config: cfg,
      createdAt: Date.now(),
    }
    setThreads(prev => [thread, ...prev])
    setActiveId(thread.id)
    setLiveIds(prev => new Set([...prev, cfg.sessionId]))
    setView('chat')
  }

  const handleSend = async (text: string) => {
    if (!activeThread) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId
        ? { ...t, messages: [...t.messages, userMsg], title: makeTitle([...t.messages, userMsg]) }
        : t
    ))
    setLoading(true)

    try {
      const res = await fetch(`${SERVER_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: activeThread.config.sessionId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Server error')
      }
      const reply = await res.text()
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply || '(no response)',
      }
      setThreads(prev => prev.map(t =>
        t.id === activeThreadId
          ? { ...t, messages: [...t.messages, assistantMsg] }
          : t
      ))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setThreads(prev => prev.map(t =>
        t.id === activeThreadId
          ? { ...t, messages: [...t.messages, { id: crypto.randomUUID(), role: 'assistant', content: `Error: ${msg}` }] }
          : t
      ))
    } finally {
      setLoading(false)
    }
  }

  const switchThread = (id: string) => {
    setActiveId(id)
    setView('chat')
  }

  const deleteThread = (id: string) => {
    setThreads(prev => {
      const next = prev.filter(t => t.id !== id)
      if (activeThreadId === id) {
        const nextActive = next[0]?.id ?? null
        setActiveId(nextActive)
        if (!nextActive) setView('settings')
      }
      return next
    })
  }

  const startNewChat = () => {
    setActiveId(null)
    setView('settings')
  }

  return (
    <ChatContext.Provider value={{
      view, setView,
      threads, activeThreadId, activeThread,
      loading, initDone, liveSessionIds,
      userName, userPicture,
      handleConnect, handleSend,
      switchThread, deleteThread, startNewChat,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat(): ChatContextType {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used inside ChatProvider')
  return ctx
}
