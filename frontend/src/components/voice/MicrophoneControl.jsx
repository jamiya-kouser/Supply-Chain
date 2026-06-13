// src/components/voice/MicrophoneControl.jsx
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react'
import { useVoice } from '../../context/VoiceContext'
import { useVapi } from '../../hooks/useVapi'

/* Animated waveform bars */
const SoundWave = () => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        className="w-[3px] rounded-full bg-accent-cyan animate-sound-wave"
        style={{
          animationDelay: `${i * 0.12}s`,
          minHeight: '4px',
        }}
      />
    ))}
  </div>
)

/* Three dots processing */
const ProcessingDots = () => (
  <div className="flex items-center gap-1">
    {[...Array(3)].map((_, i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-dot-bounce"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
)

const MicrophoneControl = () => {
  const {
    connectionStatus,
    isListening,
    isAssistantSpeaking,
    isProcessing,
  } = useVoice()

  const { startCall, stopCall, muteToggle } = useVapi()

  const isConnected   = connectionStatus === 'connected'
  const isConnecting  = connectionStatus === 'connecting'

  const handleMainAction = () => {
    if (isConnected) {
      stopCall()
    } else if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      startCall()
    }
  }

  /* State label */
  const stateLabel = isConnecting
    ? 'Connecting…'
    : isAssistantSpeaking
    ? 'Speaking'
    : isProcessing
    ? 'Processing'
    : isListening
    ? 'Listening'
    : isConnected
    ? 'Connected'
    : 'Tap to start'

  return (
    <div className="border-t border-surface-600 px-4 py-4 bg-surface-800">
      <div className="flex items-center justify-between gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2 min-w-[120px]">
          {isAssistantSpeaking && <SoundWave />}
          {isProcessing && <ProcessingDots />}
          {isListening && !isProcessing && (
            <span className="relative flex items-center justify-center w-5 h-5">
              <span className="absolute w-5 h-5 rounded-full bg-red-500/30 animate-pulse-ring" />
              <span className="w-2 h-2 rounded-full bg-red-500" />
            </span>
          )}
          <span className={`text-xs font-medium ${
            isListening
              ? 'text-red-400'
              : isAssistantSpeaking
              ? 'text-accent-cyan'
              : isProcessing
              ? 'text-brand-400'
              : 'text-gray-500'
          }`}>
            {stateLabel}
          </span>
        </div>

        {/* Main mic/call button */}
        <button
          onClick={handleMainAction}
          disabled={isConnecting}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center
            transition-all duration-300 flex-shrink-0
            ${isConnecting ? 'bg-yellow-600/30 cursor-not-allowed' : ''}
            ${isConnected  ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30' : ''}
            ${!isConnected && !isConnecting ? 'bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30' : ''}
          `}
          aria-label={isConnected ? 'End call' : 'Start call'}
        >
          {/* Listening pulse ring */}
          {isListening && (
            <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-pulse-ring" />
          )}

          {isConnected
            ? <PhoneOff size={22} className="text-white" />
            : isConnecting
            ? <Mic size={22} className="text-yellow-400 animate-pulse" />
            : <Mic size={22} className="text-white" />
          }
        </button>

        {/* Mute toggle */}
        {isConnected && (
          <button
            onClick={muteToggle}
            className="w-9 h-9 rounded-full bg-surface-600 hover:bg-surface-500 
                       flex items-center justify-center transition-colors"
            aria-label="Toggle mute"
          >
            <MicOff size={15} className="text-gray-400" />
          </button>
        )}

        {!isConnected && (
          <div className="w-9 h-9 flex items-center justify-center">
            <Volume2 size={15} className="text-gray-600" />
          </div>
        )}
      </div>

      {/* Hint text */}
      {!isConnected && !isConnecting && (
        <p className="text-[11px] text-gray-600 text-center mt-2">
          Interrupt at any time by speaking
        </p>
      )}
    </div>
  )
}

export default MicrophoneControl
