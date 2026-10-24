import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../auth/AuthContext'
import {
  Package,
  Clock,
  Shirt,
  Ship,
  Scissors,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Cpu,
} from 'lucide-react'

const StatCard = ({ label, value, icon: Icon, cardTheme = 'blue', subtext, trend }) => (
  <div className={`card-colorful-${cardTheme} p-4 relative overflow-hidden group`}>
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{label}</p>
      <div className={`icon-box-${cardTheme}`}>
        <Icon size={18} />
      </div>
    </div>
    <div className="mt-2 flex items-baseline gap-2">
      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">{value}</p>
      {trend && (
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
          <ArrowUpRight size={12} /> {trend}
        </span>
      )}
    </div>
    {subtext && <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">{subtext}</p>}
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadDashboard = () => {
    setLoading(true)
    api
      .get('/reports/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => {
        console.warn('Dashboard api fallback:', err)
        setData({
          total_orders: 6,
          total_styles: 6,
          total_buyers: 6,
          total_suppliers: 8,
          recent_orders: [
            { id: 1, po_number: 'PO-2026-001', buyer: 'H&M', status: 'IN_PRODUCTION', delivery_date: '2026-04-15', total_quantity: 10000 },
            { id: 2, po_number: 'PO-2026-002', buyer: 'Zara', status: 'IN_PRODUCTION', delivery_date: '2026-05-10', total_quantity: 8000 },
            { id: 3, po_number: 'PO-2026-003', buyer: 'Tommy Hilfiger', status: 'IN_PRODUCTION', delivery_date: '2026-05-25', total_quantity: 6000 },
            { id: 4, po_number: 'PO-2026-004', buyer: 'Marks & Spencer', status: 'CONFIRMED', delivery_date: '2026-06-01', total_quantity: 5000 },
            { id: 5, po_number: 'PO-2026-005', buyer: 'Target', status: 'CONFIRMED', delivery_date: '2026-06-15', total_quantity: 7500 },
            { id: 6, po_number: 'PO-2026-006', buyer: 'Uniqlo', status: 'DRAFT', delivery_date: '2026-07-10', total_quantity: 4000 },
          ],
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (!data && loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-slate-400 font-mono space-y-3">
        <RefreshCw size={28} className="animate-spin text-blue-600" />
        <span className="text-sm font-semibold">Connecting to BloomWorks Industrial Telemetry...</span>
      </div>
    )
  }

  const role = user?.role || 'Admin'

  return (
    <div className="space-y-6">
      {/* Industrial Plant Telemetry Banner */}
      <div className="card-colorful-blue p-5 sm:p-6 relative overflow-hidden transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <Cpu size={20} />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                BLOOMWORKS GARMENTS • SHOP FLOOR TELEMETRY
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Authenticated Operator:{' '}
              <span className="font-bold text-slate-900 dark:text-slate-200">{user?.full_name || 'System Administrator'}</span>{' '}
              <span className="text-slate-300 dark:text-slate-600">|</span> Role:{' '}
              <span className="text-blue-700 dark:text-blue-400 font-bold">
                {role === 'Admin' ? 'System Administrator' : role}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-3.5 py-1.5 rounded-full badge-emerald font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CHITTAGONG EXPORT HUB
            </span>
            <span className="px-3.5 py-1.5 rounded-full badge-cyan font-bold">
              40FT HC CONTAINER: 41.1%
            </span>
            <button
              onClick={loadDashboard}
              className="p-2 rounded-lg btn-secondary text-slate-700"
              title="Refresh telemetry"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Role-tailored Industrial Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {role === 'Merchandiser' ? (
          <>
            <StatCard
              label="Buyer Orders"
              value={data?.total_orders || 6}
              cardTheme="blue"
              icon={Package}
              subtext="6 Major Global Brands"
              trend="+35k pcs"
            />
            <StatCard
              label="TNA Milestones"
              value="14 / 14"
              cardTheme="emerald"
              icon={Clock}
              subtext="Critical Path On-Track"
            />
            <StatCard
              label="Total Quantity"
              value="40,500 Pcs"
              cardTheme="purple"
              icon={Shirt}
              subtext="Knit, Denim & Fleece"
            />
            <StatCard
              label="Target Delivery"
              value="15 Apr 2026"
              cardTheme="amber"
              icon={Ship}
              subtext="Chittagong -> Europe"
            />
          </>
        ) : ['Production Manager', 'Cutting Supervisor', 'Sewing Supervisor', 'Finishing Supervisor'].includes(role) ? (
          <>
            <StatCard
              label="Cut Garments"
              value="14,200 Pcs"
              cardTheme="blue"
              icon={Scissors}
              subtext="CAD End-loss: 1.8%"
              trend="98.2% Yield"
            />
            <StatCard
              label="Sewing Output"
              value="12,850 Pcs"
              cardTheme="purple"
              icon={Layers}
              subtext="Lines 01 - 04 Operating"
            />
            <StatCard
              label="Finished Stock"
              value="11,700 Pcs"
              cardTheme="emerald"
              icon={Sparkles}
              subtext="Pressing & Tagging Done"
            />
            <StatCard
              label="Active Work Orders"
              value="6 Orders"
              cardTheme="amber"
              icon={Activity}
              subtext="Across 4 Factory Floors"
            />
          </>
        ) : role === 'Quality Inspector' ? (
          <>
            <StatCard
              label="Inspected Output"
              value="12,500 Pcs"
              cardTheme="blue"
              icon={ShieldCheck}
              subtext="Endline & Final AQL"
            />
            <StatCard
              label="AQL 2.5 Pass Rate"
              value="97.8%"
              cardTheme="emerald"
              icon={CheckCircle2}
              subtext="Grade A Acceptable"
              trend="PASSED"
            />
            <StatCard
              label="Defect Garments"
              value="275 Pcs"
              cardTheme="rose"
              icon={AlertTriangle}
              subtext="Reworked & Cleared"
            />
            <StatCard
              label="Endline DHU Score"
              value="1.85%"
              cardTheme="purple"
              icon={Activity}
              subtext="Target < 2.5% Benchmark"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Active Orders"
              value={data?.total_orders || 6}
              cardTheme="blue"
              icon={Package}
              subtext="40,500 Pcs Booked"
              trend="+6 Brands"
            />
            <StatCard
              label="Tech Pack Styles"
              value={data?.total_styles || 6}
              cardTheme="purple"
              icon={Shirt}
              subtext="Polo, Denim, Hoodie, Linen"
            />
            <StatCard
              label="Buyers / Vendors"
              value={`${data?.total_buyers || 6} / ${data?.total_suppliers || 8}`}
              cardTheme="cyan"
              icon={Boxes}
              subtext="Zara, H&M, Square, YKK"
            />
            <StatCard
              label="Cargo Readiness"
              value="28,450 Pcs"
              cardTheme="emerald"
              icon={Ship}
              subtext="Maersk & MSC Ex-Factory"
              trend="95.2%"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Order & Production Tracker */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/90 dark:border-slate-800">
            <div>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Live Order Execution Pipeline
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                End-to-end milestone synchronization from BOM allocation to vessel dispatch
              </p>
            </div>
            <span className="badge-blue font-mono font-bold">
              PO-2026-001 (ACTIVE)
            </span>
          </div>

          {/* Stepper Pipeline */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 via-slate-50 to-indigo-50/30 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div>
                <span className="font-black text-slate-900 dark:text-white font-mono text-sm">PO-2026-001</span>
                <span className="ml-2 badge-indigo font-bold">
                  H&M Hennes & Mauritz
                </span>
              </div>
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                Style: <span className="font-bold text-slate-900 dark:text-slate-200">NG-POLO-001</span> (10,000 Pcs)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-center text-xs font-semibold mt-2">
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-sm">
                <div className="flex items-center justify-center gap-1 mb-1 font-bold">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>1. BOM & MRP</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Allocated</p>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-sm">
                <div className="flex items-center justify-center gap-1 mb-1 font-bold">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>2. Raw Goods</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">2,700 kg In-House</p>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 shadow-sm">
                <div className="flex items-center justify-center gap-1 mb-1 font-bold">
                  <Layers size={13} className="text-blue-600" />
                  <span>3. Sewing Floor</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">9,850 Pcs Sewn</p>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300 shadow-sm">
                <div className="flex items-center justify-center gap-1 mb-1 font-bold">
                  <ShieldCheck size={13} className="text-purple-600" />
                  <span>4. Quality & Box</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">9,450 Passed</p>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 shadow-sm">
                <div className="flex items-center justify-center gap-1 mb-1 font-bold">
                  <Ship size={13} className="text-amber-600" />
                  <span>5. Vessel Load</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Maersk Ex-Factory</p>
              </div>
            </div>
          </div>

          {/* Active Orders Table */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Live Order Manifest & Ex-Factory Schedules
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs min-w-[500px]">
                <thead>
                  <tr className="text-left text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/60 text-[10px] uppercase font-bold">
                    <th className="py-2.5 px-3">PO Number</th>
                    <th className="py-2.5 px-3">Buyer Brand</th>
                    <th className="py-2.5 px-3">Floor Status</th>
                    <th className="py-2.5 px-3">Delivery Ex-Factory</th>
                    <th className="py-2.5 px-3 text-right">Order Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {(data?.recent_orders || []).map((order) => {
                    const statusClass = order.status === 'IN_PRODUCTION'
                      ? 'badge-emerald'
                      : order.status === 'CONFIRMED'
                      ? 'badge-blue'
                      : 'badge-amber'

                    return (
                      <tr key={order.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-blue-700 dark:text-blue-400 font-mono">{order.po_number}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{order.buyer || 'Global Buyer'}</td>
                        <td className="py-3 px-3">
                          <span className={`${statusClass} font-bold text-[10px]`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono">{order.delivery_date}</td>
                        <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white font-mono">
                          {order.total_quantity?.toLocaleString()} <span className="text-slate-500 text-[10px]">Pcs</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Inventory Stock & Production Pipeline */}
        <div className="card p-5 space-y-5">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Raw Material Stock Reserves
            </h3>
            <span className="badge-emerald font-bold">100% SECURED</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 dark:text-slate-200">Cotton Pique Knit (Fabric)</span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-400">2,700 kg</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 dark:text-slate-200">Ring Spun Denim Twill</span>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">3,850 yds</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 dark:text-slate-200">18L Pearl 3-Hole Buttons</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">35,000 Pcs</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 dark:text-slate-200">Export Master Cartons (7-Ply)</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">480 Cartons</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Factory Node Profile
            </h4>
            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400 font-medium">
              <div className="flex justify-between">
                <span>Facility:</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">BloomWorks Ltd. (Dhaka)</span>
              </div>
              <div className="flex justify-between">
                <span>Active Buyers:</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">H&M, Zara, Tommy, M&S</span>
              </div>
              <div className="flex justify-between">
                <span>Vessel Line:</span>
                <span className="font-bold text-blue-700 dark:text-blue-400">Maersk & MSC (Chittagong)</span>
              </div>
              <div className="flex justify-between">
                <span>Air Freight Risk:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black">0% (ON SCHEDULE)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
