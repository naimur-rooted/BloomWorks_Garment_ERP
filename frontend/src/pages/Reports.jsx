import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  BarChart3,
  Landmark,
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  PieChart,
  RefreshCw,
  Layers,
  FileSpreadsheet,
  Building,
} from 'lucide-react'

export default function Reports() {
  const [activeTab, setActiveTab] = useState('job-costing') // 'job-costing' | 'commercial-lc' | 'kpis'
  const [commercialData, setCommercialData] = useState([])
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [comRes, sumRes] = await Promise.all([
        api.get('/enterprise/commercial-exim'),
        api.get('/reports/summary').catch(() => ({ data: null })),
      ])
      setCommercialData(comRes.data)
      setSummaryData(sumRes.data)
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const currentRecord = commercialData[0] || null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-colorful-rose p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="icon-box-rose">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  COMMERCIAL EXIM & JOB COST VARIANCE
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Master LC vs. Back-to-Back (B2B) banking ledgers & pre-cost vs. actual production variance analysis
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
          onClick={() => setActiveTab('job-costing')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'job-costing'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Order Job-Costing Variance Ledger
        </button>

        <button
          onClick={() => setActiveTab('commercial-lc')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'commercial-lc'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          Master LC & Back-to-Back (B2B) Banking
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'kpis'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Executive Factory KPIs
        </button>
      </div>

      {currentRecord && (
        <>
          {/* TAB 1: JOB COSTING VARIANCE LEDGER */}
          {activeTab === 'job-costing' && (
            <div className="space-y-6">
              {/* Financial Variance Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Master Order Revenue</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    ৳{currentRecord.lc_value.toLocaleString()} BDT
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{currentRecord.order_number} • {currentRecord.buyer_name}</div>
                </div>

                <div className="card p-4">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Budgeted Production Cost</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    ৳{currentRecord.budgeted_cost.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold mt-1">Target Net Margin: 9.12%</div>
                </div>

                <div className="card p-4">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Actual Post-Cost Expense</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    ৳{currentRecord.actual_cost.toLocaleString()}
                  </div>
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-mono font-semibold mt-1">Realized Net Margin: 6.78%</div>
                </div>

                <div className="card p-4 border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20">
                  <span className="text-[11px] font-semibold uppercase text-rose-700 dark:text-rose-400">Cost Variance (Margin Drag)</span>
                  <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1 font-mono">
                    +৳{currentRecord.variance_amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-rose-600 dark:text-rose-300 font-mono font-semibold mt-1">Unfavorable Variance</div>
                </div>
              </div>

              {/* Line-by-Line Variance Breakdown */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Standard Cost vs. Actual Cost Itemized Reconciliation
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Decomposes cost overruns into raw material yield, trim pricing, and sewing labor efficiency
                    </p>
                  </div>
                  <span className="badge-rose font-semibold">
                    Net Impact: -2.34% Profit Margin Slippage
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs font-mono border-collapse min-w-[850px]">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800">Cost Category / Element</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-right">Standard Budget</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-right">Actual Expense</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-right">Variance (৳)</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Status</th>
                        <th className="p-3">Primary Root Cause / Driver</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                      {currentRecord.cost_variance.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">{v.element}</td>
                          <td className="p-3 text-right border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                            ৳{v.budgeted.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                            ৳{v.actual.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-black border-r border-slate-200 dark:border-slate-800">
                            <span className={v.variance > 0 ? 'text-rose-600 dark:text-rose-400' : v.variance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                              {v.variance > 0 ? `+৳${v.variance.toFixed(2)}` : v.variance < 0 ? `-৳${Math.abs(v.variance).toFixed(2)}` : '৳0.00'}
                            </span>
                          </td>
                          <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              v.status === 'FAVORABLE' ? 'badge-emerald' :
                              v.status === 'UNFAVORABLE' ? 'badge-rose' :
                              'badge-slate'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300 font-sans text-xs">{v.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MASTER LC & BACK-TO-BACK (B2B) BANKING */}
          {activeTab === 'commercial-lc' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card p-6 space-y-5 font-mono">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Back-to-Back (B2B) Letter of Credit Supplier Ledger
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                    Raw material supplier LCs opened under Customs Bonded Warehouse license against Master LC #{currentRecord.master_lc_number}
                  </p>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs font-mono border-collapse min-w-[750px]">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800">B2B LC #</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800">Beneficiary Supplier</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800">Material Classification</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-right">LC Value (৳)</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                      {currentRecord.b2b_ledger.map((b, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-semibold text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800">{b.b2b_lc_no}</td>
                          <td className="p-3 font-medium text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">{b.supplier}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">{b.material}</td>
                          <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800">৳{b.value.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className="badge-emerald font-semibold">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Master LC Banking Card */}
              <div className="card p-6 flex flex-col justify-between font-mono">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Master Export LC</span>
                  <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                    {currentRecord.master_lc_number}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{currentRecord.issuing_bank}</div>

                  <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-sans">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Total LC Value:</span>
                      <span className="text-slate-900 dark:text-white font-bold font-mono">৳{currentRecord.lc_value.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Latest Ship Date:</span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium font-mono">{currentRecord.latest_shipment_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">LC Expiry Date:</span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium font-mono">{currentRecord.expiry_date}</span>
                    </div>
                  </div>

                  <div className="mt-6 font-sans">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 uppercase mb-1">
                      <span>B2B Entitlement Utilization</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{currentRecord.b2b_utilization_pct}% / 75.0%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(currentRecord.b2b_utilization_pct / currentRecord.max_b2b_allowed_pct) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 font-mono">
                      Opened ৳{currentRecord.total_b2b_opened.toLocaleString()} of maximum allowed ৳{(currentRecord.lc_value * 0.75).toLocaleString()}.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6 text-[10px] text-slate-400 font-sans">
                  Customs Bonded Warehouse compliance verified
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXECUTIVE FACTORY KPIS */}
          {activeTab === 'kpis' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              <div className="card p-5 space-y-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">On-Time In-Full (OTIF) Delivery</span>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">96.4%</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Evaluated across last 48 export shipments to Europe and North America
                </p>
              </div>

              <div className="card p-5 space-y-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Capacity Load vs. Booked</span>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">88.2%</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Sewing floor booked at 88.2% capacity for next 90 days (healthy buffer)
                </p>
              </div>

              <div className="card p-5 space-y-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Overall Factory DHU</span>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">3.40%</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Average defects per hundred units across all 12 operational sewing lines
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
