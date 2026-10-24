import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  Boxes,
  Scroll,
  ShieldCheck,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scissors,
  Layers,
} from 'lucide-react'

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('rolls') // 'rolls' | '4point-calc' | 'balances'
  const [rolls, setRolls] = useState([])
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)

  // 4-Point Calculator State
  const [calcLength, setCalcLength] = useState(100)
  const [calcWidth, setCalcWidth] = useState(58)
  const [defects, setDefects] = useState({
    under3: 2, // 1 pt each
    threeTo6: 1, // 2 pts each
    sixTo9: 1, // 3 pts each
    over9: 0, // 4 pts each
    holes: 1, // 4 pts each
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [rRes, bRes] = await Promise.all([
        api.get('/enterprise/fabric-rolls'),
        api.get('/inventory/balances').catch(() => ({ data: [] })),
      ])
      setRolls(rRes.data)
      setBalances(bRes.data)
    } catch (err) {
      console.error('Failed to load inventory data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate live 4-point score
  const calculate4Point = () => {
    const totalPoints =
      defects.under3 * 1 +
      defects.threeTo6 * 2 +
      defects.sixTo9 * 3 +
      defects.over9 * 4 +
      defects.holes * 4

    const score = (calcLength * calcWidth) > 0
      ? (totalPoints * 36.0 * 100.0) / (calcLength * calcWidth)
      : 0

    const passed = score <= 28.0
    return {
      points: totalPoints,
      score: score.toFixed(2),
      passed,
      grade: passed ? 'Grade A (Acceptable for Bulk Cutting)' : 'Grade B (Quarantine / Mill Debit Note)',
    }
  }

  const fourPointResult = calculate4Point()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-colorful-cyan p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="icon-box-cyan">
                <Scroll className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  RAW MATERIAL STORE & ASTM D5430 FABRIC ROLLS
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Serialized fabric roll inventory, 4-Point inspection scoring, shade lot grouping & relaxation timers
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

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 rounded-xl shadow-sm text-xs overflow-x-auto transition-colors">
        <button
          onClick={() => setActiveTab('rolls')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'rolls'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Scroll className="w-4 h-4" />
          Fabric Roll-by-Roll Inventory & Shade Lots
        </button>

        <button
          onClick={() => setActiveTab('4point-calc')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === '4point-calc'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          ASTM D5430 4-Point Calculator
        </button>

        <button
          onClick={() => setActiveTab('balances')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'balances'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          General Stock Ledger
        </button>
      </div>

      {/* TAB 1: FABRIC ROLLS & SHADE LOTS */}
      {activeTab === 'rolls' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Serialized Fabric Roll Quality & Binning
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Every physical roll is assigned a shade group and audited for shrinkage before cutting authorization
              </p>
            </div>
            <span className="badge-blue font-semibold">
              Standard 4-Point Threshold: &le; 28 pts / 100 sq yds
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono border-collapse min-w-[850px]">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Roll Barcode</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Fabric & Construction</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Shade Lot</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-right">Length</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Width / GSM</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Shrinkage (L &times; W)</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">4-Point Score</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Inspection Status</th>
                  <th className="p-3 text-center">Relaxation (24h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                {rolls.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800">
                      {r.roll_barcode}
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Mill #: {r.supplier_roll_no}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-800 dark:text-white border-r border-slate-200 dark:border-slate-800">
                      {r.material_name}
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{r.order_number}</div>
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        r.shade_lot === 'Lot A' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' :
                        r.shade_lot === 'Lot B' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800' :
                        'badge-slate'
                      }`}>
                        {r.shade_lot}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                      {r.roll_length_yds} yds
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      {r.usable_width_in}&quot; • {r.gsm}g
                    </td>
                    <td className="p-3 text-center font-medium border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {r.shrinkage_length_pct}% &times; {r.shrinkage_width_pct}%
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800">
                      <span className={`font-bold ${r.points_per_100_sq_yds <= 28 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {r.points_per_100_sq_yds} pts
                      </span>
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800">
                      {r.inspection_status === 'PASSED' ? (
                        <span className="badge-emerald">
                          <CheckCircle2 className="w-3 h-3" /> Grade A Pass
                        </span>
                      ) : (
                        <span className="badge-rose">
                          <XCircle className="w-3 h-3" /> Grade B Reject
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {r.relaxation_status === 'READY' ? (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Relaxed & Ready
                        </span>
                      ) : r.relaxation_status === 'RELAXING' ? (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" /> {r.remaining_relaxation_hours}h remaining
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not Started</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ASTM D5430 4-POINT CALCULATOR */}
      {activeTab === '4point-calc' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 space-y-5 font-mono">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ASTM D5430 4-Point Fabric Inspection Protocol
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Standard international formula to grade incoming woven and knitted fabric rolls
              </p>
            </div>

            {/* Roll Dimensions */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Inspected Roll Length (Yards)
                </label>
                <input
                  type="number"
                  value={calcLength}
                  onChange={(e) => setCalcLength(parseFloat(e.target.value) || 0)}
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Cuttable Fabric Width (Inches)
                </label>
                <input
                  type="number"
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(parseFloat(e.target.value) || 0)}
                  className="input font-mono"
                />
              </div>
            </div>

            {/* Defect Counters */}
            <div className="space-y-3 pt-2 font-sans">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Defect Length Category Penalties
              </h4>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Defects up to 3 inches</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Penalty: 1 point per defect</div>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <input
                    type="number"
                    min="0"
                    value={defects.under3}
                    onChange={(e) => setDefects({ ...defects, under3: parseInt(e.target.value) || 0 })}
                    className="input w-16 text-center font-bold text-xs py-1"
                  />
                  <span className="text-xs text-slate-500 w-14">={defects.under3 * 1} pts</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Defects &gt; 3 inches up to 6 inches</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Penalty: 2 points per defect</div>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <input
                    type="number"
                    min="0"
                    value={defects.threeTo6}
                    onChange={(e) => setDefects({ ...defects, threeTo6: parseInt(e.target.value) || 0 })}
                    className="input w-16 text-center font-bold text-xs py-1"
                  />
                  <span className="text-xs text-slate-500 w-14">={defects.threeTo6 * 2} pts</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Defects &gt; 6 inches up to 9 inches</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Penalty: 3 points per defect</div>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <input
                    type="number"
                    min="0"
                    value={defects.sixTo9}
                    onChange={(e) => setDefects({ ...defects, sixTo9: parseInt(e.target.value) || 0 })}
                    className="input w-16 text-center font-bold text-xs py-1"
                  />
                  <span className="text-xs text-slate-500 w-14">={defects.sixTo9 * 3} pts</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Defects over 9 inches or Fabric Holes</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Penalty: 4 points per defect</div>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <input
                    type="number"
                    min="0"
                    value={defects.holes}
                    onChange={(e) => setDefects({ ...defects, holes: parseInt(e.target.value) || 0 })}
                    className="input w-16 text-center font-bold text-xs py-1"
                  />
                  <span className="text-xs text-slate-500 w-14">={defects.holes * 4} pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Score Result Card */}
          <div className="card p-6 flex flex-col justify-between font-mono">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Standard Calculation</span>
              <div className="text-3xl font-black mt-2 text-slate-900 dark:text-white">
                {fourPointResult.score}{' '}
                <span className="text-sm font-normal text-slate-500">pts / 100 sq yds</span>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Penalty Points:</span>
                  <span className="text-slate-900 dark:text-white font-bold font-mono">{fourPointResult.points} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Standard Threshold:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold font-mono">&le; 28.00 pts</span>
                </div>
              </div>

              <div className="mt-6 font-sans">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">Quality Verdict</span>
                <div className={`mt-2 p-3.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${
                  fourPointResult.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300'
                    : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300'
                }`}>
                  {fourPointResult.passed ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />}
                  <span>{fourPointResult.grade}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6 text-[10px] text-slate-400 font-mono">
              Formula: (Points &times; 36 &times; 100) &divide; (Length &times; Width)
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GENERAL BALANCES */}
      {activeTab === 'balances' && (
        <div className="card p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Current Warehouse Balances</h3>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Material Code</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Description</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Category</th>
                  <th className="p-3 text-right">Stock Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                {balances.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800">{b.material_code || `MAT-00${i+1}`}</td>
                    <td className="p-3 font-medium text-slate-800 dark:text-white border-r border-slate-200 dark:border-slate-800">{b.material_name || 'Combed Cotton / Trims'}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">{b.category || 'Raw Material'}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{b.quantity || 1200}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
