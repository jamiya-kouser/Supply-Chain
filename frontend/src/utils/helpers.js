// src/utils/helpers.js
import { formatDistanceToNow, format, parseISO } from 'date-fns'

export const formatRelativeTime = (isoString) => {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true })
  } catch {
    return isoString
  }
}

export const formatDateTime = (isoString) => {
  try {
    return format(parseISO(isoString), 'MMM d, HH:mm')
  } catch {
    return isoString
  }
}

export const formatETA = (isoString) => {
  try {
    return format(parseISO(isoString), 'HH:mm')
  } catch {
    return isoString
  }
}

export const generateId = () =>
  Math.random().toString(36).slice(2, 9)

export const getStatusBadgeClass = (status) => {
  const map = {
    delivered:  'badge-green',
    in_transit: 'badge-blue',
    pending:    'badge-yellow',
    exception:  'badge-red',
    on_hold:    'badge-gray',
    available:  'badge-green',
    delivering: 'badge-blue',
    break:      'badge-yellow',
    offline:    'badge-gray',
    open:       'badge-red',
    in_progress:'badge-yellow',
    resolved:   'badge-green',
  }
  return map[status] || 'badge-gray'
}

export const truncate = (str, n) =>
  str && str.length > n ? str.slice(0, n) + '…' : str

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ') : ''

// Demo data generators
export const generateMockShipments = (n = 12) => {
  const statuses = ['pending', 'in_transit', 'delivered', 'exception', 'in_transit', 'in_transit']
  const carriers = ['FedEx', 'UPS', 'DHL', 'BlueDart', 'DTDC']
  const cities   = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata']

  return Array.from({ length: n }, (_, i) => ({
    id: `SH-${String(1000 + i).padStart(4, '0')}`,
    origin:      cities[Math.floor(Math.random() * cities.length)],
    destination: cities[Math.floor(Math.random() * cities.length)],
    status:      statuses[Math.floor(Math.random() * statuses.length)],
    eta:         new Date(Date.now() + (Math.random() * 48 - 4) * 3600000).toISOString(),
    carrier:     carriers[Math.floor(Math.random() * carriers.length)],
    driverId:    `DRV-${String(Math.floor(Math.random() * 8) + 1).padStart(3, '0')}`,
    lat:         18.5 + Math.random() * 10,
    lng:         73.8 + Math.random() * 10,
    createdAt:   new Date(Date.now() - Math.random() * 72 * 3600000).toISOString(),
    updatedAt:   new Date(Date.now() - Math.random() * 2  * 3600000).toISOString(),
  }))
}

export const generateMockDrivers = () => {
  const names    = ['Suresh K.', 'Ravi M.', 'Anita P.', 'Vikram S.', 'Priya D.', 'Arjun N.', 'Deepika R.', 'Rahul T.']
  const vehicles = ['KA-01-AB-1234', 'MH-12-CD-5678', 'TN-07-EF-9012', 'DL-03-GH-3456', 'AP-09-IJ-7890', 'GJ-05-KL-2345', 'RJ-14-MN-6789', 'UP-32-OP-0123']
  const statuses = ['available', 'delivering', 'delivering', 'delivering', 'break', 'delivering', 'offline', 'delivering']
  const locations = ['Koramangala', 'Bandra West', 'Anna Nagar', 'Connaught Place', 'Jubilee Hills', 'Navrangpura', 'Mansarovar', 'Hazratganj']

  return names.map((name, i) => ({
    id:                `DRV-${String(i + 1).padStart(3, '0')}`,
    name,
    vehicle:           vehicles[i],
    status:            statuses[i],
    location:          locations[i],
    lat:               18.5 + i * 1.2 + Math.random(),
    lng:               73.8 + i * 0.8 + Math.random(),
    currentShipmentId: statuses[i] === 'delivering' ? `SH-${1000 + i}` : null,
    eta:               new Date(Date.now() + (Math.random() * 3 + 0.5) * 3600000).toISOString(),
    deliveriesToday:   Math.floor(Math.random() * 8) + 1,
  }))
}

export const generateMockExceptions = () => [
  { id: 'EXC-001', shipmentId: 'SH-1002', driverId: 'DRV-001', driverName: 'Suresh K.', type: 'address_inaccessible', description: 'Gate locked, no response from customer.', status: 'open',        priority: 'high',     createdAt: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 'EXC-002', shipmentId: 'SH-1005', driverId: 'DRV-003', driverName: 'Anita P.',  type: 'customer_absent',     description: 'Customer not home, 3rd attempt.',      status: 'open',        priority: 'medium',   createdAt: new Date(Date.now() - 2  * 3600000).toISOString() },
  { id: 'EXC-003', shipmentId: 'SH-1008', driverId: 'DRV-006', driverName: 'Arjun N.',  type: 'delay',               description: 'Heavy traffic on NH-44.',               status: 'in_progress', priority: 'low',      createdAt: new Date(Date.now() - 1  * 3600000).toISOString() },
  { id: 'EXC-004', shipmentId: 'SH-1011', driverId: 'DRV-002', driverName: 'Ravi M.',   type: 'damage',              description: 'Package appears water damaged.',        status: 'open',        priority: 'critical', createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'EXC-005', shipmentId: 'SH-1003', driverId: 'DRV-008', driverName: 'Rahul T.',  type: 'other',               description: 'Incorrect address on label.',           status: 'resolved',    priority: 'medium',   createdAt: new Date(Date.now() - 5  * 3600000).toISOString() },
]
