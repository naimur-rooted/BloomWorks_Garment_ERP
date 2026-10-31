import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCog,
  Truck,
  Shirt,
  Boxes,
  Palette,
  Ruler,
  ShoppingCart,
  ClipboardCheck,
  Scissors,
  Layers,
  Sparkles,
  ShieldCheck,
  Package,
  PackageCheck,
  Receipt,
  Ship,
  CalendarClock,
  BarChart3,
  LogOut,
  Menu,
  X,
  QrCode,
  Banknote,
  Search,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import ThemeToggle from './ui/ThemeToggle'
import DynamicBackground from './ui/DynamicBackground'

const getNavSections = (role) => {
  const sections = [
    {
      title: 'Overview',
      dot: 'bg-blue-500',
      text: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-50/90 dark:bg-blue-950/40',
      border: 'border-blue-200/90 dark:border-blue-800/60',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
      items: [{ to: '/', label: 'Executive Dashboard', icon: LayoutDashboard }],
    },
  ]

  // Administration (System Administrator only)
  if (role === 'Admin') {
    sections.push({
      title: 'Administration',
      dot: 'bg-purple-500',
      text: 'text-purple-700 dark:text-purple-300',
      bg: 'bg-purple-50/90 dark:bg-purple-950/40',
      border: 'border-purple-200/90 dark:border-purple-800/60',
      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
      items: [{ to: '/users', label: 'User Directory', icon: UserCog }],
    })
  }

  // Master Data
  if (['Admin', 'Merchandiser', 'Planner', 'Purchase Manager', 'Inventory Manager', 'Management'].includes(role)) {
    sections.push({
      title: 'Master Specifications',
      dot: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
      border: 'border-emerald-200/90 dark:border-emerald-800/60',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
      items: [
        { to: '/buyers', label: 'Buyer Portfolios', icon: Users },
        { to: '/suppliers', label: 'Vendor Directory', icon: Truck },
        { to: '/styles', label: 'Style Tech Packs', icon: Shirt },
        { to: '/materials', label: 'Raw Materials', icon: Boxes },
        { to: '/colors', label: 'Color Formulations', icon: Palette },
        { to: '/sizes', label: 'Size Grids', icon: Ruler },
      ],
    })
  }

  // Merchandising & Sourcing
  if (['Admin', 'Merchandiser', 'Planner', 'Management'].includes(role)) {
    sections.push({
      title: 'Merchandising & T&A',
      dot: 'bg-sky-500',
      text: 'text-sky-700 dark:text-sky-300',
      bg: 'bg-sky-50/90 dark:bg-sky-950/40',
      border: 'border-sky-200/90 dark:border-sky-800/60',
      badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
      items: [
        { to: '/orders', label: 'Matrix Orders & Costing (BDT)', icon: ShoppingCart },
        { to: '/tna', label: 'Critical Path T&A', icon: CalendarClock },
        { to: '/boms', label: 'Bill of Materials (BOM)', icon: Package },
        { to: '/material-requirements', label: 'Material Forecast (MRP)', icon: ClipboardCheck },
      ],
    })
  }

  // Procurement & Warehousing
  if (['Admin', 'Purchase Manager', 'Inventory Manager', 'Warehouse Manager', 'Management'].includes(role)) {
    sections.push({
      title: 'Supply Chain & Storage',
      dot: 'bg-cyan-500',
      text: 'text-cyan-700 dark:text-cyan-300',
      bg: 'bg-cyan-50/90 dark:bg-cyan-950/40',
      border: 'border-cyan-200/90 dark:border-cyan-800/60',
      badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300',
      items: [
        { to: '/requisitions', label: 'Purchase Requisitions', icon: Receipt },
        { to: '/purchase-orders', label: 'Purchase Orders (PO)', icon: ShoppingCart },
        { to: '/goods-receipts', label: 'Goods Receipts (GRN)', icon: Package },
        { to: '/inventory', label: 'Fabric Rolls & 4-Point', icon: Boxes },
      ],
    })
  }

  // Production & Floor Control
  if (['Admin', 'Production Manager', 'Planner', 'Management'].includes(role)) {
    sections.push({
      title: 'Shop Floor & Tracking',
      dot: 'bg-indigo-500',
      text: 'text-indigo-700 dark:text-indigo-300',
      bg: 'bg-indigo-50/90 dark:bg-indigo-950/40',
      border: 'border-indigo-200/90 dark:border-indigo-800/60',
      badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
      items: [
        { to: '/bundle-tracking', label: 'Bundle Tracking & SFC', icon: QrCode },
        { to: '/production-plans', label: 'Production Scheduling', icon: CalendarClock },
        { to: '/work-orders', label: 'Work Orders', icon: ClipboardCheck },
        { to: '/cutting', label: 'Cutting Floor', icon: Scissors },
        { to: '/sewing', label: 'Sewing Operations', icon: Layers },
        { to: '/finishing', label: 'Garment Finishing', icon: Sparkles },
      ],
    })
  }

  // Quality & Dispatch
  if (['Admin', 'Quality Inspector', 'Production Manager', 'Warehouse Manager', 'Management'].includes(role)) {
    sections.push({
      title: 'Quality & Logistics',
      dot: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50/90 dark:bg-amber-950/40',
      border: 'border-amber-200/90 dark:border-amber-800/60',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
      items: [
        { to: '/quality', label: 'AQL 2.5 Quality Audits', icon: ShieldCheck },
        { to: '/packing', label: 'Ratio Packing & CBM', icon: PackageCheck },
        { to: '/deliveries', label: 'Order Delivery & Gate Pass', icon: Truck },
        { to: '/shipments', label: 'Commercial Cargo', icon: Ship },
      ],
    })
  }

  // Workforce & Compensation (Payroll in BDT)
  if (['Admin', 'Production Manager', 'Management', 'Merchandiser', 'Planner'].includes(role)) {
    sections.push({
      title: 'Compensation & Labor (BDT)',
      dot: 'bg-teal-500',
      text: 'text-teal-700 dark:text-teal-300',
      bg: 'bg-teal-50/90 dark:bg-teal-950/40',
      border: 'border-teal-200/90 dark:border-teal-800/60',
      badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300',
      items: [
        { to: '/payroll', label: 'Workforce & Piece-Rate (৳)', icon: Banknote },
      ],
    })
  }

  // Analytics & Commercial
  sections.push({
    title: 'Financial & BI',
    dot: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50/90 dark:bg-rose-950/40',
    border: 'border-rose-200/90 dark:border-rose-800/60',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    items: [
      { to: '/commercial', label: 'Commercial & Money Receive (৳)', icon: Banknote },
      { to: '/reports', label: 'EXIM & Job Costing (BDT)', icon: BarChart3 },
    ],
  })

  return sections
}

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [searchPo, setSearchPo] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  const navSections = getNavSections(user?.role || 'Admin')

  const activeItem = navSections
    .flatMap((s) => s.items)
    .find((i) => i.to === location.pathname)

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/75 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/70 dark:border-slate-800/80 select-none transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/25 ring-2 ring-white/30 shrink-0">
            BW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                BloomWorks
              </h1>
              <span className="text-[10px] bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-slate-700 font-bold px-1.5 py-0.5 rounded shadow-sm">
                ERP Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Garment Industrial Suite</p>
          </div>
        </div>
        <button
          onClick={closeSidebar}
          className="lg:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            {/* Colorful & Bold Main Menu Header Banner */}
            <div
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border shadow-xs transition-all ${section.bg} ${section.border}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full ${section.dot} shadow-xs shrink-0 ring-2 ring-white/80 dark:ring-slate-900/80`} />
                <span className={`text-[11px] font-black uppercase tracking-wider ${section.text} truncate`}>
                  {section.title}
                </span>
              </div>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${section.badge} border ${section.border}`}>
                {section.items.length}
              </span>
            </div>

            {/* Sub-menu items indented with tree line */}
            <div className="space-y-0.5 pl-2 border-l border-slate-200/70 dark:border-slate-800/70 ml-2.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isCurrent = location.pathname === item.to
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `group flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold border-l-2 border-blue-600 dark:border-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon
                      size={15}
                      className={`mr-2.5 shrink-0 transition-colors ${
                        isCurrent
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.to === '/bundle-tracking' && (
                      <span className="ml-auto text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        SFC
                      </span>
                    )}
                    {item.to === '/payroll' && (
                      <span className="ml-auto text-[9px] bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-800 px-1.5 py-0.5 rounded font-bold">
                        ৳ BDT
                      </span>
                    )}
                    {item.to === '/orders' && (
                      <span className="ml-auto text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800 px-1.5 py-0.5 rounded font-bold">
                        FOB
                      </span>
                    )}
                    {item.to === '/quality' && (
                      <span className="ml-auto text-[9px] bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded font-bold">
                        AQL
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User & Terminal Profile Footer */}
      <div className="p-3 border-t border-slate-200/70 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/90 transition-colors">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user?.full_name || 'Floor Operator'}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {user?.role === 'Admin' ? 'Sys Admin' : user?.role || 'Operator'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition shrink-0"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative flex h-screen overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Living Aurora & Fabric Texture Dynamic Background */}
      <DynamicBackground />

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 dark:bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Modern Frosted Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 max-w-[85vw] flex flex-col transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Viewport Container */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Subtle Top Accent Ribbon */}
        <div className="h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 shrink-0" />

        {/* Top Control Header */}
        <header className="h-14 bg-white/75 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline font-medium">BloomWorks ERP</span>
              <ChevronRight size={13} className="text-slate-400 hidden sm:inline" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activeItem?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Right Controls & Indicators */}
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
            {/* Live Factory Node Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-slate-700 text-[11px] shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-950 dark:text-emerald-300 font-bold">DHAKA-01 LIVE</span>
              <span className="text-emerald-300 dark:text-slate-600">|</span>
              <span className="text-blue-700 dark:text-blue-400 font-semibold">SHIFT A</span>
            </div>

            {/* Currency Pill */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-[11px] font-bold text-teal-800 dark:text-teal-300">
              <span>CURRENCY:</span>
              <span className="font-mono text-teal-900 dark:text-teal-200 font-extrabold">৳ BDT</span>
            </div>

            {/* Synchronized Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium backdrop-blur-sm shadow-sm">
              <Clock size={13} className="text-blue-600 dark:text-blue-400" />
              <span className="font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-slate-400 text-[10px]">BST</span>
            </div>

            {/* Quick Order Finder */}
            <div className="relative hidden xl:block w-40">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchPo}
                onChange={(e) => setSearchPo(e.target.value)}
                placeholder="PO lookup..."
                className="w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-300/80 dark:border-slate-700 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 shadow-sm"
              />
            </div>

            {/* Theme Toggle Switch */}
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content Viewport with Glassmorphism Over Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors duration-150 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
