// src/components/dashboard/DeliveryProgressBar.jsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'

const COLORS = {
  delivered:  '#00ff88',
  in_transit: '#7c6df4',
  pending:    '#ffd700',
  exception:  '#ff3366',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
          <span className="text-gray-200">{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  )
}

const DeliveryProgressBar = ({ shipments = [] }) => {
  const counts = {
    delivered:  shipments.filter(s => s.status === 'delivered').length,
    in_transit: shipments.filter(s => s.status === 'in_transit').length,
    pending:    shipments.filter(s => s.status === 'pending').length,
    exception:  shipments.filter(s => s.status === 'exception').length,
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1

  const pieData = [
    { name: 'Delivered',  value: counts.delivered,  fill: COLORS.delivered  },
    { name: 'In Transit', value: counts.in_transit, fill: COLORS.in_transit },
    { name: 'Pending',    value: counts.pending,    fill: COLORS.pending    },
    { name: 'Exception',  value: counts.exception,  fill: COLORS.exception  },
  ].filter(d => d.value > 0)

  // Hourly bar data (mock — replace with real time-series from API)
  const hourlyData = Array.from({ length: 8 }, (_, i) => ({
    hour: `${String(8 + i).padStart(2, '0')}:00`,
    Delivered:  Math.floor(Math.random() * 6) + 1,
    InTransit:  Math.floor(Math.random() * 4) + 1,
    Exceptions: Math.floor(Math.random() * 2),
  }))

  return (
    <div className="card-glow">
      <div className="px-5 py-4 border-b border-surface-600">
        <h3 className="font-display font-semibold text-sm text-gray-100">Delivery Overview</h3>
        <p className="text-xs text-gray-500 mt-0.5">{total} total shipments today</p>
      </div>

      <div className="p-5 flex flex-col lg:flex-row gap-6">
        {/* Pie chart */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-[160px] h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                <span className="text-xs text-gray-400">{d.name}</span>
                <span className="text-xs font-medium text-gray-200 ml-auto pl-2">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex-1 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} barSize={8} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="Delivered"  fill={COLORS.delivered}  radius={[2, 2, 0, 0]} />
              <Bar dataKey="InTransit"  fill={COLORS.in_transit} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Exceptions" fill={COLORS.exception}  radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DeliveryProgressBar
