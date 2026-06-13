// src/context/VoiceContext.jsx
import { createContext, useContext, useReducer, useCallback } from 'react'

const VoiceContext = createContext(null)

const initialState = {
  isPanelOpen:        false,
  connectionStatus:   'disconnected', // disconnected | connecting | connected | error
  isListening:        false,
  isAssistantSpeaking:false,
  isProcessing:       false,
  transcripts:        [],
  callId:             null,
  error:              null,
}

const voiceReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_PANEL':
      return { ...state, isPanelOpen: !state.isPanelOpen }
    case 'OPEN_PANEL':
      return { ...state, isPanelOpen: true }
    case 'CLOSE_PANEL':
      return { ...state, isPanelOpen: false }
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload }
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload }
    case 'SET_ASSISTANT_SPEAKING':
      return { ...state, isAssistantSpeaking: action.payload }
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload }
    case 'SET_CALL_ID':
      return { ...state, callId: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, connectionStatus: 'error' }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'ADD_TRANSCRIPT': {
      const existing = state.transcripts.findIndex(t => t.id === action.payload.id)
      if (existing !== -1) {
        const updated = [...state.transcripts]
        updated[existing] = action.payload
        return { ...state, transcripts: updated }
      }
      return { ...state, transcripts: [...state.transcripts, action.payload] }
    }
    case 'UPDATE_PARTIAL_TRANSCRIPT': {
      const idx = state.transcripts.findLastIndex(
        t => t.role === action.payload.role && !t.isFinal
      )
      if (idx !== -1) {
        const updated = [...state.transcripts]
        updated[idx] = { ...updated[idx], text: action.payload.text }
        return { ...state, transcripts: updated }
      }
      return {
        ...state,
        transcripts: [
          ...state.transcripts,
          { ...action.payload, id: `partial-${Date.now()}` },
        ],
      }
    }
    case 'FINALIZE_TRANSCRIPT': {
      const idx = state.transcripts.findLastIndex(
        t => t.role === action.payload.role && !t.isFinal
      )
      if (idx !== -1) {
        const updated = [...state.transcripts]
        updated[idx] = { ...action.payload, isFinal: true }
        return { ...state, transcripts: updated }
      }
      return { ...state, transcripts: [...state.transcripts, { ...action.payload, isFinal: true }] }
    }
    case 'ADD_SYSTEM_MESSAGE':
      return {
        ...state,
        transcripts: [
          ...state.transcripts,
          { id: `sys-${Date.now()}`, role: 'system', text: action.payload, isFinal: true, timestamp: new Date().toISOString() },
        ],
      }
    case 'CLEAR_TRANSCRIPTS':
      return { ...state, transcripts: [] }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

export const VoiceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(voiceReducer, initialState)

  const togglePanel         = useCallback(() => dispatch({ type: 'TOGGLE_PANEL' }),  [])
  const openPanel           = useCallback(() => dispatch({ type: 'OPEN_PANEL' }),    [])
  const closePanel          = useCallback(() => dispatch({ type: 'CLOSE_PANEL' }),   [])
  const setConnectionStatus = useCallback((s) => dispatch({ type: 'SET_CONNECTION_STATUS',  payload: s }),   [])
  const setListening        = useCallback((v) => dispatch({ type: 'SET_LISTENING',           payload: v }),   [])
  const setAssistantSpeaking= useCallback((v) => dispatch({ type: 'SET_ASSISTANT_SPEAKING',  payload: v }),   [])
  const setProcessing       = useCallback((v) => dispatch({ type: 'SET_PROCESSING',          payload: v }),   [])
  const setCallId           = useCallback((id)=> dispatch({ type: 'SET_CALL_ID',             payload: id }),  [])
  const setError            = useCallback((e) => dispatch({ type: 'SET_ERROR',               payload: e }),   [])
  const clearError          = useCallback(()  => dispatch({ type: 'CLEAR_ERROR' }),  [])
  const addTranscript       = useCallback((t) => dispatch({ type: 'ADD_TRANSCRIPT',          payload: t }),   [])
  const updatePartial       = useCallback((t) => dispatch({ type: 'UPDATE_PARTIAL_TRANSCRIPT', payload: t }), [])
  const finalizeTranscript  = useCallback((t) => dispatch({ type: 'FINALIZE_TRANSCRIPT',     payload: t }),   [])
  const addSystemMessage    = useCallback((m) => dispatch({ type: 'ADD_SYSTEM_MESSAGE',       payload: m }),   [])
  const clearTranscripts    = useCallback(()  => dispatch({ type: 'CLEAR_TRANSCRIPTS' }),     [])
  const reset               = useCallback(()  => dispatch({ type: 'RESET' }),        [])

  return (
    <VoiceContext.Provider value={{
      ...state,
      togglePanel, openPanel, closePanel,
      setConnectionStatus, setListening,
      setAssistantSpeaking, setProcessing,
      setCallId, setError, clearError,
      addTranscript, updatePartial, finalizeTranscript,
      addSystemMessage, clearTranscripts, reset,
    }}>
      {children}
    </VoiceContext.Provider>
  )
}

export const useVoice = () => {
  const ctx = useContext(VoiceContext)
  if (!ctx) throw new Error('useVoice must be used inside VoiceProvider')
  return ctx
}
