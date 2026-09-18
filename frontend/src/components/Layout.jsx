import { useState } from 'react'
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
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const getNavSections = (role) => {
  const sections = [
    {
      title: 'Overview',
      items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
    },
  ]

  // Administration (System Administrator only)
  if (role === 'Admin') {
    sections.push({
      title: 'Administration',
      items: [{ to: '/users', label: 'User Management', icon: UserCog }],
    })
  }

  // Master Data
  if (['Admin', 'Merchandiser', 'Planner', 'Purchase Manager', 'Inventory Manager', 'Management'].includes(role)) {
    sections.push({
      title: 'Master Data',
      items: [
        { to: '/buyers', label: 'Buyers', icon: Users },
        { to: '/suppliers', label: 'Suppliers', icon: Truck },
        { to: '/styles', label: 'Styles', icon: Shirt },
        { to: '/materials', label: 'Materials', icon: Boxes },
        { to: '/colors', label: 'Colors', icon: Palette },
        { to: '/sizes', label: 'Sizes', icon: Ruler },
      ],
    })
  }

  // Merchandising
  if (['Admin', 'Merchandiser', 'Planner', 'Management'].includes(role)) {
    sections.push({
      title: 'Merchandising',
      items: [
        { to: '/orders', label: 'Buyer Orders', icon: ShoppingCart },
        { to: '/tna', label: 'TNA', icon: CalendarClock },
      ],
    })
  }

  // BOM
  if (['Admin', 'Merchandiser', 'Planner', 'Management'].includes(role)) {
    sections.push({
      title: 'BOM & MRP',
      items: [
        { to: '/boms', label: 'BOM', icon: Package },
        { to: '/material-requirements', label: 'Material Requirements', icon: ClipboardCheck },
      ],
    })
  }

  // Procurement
  if (['Admin', 'Purchase Manager', 'Inventory Manager', 'Warehouse Manager', 'Management'].includes(role)) {
    sections.push({
      title: 'Procurement',
      items: [
        { to: '/requisitions', label: 'Purchase Requisitions', icon: Receipt },
        { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
        { to: '/goods-receipts', label: 'Goods Receipts', icon: Package },
      ],
    })
  }

  // Inventory
  if (['Admin', 'Inventory Manager', 'Warehouse Manager', 'Production Manager', 'Planner', 'Management'].includes(role)) {
    sections.push({
      title: 'Inventory',
      items: [{ to: '/inventory', label: 'Inventory', icon: Boxes }],
    })
  }

  // Production
  if (['Admin', 'Production Manager', 'Planner', 'Management'].includes(role)) {
    sections.push({
      title: 'Production',
      items: [
        { to: '/production-plans', label: 'Production Plans', icon: CalendarClock },
        { to: '/cutting', label: 'Cutting', icon: Scissors },
        { to: '/sewing', label: 'Sewing', icon: Layers },
        { to: '/finishing', label: 'Finishing', icon: Sparkles },
      ],
    })
  }

  // Quality
  if (['Admin', 'Quality Inspector', 'Production Manager', 'Management'].includes(role)) {
    sections.push({
      title: 'Quality',
      items: [{ to: '/quality', label: 'Quality Control', icon: ShieldCheck }],
    })
  }

  // Packing & Shipment
  if (['Admin', 'Warehouse Manager', 'Inventory Manager', 'Management'].includes(role)) {
    sections.push({
      title: 'Packing & Shipment',
      items: [
        { to: '/packing', label: 'Packing', icon: PackageCheck },
        { to: '/shipments', label: 'Shipments', icon: Ship },
      ],
    })
  }

  // Analytics
  sections.push({
    title: 'Analytics',
    items: [{ to: '/reports', label: 'Reports', icon: BarChart3 }],
  })

  return sections
}

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  const navSections = getNavSections(user?.role)

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">BloomWorks ERP</h1>
          <p className="text-xs text-gray-500">Garment Manufacturing</p>
        </div>
        <button
          onClick={closeSidebar}
          className="lg:hidden p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-3">
            <div className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 mx-2 rounded text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <Icon size={16} className="mr-3 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role === 'Admin' ? 'System Administrator' : user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white shrink-0"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      {/* Sidebar: static on desktop, slide-over drawer on mobile */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 max-w-[85vw] bg-gray-900 text-gray-300 flex flex-col transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {sidebarContent}
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="min-h-14 bg-white border-b flex items-center gap-3 px-4 sm:px-6 py-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded hover:bg-gray-100 text-gray-600"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {navSections
              .flatMap((s) => s.items)
              .find((i) => i.to === location.pathname)?.label || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout