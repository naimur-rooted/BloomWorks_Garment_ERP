import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  GitMerge,
  Plane,
  Ship,
  Sparkles,
} from 'lucide-react'

export default function TNA() {
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [simFabricDelayDays, setSimFabricDelayDays] = useState(0)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/enterprise/critical-path-tna')
      setMilestones(res.data)
    } catch (err) {
      console.error('Failed to load TNA data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate simulated dates based on fabric delay
  const getSimulatedMilestones = () => {
    return milestones.map((m) => {
      let simDelay = 0
      // Milestones occurring after fabric in-house cascade with the delay
      if (['M-04', 'M-05', 'M-06', 'M-07', 'M-08'].includes(m.milestone_code)) {
        simDelay = simFabricDelayDays
      }

      const pEndDate = new Date(m.planned_end)
      const newEndDate = new Date(pEndDate)
      newEndDate.setDate(newEndDate.getDate() + simDelay)

      const isDelayed = simDelay > 0
      const isCriticalLate = simDelay > 3

      return {
        ...m,
        simDelay,
        calculated_end: newEndDate.toISOString().split('T')[0],
        simStatus: isDelayed ? (isCriticalLate ? 'CRITICAL DELAY' : 'DELAYED') : m.status,
      }
    })
  }

  const simList = getSimulatedMilestones()
  const exFactoryMilestone = simList.find((m) => m.milestone_code === 'M-08')
  const airFreightRisk = simFabricDelayDays >= 4

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-colorful-blue p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="icon-box-blue">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  CRITICAL PATH TIME & ACTION (T&A) ENGINE
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Predecessor-dependent DAG network, float time calculations & cascading ex-factory delay alerts
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadData}
            className="btn-secondary flex items-center gap-1.5 text-xs font-mono font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Air Freight Delay Alert Banner */}
      {airFreightRisk ? (
        <div className="p-4 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-800/80 flex items-start gap-3 shadow-sm transition-colors">
          <Plane className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 animate-bounce mt-0.5" />
          <div className="font-mono">
            <div className="font-bold text-sm text-rose-900 dark:text-rose-100">
              CRITICAL AIR-FREIGHT CONVERSION WARNING (&plusmn;${(simFabricDelayDays * 22000).toLocaleString()} LIABILITY)
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 font-sans">
              Cumulative upstream delay has pushed Ex-Factory Date past maritime vessel cut-off. Buyer will demand emergency air shipment at factory expense unless 2nd sewing shift is added!
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between shadow-sm font-mono transition-colors">
          <div className="flex items-center gap-3">
            <Ship className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Vessel Booking On Schedule:</span> Maritime sailing buffer is currently protected (+3 days float).
            </div>
          </div>
          <span className="badge-emerald font-semibold">
            Target Sea Freight FOB
          </span>
        </div>
      )}

      {/* Interactive Delay Simulator Slider */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 font-mono">
          <div className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Cascading Delay Simulator (Milestone M-03: Bulk Fabric In-House)
            </h3>
          </div>
          <span className="badge-blue font-bold">
            Simulated Delay: +{simFabricDelayDays} Days
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Drag the slider to test what happens if the fabric dyeing mill delivers fabric late. Watch how the DAG algorithm recalculates every downstream milestone automatically.
        </p>

        <input
          type="range"
          min="0"
          max="10"
          value={simFabricDelayDays}
          onChange={(e) => setSimFabricDelayDays(parseInt(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer bg-slate-200 dark:bg-slate-800 h-2 rounded-lg"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
          <span>0 Days (On Time)</span>
          <span>+3 Days (Slack Exhausted)</span>
          <span className="text-rose-500 font-bold">+5 Days (Air Freight Penalty)</span>
          <span className="text-rose-600 font-bold">+10 Days (Order Cancellation)</span>
        </div>
      </div>

      {/* Critical Path Milestones Table */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Order PO-8821 Time & Action Critical Path (CPM)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zero-float milestones are highlighted with markers; delay on any critical task causes delivery failure
            </p>
          </div>
          <span className="badge-blue font-semibold">
            Total Cycle Lead Time: 45 Days
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono border-collapse min-w-[850px]">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3 border-r border-slate-200 dark:border-slate-800">Code</th>
                <th className="p-3 border-r border-slate-200 dark:border-slate-800">Milestone Description</th>
                <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Predecessor</th>
                <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Lead Days</th>
                <th className="p-3 border-r border-slate-200 dark:border-slate-800">Original Planned Date</th>
                <th className="p-3 border-r border-slate-200 dark:border-slate-800">Recalculated Due Date</th>
                <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Float / Slack</th>
                <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Status</th>
                <th className="p-3">Department Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
              {simList.map((m) => (
                <tr
                  key={m.milestone_code}
                  className={`transition-colors ${
                    m.simDelay > 3 ? 'bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="p-3 font-semibold text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800">{m.milestone_code}</td>
                  <td className="p-3 font-medium text-slate-800 dark:text-white border-r border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    {m.is_critical && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Critical Path Node" />
                    )}
                    {m.milestone_name}
                  </td>
                  <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                    {m.predecessor_code || 'START'}
                  </td>
                  <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">{m.lead_days}d</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">{m.planned_end}</td>
                  <td className="p-3 font-bold border-r border-slate-200 dark:border-slate-800">
                    <span className={m.simDelay > 0 ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-700 dark:text-slate-200'}>
                      {m.calculated_end}
                    </span>
                    {m.simDelay > 0 && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold ml-1">
                        (+{m.simDelay}d)
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">
                    <span className={m.float_days < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {m.float_days - m.simDelay}d
                    </span>
                  </td>
                  <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800">
                    {m.status === 'COMPLETED' ? (
                      <span className="badge-emerald font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : m.simDelay > 3 ? (
                      <span className="badge-rose font-semibold">
                        <AlertTriangle className="w-3 h-3 animate-pulse" /> Critical Delay
                      </span>
                    ) : m.simDelay > 0 ? (
                      <span className="badge-amber font-semibold">
                        <Clock className="w-3 h-3" /> Delayed
                      </span>
                    ) : (
                      <span className="badge-blue font-semibold">
                        On Track
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{m.responsible_role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
