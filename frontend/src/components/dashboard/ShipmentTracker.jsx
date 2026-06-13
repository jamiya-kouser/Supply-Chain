// src/components/dashboard/ShipmentTracker.jsx
import { useState, useMemo } from 'react'
import { Table, Map, Search, Filter, RefreshCw, ArrowUpDown } from 'lucide-react'
import { getStatusBadgeClass, formatETA, formatRelativeTime, capitalize } from '../../utils/helpers'

const ShipmentTracker = ({ shipments = [], isLoading = false, onRefresh }) => {
  const [view,   setView]   = useState('table')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortKey, setSortKey]   = useState('updatedAt')
  const [sortDir, setSortDir]   = useState('desc')

  const filtered = useMemo(() => {
    let data = [...shipments]

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q)
      )
    }

    if (filter !== 'all') {
      data = data.filter(s => s.status === filter)
    }

    data.sort((a, b) => {
      const av = a[sortKey] || ''
      const bv = b[sortKey] || ''
      return sortDir === 'asc'
        ? av > bv ? 1 : -1
        : av < bv ? 1 : -1
    })

    return data
  }, [shipments, search, filter, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const STATUSES = ['all', 'in_transit', 'delivered', 'pending', 'exception', 'on_hold']

  return (
    <div className="card-glow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-600 flex-shrink-0">
        <div>
          <h3 className="font-display font-semibold text-sm text-gray-100">Shipment Tracker</h3>
          <p className="text-xs text-gray-500 mt-0.5">{filtered.length} shipments</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-surface-700 rounded-lg p-0.5">
            <button
              onClick={() => setView('table')}
              className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1
                ${view === 'table' ? 'bg-surface-500 text-gray-100' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Table size={13} /> Table
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1
                ${view === 'map' ? 'bg-surface-500 text-gray-100' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Map size={13} /> Map
            </button>
          </div>
          <button onClick={onRefresh} className="btn-ghost px-2 py-2">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-surface-700 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search shipments…"
            className="input-field pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                ${filter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-gray-200'
                }`}
            >
              {s === 'all' ? 'All' : capitalize(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw size={20} className="animate-spin text-gray-500" />
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface-800 z-10">
              <tr className="border-b border-surface-600">
                {[
                  { key: 'id',          label: 'Shipment ID' },
                  { key: 'origin',      label: 'Origin'      },
                  { key: 'destination', label: 'Destination' },
                  { key: 'status',      label: 'Status'      },
                  { key: 'eta',         label: 'ETA'         },
                  { key: 'carrier',     label: 'Carrier'     },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="table-header text-left px-4 py-3 cursor-pointer hover:text-gray-300 
                               transition-colors select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown size={10} className={sortKey === col.key ? 'text-brand-400' : 'text-gray-600'} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="table-row">
                  <td className="px-4 py-3 font-mono text-brand-300 font-medium">{s.id}</td>
                  <td className="px-4 py-3 text-gray-300">{s.origin}</td>
                  <td className="px-4 py-3 text-gray-300">{s.destination}</td>
                  <td className="px-4 py-3">
                    <span className={getStatusBadgeClass(s.status)}>
                      {capitalize(s.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono">{formatETA(s.eta)}</td>
                  <td className="px-4 py-3 text-gray-400">{s.carrier}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-600 text-sm">
                    No shipments match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ShipmentTracker
