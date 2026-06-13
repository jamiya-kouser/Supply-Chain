// src/components/dispatch/DriverMap.jsx
import { useEffect, useRef, useState } from 'react'
import { Layers, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { MAPBOX_TOKEN } from '../../utils/constants'

const INDIA_CENTER = [78.9629, 20.5937]
const INDIA_ZOOM   = 4.5

const MapFallback = ({ drivers = [], shipments = [] }) => (
  <div className="relative w-full h-full bg-surface-700 rounded-lg overflow-hidden flex items-center justify-center">
    {/* Grid background */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
    {/* Scatter dots for drivers */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 400">
      {drivers.map((d, i) => {
        const x = 50 + ((d.lng - 68) / 20) * 500
        const y = 380 - ((d.lat - 8) / 28) * 360
        return (
          <g key={d.id}>
            <circle cx={x} cy={y} r="6" fill={d.status === 'delivering' ? '#7c6df4' : '#00ff88'} opacity="0.8" />
            <circle cx={x} cy={y} r="10" fill="none" stroke={d.status === 'delivering' ? '#7c6df4' : '#00ff88'} opacity="0.3" />
            <text x={x + 12} y={y + 4} fill="#9ca3af" fontSize="9" fontFamily="monospace">{d.name.split(' ')[0]}</text>
          </g>
        )
      })}
    </svg>
    <div className="relative z-10 text-center">
      <p className="text-xs text-gray-500 mb-1">Map Preview</p>
      <p className="text-[11px] text-gray-600">Add VITE_MAPBOX_TOKEN to enable live map</p>
    </div>
    {/* Scan line effect */}
    <div className="absolute inset-0 scan-effect pointer-events-none" />
  </div>
)

const DriverMap = ({ drivers = [], shipments = [] }) => {
  const mapContainer = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef({})
  const [mapLoaded,  setMapLoaded]  = useState(false)
  const [mapError,   setMapError]   = useState(false)

  // Initialize Mapbox
  useEffect(() => {
    if (!MAPBOX_TOKEN || mapRef.current) return

    const initMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl')
        mapboxgl.default.accessToken = MAPBOX_TOKEN

        const map = new mapboxgl.default.Map({
          container: mapContainer.current,
          style:     'mapbox://styles/mapbox/dark-v11',
          center:    INDIA_CENTER,
          zoom:      INDIA_ZOOM,
        })

        map.on('load', () => {
          setMapLoaded(true)
          mapRef.current = map
        })

        map.on('error', () => setMapError(true))

        // Controls
        map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), 'top-right')
      } catch {
        setMapError(true)
      }
    }

    initMap()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers when drivers change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const updateMarkers = async () => {
      const mapboxgl = await import('mapbox-gl')

      drivers.forEach(driver => {
        const existing = markersRef.current[driver.id]

        const el = document.createElement('div')
        el.className = 'driver-marker'
        el.style.cssText = `
          width: 28px; height: 28px; border-radius: 50%;
          background: ${driver.status === 'delivering' ? '#7c6df4' : driver.status === 'available' ? '#00ff88' : '#6b7280'};
          border: 2px solid rgba(255,255,255,0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: white; font-weight: bold;
          box-shadow: 0 0 12px rgba(0,0,0,0.5);
          cursor: pointer;
        `
        el.textContent = driver.name.charAt(0)

        if (existing) {
          existing.setLngLat([driver.lng, driver.lat])
        } else {
          const popup = new mapboxgl.default.Popup({ offset: 25, closeButton: false })
            .setHTML(`
              <div style="font-family: 'DM Sans'; font-size: 12px; color: #e5e7eb;">
                <strong>${driver.name}</strong>
                <div style="color:#9ca3af; margin-top:2px;">${driver.vehicle}</div>
                ${driver.currentShipmentId ? `<div style="color:#a5b8fc; margin-top:2px;">${driver.currentShipmentId}</div>` : ''}
              </div>
            `)

          const marker = new mapboxgl.default.Marker({ element: el })
            .setLngLat([driver.lng, driver.lat])
            .setPopup(popup)
            .addTo(mapRef.current)

          markersRef.current[driver.id] = marker
        }
      })

      // Remove stale markers
      Object.keys(markersRef.current).forEach(id => {
        if (!drivers.find(d => d.id === id)) {
          markersRef.current[id].remove()
          delete markersRef.current[id]
        }
      })
    }

    updateMarkers()
  }, [drivers, mapLoaded])

  if (!MAPBOX_TOKEN || mapError) {
    return (
      <div className="card-glow overflow-hidden flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-600 flex-shrink-0">
          <h3 className="font-display font-semibold text-sm text-gray-100">Live Driver Map</h3>
          <div className="flex items-center gap-1.5">
            <span className="status-dot-alert" />
            <span className="text-xs text-gray-500">No map token</span>
          </div>
        </div>
        <div className="flex-1 p-3">
          <MapFallback drivers={drivers} shipments={shipments} />
        </div>
      </div>
    )
  }

  return (
    <div className="card-glow overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-600 flex-shrink-0">
        <h3 className="font-display font-semibold text-sm text-gray-100">Live Driver Map</h3>
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500" />Delivering</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-green" />Available</span>
          </div>
          <button className="btn-ghost p-1.5">
            <Layers size={14} />
          </button>
        </div>
      </div>
      <div ref={mapContainer} className="flex-1" />
    </div>
  )
}

export default DriverMap
