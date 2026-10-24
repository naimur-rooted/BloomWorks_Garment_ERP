import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  Grid3X3,
  Calculator,
  Ruler,
  DollarSign,
  Plus,
  RefreshCw,
  Sparkles,
  Layers,
  Shirt,
  Calendar,
  CheckCircle2,
  Sliders,
} from 'lucide-react'

export default function Orders() {
  const [activeTab, setActiveTab] = useState('matrix') // 'matrix' | 'costing' | 'pom'
  const [matrixOrders, setMatrixOrders] = useState([])
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Interactive Costing Simulator State
  const [simEfficiency, setSimEfficiency] = useState(65)
  const [simFabricCost, setSimFabricCost] = useState(3.45)
  const [simSmv, setSimSmv] = useState(18.5)
  const [simMargin, setSimMargin] = useState(10)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/enterprise/matrix-orders')
      setMatrixOrders(res.data)
      if (res.data.length > 0) {
        setSimSmv(res.data[0].smv_minutes)
        setSimFabricCost(res.data[0].costing_breakdown.fabric_cost)
      }
    } catch (err) {
      console.error('Failed to load matrix orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectedOrder = matrixOrders[selectedOrderIndex] || null

  // Calculate live dynamic CM & FOB quote from simulator sliders
  const calculateLiveCost = () => {
    const lineMinuteRate = 0.045
    const cm = (simSmv * lineMinuteRate) / (simEfficiency / 100.0)
    const trims = 0.85
    const wash = 0.40
    const subtotal = simFabricCost + trims + cm + wash
    const commercial = subtotal * 0.03
    const base = subtotal + commercial
    const profit = base * (simMargin / 100.0)
    const fob = base + profit

    return {
      cm: cm.toFixed(2),
      subtotal: subtotal.toFixed(2),
      commercial: commercial.toFixed(2),
      profit: profit.toFixed(2),
      fob: fob.toFixed(2),
    }
  }

  const liveCost = calculateLiveCost()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-colorful-blue p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="icon-box-blue">
                <Grid3X3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  2D MATRIX ORDERS & PRE-ORDER COSTING
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Colorway &times; Size distribution grids, SMV-based costing sheets, and POM tolerance specs
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedOrderIndex}
              onChange={(e) => {
                const idx = parseInt(e.target.value)
                setSelectedOrderIndex(idx)
                if (matrixOrders[idx]) {
                  setSimSmv(matrixOrders[idx].smv_minutes)
                  setSimFabricCost(matrixOrders[idx].costing_breakdown.fabric_cost)
                }
              }}
              className="input w-72 text-xs font-mono font-bold"
            >
              {matrixOrders.map((ord, idx) => (
                <option key={ord.po_number} value={idx}>
                  {ord.po_number} • {ord.buyer_name} ({ord.style_code})
                </option>
              ))}
            </select>

            <button
              onClick={loadData}
              className="btn-secondary flex items-center gap-1.5 text-xs font-mono"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <>
          {/* Order Snapshot Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="card-colorful-blue p-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Buyer / Client</span>
              <div className="text-sm font-black truncate mt-1 text-slate-900 dark:text-white">{selectedOrder.buyer_name}</div>
            </div>
            <div className="card-colorful-purple p-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Product Type</span>
              <div className="text-sm font-bold truncate mt-1 text-slate-800 dark:text-slate-200">{selectedOrder.product_type}</div>
            </div>
            <div className="card-colorful-cyan p-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Fabric Construction</span>
              <div className="text-sm font-bold truncate mt-1 text-slate-800 dark:text-slate-200">{selectedOrder.fabric_type}</div>
            </div>
            <div className="card-colorful-emerald p-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Total Order Qty</span>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                {selectedOrder.total_quantity.toLocaleString()} pcs
              </div>
            </div>
            <div className="card-colorful-amber p-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Total Order Value</span>
              <div className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1 font-mono">
                ৳{selectedOrder.total_value.toLocaleString()} BDT
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 rounded-xl shadow-sm text-xs overflow-x-auto transition-colors">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              2D Color &times; Size Matrix Grid
            </button>

            <button
              onClick={() => setActiveTab('costing')}
              className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'costing'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Pre-Order Costing & SMV Simulator
            </button>

            <button
              onClick={() => setActiveTab('pom')}
              className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'pom'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Ruler className="w-4 h-4" />
              Tech Pack POM Tolerance Rules
            </button>
          </div>

          {/* TAB 1: 2D COLOR X SIZE MATRIX GRID */}
          {activeTab === 'matrix' && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Production Size-Color Breakdown Matrix
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Governs cutting lay planning, marker combinations, and bundle generation
                  </p>
                </div>
                <span className="badge-emerald font-semibold">
                  Allowed Over/Under Tolerance: &plusmn;3.0%
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono border-collapse min-w-[700px]">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-800">Colorway</th>
                      {selectedOrder.sizes.map((sz) => (
                        <th key={sz} className="p-3 text-center border-r border-slate-200 dark:border-slate-800 w-20">
                          {sz}
                        </th>
                      ))}
                      <th className="p-3 text-right border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">Total Qty</th>
                      <th className="p-3 text-right border-r border-slate-200 dark:border-slate-800">FOB Price</th>
                      <th className="p-3 text-right bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">Color Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                    {selectedOrder.matrix.map((row) => (
                      <tr key={row.color} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700"
                            style={{
                              backgroundColor:
                                row.color.toLowerCase().includes('navy') ? '#1e3a8a' :
                                row.color.toLowerCase().includes('white') ? '#ffffff' :
                                row.color.toLowerCase().includes('black') ? '#18181b' :
                                row.color.toLowerCase().includes('grey') ? '#9ca3af' : '#2563eb'
                            }}
                          />
                          {row.color}
                        </td>
                        {selectedOrder.sizes.map((sz) => (
                          <td key={sz} className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            {row.quantities[sz] ? row.quantities[sz].toLocaleString() : '-'}
                          </td>
                        ))}
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
                          {row.total.toLocaleString()} pcs
                        </td>
                        <td className="p-3 text-right text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                          ৳{row.unit_price.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-bold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20">
                          ৳{(row.total * row.unit_price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Column Totals Row */}
                  <tfoot className="bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-900 dark:text-white border-t-2 border-slate-200 dark:border-slate-800">
                    <tr>
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800 uppercase">Size Subtotal</td>
                      {selectedOrder.sizes.map((sz) => {
                        const colSum = selectedOrder.matrix.reduce((acc, r) => acc + (r.quantities[sz] || 0), 0)
                        return (
                          <td key={sz} className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400">
                            {colSum.toLocaleString()}
                          </td>
                        )
                      })}
                      <td className="p-3 text-right border-r border-slate-200 dark:border-slate-800 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">
                        {selectedOrder.total_quantity.toLocaleString()} pcs
                      </td>
                      <td className="p-3 text-right border-r border-slate-200 dark:border-slate-800 text-slate-400">-</td>
                      <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20">
                        ৳{selectedOrder.total_value.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PRE-ORDER COSTING & SMV SIMULATOR */}
          {activeTab === 'costing' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Costing Breakdown Table */}
              <div className="lg:col-span-2 card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Standard Cost Breakdown per Garment
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Standard Minutes (SMV): {selectedOrder.smv_minutes} mins • Target Line Efficiency: {selectedOrder.target_efficiency_pct}%
                    </p>
                  </div>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                    Quoted FOB: ৳{selectedOrder.costing_breakdown.quoted_fob_price.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-700 dark:text-slate-300">1. Fabric Raw Material Cost (Body + Rib + Trims)</span>
                    <span className="font-bold text-slate-900 dark:text-white">৳{selectedOrder.costing_breakdown.fabric_cost.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-700 dark:text-slate-300">2. Sewing & Packaging Trims (Thread, Labels, Buttons, Polybags, Cartons)</span>
                    <span className="font-bold text-slate-900 dark:text-white">৳{selectedOrder.costing_breakdown.trims_cost.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div>
                      <span className="font-bold text-blue-700 dark:text-blue-300">3. Cost of Making (CM Labor & Factory Overhead)</span>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400">
                        Formula: (SMV {selectedOrder.smv_minutes}m &times; ৳4.50/min) &divide; {selectedOrder.target_efficiency_pct}%
                      </div>
                    </div>
                    <span className="font-black text-blue-700 dark:text-blue-300">৳{selectedOrder.costing_breakdown.cm_making_cost.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-700 dark:text-slate-300">4. Washing, Wet Processing & Embellishments</span>
                    <span className="font-bold text-slate-900 dark:text-white">৳{selectedOrder.costing_breakdown.wash_embellishment.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-700 dark:text-slate-300">5. Commercial, Bank Charges (LC Fees 1.5%) & Inland Freight</span>
                    <span className="font-bold text-slate-900 dark:text-white">৳{selectedOrder.costing_breakdown.commercial_freight.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">6. Factory Profit Margin (Net Contribution)</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">৳{selectedOrder.costing_breakdown.factory_margin.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Costing Simulator Sliders */}
              <div className="card p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white">
                    Live Costing & Margin Simulator
                  </h4>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Sewing Line Efficiency:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{simEfficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="90"
                    value={simEfficiency}
                    onChange={(e) => setSimEfficiency(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer bg-slate-200 dark:bg-slate-800 h-2 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Lower efficiency increases labor cost per piece.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Garment SMV (Minutes):</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{simSmv} mins</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="0.5"
                    value={simSmv}
                    onChange={(e) => setSimSmv(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer bg-slate-200 dark:bg-slate-800 h-2 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Fabric Cost (৳):</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{simFabricCost.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="10.0"
                    step="0.1"
                    value={simFabricCost}
                    onChange={(e) => setSimFabricCost(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer bg-slate-200 dark:bg-slate-800 h-2 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Target Profit Margin:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{simMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    value={simMargin}
                    onChange={(e) => setSimMargin(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer bg-slate-200 dark:bg-slate-800 h-2 rounded-lg"
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Simulated CM:</span>
                    <span className="text-slate-900 dark:text-white font-bold">৳{liveCost.cm}/pc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Simulated Profit:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">৳{liveCost.profit}/pc</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">New Quoted FOB:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-black">৳{liveCost.fob}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TECH PACK POM TOLERANCE RULES */}
          {activeTab === 'pom' && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Points of Measure (POM) & Graded Tolerances
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enforced during In-line QC and Final Pre-Shipment Audit against physical tape measurements
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono min-w-[650px]">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-800">POM Code</th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-800">Measurement Description</th>
                      <th className="p-3 text-center border-r border-slate-200 dark:border-slate-800">Base Spec (cm)</th>
                      <th className="p-3 text-center border-r border-slate-200 dark:border-slate-800">Allowed Tol (+/-)</th>
                      <th className="p-3 text-center">Grading Step / Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                    {selectedOrder.pom_specs.map((pom) => (
                      <tr key={pom.pom_code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800">{pom.pom_code}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">{pom.name}</td>
                        <td className="p-3 text-center font-bold border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">{pom.base_m} cm</td>
                        <td className="p-3 text-center text-amber-600 dark:text-amber-400 border-r border-slate-200 dark:border-slate-800 font-bold">&plusmn;{pom.tolerance} cm</td>
                        <td className="p-3 text-center text-slate-600 dark:text-slate-300">+{pom.grading_step} cm / size</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
