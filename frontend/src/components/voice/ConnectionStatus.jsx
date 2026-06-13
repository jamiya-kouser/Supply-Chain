// src/components/voice/ConnectionStatus.jsx
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react'
import { useVoice } from '../../context/VoiceContext'

const STATUS_CONFIG = {
  disconnected: { icon: WifiOff,    label: 'Disconnected', class: 'text-gray-500',        dot: 'bg-gray-600'      },
  connecting:   { icon: Loader2,    label: 'Connecting…',  class: 'text-yellow-400',       dot: 'bg-yellow-400'    },
  connected:    { icon: Wifi,       label: 'Connected',    class: 'text-accent-green',      dot: 'status-dot-online'},
  error:        { icon: AlertCircle,label: 'Error',        class: 'text-accent-red',        dot: 'status-dot-alert' },
}

const ConnectionStatus = () => {
  const { connectionStatus, error } = useVoice()
  const cfg = STATUS_CONFIG[connectionStatus] || STATUS_CONFIG.disconnected
  const Icon = cfg.icon

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-700 rounded-lg">
      <span className={`status-dot ${cfg.dot}`} />
      <Icon
        size={13}
        className={`${cfg.class} ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`}
      />
      <span className={`text-xs font-medium ${cfg.class}`}>{cfg.label}</span>
      {error && (
        <span className="text-xs text-red-400 ml-1 truncate max-w-[140px]" title={error}>
          — {error}
        </span>
      )}
    </div>
  )
}

export default ConnectionStatus
