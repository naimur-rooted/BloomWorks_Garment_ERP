import { useState, useEffect, useRef } from 'react'
import {
  Truck, Plus, Search, Filter, Printer, CheckCircle, Clock, AlertTriangle, 
  ChevronRight, RefreshCw, X, Shield, FileText, CheckCircle2, ArrowRight
} from 'lucide-react'
import api from '../services/api'
import Modal from '../components/ui/Modal'

export default function Deliveries() {
  const [activeView, setActiveView] = useState('challans') // 'challans' | 'gate_passes'
  const [challans, setChallans] = useState([])
  const [gatePasses, setGatePasses] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [partyFilter, setPartyFilter] = useState('')
  const [receiveStatusFilter, setReceiveStatusFilter] = useState('')
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  // Modals
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false)
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false)
  const [printDoc, setPrintDoc] = useState(null) // Document to print

  // Challan Form
  const [challanForm, setChallanForm] = useState({
    challan_number: `FPL-DC-25-${Math.floor(1000 + Math.random() * 9000)}`,
    job_number: `FPL-25-0${Math.floor(100 + Math.random() * 900)}`,
    party_name: 'M/S Windy Apparels Ltd.',
    delivery_factory: 'Windy Apparels Ltd. (EPZ Complex, Savar)',
    pickup_number: 'COVERED-VAN-DM-SHA-11-4521',
    delivery_date: new Date().toISOString().split('T')[0],
    buyer_name: 'Primark',
    style_number: '#test 1650 Apparel Cargo Pants',
    po_number: 'PO-PRM-2025-104',
    receive_status: 'NOT_RECEIVED',
    total_order_qty: 2500,
    previous_delivery_qty: 0,
    current_delivery_qty: 1800,
    total_packaging_qty: 40,
    total_amount_bdt: 1530000,
    prepared_by: 'Md. Mahmudul Hassan Emon',
    security_incharge: 'Main Gate Security Officer',
    authorized_by: 'Factory Commercial Manager',
  })

  // Gate Pass Form
  const [gpForm, setGpForm] = useState({
    gate_pass_number: `GP-25-0${Math.floor(100 + Math.random() * 900)}`,
    pass_date: new Date().toISOString().split('T')[0],
    factory_name: 'M/S Windy Apparels Ltd.',
    factory_address: 'DEPZ Zone, Ganakbari, Savar, Dhaka',
    pickup_number: 'COVERED-VAN-DM-SHA-11-4521',
    driver_name: 'Mohammad Ali',
    driver_phone: '+880 1711-987654',
    total_quantity: 1800,
    total_packaging_qty: 40,
    prepared_by: 'Commercial Officer',
    security_incharge: 'Security Sub-Inspector',
    authorized_by: 'AGM Production & Security',
    status: 'GATE_OUT',
  })

  const loadData = () => {
    setLoading(true)
    const params = {}
    if (partyFilter) params.party_name = partyFilter
    if (receiveStatusFilter) params.receive_status = receiveStatusFilter
    if (deliveryStatusFilter) params.delivery_status = deliveryStatusFilter
    if (search) params.search = search

    Promise.all([
      api.get('/logistics/challans', { params }),
      api.get('/logistics/gate-passes'),
    ])
      .then(([challansRes, gpRes]) => {
        setChallans(challansRes.data || [])
        setGatePasses(gpRes.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [partyFilter, receiveStatusFilter, deliveryStatusFilter])

  const handleToggleReceive = async (challanId) => {
    try {
      await api.patch(`/logistics/challans/${challanId}/toggle-receive`)
      loadData()
    } catch (err) {
      alert('Failed to update receipt status')
    }
  }

  const handleCreateChallan = async (e) => {
    e.preventDefault()
    try {
      await api.post('/logistics/challans', {
        ...challanForm,
        total_order_qty: Number(challanForm.total_order_qty || 0),
        previous_delivery_qty: Number(challanForm.previous_delivery_qty || 0),
        current_delivery_qty: Number(challanForm.current_delivery_qty || 0),
        total_packaging_qty: Number(challanForm.total_packaging_qty || 1),
        total_amount_bdt: Number(challanForm.total_amount_bdt || 0),
      })
      setIsChallanModalOpen(false)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create delivery challan')
    }
  }

  const handleCreateGatePass = async (e) => {
    e.preventDefault()
    try {
      await api.post('/logistics/gate-passes', {
        ...gpForm,
        total_quantity: Number(gpForm.total_quantity || 0),
        total_packaging_qty: Number(gpForm.total_packaging_qty || 0),
      })
      setIsGatePassModalOpen(false)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to issue gate pass')
    }
  }

  const handlePrint = (doc, type = 'CHALLAN') => {
    setPrintDoc({ ...doc, printType: type })
    setTimeout(() => {
      window.print()
    }, 300)
  }

  // Calculate live balance for modal
  const liveOrder = Number(challanForm.total_order_qty || 0)
  const livePrev = Number(challanForm.previous_delivery_qty || 0)
  const liveCurr = Number(challanForm.current_delivery_qty || 0)
  const liveDue = Math.max(0, liveOrder - (livePrev + liveCurr))
  const liveDelStatus = liveDue <= 0 ? 'ALL_DELIVERED' : 'HAVE_DUE'

  return (
    <div className="space-y-6">
      {/* 1. Header with Tabs & Create Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-7 w-7 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Order Delivery & Security Gate Pass
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            3-Way Balance (Order, Delivered, Due), Packaging Cartons & Official Factory Barcode Challans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setChallanForm({
                ...challanForm,
                challan_number: `FPL-DC-25-0${Math.floor(100 + Math.random() * 900)}`,
                job_number: `FPL-25-0${Math.floor(100 + Math.random() * 900)}`,
              })
              setIsChallanModalOpen(true)
            }}
            className="btn-primary bg-blue-600 hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Deliver Order (Challan)
          </button>
          <button
            onClick={() => {
              setGpForm({
                ...gpForm,
                gate_pass_number: `GP-25-0${Math.floor(100 + Math.random() * 900)}`,
              })
              setIsGatePassModalOpen(true)
            }}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 font-semibold shadow-sm"
          >
            <Shield className="h-4 w-4" />
            Issue Gate Pass
          </button>
        </div>
      </div>

      {/* 2. Sub-View Selector (Delivery Challans vs Gate Passes) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveView('challans')}
          className={`py-2 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeView === 'challans'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          Order Delivery List ({challans.length})
        </button>
        <button
          onClick={() => setActiveView('gate_passes')}
          className={`py-2 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeView === 'gate_passes'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Shield className="h-4 w-4" />
          Security Gate Passes ({gatePasses.length})
        </button>
      </div>

      {/* 3. Filter Bar (Matching Fashion Packers Ltd. layout) */}
      {activeView === 'challans' && (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Challan No, Job No, Style..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="">- Select Company / Party -</option>
            <option value="Windy">M/S Windy Apparels Ltd.</option>
            <option value="Rowa">Rowa Fashions Ltd.</option>
            <option value="Vintage">Vintage Garments Ltd.</option>
            <option value="Origin">Origin Trims & Accessories</option>
          </select>

          <select
            value={receiveStatusFilter}
            onChange={(e) => setReceiveStatusFilter(e.target.value)}
            className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="">- Receive Status -</option>
            <option value="NOT_RECEIVED">Not Received</option>
            <option value="RECEIVED">Received</option>
          </select>

          <select
            value={deliveryStatusFilter}
            onChange={(e) => setDeliveryStatusFilter(e.target.value)}
            className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="">- Delivery Status -</option>
            <option value="ALL_DELIVERED">All Delivered</option>
            <option value="HAVE_DUE">Have Due</option>
          </select>

          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Search className="h-4 w-4" />
            SEARCH
          </button>
          <button
            onClick={() => {
              setSearch('')
              setPartyFilter('')
              setReceiveStatusFilter('')
              setDeliveryStatusFilter('')
              loadData()
            }}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            REFRESH
          </button>
        </div>
      )}

      {/* 4. VIEW: ORDER DELIVERY CHALLANS TABLE (Matching Fashion Packers Screenshot) */}
      {activeView === 'challans' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-3 px-3 w-12 text-center">SL</th>
                  <th className="py-3 px-3">Job No</th>
                  <th className="py-3 px-3">Challan No</th>
                  <th className="py-3 px-3">Delivery Date</th>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-4">Delivery Factory</th>
                  <th className="py-3 px-3 text-center">Challan Receive Status</th>
                  <th className="py-3 px-3 text-right">Total Delivery Qty</th>
                  <th className="py-3 px-3 text-center">Total Packaging Qty</th>
                  <th className="py-3 px-3 text-center">Delivery Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="11" className="py-8 text-center text-slate-400">
                      Loading delivery challans...
                    </td>
                  </tr>
                ) : challans.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-8 text-center text-slate-400">
                      No delivery challans recorded.
                    </td>
                  </tr>
                ) : (
                  challans.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-500 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">{c.job_number}</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => handlePrint(c, 'CHALLAN')}>
                        {c.challan_number}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs">{c.delivery_date}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">{c.party_name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">{c.delivery_factory}</td>
                      
                      {/* Receive Status (Toggle button matching reference red Not Received / green Received) */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleReceive(c.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                            c.receive_status === 'RECEIVED'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-500 hover:bg-rose-600 text-white'
                          }`}
                        >
                          {c.receive_status === 'RECEIVED' ? (
                            <>
                              <CheckCircle className="h-3 w-3" /> Received
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> Not Received
                            </>
                          )}
                        </button>
                      </td>

                      {/* Delivery Qty */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {Number(c.current_delivery_qty).toLocaleString()}
                      </td>

                      {/* Packaging Cartons */}
                      <td className="py-3 px-3 text-center font-mono text-xs text-slate-700 dark:text-slate-300">
                        {c.total_packaging_qty} Cartons
                      </td>

                      {/* Delivery Status (All Delivered vs Have Due) */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ${
                            c.delivery_status === 'ALL_DELIVERED'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 text-slate-900'
                          }`}
                        >
                          {c.delivery_status === 'ALL_DELIVERED' ? 'All Delivered' : 'Have Due'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handlePrint(c, 'CHALLAN')}
                            title="Print A4 Delivery Challan"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded transition-colors"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. VIEW: SECURITY GATE PASSES TABLE */}
      {activeView === 'gate_passes' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-3 px-3 w-12 text-center">SL</th>
                  <th className="py-3 px-3">Gate Pass No</th>
                  <th className="py-3 px-3">Pass Date</th>
                  <th className="py-3 px-4">Destination Plant</th>
                  <th className="py-3 px-3">Vehicle / Pickup No</th>
                  <th className="py-3 px-4">Driver Name & Contact</th>
                  <th className="py-3 px-3 text-right">Total Cargo Qty</th>
                  <th className="py-3 px-3 text-center">Total Packaging</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-slate-400">
                      Loading security gate passes...
                    </td>
                  </tr>
                ) : gatePasses.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-slate-400">
                      No security gate passes issued.
                    </td>
                  </tr>
                ) : (
                  gatePasses.map((gp, idx) => (
                    <tr key={gp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-500 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer" onClick={() => handlePrint(gp, 'GATE_PASS')}>
                        {gp.gate_pass_number}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs">{gp.pass_date}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">
                        {gp.factory_name}
                        <div className="text-[11px] text-slate-400 line-clamp-1">{gp.factory_address}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                        {gp.pickup_number}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 text-xs">
                        {gp.driver_name} <br />
                        <span className="font-mono text-slate-500">{gp.driver_phone}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {Number(gp.total_quantity).toLocaleString()} pcs
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-xs text-slate-700 dark:text-slate-300">
                        {gp.total_packaging_qty} Cartons
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                          {gp.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handlePrint(gp, 'GATE_PASS')}
                          title="Print Security Gate Pass"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded transition-colors"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CREATE DELIVERY CHALLAN MODAL */}
      <Modal isOpen={isChallanModalOpen} onClose={() => setIsChallanModalOpen(false)} title="Create Factory Delivery Challan (DC)">
        <form onSubmit={handleCreateChallan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Challan Number *
              </label>
              <input
                className="input font-mono font-bold"
                required
                value={challanForm.challan_number}
                onChange={(e) => setChallanForm({ ...challanForm, challan_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job / Purchase Id No *
              </label>
              <input
                className="input font-mono font-bold"
                required
                value={challanForm.job_number}
                onChange={(e) => setChallanForm({ ...challanForm, job_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Party / Customer Name *
              </label>
              <input
                className="input"
                required
                value={challanForm.party_name}
                onChange={(e) => setChallanForm({ ...challanForm, party_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Delivery Factory / Unit Address *
              </label>
              <input
                className="input"
                required
                value={challanForm.delivery_factory}
                onChange={(e) => setChallanForm({ ...challanForm, delivery_factory: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Style Number & Buyer *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  placeholder="Style#"
                  value={challanForm.style_number}
                  onChange={(e) => setChallanForm({ ...challanForm, style_number: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Buyer"
                  value={challanForm.buyer_name}
                  onChange={(e) => setChallanForm({ ...challanForm, buyer_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pickup / Transport Vehicle No
              </label>
              <input
                className="input font-mono"
                value={challanForm.pickup_number}
                onChange={(e) => setChallanForm({ ...challanForm, pickup_number: e.target.value })}
              />
            </div>

            {/* 3-WAY QUANTITY CALCULATION MATRIX */}
            <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                3-Way Delivery Balance Arithmetic
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Total Order Qty</label>
                  <input
                    type="number"
                    className="input font-mono font-bold"
                    value={challanForm.total_order_qty}
                    onChange={(e) => setChallanForm({ ...challanForm, total_order_qty: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Prev Delivered Qty</label>
                  <input
                    type="number"
                    className="input font-mono font-bold"
                    value={challanForm.previous_delivery_qty}
                    onChange={(e) => setChallanForm({ ...challanForm, previous_delivery_qty: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Current Delivery *</label>
                  <input
                    type="number"
                    className="input font-mono font-bold text-blue-600"
                    value={challanForm.current_delivery_qty}
                    onChange={(e) => setChallanForm({ ...challanForm, current_delivery_qty: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Balance Due Qty</label>
                  <input
                    type="number"
                    readOnly
                    className="input font-mono font-bold bg-slate-100 dark:bg-slate-900 text-rose-600"
                    value={liveDue}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <span>
                  Delivery Status Classification:{' '}
                  <strong className={liveDelStatus === 'ALL_DELIVERED' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {liveDelStatus === 'ALL_DELIVERED' ? 'ALL DELIVERED (Complete)' : 'HAVE DUE (Partial Delivery)'}
                  </strong>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">Total Cartons:</span>
                  <input
                    type="number"
                    className="w-20 px-2 py-0.5 border rounded text-right font-mono"
                    value={challanForm.total_packaging_qty}
                    onChange={(e) => setChallanForm({ ...challanForm, total_packaging_qty: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Billing Amount (BDT ৳) *
              </label>
              <input
                type="number"
                step="0.01"
                className="input font-mono font-bold"
                value={challanForm.total_amount_bdt}
                onChange={(e) => setChallanForm({ ...challanForm, total_amount_bdt: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Challan Delivery Date
              </label>
              <input
                type="date"
                className="input"
                value={challanForm.delivery_date}
                onChange={(e) => setChallanForm({ ...challanForm, delivery_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setIsChallanModalOpen(false)} className="btn-secondary text-sm">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-sm font-bold bg-blue-600 hover:bg-blue-700">
              Save Delivery Challan
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. ISSUE GATE PASS MODAL */}
      <Modal isOpen={isGatePassModalOpen} onClose={() => setIsGatePassModalOpen(false)} title="Issue Security Gate Pass">
        <form onSubmit={handleCreateGatePass} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gate Pass Number *
              </label>
              <input
                className="input font-mono font-bold"
                required
                value={gpForm.gate_pass_number}
                onChange={(e) => setGpForm({ ...gpForm, gate_pass_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Destination Factory / Plant *
              </label>
              <input
                className="input"
                required
                value={gpForm.factory_name}
                onChange={(e) => setGpForm({ ...gpForm, factory_name: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Factory Full Address *
              </label>
              <input
                className="input"
                required
                value={gpForm.factory_address}
                onChange={(e) => setGpForm({ ...gpForm, factory_address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle / Covered Van Number *
              </label>
              <input
                className="input font-mono font-bold"
                placeholder="COVERED-VAN-DM-SHA-11-4521"
                required
                value={gpForm.pickup_number}
                onChange={(e) => setGpForm({ ...gpForm, pickup_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Driver Name & Contact Number *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  placeholder="Driver Name"
                  required
                  value={gpForm.driver_name}
                  onChange={(e) => setGpForm({ ...gpForm, driver_name: e.target.value })}
                />
                <input
                  className="input font-mono"
                  placeholder="Driver Phone"
                  required
                  value={gpForm.driver_phone}
                  onChange={(e) => setGpForm({ ...gpForm, driver_phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Quantity (Pcs) *
              </label>
              <input
                type="number"
                className="input font-mono font-bold"
                required
                value={gpForm.total_quantity}
                onChange={(e) => setGpForm({ ...gpForm, total_quantity: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Packaging Cartons *
              </label>
              <input
                type="number"
                className="input font-mono font-bold"
                required
                value={gpForm.total_packaging_qty}
                onChange={(e) => setGpForm({ ...gpForm, total_packaging_qty: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setIsGatePassModalOpen(false)} className="btn-secondary text-sm">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-sm font-bold bg-emerald-600 hover:bg-emerald-700">
              Clear & Issue Gate Pass
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. PRINTABLE A4 FACTORY CHALLAN & GATE PASS MODAL / PRINT VIEW */}
      {printDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-lg shadow-2xl max-w-3xl w-full p-8 relative print:p-0 print:shadow-none print:w-full">
            {/* Screen Close & Print Bar */}
            <div className="flex justify-between items-center mb-6 print:hidden border-b pb-3">
              <span className="font-bold text-slate-700 text-sm">
                Official Document Preview: {printDoc.challan_number || printDoc.gate_pass_number}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Print to A4
                </button>
                <button
                  onClick={() => setPrintDoc(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-1.5 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* A4 PRINTABLE DOCUMENT CONTENT */}
            <div className="border border-slate-800 p-6 space-y-4 font-serif text-sm">
              {/* Factory Header */}
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h1 className="text-2xl font-black tracking-wider uppercase font-sans text-slate-900">
                  BLOOMWORKS APPAREL & EXPORT LTD.
                </h1>
                <p className="text-xs text-slate-600">
                  Plot #124-126, Gazipur Industrial Area, Konabari, Gazipur-1700, Bangladesh
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Phone: +880-2-9876543 | E-mail: commercial@bloomworks-bd.com | BIN: 002391048-0102
                </p>
                <div className="mt-2 inline-block px-4 py-1 border border-slate-800 font-bold text-sm uppercase tracking-widest bg-slate-50">
                  {printDoc.printType === 'GATE_PASS' ? 'SECURITY GATE PASS (OUTWARD)' : 'DELIVERY CHALLAN & PACKING NOTE'}
                </div>
              </div>

              {/* Barcode Simulation */}
              <div className="flex justify-between items-center px-2 py-1 bg-slate-50 border border-slate-200">
                <div className="font-mono text-xs">
                  <strong>DOC NO:</strong> {printDoc.challan_number || printDoc.gate_pass_number}
                </div>
                {/* SVG Barcode Representation */}
                <div className="text-center font-mono">
                  <div className="flex items-center gap-0.5 h-7">
                    {Array.from({ length: 38 }).map((_, i) => (
                      <div
                        key={i}
                        className={`bg-black h-full ${i % 3 === 0 ? 'w-1' : i % 5 === 0 ? 'w-0.5' : 'w-1.5'}`}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] tracking-widest text-slate-600">
                    *{printDoc.challan_number || printDoc.gate_pass_number}*
                  </div>
                </div>
                <div className="font-mono text-xs">
                  <strong>DATE:</strong> {printDoc.delivery_date || printDoc.pass_date || new Date().toISOString().split('T')[0]}
                </div>
              </div>

              {/* Document Meta Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div><strong>Party Name:</strong> {printDoc.party_name || printDoc.factory_name}</div>
                  <div><strong>Delivery Factory:</strong> {printDoc.delivery_factory || printDoc.factory_address}</div>
                  <div><strong>Vehicle / Truck No:</strong> {printDoc.pickup_number}</div>
                  {printDoc.driver_name && (
                    <div><strong>Driver Name & Phone:</strong> {printDoc.driver_name} ({printDoc.driver_phone})</div>
                  )}
                </div>
                <div className="space-y-1 text-right">
                  <div><strong>Job Number:</strong> {printDoc.job_number || 'FPL-25-0330'}</div>
                  <div><strong>Buyer:</strong> {printDoc.buyer_name || 'Primark Stores Ltd'}</div>
                  <div><strong>Style#:</strong> {printDoc.style_number || '#test 1650 Cargo Pants'}</div>
                  <div><strong>PO Number:</strong> {printDoc.po_number || 'PO-PRM-2025-091'}</div>
                </div>
              </div>

              {/* 3-Way Delivery Table */}
              <table className="w-full text-left border-collapse border border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-800 font-bold">
                    <th className="border border-slate-800 p-2 text-center w-8">SL</th>
                    <th className="border border-slate-800 p-2">Item Description / Size Grid</th>
                    <th className="border border-slate-800 p-2 text-right">Total Order</th>
                    <th className="border border-slate-800 p-2 text-right">Prev Delivered</th>
                    <th className="border border-slate-800 p-2 text-right">Current Delivery</th>
                    <th className="border border-slate-800 p-2 text-right">Balance Due</th>
                    <th className="border border-slate-800 p-2 text-center">Packaging</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-800 p-2 text-center">1</td>
                    <td className="border border-slate-800 p-2">
                      <strong>{printDoc.style_number || 'Apparel Cargo Pants'}</strong>
                      <div className="text-[10px] text-slate-600">Export Oriented 100% Quality Inspected AQL 2.5 Passed</div>
                    </td>
                    <td className="border border-slate-800 p-2 text-right font-mono">
                      {Number(printDoc.total_order_qty || printDoc.total_quantity || 1500).toLocaleString()}
                    </td>
                    <td className="border border-slate-800 p-2 text-right font-mono">
                      {Number(printDoc.previous_delivery_qty || 0).toLocaleString()}
                    </td>
                    <td className="border border-slate-800 p-2 text-right font-mono font-bold">
                      {Number(printDoc.current_delivery_qty || printDoc.total_quantity || 1500).toLocaleString()}
                    </td>
                    <td className="border border-slate-800 p-2 text-right font-mono text-rose-700 font-bold">
                      {Number(printDoc.balance_due_qty || 0).toLocaleString()}
                    </td>
                    <td className="border border-slate-800 p-2 text-center font-mono">
                      {printDoc.total_packaging_qty || 16} Cartons
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-800">
                    <td colSpan="4" className="border border-slate-800 p-2 text-right">
                      TOTAL DISPATCH QUANTITY:
                    </td>
                    <td className="border border-slate-800 p-2 text-right font-mono font-bold text-sm">
                      {Number(printDoc.current_delivery_qty || printDoc.total_quantity || 1500).toLocaleString()} Pcs
                    </td>
                    <td colSpan="2" className="border border-slate-800 p-2 text-center font-mono font-bold">
                      {printDoc.total_packaging_qty || 16} Cartons Total
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Amount Valuation in BDT */}
              {printDoc.total_amount_bdt && (
                <div className="flex justify-between items-center text-xs font-mono p-2 bg-slate-50 border border-slate-300">
                  <span><strong>Total Billing Valuation:</strong> BDT ৳{Number(printDoc.total_amount_bdt).toLocaleString()}</span>
                  <span><strong>Status:</strong> {printDoc.delivery_status || 'ALL_DELIVERED'}</span>
                </div>
              )}

              {/* Three Official Signatures */}
              <div className="grid grid-cols-3 gap-8 pt-12 text-center text-xs">
                <div>
                  <div className="border-t border-slate-800 pt-1 font-bold">
                    {printDoc.prepared_by || 'Md. Mahmudul Hassan Emon'}
                  </div>
                  <div className="text-[10px] text-slate-500">Prepared By (Store / Commercial)</div>
                </div>

                <div>
                  <div className="border-t border-slate-800 pt-1 font-bold">
                    {printDoc.security_incharge || 'Main Gate Security Officer'}
                  </div>
                  <div className="text-[10px] text-slate-500">Security Gate Clearance / Incharge</div>
                </div>

                <div>
                  <div className="border-t border-slate-800 pt-1 font-bold">
                    {printDoc.authorized_by || 'Factory Commercial Head'}
                  </div>
                  <div className="text-[10px] text-slate-500">Authorized Plant Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
