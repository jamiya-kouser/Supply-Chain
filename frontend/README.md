# LogistiX — Logistics Command Center

A production-grade React frontend for a Voice AI-powered logistics platform.
Built with Vapi, Mapbox, Recharts, TailwindCSS, React Query, and WebSockets.

---

## Stack

| Layer         | Technology                                 |
|---------------|--------------------------------------------|
| Framework     | React 18 + Vite                            |
| Styling       | TailwindCSS (custom dark theme)            |
| Icons         | Lucide React                               |
| Voice AI      | Vapi Web SDK (`@vapi-ai/web`)             |
| WebRTC Audio  | Vapi (handles WebRTC internally)           |
| Maps          | Mapbox GL JS                               |
| Charts        | Recharts                                   |
| State         | React Context + useReducer                 |
| Server State  | TanStack React Query                       |
| HTTP Client   | Axios (JWT auto-attach)                    |
| Real-time     | Native WebSocket API                       |
| Routing       | React Router v6                            |

---

## Project Structure

```
src/
├── components/
│   ├── voice/
│   │   ├── VoiceAssistantButton.jsx   # Floating mic button (bottom-right)
│   │   ├── VoiceAssistantPanel.jsx    # Slide-in voice panel (400px)
│   │   ├── MicrophoneControl.jsx      # Start/stop + visual states
│   │   ├── TranscriptList.jsx         # Virtualised transcript scroll
│   │   ├── TranscriptMessage.jsx      # ChatGPT-style message bubble
│   │   └── ConnectionStatus.jsx       # Connection status badge
│   ├── dispatch/
│   │   ├── DriverStatusBoard.jsx      # Live driver table
│   │   ├── ExceptionPanel.jsx         # Exception cards + resolve actions
│   │   ├── DriverMap.jsx              # Mapbox live driver map
│   │   └── DeliveryProgressBar.jsx    # Recharts bar + pie charts
│   ├── dashboard/
│   │   ├── StatsCards.jsx             # 4-up KPI cards
│   │   ├── ShipmentTracker.jsx        # Filterable shipment table
│   │   ├── OrdersTable.jsx            # Recent orders
│   │   └── InventoryTable.jsx         # Inventory with low-stock alerts
│   └── layout/
│       ├── Navbar.jsx                 # Top nav + notifications
│       ├── Sidebar.jsx                # Collapsible nav sidebar
│       └── Footer.jsx
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx                  # Auth + demo login
│   ├── DashboardPage.jsx              # Main dashboard
│   └── DispatchDashboard.jsx          # Dispatch command center
├── hooks/
│   ├── useVapi.js                     # Vapi lifecycle + event handlers
│   ├── useWebSocket.js                # WS connection + auto-reconnect
│   └── useTranscripts.js              # Transcript helpers
├── services/
│   ├── api.js                         # Axios instance + all endpoints
│   └── vapiConfig.js                  # Vapi assistant config
├── context/
│   ├── VoiceContext.jsx               # Global voice state (reducer)
│   └── AuthContext.jsx                # Auth state
├── utils/
│   ├── constants.js                   # Env vars + enums
│   └── helpers.js                     # Formatters + mock data generators
├── App.jsx                            # Router + layout wrapper
└── main.jsx
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
VITE_API_URL=http://localhost:8000         # Your FastAPI backend
VITE_WS_URL=ws://localhost:8000
VITE_VAPI_PUBLIC_KEY=your_key_here         # From app.vapi.ai
VITE_VAPI_ASSISTANT_ID=your_assistant_id   # From app.vapi.ai
VITE_MAPBOX_TOKEN=your_token_here          # From mapbox.com (free tier)
```

### 3. Start dev server

```bash
npm run dev
```

Open http://localhost:3000

> **No backend?** Use the **Demo Login** on the login page — all data uses
> mock generators and the voice panel works in demo mode (no Vapi key needed).

---

## Connecting to FastAPI Backend

### REST Endpoints Expected

```
GET  /api/shipments         → list shipments
GET  /api/shipments/:id
PATCH /api/shipments/:id

GET  /api/drivers
PATCH /api/drivers/:id/status

GET  /api/exceptions
POST /api/exceptions/:id/resolve

GET  /api/orders
GET  /api/inventory

POST /api/auth/login        → returns { token, user }
GET  /api/auth/me
```

### WebSocket

Connect at: `ws://localhost:8000/ws/transcripts/{sessionId}`

Expected event shapes:

```json
{ "type": "shipment_update",        "payload": { ...shipment } }
{ "type": "exception_created",      "payload": { ...exception } }
{ "type": "driver_location_update", "payload": { "id": "DRV-001", "lat": 18.5, "lng": 73.8 } }
{ "type": "function_call",          "payload": { "name": "...", "args": {} } }
```

---

## Voice AI — Vapi Setup

1. Go to [app.vapi.ai](https://app.vapi.ai)
2. Create an assistant
3. Copy your **Public Key** and **Assistant ID** to `.env`
4. The `useVapi` hook handles:
   - Call start/stop
   - Partial + final transcripts
   - Barge-in (interruption)
   - Function calls forwarded to backend
   - Auto-reconnect on error

---

## Mapbox Setup

1. Create free account at [mapbox.com](https://mapbox.com)
2. Copy your default public token to `.env` as `VITE_MAPBOX_TOKEN`
3. Without token, a fallback SVG map renders showing driver positions

---

## Build for Production

```bash
npm run build
```

Output in `dist/` — deploy to Vercel, Netlify, or serve with Nginx.

---

## Extending

### Add React Query for real data

Replace mock data in `DashboardPage.jsx`:

```js
import { useQuery } from '@tanstack/react-query'
import { shipmentsApi } from '../services/api'

const { data: shipments = [], isLoading } = useQuery({
  queryKey: ['shipments'],
  queryFn:  () => shipmentsApi.getAll().then(r => r.data),
  refetchInterval: 30_000,
})
```

### Add WebSocket live updates

In `DispatchDashboard.jsx`:

```js
import { useDispatchWebSocket } from '../hooks/useWebSocket'

useDispatchWebSocket('session-123', {
  onDriverLocationUpdate: (payload) => {
    setDrivers(prev =>
      prev.map(d => d.id === payload.id ? { ...d, lat: payload.lat, lng: payload.lng } : d)
    )
  },
  onExceptionCreated: (payload) => {
    setExceptions(prev => [payload, ...prev])
  },
})
```

---

## Demo Credentials

| Role       | Action                          |
|------------|---------------------------------|
| Dispatcher | Click "Dispatcher" demo button  |
| Driver     | Click "Driver" demo button      |

No backend required for UI preview.
