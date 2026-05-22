import { useState, useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import { useCalendars } from '../context/CalendarContext'

type Modal = 'google' | 'outlook' | 'apple' | 'calendly' | null

// ---------- SVG logos ----------

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-16 h-16">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

function OutlookLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-16 h-16">
      <rect x="0" y="0" width="48" height="48" rx="8" fill="#0078D4"/>
      <rect x="6" y="6" width="20" height="20" rx="2" fill="#50E6FF"/>
      <rect x="22" y="6" width="20" height="20" rx="2" fill="#fff" fillOpacity="0.7"/>
      <rect x="6" y="22" width="20" height="20" rx="2" fill="#fff" fillOpacity="0.7"/>
      <rect x="22" y="22" width="20" height="20" rx="2" fill="#50E6FF" fillOpacity="0.7"/>
      <text x="24" y="30" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">OL</text>
    </svg>
  )
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-16 h-16">
      <path
        fill="#1d1d1f"
        d="M35.08 25.6c-.06-5.25 4.29-7.77 4.49-7.9-2.45-3.58-6.26-4.07-7.62-4.13-3.24-.33-6.33 1.92-7.97 1.92-1.64 0-4.17-1.88-6.86-1.83-3.52.05-6.77 2.05-8.58 5.19-3.66 6.34-.94 15.72 2.63 20.86 1.75 2.52 3.83 5.34 6.55 5.24 2.64-.1 3.63-1.7 6.82-1.7 3.19 0 4.1 1.7 6.88 1.65 2.83-.05 4.62-2.55 6.36-5.09 2-2.92 2.83-5.75 2.87-5.9-.06-.03-5.51-2.11-5.57-8.31zM29.7 9.87c1.46-1.77 2.44-4.22 2.17-6.67-2.1.09-4.63 1.4-6.13 3.16-1.35 1.56-2.53 4.06-2.21 6.45 2.33.18 4.71-1.18 6.17-2.94z"
      />
    </svg>
  )
}

function CalendlyLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-16 h-16">
      <circle cx="24" cy="24" r="24" fill="#006BFF"/>
      <rect x="12" y="14" width="24" height="22" rx="3" fill="white"/>
      <rect x="12" y="14" width="24" height="7" rx="3" fill="#006BFF"/>
      <rect x="17" y="26" width="4" height="4" rx="1" fill="#006BFF"/>
      <rect x="22" y="26" width="4" height="4" rx="1" fill="#006BFF"/>
      <rect x="27" y="26" width="4" height="4" rx="1" fill="#006BFF"/>
      <rect x="17" y="31" width="4" height="3" rx="1" fill="#006BFF"/>
      <rect x="22" y="31" width="4" height="3" rx="1" fill="#006BFF"/>
    </svg>
  )
}

// ---------- card ----------

interface CardProps {
  logo: React.ReactNode
  name: string
  subtitle: string
  connected: boolean
  busy: boolean
  onClick: () => void
}

function ProviderCard({ logo, name, subtitle, connected, busy, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`
        relative flex flex-col items-center justify-center gap-4
        rounded-3xl border-2 p-8 w-full aspect-square
        transition-all duration-200 cursor-pointer
        hover:shadow-lg active:scale-[0.97]
        disabled:cursor-wait disabled:opacity-70
        ${connected
          ? 'border-blue-500 bg-blue-50 shadow-blue-100 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'}
      `}
    >
      {connected && (
        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500
                         flex items-center justify-center text-white text-xs font-bold">
          ✓
        </span>
      )}

      {busy && (
        <span className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/70">
          <svg className="animate-spin w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
        </span>
      )}

      <div className="flex-shrink-0">{logo}</div>

      <div className="text-center">
        <p className={`text-base font-semibold ${connected ? 'text-blue-700' : 'text-gray-800'}`}>
          {name}
        </p>
        <p className={`text-xs mt-0.5 ${connected ? 'text-blue-500' : 'text-gray-400'}`}>
          {busy ? 'Connecting…' : connected ? 'Connected — click to disconnect' : subtitle}
        </p>
      </div>
    </button>
  )
}

// ---------- shared modal shell ----------

function Modal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-5">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = `w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition`

function ModalActions({
  onCancel, onConfirm, confirmLabel, disabled,
}: { onCancel: () => void; onConfirm: () => void; confirmLabel: string; disabled: boolean }) {
  return (
    <div className="flex gap-3 mt-6">
      <button onClick={onConfirm} disabled={disabled}
        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white
                   font-medium text-sm rounded-full py-3 transition-colors cursor-pointer">
        {confirmLabel}
      </button>
      <button onClick={onCancel} disabled={disabled}
        className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-600
                   font-medium text-sm rounded-full py-3 transition-colors cursor-pointer">
        Cancel
      </button>
    </div>
  )
}

// ---------- Google modal (uses context) ----------

function GoogleModal({ onClose }: { onClose: () => void }) {
  const { google } = useCalendars()
  const [clientId, setClientId]         = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [localError, setLocalError]     = useState('')

  const handleConnect = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setLocalError('Client ID and Client Secret are required.')
      return
    }
    setLocalError('')
    await google.setup(clientId, clientSecret)
  }

  // If connected successfully via polling, close modal
  useEffect(() => {
    if (google.isConnected) onClose()
  }, [google.isConnected, onClose])

  const err = localError || google.error

  return (
    <Modal title="Configure Google Calendar">
      <p className="text-sm text-gray-500 mb-5">
        To connect, you need to create an <span className="font-medium text-blue-600">OAuth 2.0 Client ID</span> in the Google Cloud Console.
        Set the redirect URI to: <code className="bg-gray-100 px-1 rounded text-blue-700">http://localhost:8000/auth/google/callback</code>
      </p>
      <div className="space-y-4">
        <Field label="Client ID" required>
          <input className={inputCls} value={clientId} onChange={e => setClientId(e.target.value)} placeholder="xxxxx.apps.googleusercontent.com"/>
        </Field>
        <Field label="Client Secret" required>
          <input className={inputCls} type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} placeholder="GOCSPX-xxxx"/>
        </Field>
      </div>
      {err && <p className="text-red-500 text-sm mt-3">{err}</p>}
      {google.polling && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
          <svg className="animate-spin w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <p className="text-sm text-blue-700 font-medium">Please complete the login in the new tab...</p>
        </div>
      )}
      <ModalActions onCancel={onClose} onConfirm={handleConnect} disabled={google.connecting || google.polling}
        confirmLabel={google.connecting ? 'Setting up…' : google.polling ? 'Waiting…' : 'Open Auth Page'}/>
    </Modal>
  )
}

// ---------- Outlook modal (uses context) ----------

function OutlookModal({ onClose }: { onClose: () => void }) {
  const { outlook } = useCalendars()
  const [clientId, setClientId]         = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [tenantId, setTenantId]         = useState('common')
  const [localError, setLocalError]     = useState('')

  const handleSetup = async () => {
    if (!clientId.trim() || !clientSecret.trim()) { setLocalError('Client ID and Client Secret are required.'); return }
    setLocalError('')
    await outlook.setup(clientId, clientSecret, tenantId)
    if (!outlook.error) onClose()
  }

  const busy = outlook.connecting || outlook.polling
  const err  = localError || outlook.error

  return (
    <Modal title="Connect Outlook Calendar">
      <p className="text-sm text-gray-500 mb-5">
        Register an app in <span className="font-medium text-blue-600">Azure Portal → App Registrations</span> with
        redirect URI:{' '}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">http://localhost:8000/auth/outlook/callback</code>
      </p>
      <div className="flex flex-col gap-4">
        <Field label="Client ID" required>
          <input className={inputCls} value={clientId} onChange={e => setClientId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/>
        </Field>
        <Field label="Client Secret" required>
          <input className={inputCls} type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} placeholder="Paste client secret"/>
        </Field>
        <Field label="Tenant ID (optional)">
          <input className={inputCls} value={tenantId} onChange={e => setTenantId(e.target.value)} placeholder="common"/>
        </Field>
      </div>
      {err && <p className="text-red-500 text-sm mt-3">{err}</p>}
      {outlook.polling && (
        <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
          Waiting for Microsoft sign-in… complete it in the opened tab.
        </div>
      )}
      <ModalActions
        onCancel={onClose} onConfirm={handleSetup} disabled={busy}
        confirmLabel={outlook.connecting ? 'Opening…' : outlook.polling ? 'Waiting…' : 'Authenticate with Microsoft'}
      />
    </Modal>
  )
}

// ---------- Apple modal (uses context) ----------

function AppleModal({ onClose }: { onClose: () => void }) {
  const { apple } = useCalendars()
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [localError, setLocalError] = useState('')

  const handleConnect = async () => {
    if (!username.trim() || !password.trim()) { setLocalError('Apple ID and app-specific password are required.'); return }
    setLocalError('')
    await apple.connect(username, password)
    if (!apple.error) onClose()
  }

  const err = localError || apple.error

  return (
    <Modal title="Connect Apple Calendar">
      <p className="text-sm text-gray-500 mb-5">
        Use your Apple ID and an <span className="font-medium text-blue-600">app-specific password</span>.
        Generate one at <span className="font-medium">appleid.apple.com → Security → App-Specific Passwords</span>.
      </p>
      <div className="flex flex-col gap-4">
        <Field label="Apple ID (email)" required>
          <input className={inputCls} type="email" value={username} onChange={e => setUsername(e.target.value)} placeholder="you@icloud.com"/>
        </Field>
        <Field label="App-Specific Password" required>
          <input className={inputCls} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="xxxx-xxxx-xxxx-xxxx"/>
        </Field>
      </div>
      {err && <p className="text-red-500 text-sm mt-3">{err}</p>}
      <ModalActions onCancel={onClose} onConfirm={handleConnect} disabled={apple.connecting}
        confirmLabel={apple.connecting ? 'Connecting…' : 'Connect'}/>
    </Modal>
  )
}

// ---------- Calendly modal (uses context) ----------

function CalendlyModal({ onClose }: { onClose: () => void }) {
  const { calendly } = useCalendars()
  const [token, setToken]           = useState('')
  const [localError, setLocalError] = useState('')

  const handleConnect = async () => {
    if (!token.trim()) { setLocalError('Personal Access Token is required.'); return }
    setLocalError('')
    await calendly.connect(token)
    if (!calendly.error) onClose()
  }

  const err = localError || calendly.error

  return (
    <Modal title="Connect Calendly">
      <p className="text-sm text-gray-500 mb-5">
        Create a <span className="font-medium text-blue-600">Personal Access Token</span> at:{' '}
        <span className="font-medium">Calendly → Integrations → API & Webhooks</span>.
      </p>
      <Field label="Personal Access Token" required>
        <input className={inputCls} type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="eyJhbGciOi…"/>
      </Field>
      {err && <p className="text-red-500 text-sm mt-3">{err}</p>}
      <ModalActions onCancel={onClose} onConfirm={handleConnect} disabled={calendly.connecting}
        confirmLabel={calendly.connecting ? 'Connecting…' : 'Connect'}/>
    </Modal>
  )
}

// ---------- Main component ----------

export default function CalendarProviders() {
  const { setView }                          = useChat()
  const { google, outlook, apple, calendly, refreshAll, isAnyConnected } = useCalendars()
  const [modal, setModal]                    = useState<Modal>(null)

  // Re-fetch status every time this screen is shown so the UI always reflects reality
  useEffect(() => { refreshAll() }, [])

  const handleCardClick = (provider: 'google' | 'outlook' | 'apple' | 'calendly') => {
    const ctx = { google, outlook, apple, calendly }[provider]
    if (ctx.connecting) return

    if (ctx.isConnected) {
      ctx.disconnect()
      return
    }

    if (provider === 'google')   { setModal('google'); return }
    if (provider === 'outlook')  { setModal('outlook'); return }
    if (provider === 'apple')    { setModal('apple'); return }
    if (provider === 'calendly') { setModal('calendly'); return }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-medium text-gray-800 mb-2">Calendar Assistant</h1>
          <p className="text-gray-400 text-lg">Choose the calendars you want to sync</p>
        </div>

        {/* 2 × 2 grid */}
        <div className="grid grid-cols-2 gap-5 mb-8">
          <ProviderCard
            logo={<GoogleLogo />} name="Google" subtitle="Click to connect via OAuth2"
            connected={google.isConnected} busy={google.connecting || google.polling}
            onClick={() => handleCardClick('google')}
          />
          <ProviderCard
            logo={<OutlookLogo />} name="Outlook" subtitle="Microsoft 365 calendar"
            connected={outlook.isConnected} busy={outlook.connecting || outlook.polling}
            onClick={() => handleCardClick('outlook')}
          />
          <ProviderCard
            logo={<AppleLogo />} name="Apple Calendar" subtitle="iCloud CalDAV"
            connected={apple.isConnected} busy={apple.connecting}
            onClick={() => handleCardClick('apple')}
          />
          <ProviderCard
            logo={<CalendlyLogo />} name="Calendly" subtitle="Scheduled meetings"
            connected={calendly.isConnected} busy={calendly.connecting}
            onClick={() => handleCardClick('calendly')}
          />
        </div>

        {/* Continue */}
        <button
          onClick={() => { localStorage.setItem('providersDone', '1'); setView('settings') }}
          disabled={!isAnyConnected}
          className={`w-full font-medium text-lg rounded-full py-4 transition-colors cursor-pointer
                     ${isAnyConnected 
                       ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                       : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {isAnyConnected ? 'Continue →' : 'Connect a calendar to continue'}
        </button>
        <p className="text-center text-sm text-gray-400 mt-3">
          You can connect more providers later from Settings
        </p>
      </div>

      {modal === 'google'   && <GoogleModal   onClose={() => setModal(null)}/>}
      {modal === 'outlook'  && <OutlookModal  onClose={() => setModal(null)}/>}
      {modal === 'apple'    && <AppleModal    onClose={() => setModal(null)}/>}
      {modal === 'calendly' && <CalendlyModal onClose={() => setModal(null)}/>}
    </div>
  )
}
