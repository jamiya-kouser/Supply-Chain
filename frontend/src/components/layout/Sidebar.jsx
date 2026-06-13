// src/components/layout/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Radio, Package, Users, AlertTriangle,
  Map, BarChart2, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/dispatch',  icon: Radio,           label: 'Dispatch'    },
  { to: '/shipments', icon: Package,         label: 'Shipments'   },
  { to: '/drivers',   icon: Users,           label: 'Drivers'     },
  { to: '/exceptions',icon: AlertTriangle,   label: 'Exceptions'  },
  { to: '/map',       icon: Map,             label: 'Live Map'    },
  { to: '/analytics', icon: BarChart2,       label: 'Analytics'   },
]

const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group
       ${isActive
         ? 'bg-brand-600/20 text-brand-300 border border-brand-600/20'
         : 'text-gray-500 hover:text-gray-200 hover:bg-surface-600'
       }`
    }
    title={collapsed ? label : undefined}
  >
    <Icon size={17} className="flex-shrink-0" />
    {!collapsed && <span className="font-medium truncate">{label}</span>}
  </NavLink>
)

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`flex-shrink-0 h-full bg-surface-900 border-r border-surface-700 flex flex-col
        transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[220px]'}`}
    >
      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-surface-700 flex flex-col gap-1">
        <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 
                     hover:text-gray-300 hover:bg-surface-600 text-xs transition-colors mt-1"
        >
          {collapsed
            ? <ChevronRight size={15} />
            : <><ChevronLeft size={15} /><span className="text-xs">Collapse</span></>
          }
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
