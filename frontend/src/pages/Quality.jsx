import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Search,
  Calculator,
  FileCheck,
  Sliders,
  Scissors,
  Check,
} from 'lucide-react'

export default function Quality() {
  const [activeTab, setActiveTab] = useState('audits') // 'audits' | 'aql-calc' | 'pareto'
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)

  // Interactive AQL Calculator State
  const [lotSize, setLotSize] = useState(4660)
  const [aqlTarget, setAqlTarget] = useState(2.5)
  const [simDefectsFound, setSimDefectsFound] = useState(6)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/enterprise/quality-audits')
      setAudits(res.data)
    } catch (err) {
      console.error('Failed to load quality audits:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ISO 2859-1 Normal Inspection Level II Calculator
  const getAqlCalculation = () => {
    let sampleSize = 125
    let maxAllowed = 7
    let letter = 'K'

    if (lotSize <= 500) {
      sampleSize = 50
      maxAllowed = 3
      letter = 'H'
    } else if (lotSize <= 1200) {
      sampleSize = 80
      maxAllowed = 5
      letter = 'J'
    } else if (lotSize <= 3200) {
      sampleSize = 125
      maxAllowed = 7
      letter = 'K'
    } else if (lotSize <= 10000) {
      sampleSize = 200
      maxAllowed = 10
      letter = 'L'
    } else {
      sampleSize = 315
      maxAllowed = 14
      letter = 'M'
    }

    const passed = simDefectsFound <= maxAllowed
    return {
      letter,
      sampleSize,
      maxAllowed,
      rejectMin: maxAllowed + 1,
      passed,
      verdict: passed ? 'PASSED - APPROVED FOR SHIPMENT' : 'FAILED - LOT QUARANTINED (100% RE-AUDIT REQUIRED)',
    }
  }

  const aqlResult = getAqlCalculation()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-colorful-amber p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="icon-box-amber">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  QUALITY ASSURANCE & ISO 2859-1 AQL AUDIT
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  End-line defect tracking (DHU), Defect Pareto analysis & Pre-Shipment AQL 2.5 final inspection gates
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
          onClick={() => setActiveTab('audits')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'audits'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Inspection Audit Records & Certificates
        </button>

        <button
          onClick={() => setActiveTab('aql-calc')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'aql-calc'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          ISO 2859-1 AQL Sampling Table Calculator
        </button>

        <button
          onClick={() => setActiveTab('pareto')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'pareto'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Defect Pareto & DHU Scorecards
        </button>
      </div>

      {/* TAB 1: AUDIT RECORDS */}
      {activeTab === 'audits' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Quality Inspection Records & Shipment Gates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hard Gate: Shipments are locked unless an accredited FINAL_AQL inspection passes
              </p>
            </div>
            <span className="badge-indigo font-semibold">
              Standard AQL: 2.5 Major / 4.0 Minor
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono border-collapse min-w-[850px]">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Audit Report #</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Order / Style</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Station / Line</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Audit Stage</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-right">Sample Size</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Allowed / Defective</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">DHU Rate</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Verdict</th>
                  <th className="p-3">Lead Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                {audits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800">{a.audit_number}</td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                      {a.order_number}
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{a.style_code}</div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">{a.line_number}</td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800">
                      <span className="badge-indigo font-semibold">
                        {a.audit_type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                      {a.sample_size} pcs
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400">Max {a.allowed_defects}</span> /{' '}
                      <span className={`font-bold ${a.total_defective <= a.allowed_defects ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {a.total_defective} found
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold border-r border-slate-200 dark:border-slate-800 text-purple-600 dark:text-purple-400">
                      {a.dhu_score}%
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800">
                      {a.audit_result === 'PASS' ? (
                        <span className="badge-emerald font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                        </span>
                      ) : (
                        <span className="badge-rose font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{a.inspector_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AQL SAMPLING TABLE CALCULATOR */}
      {activeTab === 'aql-calc' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 space-y-5 font-mono">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ISO 2859-1 (MIL-STD-105E) AQL Sampling Plan Calculator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Standard single sampling plan for normal pre-shipment audit inspection
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Total Order Lot Size (Pieces)
                </label>
                <input
                  type="number"
                  value={lotSize}
                  onChange={(e) => setLotSize(parseInt(e.target.value) || 0)}
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Target AQL Standard
                </label>
                <select
                  value={aqlTarget}
                  onChange={(e) => setAqlTarget(parseFloat(e.target.value))}
                  className="input font-mono"
                >
                  <option value="1.5">AQL 1.5 (High Fashion / Luxury)</option>
                  <option value="2.5">AQL 2.5 (Standard Commercial Apparel)</option>
                  <option value="4.0">AQL 4.0 (Budget / Basic Apparel)</option>
                </select>
              </div>
            </div>

            <div className="font-sans">
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-500 dark:text-slate-400">Simulate Defective Garments Discovered:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{simDefectsFound} pcs</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={simDefectsFound}
                onChange={(e) => setSimDefectsFound(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer bg-slate-200 dark:bg-slate-800 h-2 rounded-lg"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Drag slider to test pass vs. fail shipment gate triggers.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 font-mono">
              <div className="font-bold text-slate-900 dark:text-white uppercase">ISO 2859-1 Code Letter Index:</div>
              <div className="grid grid-cols-3 gap-2 text-slate-600 dark:text-slate-400">
                <div>Sample Code: <span className="font-bold text-blue-600 dark:text-blue-400">{aqlResult.letter}</span></div>
                <div>Random Sample Qty: <span className="font-bold text-slate-900 dark:text-white">{aqlResult.sampleSize} pcs</span></div>
                <div>Acceptance (Ac): <span className="font-bold text-emerald-600 dark:text-emerald-400">&le; {aqlResult.maxAllowed} pcs</span></div>
              </div>
            </div>
          </div>

          {/* Verdict Card */}
          <div className="card p-6 flex flex-col justify-between font-mono">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Audit Acceptance Threshold</span>
              <div className="text-3xl font-black mt-2 text-slate-900 dark:text-white">
                Ac &le; {aqlResult.maxAllowed} <span className="text-sm font-normal text-slate-400">/ Re &ge; {aqlResult.rejectMin}</span>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Lot:</span>
                  <span className="text-slate-900 dark:text-white font-bold font-mono">{lotSize.toLocaleString()} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sample Required:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">{aqlResult.sampleSize} garments</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Defects Found:</span>
                  <span className={simDefectsFound <= aqlResult.maxAllowed ? 'text-emerald-600 dark:text-emerald-400 font-bold font-mono' : 'text-rose-600 dark:text-rose-400 font-bold font-mono'}>
                    {simDefectsFound} garments
                  </span>
                </div>
              </div>

              <div className="mt-6 font-sans">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">Shipment Gate Lock</span>
                <div className={`mt-2 p-3.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${
                  aqlResult.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300'
                    : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300'
                }`}>
                  {aqlResult.passed ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />}
                  <span>{aqlResult.verdict}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6 text-[10px] text-slate-400 font-mono">
              Enforces Level II Normal Single Sampling per buyer protocol
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEFECT PARETO & DHU SCORECARD */}
      {activeTab === 'pareto' && (
        <div className="card p-6 space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
              End-Line Sewing Defect Pareto & DHU Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Defects per Hundred Units (DHU) categorized by manufacturing root cause
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 font-mono">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Top Sewing Floor Defects (Pareto Analysis)
              </h4>

              <div className="space-y-2">
                {[
                  { name: 'Skip Stitch / Broken Thread', count: 18, pct: 36, cat: 'Machine Tension' },
                  { name: 'Needle Cut / Hole', count: 12, pct: 24, cat: 'Needle Gauge' },
                  { name: 'Seam Puckering', count: 8, pct: 16, cat: 'Feed Dog Differential' },
                  { name: 'Uneven Hem / Runoff', count: 7, pct: 14, cat: 'Operator Handling' },
                  { name: 'Oil & Water Stain', count: 5, pct: 10, cat: 'Maintenance' },
                ].map((d) => (
                  <div key={d.name} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-white mb-1">
                      <span>{d.name} ({d.cat})</span>
                      <span className="text-blue-600 dark:text-blue-400">{d.count} pcs ({d.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800/40 flex flex-col justify-between font-mono">
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-2">DHU (Defects per Hundred Units) Formula</h4>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-blue-200 dark:border-blue-800/60 text-xs text-blue-800 dark:text-blue-300">
                  DHU = (Total Defects Found &divide; Total Garments Checked) &times; 100
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-blue-200 dark:border-slate-800">
                    <span>Target Factory DHU:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">&le; 3.00%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-200 dark:border-slate-800">
                    <span>Line 04 Current DHU:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">4.80% (Minor Rework)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>First-Time Pass Yield (FTY):</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">95.20%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                Auditors re-inspect 100% of altered garments before bundle leaves the line.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
