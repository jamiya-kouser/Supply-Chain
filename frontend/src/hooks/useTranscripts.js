// src/hooks/useTranscripts.js
import { useCallback, useRef } from 'react'
import { useVoice } from '../context/VoiceContext'
import { generateId } from '../utils/helpers'

export const useTranscripts = () => {
  const { transcripts, addTranscript, updatePartial, finalizeTranscript, clearTranscripts } = useVoice()
  const listRef = useRef(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight
      }
    })
  }, [])

  const addUserMessage = useCallback((text, isFinal = true) => {
    const msg = { id: generateId(), role: 'user', text, isFinal, timestamp: new Date().toISOString() }
    addTranscript(msg)
    scrollToBottom()
    return msg
  }, [addTranscript, scrollToBottom])

  const addAssistantMessage = useCallback((text, isFinal = true) => {
    const msg = { id: generateId(), role: 'assistant', text, isFinal, timestamp: new Date().toISOString() }
    addTranscript(msg)
    scrollToBottom()
    return msg
  }, [addTranscript, scrollToBottom])

  const updateUserPartial = useCallback((text) => {
    updatePartial({ role: 'user', text, isFinal: false, timestamp: new Date().toISOString() })
    scrollToBottom()
  }, [updatePartial, scrollToBottom])

  const finalizeUserMessage = useCallback((text) => {
    finalizeTranscript({ id: generateId(), role: 'user', text, isFinal: true, timestamp: new Date().toISOString() })
    scrollToBottom()
  }, [finalizeTranscript, scrollToBottom])

  return {
    transcripts,
    listRef,
    addUserMessage,
    addAssistantMessage,
    updateUserPartial,
    finalizeUserMessage,
    clearTranscripts,
    scrollToBottom,
  }
}
