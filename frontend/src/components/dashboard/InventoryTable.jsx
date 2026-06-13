// src/components/dashboard/InventoryTable.jsx
import { useState } from 'react'
import { Box, TrendingDown, AlertCircle } from 'lucide-react'

const DEMO_INVENTORY = [
  { sku: 'SKU-0021', name: 'Industrial Bearings 6205',  qty: 840,  min: 200, warehouse: 'WH-Mumbai',    category: 'Mechanical' },
  { sku: 'SKU-0045', name: 'Circuit Breaker 32A',       qty: 124,  min: 150, warehouse: 'WH-Delhi',     category: 'Electrical' },
  { sku: 'SKU-0078', name: 'Hydraulic Hose 12mm',       qty: 2340, min: 500, warehouse: 'WH-Pune',      category: 'Hydraulics' },
  { sku: 'SKU-0103', name: 'Servo Motor 1.5kW',         qty: 67,   min: 80,  warehouse: 'WH-Bangalore', category: 'Motors'     },
  { sku: 'SKU-0119', name: 'PLC Control Module S7-300', qty: 42,   min: 30,  warehouse: 'WH-Chennai',   category: 'Electronics'},
  { sku: 'SKU-0134', name: 'Safety Valve DN50',         qty: 188,  min: 100, warehouse: 'WH-Hyderabad', category: 'Valves'     },
]

const InventoryTable = ({ inventory = DEMO_INVENTORY }) => {
  const [search, setSearch] = useState('')

  const filtered = inventory.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card-glow flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-600">
        <div>
          <h3 className="font-display font-semibold text-sm text-gray-100">Inventory</h3>
          <p className="text-xs text-gray-500 mt-0.5">{inventory.filter(i => i.qty < i.min).length} low stock alerts</p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search SKU…"
          className="input-field w-40 h-8 text-xs"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-surface-800">
            <tr className="border-b border-surface-600">
              <th className="table-header text-left px-4 py-3">SKU</th>
              <th className="table-header text-left px-4 py-3">Item</th>
              <th className="table-header text-left px-4 py-3">Category</th>
              <th className="table-header text-left px-4 py-3">Warehouse</th>
              <th className="table-header text-left px-4 py-3">Qty</th>
              <th className="table-header text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const isLow = item.qty < item.min
              const pct   = Math.min((item.qty / item.min) * 100, 100)
              return (
                <tr key={item.sku} className="table-row">
                  <td className="px-4 py-3 font-mono text-gray-500">{item.sku}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Box size={13} className={isLow ? 'text-red-400' : 'text-gray-500'} />
                      <span className="text-gray-200">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.category}</td>
                  <td className="px-4 py-3 text-gray-400">{item.warehouse}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`font-medium ${isLow ? 'text-red-400' : 'text-gray-300'}`}>
                        {item.qty.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isLow ? (
                      <span className="badge-red flex items-center gap-1">
                        <TrendingDown size={10} /> Low Stock
                      </span>
                    ) : (
                      <span className="badge-green">In Stock</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventoryTable
