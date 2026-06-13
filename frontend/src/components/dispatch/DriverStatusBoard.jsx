// src/components/dispatch/DriverStatusBoard.jsx
import { useState } from 'react'
import { Phone, MapPin, Package, Clock, User } from 'lucide-react'
import { getStatusBadgeClass, formatETA, capitalize } from '../../utils/helpers'

const STATUS_DOT = {
  available:  'status-dot-online',
  delivering: 'status-dot-busy',
  break:      'bg-yellow-400',
  offline:    'status-dot-offline',
}

const DriverRow = ({ driver, onContact }) => (
  <tr className="table-row group">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-full bg-surface-600 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-gray-400" />
          <span className={`absolute bottom-0 right-0 status-dot w-2.5 h-2.5 border-2 border-surface-800 ${STATUS_DOT[driver.status] || 'status-dot-offline'}`} />
        </div>
        <div>
          <p className="text-sm text-gray-200 font-medium">{driver.name}</p>
          <p className="text-[11px] text-gray-600 font-mono">{driver.id}</p>
        </div>
      </div>
    </td>
    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{driver.vehicle}</td>
    <td className="px-4 py-3">
      <span className={getStatusBadgeClass(driver.status)}>
        {capitalize(driver.status)}
      </span>
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <MapPin size={11} className="text-gray-600" />
        {driver.location}
      </div>
    </td>
    <td className="px-4 py-3">
      {driver.currentShipmentId ? (
        <span className="font-mono text-xs text-brand-300">{driver.currentShipmentId}</span>
      ) : (
        <span className="text-xs text-gray-600">—</span>
      )}
    </td>
    <td className="px-4 py-3">
      {driver.status === 'delivering' ? (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={11} className="text-gray-600" />
          {formatETA(driver.eta)}
        </div>
      ) : (
        <span className="text-xs text-gray-600">—</span>
      )}
    </td>
    <td className="px-4 py-3">
      <button
        onClick={() => onContact?.(driver)}
        className="opacity-0 group-hover:opacity-100 transition-opacity
                   flex items-center gap-1.5 px-2.5 py-1 rounded-lg 
                   bg-brand-600/20 text-brand-300 text-xs hover:bg-brand-600/30"
      >
        <Phone size={11} /> Contact
      </button>
    </td>
  </tr>
)

const DriverStatusBoard = ({ drivers = [] }) => {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? drivers
    : drivers.filter(d => d.status === filter)

  return (
    <div className="card-glow flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-600">
        <div>
          <h3 className="font-display font-semibold text-sm text-gray-100">Driver Status Board</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {drivers.filter(d => d.status !== 'offline').length} active · {drivers.length} total
          </p>
        </div>
        <div className="flex gap-1">
          {['all', 'available', 'delivering', 'break', 'offline'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                ${filter === s ? 'bg-brand-600 text-white' : 'bg-surface-700 text-gray-400 hover:text-gray-200'}`}
            >
              {capitalize(s) || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-surface-800">
            <tr className="border-b border-surface-600">
              <th className="table-header text-left px-4 py-3">Driver</th>
              <th className="table-header text-left px-4 py-3">Vehicle</th>
              <th className="table-header text-left px-4 py-3">Status</th>
              <th className="table-header text-left px-4 py-3">Location</th>
              <th className="table-header text-left px-4 py-3">Shipment</th>
              <th className="table-header text-left px-4 py-3">ETA</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(driver => (
              <DriverRow key={driver.id} driver={driver} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-600 text-sm">
                  No drivers match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DriverStatusBoard
