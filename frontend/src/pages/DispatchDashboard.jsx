// src/pages/DispatchDashboard.jsx
import { useState, useMemo, useCallback } from 'react'
import DriverStatusBoard from '../components/dispatch/DriverStatusBoard'
import ExceptionPanel from '../components/dispatch/ExceptionPanel'
import DriverMap from '../components/dispatch/DriverMap'
import DeliveryProgressBar from '../components/dashboard/DeliveryProgressBar'
import StatsCards from '../components/dashboard/StatsCards'
import { generateMockShipments, generateMockDrivers, generateMockExceptions } from '../utils/helpers'

const DispatchDashboard = () => {
  const [shipments,  setShipments]  = useState(() => generateMockShipments(14))
  const [drivers,    setDrivers]    = useState(() => generateMockDrivers())
  const [exceptions, setExceptions] = useState(() => generateMockExceptions())

  const handleResolveException = useCallback((id) => {
    setExceptions(prev =>
      prev.map(e => e.id === id ? { ...e, status: 'resolved' } : e)
    )
  }, [])

  const handleContactDriver = useCallback((exc) => {
    // In production — open voice panel or show comms modal
    console.log('[Dispatch] Contacting driver for exception:', exc)
    alert(`Initiating contact with ${exc.driverName} for ${exc.id}`)
  }, [])

  return (
    <div className="flex flex-col gap-5 p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-gray-100">Dispatch Command Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live operations monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot-online" />
          <span className="text-xs text-gray-400">Live · Updates every 30s</span>
        </div>
      </div>

      {/* Stats */}
      <StatsCards shipments={shipments} drivers={drivers} exceptions={exceptions} />

      {/* Map + Exceptions — side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5" style={{ minHeight: 420 }}>
        <div className="xl:col-span-2 h-[420px]">
          <DriverMap drivers={drivers} shipments={shipments} />
        </div>
        <div className="h-[420px]">
          <ExceptionPanel
            exceptions={exceptions}
            onResolve={handleResolveException}
            onContact={handleContactDriver}
          />
        </div>
      </div>

      {/* Delivery chart */}
      <DeliveryProgressBar shipments={shipments} />

      {/* Driver board — full width */}
      <div className="h-96">
        <DriverStatusBoard drivers={drivers} />
      </div>
    </div>
  )
}

export default DispatchDashboard
