// src/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom'
import { Truck, Radio, Map, AlertTriangle, BarChart2, Mic, ArrowRight, Zap } from 'lucide-react'

const Feature = ({ icon: Icon, title, desc, color }) => (
  <div className="p-5 card-glow hover:border-brand-500/30 transition-all duration-300 group">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 
      ${color === 'purple' ? 'bg-brand-500/10 border border-brand-500/20' : ''}
      ${color === 'cyan'   ? 'bg-cyan-500/10 border border-cyan-500/20'   : ''}
      ${color === 'green'  ? 'bg-green-500/10 border border-green-500/20' : ''}
      ${color === 'red'    ? 'bg-red-500/10 border border-red-500/20'     : ''}
    `}>
      <Icon size={18} className={`
        ${color === 'purple' ? 'text-brand-400' : ''}
        ${color === 'cyan'   ? 'text-cyan-400'   : ''}
        ${color === 'green'  ? 'text-green-400'  : ''}
        ${color === 'red'    ? 'text-red-400'     : ''}
      `} />
    </div>
    <h3 className="font-display font-semibold text-gray-100 mb-1.5">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </div>
)

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface-900 overflow-hidden">
      {/* Navbar */}
      <nav className="border-b border-surface-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Truck size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-base tracking-tight">
            Logisti<span className="text-brand-400">X</span>
          </span>
        </div>
        <button onClick={() => navigate('/login')} className="btn-primary">
          Get Started <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero */}
      <div className="relative px-6 pt-24 pb-20 text-center max-w-4xl mx-auto">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] 
                        bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                          bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 mb-6">
            <Zap size={12} className="text-brand-400" />
            Powered by Vapi Voice AI
          </div>

          <h1 className="font-display font-bold text-5xl md:text-6xl leading-tight tracking-tight mb-6">
            Logistics Command
            <br />
            <span className="text-brand-400">Voice Intelligence</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            AI-powered dispatch platform. Talk to your logistics system.
            Real-time driver monitoring, shipment tracking, and exception management.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary px-6 py-3 text-sm"
            >
              <Radio size={16} /> Launch Dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-surface-500 
                         text-gray-300 hover:border-brand-500/40 text-sm font-medium transition-all"
            >
              <Mic size={16} className="text-brand-400" /> Try Voice Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="px-6 pb-20 max-w-5xl mx-auto">
        <h2 className="font-display font-bold text-2xl text-center text-gray-100 mb-8">
          Built for Real Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Feature icon={Mic}           title="Voice Dispatch"       desc="Speak to report updates, query shipments, and manage exceptions hands-free." color="purple" />
          <Feature icon={Map}           title="Live Driver Map"      desc="Track every driver in real-time. Mapbox-powered with sub-second updates."     color="cyan"   />
          <Feature icon={AlertTriangle} title="Exception Monitoring" desc="Instant alerts for delivery failures, inaccessible addresses, and damage."     color="red"    />
          <Feature icon={BarChart2}     title="Analytics Dashboard"  desc="Delivery trends, carrier performance, and exception rates at a glance."         color="purple" />
          <Feature icon={Truck}         title="Shipment Tracker"     desc="End-to-end shipment visibility from warehouse to last-mile delivery."           color="cyan"   />
          <Feature icon={Radio}         title="Dispatch Control"     desc="Coordinate drivers, reassign loads, and resolve exceptions from one screen."     color="green"  />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-surface-700 px-6 py-5 text-center">
        <p className="text-xs text-gray-700">© 2025 LogistiX Command Center · Built for hackathon judges who want real logistics software</p>
      </div>
    </div>
  )
}

export default LandingPage
