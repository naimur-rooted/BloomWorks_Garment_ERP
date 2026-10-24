import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  PackageCheck,
  Package,
  Calculator,
  Barcode,
  Truck,
  Printer,
  RefreshCw,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react'

export default function Packing() {
  const [activeTab, setActiveTab] = useState('plans') // 'plans' | 'cbm-calc' | 'labels'
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  // CBM & Container Calculator State
  const [calcGarments, setCalcGarments] = useState(4660)
  const [calcPiecesPerBox, setCalcPiecesPerBox] = useState(12)
  const [calcLength, setCalcLength] = useState(60)
  const [calcWidth, setCalcWidth] = useState(40)
  const [calcHeight, setCalcHeight] = useState(30)
  const [calcGarmentWeight, setCalcGarmentWeight] = useState(0.32)
  const [calcTareWeight, setCalcTareWeight] = useState(0.95)
  const [calcContainer, setCalcContainer] = useState('40FT_HC')

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/enterprise/packing-plans')
      setPlans(res.data)
    } catch (err) {
      console.error('Failed to load packing plans:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Live CBM & Stuffing Calculation
  const calculateCbmStuffing = () => {
    const totalCartons = Math.floor(calcGarments / calcPiecesPerBox)
    const loosePieces = calcGarments % calcPiecesPerBox
    const cbmPerBox = (calcLength * calcWidth * calcHeight) / 1000000.0
    const totalCbm = totalCartons * cbmPerBox

    const grossWeightPerBox = calcPiecesPerBox * calcGarmentWeight + calcTareWeight
    const totalGrossWeight = totalCartons * grossWeightPerBox + loosePieces * calcGarmentWeight

    const capacities = {
      '20FT_DRY': 28.0,
      '40FT_DRY': 58.0,
      '40FT_HC': 68.0,
    }
    const maxCbm = capacities[calcContainer] || 68.0
    const utilizationPct = Math.min(100.0, (totalCbm / maxCbm) * 100.0)

    return {
      totalCartons,
      loosePieces,
      cbmPerBox: cbmPerBox.toFixed(4),
      totalCbm: totalCbm.toFixed(2),
      grossWeightPerBox: grossWeightPerBox.toFixed(2),
      totalGrossWeight: totalGrossWeight.toFixed(2),
      maxCbm,
      utilizationPct: utilizationPct.toFixed(1),
    }
  }

  const cbmResult = calculateCbmStuffing()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-colorful-purple p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="icon-box-purple">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  ASSORTED PRE-PACK RATIO & 3D CONTAINER CBM
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Multi-size ratio cartons, volumetric CBM calculations, container stuffing & GS1-128 labels
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
          onClick={() => setActiveTab('plans')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'plans'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Active Assorted Packing Plans
        </button>

        <button
          onClick={() => setActiveTab('cbm-calc')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'cbm-calc'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Volumetric CBM & Container Stuffing Optimizer
        </button>

        <button
          onClick={() => setActiveTab('labels')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'labels'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Barcode className="w-4 h-4" />
          GS1-128 Shipping Carton Labels
        </button>
      </div>

      {/* TAB 1: PACKING PLANS */}
      {activeTab === 'plans' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Buyer Pre-Pack Ratio Instructions & Carton Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cartons packed with pre-assorted ratio curves for direct store shelf replenishment
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono border-collapse min-w-[850px]">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Plan Code</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Order #</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Pack Type</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Ratio Formula</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Pcs / Ctn</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-right">Total Cartons</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-right">Shipment CBM</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Container Type</th>
                  <th className="p-3 text-center">Container Fill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                {plans.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800">{p.plan_number}</td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">{p.order_number}</td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800">
                      <span className="badge-blue font-semibold">
                        {p.pack_type}
                      </span>
                    </td>
                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold text-amber-600 dark:text-amber-400">
                      {p.ratio_formula}
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                      {p.pieces_per_carton} pcs
                    </td>
                    <td className="p-3 text-right font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                      {p.total_cartons.toLocaleString()} ctns
                    </td>
                    <td className="p-3 text-right border-r border-slate-200 dark:border-slate-800 font-bold text-blue-600 dark:text-blue-400">
                      {p.total_shipment_cbm} m&sup3;
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      {p.container_type}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                        <span>{p.container_utilization_pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CBM & CONTAINER STUFFING OPTIMIZER */}
      {activeTab === 'cbm-calc' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 space-y-5 font-mono">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Volumetric CBM & Gross Weight Calculator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Prevents carrier dead-freight penalties by optimizing carton dimensions against shipping container cubic capacity
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Total Garments</label>
                <input
                  type="number"
                  value={calcGarments}
                  onChange={(e) => setCalcGarments(parseInt(e.target.value) || 0)}
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Pcs per Carton</label>
                <input
                  type="number"
                  value={calcPiecesPerBox}
                  onChange={(e) => setCalcPiecesPerBox(parseInt(e.target.value) || 0)}
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Garment Wt (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={calcGarmentWeight}
                  onChange={(e) => setCalcGarmentWeight(parseFloat(e.target.value) || 0)}
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Container Spec</label>
                <select
                  value={calcContainer}
                  onChange={(e) => setCalcContainer(e.target.value)}
                  className="input font-mono"
                >
                  <option value="20FT_DRY">20ft Dry (28 CBM)</option>
                  <option value="40FT_DRY">40ft Dry (58 CBM)</option>
                  <option value="40FT_HC">40ft High Cube (68 CBM)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs font-sans pt-2">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Carton Length (cm)</label>
                <input
                  type="number"
                  value={calcLength}
                  onChange={(e) => setCalcLength(parseFloat(e.target.value) || 0)}
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Carton Width (cm)</label>
                <input
                  type="number"
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(parseFloat(e.target.value) || 0)}
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Carton Height (cm)</label>
                <input
                  type="number"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(parseFloat(e.target.value) || 0)}
                  className="input font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-900 dark:text-white uppercase font-sans">Shipment Summary Parameters:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-600 dark:text-slate-400">
                <div>Total Boxes: <span className="font-bold text-slate-900 dark:text-white">{cbmResult.totalCartons} ctns</span></div>
                <div>Loose Remainder: <span className="font-bold text-amber-600 dark:text-amber-400">{cbmResult.loosePieces} pcs</span></div>
                <div>CBM / Box: <span className="font-bold text-blue-600 dark:text-blue-400">{cbmResult.cbmPerBox} m&sup3;</span></div>
                <div>Box Gross Wt: <span className="font-bold text-slate-900 dark:text-white">{cbmResult.grossWeightPerBox} kg</span></div>
              </div>
            </div>
          </div>

          {/* Stuffing Gauge Card */}
          <div className="card p-6 flex flex-col justify-between font-mono">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Shipment Volume</span>
              <div className="text-3xl font-black mt-2 text-slate-900 dark:text-white">
                {cbmResult.totalCbm} <span className="text-sm font-normal text-slate-500">m&sup3;</span>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Gross Weight:</span>
                  <span className="text-slate-900 dark:text-white font-bold font-mono">{cbmResult.totalGrossWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Container Max Volume:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold font-mono">{cbmResult.maxCbm} m&sup3;</span>
                </div>
              </div>

              <div className="mt-6 font-sans">
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Container Fill Utilization:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{cbmResult.utilizationPct}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, cbmResult.utilizationPct)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  {cbmResult.utilizationPct < 85 ? 'Warning: Under-utilized space. Consider packing smaller cartons.' : 'Optimal stuffing achieved!'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6 text-[10px] text-slate-400 font-mono">
              Formula: (L &times; W &times; H in cm) &divide; 1,000,000 = CBM
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GS1-128 LABELS */}
      {activeTab === 'labels' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center card p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">GS1-128 Shipping Carton Stencil Labels</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">International maritime shipping label format with Serial Shipping Container Codes (SSCC)</p>
            </div>
            <button
              onClick={() => window.print()}
              className="btn-primary flex items-center gap-2 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Carton Labels</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((ctnNum) => (
              <div key={ctnNum} className="bg-white text-slate-900 p-6 rounded-xl border-2 border-slate-900 shadow-md font-sans">
                <div className="border-b-2 border-slate-900 pb-2 mb-3 flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-sm tracking-tight">BLOOMWORKS GARMENTS LTD.</h4>
                    <p className="text-[10px] text-slate-600">CHITTAGONG EPZ, BANGLADESH</p>
                  </div>
                  <span className="text-xs font-mono font-black border border-slate-900 px-2 py-0.5 rounded">
                    CARTON #{ctnNum} OF 388
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">BUYER / CONSIGNEE</span>
                    <span className="font-bold">H&M HENNES & MAURITZ GBC AB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">DESTINATION PORT</span>
                    <span className="font-bold">GOTHENBURG, SWEDEN</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ORDER & STYLE</span>
                    <span className="font-bold">PO-8821 / POLO-CLASSIC-01</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">PRE-PACK RATIO</span>
                    <span className="font-bold text-blue-700">1:2:3:3:2:1 (12 PCS)</span>
                  </div>
                </div>

                {/* Simulated GS1-128 Barcode */}
                <div className="border-t-2 border-slate-900 pt-3 text-center">
                  <div className="h-14 bg-slate-900 flex items-center justify-center text-white font-mono text-xs tracking-widest px-4">
                    ||| | ||||| || |||||| | ||||| ||| |||| | ||||| ||||
                  </div>
                  <span className="text-[10px] font-mono font-bold block mt-1">
                    (00) 0 0812345 678901234 {ctnNum}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
