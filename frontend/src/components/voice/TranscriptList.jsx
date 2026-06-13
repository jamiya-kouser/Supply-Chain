// src/components/voice/TranscriptList.jsx
import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import TranscriptMessage from './TranscriptMessage'
import { useVoice } from '../../context/VoiceContext'

const TranscriptList = () => {
  const { transcripts } = useVoice()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcripts])

  if (transcripts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-full bg-surface-600 flex items-center justify-center">
          <MessageSquare size={22} className="text-gray-500" />
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Press the microphone to start speaking.
          <br />
          Your conversation will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
      {transcripts.map((msg) => (
        <TranscriptMessage key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

export default TranscriptList
