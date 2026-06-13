// src/components/voice/VoiceAssistantPanel.jsx
import { X, Trash2, ChevronRight } from 'lucide-react'
import { useVoice } from '../../context/VoiceContext'
import ConnectionStatus from './ConnectionStatus'
import TranscriptList from './TranscriptList'
import MicrophoneControl from './MicrophoneControl'

const VoiceAssistantPanel = () => {
  const { isPanelOpen, closePanel, clearTranscripts } = useVoice()

  return (
    <>
      {/* Backdrop */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closePanel}
        />
      )}

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-[380px] max-w-[95vw] z-50
          bg-surface-800 border-l border-surface-600 flex flex-col
          shadow-2xl shadow-black/60
          transition-transform duration-300 ease-out
          ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-label="Voice assistant panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-600 bg-surface-900">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 
                            flex items-center justify-center">
              <span className="text-brand-400 font-display font-bold text-xs">AI</span>
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-gray-100">Voice Dispatcher</h2>
              <p className="text-[11px] text-gray-500">LogistiX Command AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearTranscripts}
              className="w-8 h-8 rounded-lg hover:bg-surface-600 flex items-center justify-center 
                         transition-colors group"
              title="Clear transcript"
            >
              <Trash2 size={14} className="text-gray-500 group-hover:text-gray-300" />
            </button>
            <button
              onClick={closePanel}
              className="w-8 h-8 rounded-lg hover:bg-surface-600 flex items-center justify-center 
                         transition-colors"
              aria-label="Close panel"
            >
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Connection status bar */}
        <div className="px-4 py-2 border-b border-surface-700 bg-surface-800/80 flex items-center justify-between">
          <ConnectionStatus />
          <span className="text-[10px] text-gray-600 font-mono">v1.0 · IN-EN</span>
        </div>

        {/* Transcript area */}
        <TranscriptList />

        {/* Microphone controls */}
        <MicrophoneControl />
      </aside>
    </>
  )
}

export default VoiceAssistantPanel
