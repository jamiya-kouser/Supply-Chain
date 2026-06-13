// src/components/dashboard/OrdersTable.jsx
import { useState } from 'react'
import { Package, ChevronRight } from 'lucide-react'
import { getStatusBadgeClass, formatRelativeTime, capitalize } from '../../utils/helpers'

// Demo orders — replace with real API data
const DEMO_ORDERS = [
  { id: 'ORD-4521', customer: 'Infosys Ltd.',       items: 14, value: '₹84,200', shipmentId: 'SH-1001', status: 'in_transit', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'ORD-4520', customer: 'Wipro Technologies', items: 7,  value: '₹32,500', shipmentId: 'SH-1002', status: 'pending',    createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'ORD-4519', customer: 'TCS Mumbai',         items: 21, value: '₹1,10,000',shipmentId: 'SH-1003',status: 'delivered', createdAt: new Date(Date.now() - 10800000).toISOString()},
  { id: 'ORD-4518', customer: 'HCL Tech',           items: 3,  value: '₹18,750', shipmentId: 'SH-1004', status: 'exception', createdAt: new Date(Date.now() - 14400000).toISOString()},
  { id: 'ORD-4517', customer: 'Cognizant India',    items: 9,  value: '₹52,000', shipmentId: 'SH-1005', status: 'in_transit',createdAt: new Date(Date.now() - 18000000).toISOString()},
]

const OrdersTable = ({ orders = DEMO_ORDERS }) => {
  const [selected, setSelected] = useState(null)

  return (
    <div className="card-glow flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-600">
        <div>
          <h3 className="font-display font-semibold text-sm text-gray-100">Recent Orders</h3>
          <p className="text-xs text-gray-500 mt-0.5">{orders.length} orders</p>
        </div>
        <button className="btn-ghost text-xs">View all</button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-surface-800">
            <tr className="border-b border-surface-600">
              <th className="table-header text-left px-4 py-3">Order</th>
              <th className="table-header text-left px-4 py-3">Customer</th>
              <th className="table-header text-left px-4 py-3">Items</th>
              <th className="table-header text-left px-4 py-3">Value</th>
              <th className="table-header text-left px-4 py-3">Status</th>
              <th className="table-header text-left px-4 py-3">Time</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelected(order.id === selected ? null : order.id)}
                className={`table-row cursor-pointer ${order.id === selected ? 'bg-brand-600/5' : ''}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Package size={13} className="text-brand-400 flex-shrink-0" />
                    <span className="font-mono text-brand-300 font-medium">{order.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300">{order.customer}</td>
                <td className="px-4 py-3 text-gray-400">{order.items} items</td>
                <td className="px-4 py-3 text-gray-200 font-medium">{order.value}</td>
                <td className="px-4 py-3">
                  <span className={getStatusBadgeClass(order.status)}>
                    {capitalize(order.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatRelativeTime(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <ChevronRight size={13} className="text-gray-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrdersTable
