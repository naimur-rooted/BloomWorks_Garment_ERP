import { useEffect, useState } from 'react'
import { 
  Shirt, Plus, Search, Filter, Layers, Clock, Calendar, CheckCircle2, 
  AlertCircle, ChevronRight, BarChart2, DollarSign, Tag, RefreshCw, X
} from 'lucide-react'
import api from '../services/api'
import Modal from '../components/ui/Modal'

export default function Styles() {
  const [data, setData] = useState([])
  const [buyers, setBuyers] = useState([])
  const [summary, setSummary] = useState({
    total: 0,
    new_style: 0,
    design_innovation: 0,
    product_dev: 0,
    projection: 0,
    on_order: 0,
    key_styles: 0,
    pending_pos: 0,
    un_shipped: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedBuyer, setSelectedBuyer] = useState('')
  
  // Modal & Tab State
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [form, setForm] = useState({
    style_no: '',
    merchant_style_no: '',
    description: '',
    buyer_id: '',
    category: 'Cargo Pants',
    sub_category: 'Bottoms',
    brand: '',
    season: 'SS26',
    gender: 'Men',
    style_type: 'Bulk',
    source_allocation: 'Inhouse',
    sam_minutes: 22.5,
    target_efficiency_pct: 70,
    ocd_date: '',
    pcd_date: '',
    ex_factory_date: '',
    pd_merchant_name: 'Sanat Kumar',
    prod_merchant_name: 'Sheela Singh',
    lifecycle_stage: 'ON_ORDER',
    risk_priority: 'Medium',
    risk_criterion: 'Critical Path Fabric Inhouse',
    costing_qty: 10000,
    projection_qty: 12000,
    placement_qty: 10000,
    target_fob_bdt: 850,
    repeat_order: false,
    size_range: '28, 30, 32, 34, 36, 38',
    size_ratio: '1:2:3:3:2:1',
    value_additions: 'Enzyme Wash, Silicon Softener',
    has_lining: false,
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&q=80',
    remarks: '',
  })

  const loadData = () => {
    setLoading(true)
    const params = {}
    if (selectedStage && selectedStage !== 'ALL') {
      params.lifecycle_stage = selectedStage
    }
    if (selectedBuyer) {
      params.buyer_id = selectedBuyer
    }
    if (search) {
      params.search = search
    }

    Promise.all([
      api.get('/styles', { params }),
      api.get('/styles/summary'),
      api.get('/buyers'),
    ])
      .then(([stylesRes, summaryRes, buyersRes]) => {
        setData(stylesRes.data || [])
        setSummary(summaryRes.data || {})
        setBuyers(buyersRes.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [selectedStage, selectedBuyer])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadData()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/styles', {
        ...form,
        buyer_id: form.buyer_id ? Number(form.buyer_id) : null,
        sam_minutes: Number(form.sam_minutes || 0),
        target_efficiency_pct: Number(form.target_efficiency_pct || 0),
        costing_qty: Number(form.costing_qty || 0),
        projection_qty: Number(form.projection_qty || 0),
        placement_qty: Number(form.placement_qty || 0),
        target_fob_bdt: Number(form.target_fob_bdt || 0),
      })
      setIsOpen(false)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save style specification')
    }
  }

  const ribbonItems = [
    { key: 'ALL', label: 'Total Styles', count: summary.total || data.length, bg: 'bg-cyan-600 text-white' },
    { key: 'NEW', label: 'New Style', count: summary.new_style || 0, bg: 'bg-sky-500 text-white' },
    { key: 'DESIGN', label: 'Design & Innovation', count: summary.design_innovation || 0, bg: 'bg-purple-600 text-white' },
    { key: 'PRODUCT_DEV', label: 'Product Developm.', count: summary.product_dev || 0, bg: 'bg-emerald-600 text-white' },
    { key: 'PROJECTION', label: 'Projection', count: summary.projection || 0, bg: 'bg-blue-600 text-white' },
    { key: 'ON_ORDER', label: 'On-Order', count: summary.on_order || 0, bg: 'bg-amber-600 text-white' },
    { key: 'KEY_STYLES', label: 'Key Styles', count: summary.key_styles || 0, bg: 'bg-teal-600 text-white' },
    { key: 'PENDING_POS', label: "Pending PO's", count: summary.pending_pos || 0, bg: 'bg-rose-600 text-white' },
    { key: 'UN_SHIPPED', label: 'Un-Shipped', count: summary.un_shipped || 0, bg: 'bg-slate-800 text-white' },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shirt className="h-7 w-7 text-blue-600" />
            Style & Garment Engineering Master
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Industrial Engineering (IE), SAM, T&A Lifecycle Pipeline & Costing Matrix (BDT ৳)
          </p>
        </div>
        <button
          onClick={() => {
            setActiveTab('general')
            setIsOpen(true)
          }}
          className="btn-primary flex items-center gap-2 shadow-sm font-semibold"
        >
          <Plus className="h-5 w-5" />
          Create New Style
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search style#, name, merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedBuyer}
          onChange={(e) => setSelectedBuyer(e.target.value)}
          className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none"
        >
          <option value="">All Buyers</option>
          {buyers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Search className="h-4 w-4" />
          SEARCH
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch('')
            setSelectedBuyer('')
            setSelectedStage('ALL')
            loadData()
          }}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </button>
      </form>

      {/* 3. The 9-Stage Pipeline Ribbon (Matching Apparel ERP UI) */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {ribbonItems.map((ribbon) => {
          const isSelected = selectedStage === ribbon.key
          return (
            <button
              key={ribbon.key}
              onClick={() => setSelectedStage(ribbon.key)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all text-center border ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-blue-500 shadow-md font-bold'
                  : 'hover:opacity-95 opacity-90'
              } ${ribbon.bg}`}
            >
              <span className="text-xl font-black tracking-tight">{ribbon.count}</span>
              <span className="text-[11px] font-medium leading-tight mt-0.5 line-clamp-1">{ribbon.label}</span>
            </button>
          )
        })}
      </div>

      {/* 4. Real Industrial Styles Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs tracking-wider uppercase">
                <th className="py-3 px-3 w-16 text-center">Style</th>
                <th className="py-3 px-3">Style#</th>
                <th className="py-3 px-4">Style Specification</th>
                <th className="py-3 px-3">PD Merchant</th>
                <th className="py-3 px-3">Prod. Merchant</th>
                <th className="py-3 px-3 text-center">IE SAM / Eff%</th>
                <th className="py-3 px-3 text-center">Risk Priority</th>
                <th className="py-3 px-4 w-48 text-center">TNA Progress (%)</th>
                <th className="py-3 px-3">Active Milestone</th>
                <th className="py-3 px-3 text-right">Target FOB (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    Loading production styles master...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    No garment styles found matching filter.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Visual Thumbnail */}
                    <td className="py-3 px-3 text-center">
                      <div className="w-12 h-14 mx-auto rounded border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.style_no} className="w-full h-full object-cover" />
                        ) : (
                          <Shirt className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                    </td>

                    {/* Style# & Badges */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                        {item.style_no}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                          {item.source_allocation || 'Inhouse'}
                        </span>
                        <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                          T
                        </span>
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                          P
                        </span>
                      </div>
                    </td>

                    {/* Specification & Brand */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {item.description || item.name || item.style_no}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 font-mono">
                          Buyer: <strong className="text-slate-700 dark:text-slate-300">{item.buyer_name || 'H&M'}</strong>
                        </span>
                        <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {item.category}
                        </span>
                      </div>
                    </td>

                    {/* PD Merchant */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {item.pd_merchant_name || 'Sanat Kumar'}
                    </td>

                    {/* Prod Merchant */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {item.prod_merchant_name || 'Sheela Singh'}
                    </td>

                    {/* IE SAM & Target Efficiency */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {item.sam_minutes ? `${Number(item.sam_minutes).toFixed(1)}m` : '18.0m'}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          {item.target_efficiency_pct ? `${Number(item.target_efficiency_pct).toFixed(0)}% Eff` : '70% Eff'}
                        </span>
                      </div>
                    </td>

                    {/* Risk Priority */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        (item.risk_priority || '').toUpperCase() === 'HIGH' || (item.risk_priority || '').toUpperCase() === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-900/40 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}>
                        {item.risk_priority || 'Medium'}
                      </span>
                    </td>

                    {/* TNA Progress Bar */}
                    <td className="py-3 px-4 text-center">
                      <div className="w-full">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          <span>{item.tna_progress_pct || 21}%</span>
                          <span className="font-normal text-slate-400">Target 100%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              (item.tna_progress_pct || 21) >= 60
                                ? 'bg-emerald-500'
                                : (item.tna_progress_pct || 21) >= 30
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, item.tna_progress_pct || 21)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Active Milestone */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs">
                        {item.active_milestone || 'BOM Confirmed'}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        PCD: {item.pcd_date || '2025-03-05'}
                      </div>
                    </td>

                    {/* Target FOB BDT */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ৳{item.target_fob_bdt ? Number(item.target_fob_bdt).toFixed(2) : '850.00'}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {item.placement_qty ? `${Number(item.placement_qty).toLocaleString()} pcs` : '10,000 pcs'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 4-Tab Industrial Intake Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Industrial Style Tech-Pack">
        <div className="space-y-4">
          {/* Sub-tabs header */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            {[
              { id: 'general', label: '1. General & Classification' },
              { id: 'ie', label: '2. Industrial Eng. (IE & SAM)' },
              { id: 'commercial', label: '3. Commercial & Quantities (BDT ৳)' },
              { id: 'specs', label: '4. Specs & Value Additions' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* TAB 1: General */}
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Style Type *
                  </label>
                  <select
                    className="input"
                    value={form.style_type}
                    onChange={(e) => setForm({ ...form, style_type: e.target.value })}
                  >
                    <option value="Bulk">Bulk Production</option>
                    <option value="Sample">Proto / Development Sample</option>
                    <option value="Repeat">Repeat Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Buyer *
                  </label>
                  <select
                    className="input"
                    required
                    value={form.buyer_id}
                    onChange={(e) => setForm({ ...form, buyer_id: e.target.value })}
                  >
                    <option value="">Select Buyer...</option>
                    {buyers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.country || 'Global'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Internal Style# *
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. #test 1650"
                    required
                    value={form.style_no}
                    onChange={(e) => setForm({ ...form, style_no: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Merchant Style#
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. CP-1650-OLIVE"
                    value={form.merchant_style_no}
                    onChange={(e) => setForm({ ...form, merchant_style_no: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Style Name / Description *
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. #test 1650 Apparel Cargo Pants Heavy Twill"
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Cargo Pants, Woven Shirt"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender & Source Allocation
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="input"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                      <option value="Kids">Kids</option>
                    </select>
                    <select
                      className="input"
                      value={form.source_allocation}
                      onChange={(e) => setForm({ ...form, source_allocation: e.target.value })}
                    >
                      <option value="Inhouse">Inhouse</option>
                      <option value="Subcontract">Subcontract</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PD Merchant Name
                  </label>
                  <input
                    className="input"
                    value={form.pd_merchant_name}
                    onChange={(e) => setForm({ ...form, pd_merchant_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Production Merchant Name
                  </label>
                  <input
                    className="input"
                    value={form.prod_merchant_name}
                    onChange={(e) => setForm({ ...form, prod_merchant_name: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: IE & SAM */}
            {activeTab === 'ie' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SAM (Standard Allowed Minutes) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input font-mono font-bold"
                    placeholder="e.g. 22.5"
                    value={form.sam_minutes}
                    onChange={(e) => setForm({ ...form, sam_minutes: e.target.value })}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Calculated via GSD / Sewing Workstudy</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Line Target Efficiency (%) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    className="input font-mono font-bold"
                    placeholder="e.g. 70"
                    value={form.target_efficiency_pct}
                    onChange={(e) => setForm({ ...form, target_efficiency_pct: e.target.value })}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Floor standard benchmark: 65% - 85%</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Order Confirm Date (OCD)
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={form.ocd_date}
                    onChange={(e) => setForm({ ...form, ocd_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Planned Cut Date (PCD) *
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={form.pcd_date}
                    onChange={(e) => setForm({ ...form, pcd_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ex-Factory Target Date *
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={form.ex_factory_date}
                    onChange={(e) => setForm({ ...form, ex_factory_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lifecycle Stage
                  </label>
                  <select
                    className="input font-semibold"
                    value={form.lifecycle_stage}
                    onChange={(e) => setForm({ ...form, lifecycle_stage: e.target.value })}
                  >
                    <option value="NEW">New Style</option>
                    <option value="DESIGN">Design & Innovation</option>
                    <option value="PRODUCT_DEV">Product Development</option>
                    <option value="PROJECTION">Projection</option>
                    <option value="ON_ORDER">On-Order</option>
                    <option value="KEY_STYLES">Key Styles</option>
                    <option value="PENDING_POS">Pending POs</option>
                    <option value="UN_SHIPPED">Un-Shipped</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 3: Commercial & Quantities */}
            {activeTab === 'commercial' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Costing Quantity (Pcs)
                  </label>
                  <input
                    type="number"
                    className="input font-mono"
                    value={form.costing_qty}
                    onChange={(e) => setForm({ ...form, costing_qty: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Projection Quantity (Pcs)
                  </label>
                  <input
                    type="number"
                    className="input font-mono"
                    value={form.projection_qty}
                    onChange={(e) => setForm({ ...form, projection_qty: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Placement Quantity (Pcs) *
                  </label>
                  <input
                    type="number"
                    className="input font-mono font-bold"
                    value={form.placement_qty}
                    onChange={(e) => setForm({ ...form, placement_qty: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target FOB Price (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input font-mono font-bold"
                    placeholder="e.g. 850.00"
                    value={form.target_fob_bdt}
                    onChange={(e) => setForm({ ...form, target_fob_bdt: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="repeat_order"
                    checked={form.repeat_order}
                    onChange={(e) => setForm({ ...form, repeat_order: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="repeat_order" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    This is a Repeat Order (Fabric patterns and grading already approved)
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: Specs & Additions */}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Size Range
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. 28, 30, 32, 34, 36, 38"
                    value={form.size_range}
                    onChange={(e) => setForm({ ...form, size_range: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Size Ratio
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. 1:2:3:3:2:1"
                    value={form.size_ratio}
                    onChange={(e) => setForm({ ...form, size_ratio: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Value Additions / Garment Treatments
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Enzyme Bleach Wash, Silicone Softener, Hand Whiskering"
                    value={form.value_additions}
                    onChange={(e) => setForm({ ...form, value_additions: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Garment Photo Reference URL
                  </label>
                  <input
                    className="input font-mono text-xs"
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Technical Merchandising Remarks
                  </label>
                  <textarea
                    rows="2"
                    className="input text-xs"
                    placeholder="Special stitching tension, thread count or packing details..."
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Modal Bottom Controls */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">
                Tab: <strong className="uppercase">{activeTab}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                {activeTab !== 'specs' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'general') setActiveTab('ie')
                      else if (activeTab === 'ie') setActiveTab('commercial')
                      else if (activeTab === 'commercial') setActiveTab('specs')
                    }}
                    className="btn-primary text-sm flex items-center gap-1"
                  >
                    Next Tab <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="submit" className="btn-primary text-sm font-bold bg-emerald-600 hover:bg-emerald-700">
                    Save Style Tech-Pack
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
