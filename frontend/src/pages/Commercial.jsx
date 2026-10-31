import { useState, useEffect } from 'react'
import {
  Banknote, Plus, Search, Calendar, FileText, CheckCircle2, 
  ArrowUpRight, ArrowDownLeft, RefreshCw, Upload, ShieldCheck, DollarSign
} from 'lucide-react'
import api from '../services/api'

export default function Commercial() {
  const [activeTab, setActiveTab] = useState('ledger') // 'ledger' | 'create_mr' | 'mr_list'
  const [parties, setParties] = useState([])
  const [selectedParty, setSelectedParty] = useState('M/S Windy Apparels Ltd.')
  const [ledger, setLedger] = useState(null)
  const [moneyReceives, setMoneyReceives] = useState([])
  const [loading, setLoading] = useState(true)

  // MR Form
  const [mrForm, setMrForm] = useState({
    voucher_number: `FPL-MR-25-0${Math.floor(100 + Math.random() * 900)}`,
    receipt_date: new Date().toISOString().split('T')[0],
    party_name: 'M/S Windy Apparels Ltd.',
    group_name: 'Windy Group',
    buyer_name: 'Primark',
    total_paid_amount: '',
    payment_method: 'AT_SIGHT_LC',
    document_reference: 'LC# 0845-LC-2025-020 / Bill No. 06',
    attachment_name: 'LC_Endorsement_Windy.pdf',
    remarks: 'Payment received via Export At-Sight LC settlement.',
  })

  // Load parties summary
  const loadParties = () => {
    api.get('/logistics/parties')
      .then((res) => {
        setParties(res.data || [])
        if (res.data?.length > 0 && !selectedParty) {
          setSelectedParty(res.data[0].party_name)
        }
      })
      .catch(console.error)
  }

  // Load Ledger for selected party
  const loadPartyLedger = (party) => {
    if (!party) return
    setLoading(true)
    api.get(`/logistics/party-ledger/${encodeURIComponent(party)}`)
      .then((res) => {
        setLedger(res.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  // Load Money Receives
  const loadMoneyReceives = () => {
    api.get('/logistics/money-receives')
      .then((res) => setMoneyReceives(res.data || []))
      .catch(console.error)
  }

  useEffect(() => {
    loadParties()
    loadMoneyReceives()
  }, [])

  useEffect(() => {
    if (selectedParty) {
      loadPartyLedger(selectedParty)
    }
  }, [selectedParty])

  const handleCreateMR = async (e) => {
    e.preventDefault()
    try {
      await api.post('/logistics/money-receives', {
        ...mrForm,
        total_paid_amount: Number(mrForm.total_paid_amount || 0),
      })
      alert('Money Receive Voucher registered successfully!')
      setActiveTab('ledger')
      loadParties()
      loadMoneyReceives()
      loadPartyLedger(mrForm.party_name)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to record money receipt')
    }
  }

  // Selected party metrics from parties list
  const currentPartySummary = parties.find((p) => p.party_name === selectedParty) || {
    total_billed_bdt: 0,
    total_received_bdt: 0,
    balance_due_bdt: 0,
    total_delivered_qty: 0,
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Banknote className="h-7 w-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Commercial Accounts Receivable & Money Receive
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Party-Wise Aging Ledger, Export At-Sight LC, Cash/Cheque Settlements & Outstanding Balances (BDT ৳)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'ledger'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Party Wise Report
          </button>
          <button
            onClick={() => {
              // Preload due balance into form
              const due = currentPartySummary.balance_due_bdt || 0
              setMrForm({
                ...mrForm,
                party_name: selectedParty,
                total_paid_amount: due > 0 ? due : '',
                voucher_number: `FPL-MR-25-0${Math.floor(100 + Math.random() * 900)}`,
              })
              setActiveTab('create_mr')
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'create_mr'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Plus className="h-4 w-4" />
            Create Money Receive
          </button>
          <button
            onClick={() => setActiveTab('mr_list')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'mr_list'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Money Receive List ({moneyReceives.length})
          </button>
        </div>
      </div>

      {/* 2. TAB: PARTY WISE REPORT (Matching Fashion Packers Screenshot 8) */}
      {activeTab === 'ledger' && (
        <div className="space-y-5">
          {/* Party Selector Header */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm whitespace-nowrap">
                Party Name:
              </span>
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="input font-semibold text-sm max-w-md bg-blue-50 dark:bg-slate-800 border-blue-300 dark:border-slate-700"
              >
                {parties.map((p) => (
                  <option key={p.party_name} value={p.party_name}>
                    {p.party_name} (Balance: ৳{Number(p.balance_due_bdt).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => loadPartyLedger(selectedParty)}
              className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh ledger"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Aggregate Financial Metrics Banner (Matching Fashion Packers Screenshot 8 totals) */}
          <div className="bg-slate-800 text-white rounded-xl p-4 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="border-r border-slate-700 pr-2">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Delivered Qty</div>
              <div className="text-xl font-black font-mono mt-1">
                {Number(currentPartySummary.total_delivered_qty || 0).toLocaleString()} Pcs
              </div>
            </div>

            <div className="border-r border-slate-700 pr-2">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Amount (Billed)</div>
              <div className="text-xl font-black font-mono text-cyan-400 mt-1">
                ৳{Number(currentPartySummary.total_billed_bdt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="border-r border-slate-700 pr-2">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Received Amount</div>
              <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                ৳{Number(currentPartySummary.total_received_bdt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Outstanding Balance</div>
              <div className="text-xl font-black font-mono text-amber-400 mt-1">
                ৳{Number(currentPartySummary.balance_due_bdt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Chronological Statement Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Itemized Running Debt & Payment Ledger: {selectedParty}
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {ledger?.timeline?.length || 0} Transactions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs tracking-wider uppercase">
                    <th className="py-2.5 px-3 w-12 text-center">SL</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Document / Challan No</th>
                    <th className="py-2.5 px-3">Job / Ref No</th>
                    <th className="py-2.5 px-4">Transaction Details</th>
                    <th className="py-2.5 px-3 text-right">Debit (Billed ৳)</th>
                    <th className="py-2.5 px-3 text-right">Credit (Received ৳)</th>
                    <th className="py-2.5 px-3 text-right">Running Balance (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-slate-400">
                        Loading running statement...
                      </td>
                    </tr>
                  ) : !ledger || ledger.timeline.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-slate-400">
                        No transactions recorded for {selectedParty}.
                      </td>
                    </tr>
                  ) : (
                    ledger.timeline.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row.date}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.type === 'CHALLAN'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {row.doc_no}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{row.job_no}</td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-normal">
                          {row.details}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-900 dark:text-white font-bold">
                          {row.debit_billed > 0
                            ? `৳${row.debit_billed.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                            : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {row.credit_received > 0
                            ? `৳${row.credit_received.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                            : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          ৳{row.running_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: CREATE MONEY RECEIVE (Matching Fashion Packers Screenshot 7) */}
      {activeTab === 'create_mr' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-3 mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Banknote className="h-6 w-6 text-emerald-600" />
              Create Money Receive Voucher
            </h2>
            <p className="text-xs text-slate-500">
              Record export remittances, At-Sight LC encashment, cheques or cash receipts against delivery challans
            </p>
          </div>

          <form onSubmit={handleCreateMR} className="space-y-4">
            {/* Party Selector Banner */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Select Customer / Party:
              </span>
              <select
                value={mrForm.party_name}
                onChange={(e) => {
                  const pName = e.target.value
                  const partyData = parties.find((p) => p.party_name === pName)
                  setMrForm({
                    ...mrForm,
                    party_name: pName,
                    total_paid_amount: partyData?.balance_due_bdt || '',
                  })
                }}
                className="input max-w-md font-bold text-sm bg-white dark:bg-slate-800"
              >
                {parties.map((p) => (
                  <option key={p.party_name} value={p.party_name}>
                    {p.party_name} (Due: ৳{Number(p.balance_due_bdt).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Voucher Number *
                </label>
                <input
                  className="input font-mono font-bold"
                  required
                  value={mrForm.voucher_number}
                  onChange={(e) => setMrForm({ ...mrForm, voucher_number: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receipt Date *
                </label>
                <input
                  type="date"
                  className="input"
                  required
                  value={mrForm.receipt_date}
                  onChange={(e) => setMrForm({ ...mrForm, receipt_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method *
                </label>
                <select
                  className="input font-semibold"
                  value={mrForm.payment_method}
                  onChange={(e) => setMrForm({ ...mrForm, payment_method: e.target.value })}
                >
                  <option value="AT_SIGHT_LC">At-Sight LC (Letter of Credit)</option>
                  <option value="CASH">Cash in Hand</option>
                  <option value="CHEQUE">Bank Cheque / Pay Order</option>
                  <option value="BANK_WIRE">Bank Wire Transfer (EFT/RTGS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document / LC / Cheque Reference *
                </label>
                <input
                  className="input font-mono"
                  placeholder="e.g. LC# 0845-LC-2025-019 / Bill No. 05"
                  required
                  value={mrForm.document_reference}
                  onChange={(e) => setMrForm({ ...mrForm, document_reference: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receive Amount (BDT ৳) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input font-mono font-bold text-lg text-emerald-600"
                  placeholder="0.00"
                  value={mrForm.total_paid_amount}
                  onChange={(e) => setMrForm({ ...mrForm, total_paid_amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attachment (Voucher Scan / Bank Advice)
                </label>
                <input
                  type="file"
                  className="input text-xs"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setMrForm({ ...mrForm, attachment_name: file.name })
                  }}
                />
                {mrForm.attachment_name && (
                  <span className="text-[11px] text-emerald-600 mt-1 block">
                    Attached: {mrForm.attachment_name}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Settlement Notes
                </label>
                <textarea
                  rows="2"
                  className="input text-xs"
                  placeholder="Remarks e.g. LC settled via Standard Chartered Bank Dhaka branch..."
                  value={mrForm.remarks}
                  onChange={(e) => setMrForm({ ...mrForm, remarks: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('ledger')}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-sm font-bold bg-emerald-600 hover:bg-emerald-700"
              >
                Save Money Receive Voucher
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. TAB: MONEY RECEIVE LIST */}
      {activeTab === 'mr_list' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-3 px-3 w-12 text-center">SL</th>
                  <th className="py-3 px-3">Voucher No</th>
                  <th className="py-3 px-3">Receipt Date</th>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-4">Document Reference</th>
                  <th className="py-3 px-3 text-right">Received Amount (৳)</th>
                  <th className="py-3 px-3 text-center">Attachment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-xs">
                {moneyReceives.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No money receive vouchers recorded.
                    </td>
                  </tr>
                ) : (
                  moneyReceives.map((mr, idx) => (
                    <tr key={mr.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {mr.voucher_number}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{mr.receipt_date}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">{mr.party_name}</td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {mr.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {mr.document_reference || '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ৳{Number(mr.total_paid_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {mr.attachment_name ? (
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center justify-center gap-1">
                            <FileText className="h-3.5 w-3.5" /> Scan
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
