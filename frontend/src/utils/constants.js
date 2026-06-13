// src/utils/constants.js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const WS_URL  = import.meta.env.VITE_WS_URL  || 'ws://localhost:8000'
export const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || ''
export const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || ''
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

export const SHIPMENT_STATUS = {
  pending:    { label: 'Pending',    color: 'yellow' },
  in_transit: { label: 'In Transit', color: 'blue'   },
  delivered:  { label: 'Delivered',  color: 'green'  },
  exception:  { label: 'Exception',  color: 'red'    },
  on_hold:    { label: 'On Hold',    color: 'gray'   },
}

export const DRIVER_STATUS = {
  available:  { label: 'Available',  color: 'green'  },
  delivering: { label: 'Delivering', color: 'blue'   },
  break:      { label: 'Break',      color: 'yellow' },
  offline:    { label: 'Offline',    color: 'gray'   },
}

export const EXCEPTION_PRIORITY = {
  low:      { label: 'Low',      color: 'gray'   },
  medium:   { label: 'Medium',   color: 'yellow' },
  high:     { label: 'High',     color: 'orange' },
  critical: { label: 'Critical', color: 'red'    },
}

export const WS_EVENTS = {
  FUNCTION_CALL:          'function_call',
  SHIPMENT_UPDATE:        'shipment_update',
  EXCEPTION_CREATED:      'exception_created',
  DRIVER_LOCATION_UPDATE: 'driver_location_update',
}
