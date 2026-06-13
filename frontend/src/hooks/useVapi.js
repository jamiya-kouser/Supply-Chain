// src/hooks/useVapi.js
import { useRef, useCallback, useEffect } from 'react'
import Vapi from '@vapi-ai/web'
import { useVoice } from '../context/VoiceContext'
import { vapiConfig, assistantOverrides } from '../services/vapiConfig'
import { generateId } from '../utils/helpers'

export const useVapi = () => {
  const vapiRef = useRef(null)
  const {
    setConnectionStatus, setListening, setAssistantSpeaking,
    setProcessing, setCallId, setError, addSystemMessage,
    updatePartial, finalizeTranscript, addTranscript,
    connectionStatus,
  } = useVoice()

  // Initialize Vapi instance once
  const getVapi = useCallback(() => {
    if (!vapiRef.current) {
      if (!vapiConfig.publicKey) {
        console.warn('[Vapi] No public key configured — running in demo mode')
        return null
      }
      vapiRef.current = new Vapi(vapiConfig.publicKey)
    }
    return vapiRef.current
  }, [])

  const attachListeners = useCallback((vapi) => {
    vapi.on('call-start', () => {
      setConnectionStatus('connected')
      setListening(true)
      addSystemMessage('Voice session started')
    })

    vapi.on('call-end', () => {
      setConnectionStatus('disconnected')
      setListening(false)
      setAssistantSpeaking(false)
      setProcessing(false)
      addSystemMessage('Voice session ended')
    })

    vapi.on('speech-start', () => {
      setAssistantSpeaking(true)
      setProcessing(false)
    })

    vapi.on('speech-end', () => {
      setAssistantSpeaking(false)
    })

    vapi.on('message', (message) => {
      if (message.type === 'transcript') {
        const { role, transcript, transcriptType } = message

        if (transcriptType === 'partial') {
          updatePartial({
            role,
            text:      transcript,
            isFinal:   false,
            timestamp: new Date().toISOString(),
          })
        } else if (transcriptType === 'final') {
          finalizeTranscript({
            id:        generateId(),
            role,
            text:      transcript,
            isFinal:   true,
            timestamp: new Date().toISOString(),
          })
          if (role === 'user') {
            setProcessing(true)
            setListening(false)
          }
        }
      }

      if (message.type === 'function-call') {
        console.log('[Vapi] Function call:', message.functionCall)
      }

      if (message.type === 'hang') {
        addSystemMessage('Call ended by assistant')
      }
    })

    vapi.on('error', (err) => {
      console.error('[Vapi] Error:', err)
      setError(err?.message || 'Voice connection error')
    })

    // Barge-in: user starts speaking while assistant is speaking
    vapi.on('volume-level', () => {
      // volume events handled by vapi internally for barge-in
    })
  }, [setConnectionStatus, setListening, setAssistantSpeaking, setProcessing, setError, addSystemMessage, updatePartial, finalizeTranscript])

  const startCall = useCallback(async () => {
    const vapi = getVapi()

    if (!vapi) {
      // Demo mode — simulate call
      setConnectionStatus('connected')
      setListening(true)
      addSystemMessage('Demo mode — backend not connected')
      addTranscript({
        id:        generateId(),
        role:      'assistant',
        text:      'Hello! I am your logistics assistant. Ask me about shipments, drivers, or exceptions.',
        isFinal:   true,
        timestamp: new Date().toISOString(),
      })
      return
    }

    try {
      setConnectionStatus('connecting')
      attachListeners(vapi)

      const call = await vapi.start(vapiConfig.assistantId, assistantOverrides)
      if (call?.id) setCallId(call.id)
    } catch (err) {
      setError(err?.message || 'Failed to start voice call')
    }
  }, [getVapi, attachListeners, setConnectionStatus, setCallId, setError, setListening, addSystemMessage, addTranscript])

  const stopCall = useCallback(async () => {
    const vapi = vapiRef.current
    if (vapi) {
      try {
        await vapi.stop()
      } catch (err) {
        console.error('[Vapi] Stop error:', err)
      }
    }
    setConnectionStatus('disconnected')
    setListening(false)
    setAssistantSpeaking(false)
    setProcessing(false)
  }, [setConnectionStatus, setListening, setAssistantSpeaking, setProcessing])

  const sendMessage = useCallback((text) => {
    const vapi = vapiRef.current
    if (vapi && connectionStatus === 'connected') {
      vapi.send({ type: 'add-message', message: { role: 'user', content: text } })
    }
  }, [connectionStatus])

  const muteToggle = useCallback(() => {
    const vapi = vapiRef.current
    if (vapi) {
      const isMuted = vapi.isMuted()
      vapi.setMuted(!isMuted)
      return !isMuted
    }
    return false
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return { startCall, stopCall, sendMessage, muteToggle }
}
