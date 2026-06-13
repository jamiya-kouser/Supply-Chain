// src/pages/DashboardPage.jsx
import { useMemo } from 'react'
import StatsCards from '../components/dashboard/StatsCards'
import ShipmentTracker from '../components/dashboard/ShipmentTracker'
import DeliveryProgressBar from '../components/dashboard/DeliveryProgressBar'
import OrdersTable from '../components/dashboard/OrdersTable'
import InventoryTable from '../components/dashboard/InventoryTable'
import { generateMockShipments, generateMockDrivers, generateMockExceptions } from '../utils/helpers'

const DashboardPage = () => {
  // In production replace with React Query hooks hitting the API
  const shipments  = useMemo(() => generateMockShipments(16), [])
  const drivers    = useMemo(() => generateMockDrivers(),      [])
  const exceptions = useMemo(() => generateMockExceptions(),   [])

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      {/* Page header */}
      <div>
        <h1 className="font-display font-bold text-xl text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time logistics overview</p>
      </div>

      {/* Stat cards */}
      <StatsCards shipments={shipments} drivers={drivers} exceptions={exceptions} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Delivery chart — 2 cols */}
        <div className="xl:col-span-2">
          <DeliveryProgressBar shipments={shipments} />
        </div>

        {/* Exceptions summary — 1 col */}
        <div className="card-glow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm text-gray-100">Critical Alerts</h3>
            <span className="badge-red">{exceptions.filter(e => e.status === 'open').length} open</span>
          </div>
          <div className="flex flex-col gap-2">
            {exceptions.filter(e => e.status === 'open').slice(0, 4).map(e => (
              <div key={e.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-700 border border-surface-600">
                <span className={`status-dot mt-1.5 ${e.priority === 'critical' ? 'status-dot-alert' : 'bg-yellow-400'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-200 truncate">{e.description}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{e.id} · {e.shipmentId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shipment tracker */}
      <div className="h-80">
        <ShipmentTracker shipments={shipments} />
      </div>

      {/* Orders + inventory */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-72">
          <OrdersTable />
        </div>
        <div className="h-72">
          <InventoryTable />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
