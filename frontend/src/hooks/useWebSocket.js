// src/hooks/useWebSocket.js
import { useEffect, useRef, useCallback, useState } from 'react'
import { WS_URL, WS_EVENTS } from '../utils/constants'

const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECTS     = 5

export const useWebSocket = (sessionId, { onMessage, onOpen, onClose } = {}) => {
  const wsRef        = useRef(null)
  const reconnects   = useRef(0)
  const timerId      = useRef(null)
  const isMounted    = useRef(true)
  const [status, setStatus] = useState('disconnected')

  const connect = useCallback(() => {
    if (!sessionId) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const url = `${WS_URL}/ws/transcripts/${sessionId}`
    setStatus('connecting')

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        if (!isMounted.current) return
        reconnects.current = 0
        setStatus('connected')
        onOpen?.()
      }

      ws.onmessage = (event) => {
        if (!isMounted.current) return
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (err) {
          console.error('[WS] Parse error:', err)
        }
      }

      ws.onerror = (err) => {
        console.error('[WS] Error:', err)
        setStatus('error')
      }

      ws.onclose = () => {
        if (!isMounted.current) return
        setStatus('disconnected')
        onClose?.()

        if (reconnects.current < MAX_RECONNECTS) {
          reconnects.current += 1
          timerId.current = setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }
    } catch (err) {
      console.error('[WS] Connection failed:', err)
      setStatus('error')
    }
  }, [sessionId, onMessage, onOpen, onClose])

  const disconnect = useCallback(() => {
    clearTimeout(timerId.current)
    wsRef.current?.close()
    wsRef.current = null
    setStatus('disconnected')
  }, [])

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    connect()
    return () => {
      isMounted.current = false
      disconnect()
    }
  }, [connect, disconnect])

  return { status, send, disconnect, reconnect: connect }
}

// Hook that parses specific event types
export const useDispatchWebSocket = (sessionId, handlers = {}) => {
  const onMessage = useCallback((data) => {
    switch (data.type) {
      case WS_EVENTS.SHIPMENT_UPDATE:
        handlers.onShipmentUpdate?.(data.payload)
        break
      case WS_EVENTS.EXCEPTION_CREATED:
        handlers.onExceptionCreated?.(data.payload)
        break
      case WS_EVENTS.DRIVER_LOCATION_UPDATE:
        handlers.onDriverLocationUpdate?.(data.payload)
        break
      case WS_EVENTS.FUNCTION_CALL:
        handlers.onFunctionCall?.(data.payload)
        break
      default:
        handlers.onUnknown?.(data)
    }
  }, [handlers])

  return useWebSocket(sessionId, { onMessage, ...handlers })
}
