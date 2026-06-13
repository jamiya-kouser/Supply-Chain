// src/services/vapiConfig.js
import { VAPI_PUBLIC_KEY, VAPI_ASSISTANT_ID } from '../utils/constants'

export const vapiConfig = {
  publicKey:    VAPI_PUBLIC_KEY,
  assistantId:  VAPI_ASSISTANT_ID,
}

export const assistantOverrides = {
  backgroundDenoisingEnabled: true,
  stopSpeakingPlan: {
    numWords:          3,
    voiceSeconds:      0.3,
    backoffSeconds:    1.0,
  },
  transcriber: {
    provider: 'deepgram',
    model:    'nova-2',
    language: 'en-IN',
  },
  voice: {
    provider: 'playht',
    voiceId:  'jennifer',
    speed:    1.05,
  },
  firstMessage:
    'Hello! I am your logistics assistant. You can ask me about shipment status, report delivery issues, or request driver updates.',
  systemPrompt: `You are a logistics voice AI dispatcher for LogistiX Command Center.
You help delivery drivers and dispatchers:
- Track and update shipment statuses
- Report and log delivery exceptions
- Provide ETA estimates
- Connect dispatchers with drivers
Always be concise, clear, and professional. Confirm every action you take.`,
}
