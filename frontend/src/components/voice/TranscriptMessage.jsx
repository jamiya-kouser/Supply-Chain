// src/components/voice/TranscriptMessage.jsx
import { memo } from 'react'
import { Bot, User } from 'lucide-react'
import { formatETA } from '../../utils/helpers'

const TranscriptMessage = memo(({ message }) => {
  const { role, text, isFinal, timestamp } = message

  if (role === 'system') {
    return (
      <div className="transcript-system animate-fade-in">
        — {text} —
      </div>
    )
  }

  const isUser = role === 'user'

  return (
    <div className={`flex items-end gap-2 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mb-0.5
          ${isUser ? 'bg-brand-600' : 'bg-surface-500'}`}
      >
        {isUser
          ? <User size={13} className="text-white" />
          : <Bot  size={13} className="text-accent-cyan" />
        }
      </div>

      {/* Bubble */}
      <div className={`group relative flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={isUser ? 'transcript-user' : 'transcript-assistant'}>
          {isFinal ? (
            <span>{text}</span>
          ) : (
            <span className="text-gray-400 italic">
              {text}
              <span className="inline-flex ml-1 gap-0.5 align-middle">
                <span className="w-1 h-1 rounded-full bg-gray-500 animate-dot-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-gray-500 animate-dot-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-gray-500 animate-dot-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </span>
          )}
        </div>

        {/* Timestamp — appears on hover */}
        {isFinal && timestamp && (
          <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            {formatETA(timestamp)}
          </span>
        )}
      </div>
    </div>
  )
})

TranscriptMessage.displayName = 'TranscriptMessage'

export default TranscriptMessage
