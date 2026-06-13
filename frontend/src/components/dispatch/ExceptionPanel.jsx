// src/components/dispatch/ExceptionPanel.jsx
import { useState } from 'react'
import {
  AlertTriangle, Phone, CheckCircle2, Clock,
  MapPinOff, UserX, Package, Timer, HelpCircle,
} from 'lucide-react'
import { getStatusBadgeClass, formatRelativeTime, capitalize } from '../../utils/helpers'

const TYPE_ICON = {
  address_inaccessible: MapPinOff,
  customer_absent:      UserX,
  damage:               Package,
  delay:                Timer,
  other:                HelpCircle,
}

const PRIORITY_COLOR = {
  low:      'text-gray-400 bg-gray-500/10 border-gray-500/20',
  medium:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  high:     'text-orange-400 bg-orange-500/10 border-orange-500/20',
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const ExceptionCard = ({ exc, onResolve, onContact }) => {
  const [expanded, setExpanded] = useState(false)
  const TypeIcon = TYPE_ICON[exc.type] || HelpCircle

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200
        ${exc.status === 'resolved'
          ? 'border-surface-600 opacity-60'
          : exc.priority === 'critical'
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-surface-600 bg-surface-700/30'
        }`}
    >
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Priority indicator */}
        <div className={`mt-0.5 w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0
          ${PRIORITY_COLOR[exc.priority]}`}>
          <TypeIcon size={13} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-400">{exc.id}</span>
            <span className="font-mono text-xs text-brand-300">{exc.shipmentId}</span>
            <span className={`badge border ${PRIORITY_COLOR[exc.priority]} text-[10px]`}>
              {capitalize(exc.priority)}
            </span>
            <span className={getStatusBadgeClass(exc.status)}>
              {capitalize(exc.status)}
            </span>
          </div>
          <p className="text-sm text-gray-200 mt-1 truncate">{exc.description}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-gray-500">Driver: {exc.driverName}</span>
            <span className="text-[11px] text-gray-600 flex items-center gap-0.5">
              <Clock size={10} /> {formatRelativeTime(exc.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded actions */}
      {expanded && exc.status !== 'resolved' && (
        <div className="flex items-center gap-2 px-4 pb-3 border-t border-surface-600 pt-3">
          <button
            onClick={() => onResolve?.(exc.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 text-green-400 
                       border border-green-500/20 rounded-lg text-xs hover:bg-green-600/30 transition-colors"
          >
            <CheckCircle2 size={13} /> Resolve
          </button>
          <button
            onClick={() => onContact?.(exc)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 text-brand-300 
                       border border-brand-500/20 rounded-lg text-xs hover:bg-brand-600/30 transition-colors"
          >
            <Phone size={13} /> Contact Driver
          </button>
        </div>
      )}
    </div>
  )
}

const ExceptionPanel = ({ exceptions = [], onResolve, onContact }) => {
  const [filter, setFilter] = useState('open')

  const filtered = filter === 'all'
    ? exceptions
    : exceptions.filter(e => e.status === filter)

  const openCount     = exceptions.filter(e => e.status === 'open').length
  const criticalCount = exceptions.filter(e => e.priority === 'critical' && e.status === 'open').length

  return (
    <div className="card-glow flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-600 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={15} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-gray-100">Exceptions</h3>
            <p className="text-xs text-gray-500">
              {openCount} open
              {criticalCount > 0 && <span className="text-red-400 ml-1">· {criticalCount} critical</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {['open', 'in_progress', 'resolved', 'all'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors
                ${filter === s ? 'bg-brand-600 text-white' : 'bg-surface-700 text-gray-400 hover:text-gray-200'}`}
            >
              {s === 'in_progress' ? 'Active' : capitalize(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
        {filtered.map(exc => (
          <ExceptionCard
            key={exc.id}
            exc={exc}
            onResolve={onResolve}
            onContact={onContact}
          />
        ))}
        {filtered.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
            <CheckCircle2 size={28} className="text-green-500/40" />
            <p className="text-sm text-gray-600">No {filter} exceptions</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExceptionPanel
