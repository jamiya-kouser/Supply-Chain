// src/components/voice/VoiceAssistantButton.jsx
import { Mic, PhoneCall } from 'lucide-react'
import { useVoice } from '../../context/VoiceContext'

const VoiceAssistantButton = () => {
  const { togglePanel, isPanelOpen, connectionStatus, isListening, isAssistantSpeaking } = useVoice()

  const isActive  = connectionStatus === 'connected'
  const isRinging = isListening || isAssistantSpeaking

  return (
    <button
      onClick={togglePanel}
      className={`
        fixed bottom-6 right-6 z-40
        w-[60px] h-[60px] rounded-full
        flex items-center justify-center
        shadow-2xl transition-all duration-300
        ${isPanelOpen
          ? 'bg-surface-600 shadow-black/50 scale-95'
          : isActive
          ? 'bg-accent-green/20 border-2 border-accent-green shadow-accent-green/30'
          : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/40 hover:scale-110'
        }
      `}
      aria-label="Toggle voice assistant"
    >
      {/* Pulse rings when active */}
      {isRinging && (
        <>
          <span className="absolute inset-0 rounded-full border-2 border-accent-green/50 animate-pulse-ring" />
          <span className="absolute inset-0 rounded-full border-2 border-accent-green/30 animate-pulse-ring"
                style={{ animationDelay: '0.5s' }} />
        </>
      )}

      {/* Glow when connected */}
      {isActive && !isPanelOpen && (
        <span className="absolute inset-0 rounded-full animate-glow pointer-events-none" />
      )}

      {/* Icon */}
      {isActive
        ? <PhoneCall size={24} className={`${isRinging ? 'text-accent-green' : 'text-white'} relative z-10`} />
        : <Mic size={24} className="text-white relative z-10" />
      }

      {/* Notification dot — unread system messages */}
      {!isPanelOpen && isActive && (
        <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-accent-green 
                         border-2 border-surface-900" />
      )}
    </button>
  )
}

export default VoiceAssistantButton
