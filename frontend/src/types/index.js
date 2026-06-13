// src/types/shipment.js
/**
 * @typedef {Object} Shipment
 * @property {string} id
 * @property {string} origin
 * @property {string} destination
 * @property {'pending'|'in_transit'|'delivered'|'exception'|'on_hold'} status
 * @property {string} eta
 * @property {string} carrier
 * @property {string} driverId
 * @property {number} lat
 * @property {number} lng
 * @property {string} createdAt
 * @property {string} updatedAt
 */

// src/types/driver.js
/**
 * @typedef {Object} Driver
 * @property {string} id
 * @property {string} name
 * @property {string} vehicle
 * @property {'available'|'delivering'|'break'|'offline'} status
 * @property {string} location
 * @property {number} lat
 * @property {number} lng
 * @property {string} currentShipmentId
 * @property {string} eta
 * @property {number} deliveriesToday
 */

// src/types/exception.js
/**
 * @typedef {Object} Exception
 * @property {string} id
 * @property {string} shipmentId
 * @property {string} driverId
 * @property {string} driverName
 * @property {'address_inaccessible'|'customer_absent'|'damage'|'delay'|'other'} type
 * @property {string} description
 * @property {'open'|'in_progress'|'resolved'} status
 * @property {'low'|'medium'|'high'|'critical'} priority
 * @property {string} createdAt
 */

// src/types/transcript.js
/**
 * @typedef {Object} TranscriptMessage
 * @property {string} id
 * @property {'user'|'assistant'|'system'} role
 * @property {string} text
 * @property {boolean} isFinal
 * @property {string} timestamp
 */

export {}
