// src/components/dashboard/StatsCards.jsx
import { Package, Users, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, sub, trend, color }) => {
  const colorMap = {
    blue:   { bg: 'bg-brand-500/10',   border: 'border-brand-500/20',   icon: 'text-brand-400'   },
    green:  { bg: 'bg-green-500/10',   border: 'border-green-500/20',   icon: 'text-green-400'   },
    red:    { bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: 'text-red-400'     },
    cyan:   { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    icon: 'text-cyan-400'    },
    yellow: { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  icon: 'text-yellow-400'  },
  }
  const c = colorMap[color] || colorMap.blue

  const isPositive = trend?.startsWith('+')

  return (
    <div className={`stat-card border ${c.border} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon size={19} className={c.icon} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium
            ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
      {sub && <p className="text-[11px] text-gray-600">{sub}</p>}
    </div>
  )
}

const StatsCards = ({ shipments = [], drivers = [], exceptions = [] }) => {
  const delivered   = shipments.filter(s => s.status === 'delivered').length
  const inTransit   = shipments.filter(s => s.status === 'in_transit').length
  const activeDrivers = drivers.filter(d => d.status !== 'offline').length
  const openExc     = exceptions.filter(e => e.status === 'open').length
  const criticalExc = exceptions.filter(e => e.priority === 'critical' && e.status === 'open').length

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={Package}
        label="Total Shipments"
        value={shipments.length}
        sub={`${inTransit} in transit`}
        trend="+12%"
        color="blue"
      />
      <StatCard
        icon={CheckCircle2}
        label="Delivered Today"
        value={delivered}
        sub={`${Math.round((delivered / (shipments.length || 1)) * 100)}% completion rate`}
        trend="+5%"
        color="green"
      />
      <StatCard
        icon={Users}
        label="Active Drivers"
        value={activeDrivers}
        sub={`${drivers.filter(d => d.status === 'delivering').length} currently delivering`}
        color="cyan"
      />
      <StatCard
        icon={AlertTriangle}
        label="Open Exceptions"
        value={openExc}
        sub={criticalExc > 0 ? `${criticalExc} critical` : 'No critical issues'}
        trend={openExc > 3 ? '+2' : undefined}
        color={openExc > 0 ? 'red' : 'green'}
      />
    </div>
  )
}

export default StatsCards
