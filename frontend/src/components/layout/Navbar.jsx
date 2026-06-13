// src/components/layout/Navbar.jsx
import { useState } from 'react'
import { Bell, Search, ChevronDown, Truck, LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)

  const mockNotifications = [
    { id: 1, text: 'Exception EXC-004 requires immediate attention', time: '2m ago', dot: 'status-dot-alert'  },
    { id: 2, text: 'Driver Suresh K. approaching delivery zone',      time: '8m ago', dot: 'status-dot-online' },
    { id: 3, text: 'Shipment SH-1007 delivered successfully',         time: '15m ago',dot: 'status-dot-online' },
  ]

  return (
    <nav className="h-14 bg-surface-900 border-b border-surface-700 flex items-center px-4 gap-4 
                    sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mr-2">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Truck size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-base tracking-tight text-white">
          Logisti<span className="text-brand-400">X</span>
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md relative hidden md:flex items-center">
        <Search size={14} className="absolute left-3 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search shipments, drivers, exceptions…"
          className="input-field pl-9 text-xs h-8"
        />
        <kbd className="absolute right-2.5 text-[10px] text-gray-600 font-mono bg-surface-600 
                        px-1.5 py-0.5 rounded hidden lg:block">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false) }}
            className="btn-ghost relative w-9 h-9 p-0 justify-center"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-red border border-surface-900" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 card-glow z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-600">
                <p className="font-semibold text-sm">Notifications</p>
              </div>
              <div className="divide-y divide-surface-700">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-700 cursor-pointer transition-colors">
                    <span className={`${n.dot} mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-200 leading-relaxed">{n.text}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-surface-600 text-center">
                <button className="text-xs text-brand-400 hover:text-brand-300">View all</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false) }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-xs font-medium text-gray-200">{user?.name || 'User'}</span>
              <span className="text-[10px] text-gray-500 capitalize">{user?.role || 'dispatcher'}</span>
            </div>
            <ChevronDown size={13} className="text-gray-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 card-glow z-50 overflow-hidden py-1">
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-300 hover:bg-surface-700 transition-colors">
                <User size={14} /> Profile
              </button>
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-300 hover:bg-surface-700 transition-colors">
                <Settings size={14} /> Settings
              </button>
              <div className="border-t border-surface-600 my-1" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-surface-700 transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
