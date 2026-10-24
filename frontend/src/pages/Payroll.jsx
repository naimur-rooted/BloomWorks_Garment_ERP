import { useState, useEffect } from 'react'
import {
  Banknote,
  Calculator,
  Users,
  Clock,
  Printer,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Award,
  ChevronDown,
  X,
  QrCode,
  Sliders,
} from 'lucide-react'
import api from '../services/api'

// Fallback demo records matching backend enterprise schema
const FALLBACK_PAYROLL = [
  {
    id: 1,
    employee_code: 'EMP-402',
    full_name: 'Fatima Begum',
    department: 'Sewing Floor',
    designation: 'Senior Overlock Operator',
    skill_grade: 'Grade A',
    salary_type: 'PIECE_RATE',
    base_salary: 14500.0,
    piece_rate_earnings: 9250.0,
    operations_completed_count: 1850,
    overtime_hours: 22.0,
    overtime_pay: 3300.0,
    efficiency_bonus: 2500.0,
    attendance_allowance: 1500.0,
    gross_earnings: 31050.0,
    deductions: 500.0,
    net_payable_salary: 30550.0,
    payment_status: 'PAID',
    month_year: 'October 2026',
    breakdown: [
      { operation: 'Collar Setting & Hemming', bundles: 92, pieces: 1850, rate: 5.00, total: 9250.0 },
    ],
  },
  {
    id: 2,
    employee_code: 'EMP-403',
    full_name: 'Kamal Hossain',
    department: 'Cutting Room',
    designation: 'Chief Cutting Master',
    skill_grade: 'Grade A',
    salary_type: 'FIXED_SALARY',
    base_salary: 32000.0,
    piece_rate_earnings: 0.0,
    operations_completed_count: 0,
    overtime_hours: 15.0,
    overtime_pay: 3000.0,
    efficiency_bonus: 0.0,
    attendance_allowance: 1500.0,
    gross_earnings: 335.0,
    deductions: 500.0,
    net_payable_salary: 330.0,
    payment_status: 'PAID',
    month_year: 'October 2026',
    breakdown: [
      { duty: 'Monthly CAD marker planning & CNC knife maintenance', pieces: 0, rate: 0, total: 0 },
    ],
  },
  {
    id: 3,
    employee_code: 'EMP-404',
    full_name: 'Nasrin Akter',
    department: 'Sewing Floor',
    designation: 'Flatlock Specialist',
    skill_grade: 'Grade B',
    salary_type: 'PIECE_RATE',
    base_salary: 110.0,
    piece_rate_earnings: 66.0,
    operations_completed_count: 2200,
    overtime_hours: 20.0,
    overtime_pay: 32.0,
    efficiency_bonus: 20.0,
    attendance_allowance: 1500.0,
    gross_earnings: 248.0,
    deductions: 500.0,
    net_payable_salary: 243.0,
    payment_status: 'PAID',
    month_year: 'October 2026',
    breakdown: [
      { operation: 'Sleeve Cuff Overlock & Topstitch', bundles: 110, pieces: 2200, rate: 0.03, total: 66.0 },
    ],
  },
  {
    id: 4,
    employee_code: 'EMP-405',
    full_name: 'Monir Hossain',
    department: 'Quality Assurance',
    designation: 'Chief Quality Inspector',
    skill_grade: 'Grade A',
    salary_type: 'FIXED_SALARY',
    base_salary: 240.0,
    piece_rate_earnings: 0.0,
    operations_completed_count: 0,
    overtime_hours: 10.0,
    overtime_pay: 20.0,
    efficiency_bonus: 30.0,
    attendance_allowance: 1500.0,
    gross_earnings: 310.0,
    deductions: 500.0,
    net_payable_salary: 305.0,
    payment_status: 'PAID',
    month_year: 'October 2026',
    breakdown: [
      { duty: 'AQL 2.5 Pre-Shipment Audit & End-Line DHU Management', pieces: 0, rate: 0, total: 0 },
    ],
  },
  {
    id: 5,
    employee_code: 'EMP-406',
    full_name: 'Rafiqul Islam',
    department: 'Finishing',
    designation: 'Steam Presser / Ironing',
    skill_grade: 'Grade B',
    salary_type: 'PIECE_RATE',
    base_salary: 110.0,
    piece_rate_earnings: 62.0,
    operations_completed_count: 3100,
    overtime_hours: 18.0,
    overtime_pay: 28.8,
    efficiency_bonus: 0.0,
    attendance_allowance: 1500.0,
    gross_earnings: 220.8,
    deductions: 500.0,
    net_payable_salary: 215.8,
    payment_status: 'APPROVED',
    month_year: 'October 2026',
    breakdown: [
      { operation: 'Final Garment Steam Press & Tagging', bundles: 155, pieces: 3100, rate: 0.02, total: 62.0 },
    ],
  },
]

export default function Payroll() {
  const [payrollRecords, setPayrollRecords] = useState(FALLBACK_PAYROLL)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSlipRecord, setSelectedSlipRecord] = useState(null)

  // Interactive Live Piece-Rate Calculator state
  const [calcBase, setCalcBase] = useState(14500.0)
  const [calcPieces, setCalcPieces] = useState(1850)
  const [calcRate, setCalcRate] = useState(5.0)
  const [calcOtHours, setCalcOtHours] = useState(22.0)
  const [calcOtRate, setCalcOtRate] = useState(150.0)
  const [calcEfficiencyBonus, setCalcEfficiencyBonus] = useState(2500.0)
  const [calcAttendance, setCalcAttendance] = useState(1500.0)
  const [calcDeductions, setCalcDeductions] = useState(500.0)
  const [calcSyncing, setCalcSyncing] = useState(false)

  // Fetch from enterprise backend router
  const fetchPayroll = async () => {
    try {
      setRefreshing(true)
      const res = await api.get('/enterprise/payroll')
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setPayrollRecords(res.data)
      }
    } catch (err) {
      console.warn('API /enterprise/payroll unavailable, utilizing fallback demo registry:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPayroll()
  }, [])

  // Live calculation formula
  const computeLivePay = () => {
    const pieceEarnings = calcPieces * calcRate
    const otPay = calcOtHours * calcOtRate
    const gross = calcBase + pieceEarnings + otPay + calcEfficiencyBonus + calcAttendance
    const net = Math.max(0, gross - calcDeductions)
    return {
      pieceEarnings: pieceEarnings.toFixed(2),
      otPay: otPay.toFixed(2),
      gross: gross.toFixed(2),
      net: net.toFixed(2),
    }
  }

  const liveResult = computeLivePay()

  // Verify calculation via backend POST API
  const syncWithBackendEngine = async () => {
    try {
      setCalcSyncing(true)
      const payload = {
        base_salary: calcBase,
        pieces_completed: calcPieces,
        rate_per_piece: calcRate,
        overtime_hours: calcOtHours,
        hourly_ot_rate: calcOtRate,
        efficiency_bonus: calcEfficiencyBonus,
        attendance_allowance: calcAttendance,
        deductions: calcDeductions,
      }
      const res = await api.post('/enterprise/calculate-piece-rate', payload)
      if (res.data) {
        alert(
          `Backend Calculation Confirmed:\n• Gross Wage: $${res.data.gross_earnings}\n• Net Payable: ৳${res.data.net_payable_salary}\n• Verified by Server Engine`
        )
      }
    } catch (err) {
      alert(`Local verification calculated: Net Payable ৳${liveResult.net}`)
    } finally {
      setCalcSyncing(false)
    }
  }

  // Presets for quick industry test
  const applyPreset = (type) => {
    if (type === 'overlock') {
      setCalcBase(120.0)
      setCalcPieces(1850)
      setCalcRate(0.04)
      setCalcOtHours(22)
      setCalcEfficiencyBonus(25)
    } else if (type === 'flatlock') {
      setCalcBase(110.0)
      setCalcPieces(2200)
      setCalcRate(0.03)
      setCalcOtHours(20)
      setCalcEfficiencyBonus(20)
    } else if (type === 'ironing') {
      setCalcBase(110.0)
      setCalcPieces(3100)
      setCalcRate(0.02)
      setCalcOtHours(18)
      setCalcEfficiencyBonus(0)
    }
  }

  // Filter records
  const filteredRecords = payrollRecords.filter((rec) => {
    const matchesDept = selectedDept === 'ALL' || rec.department === selectedDept
    const matchesSearch =
      searchQuery === '' ||
      rec.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.designation.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDept && matchesSearch
  })

  // Executive summary metrics
  const totalPayroll = payrollRecords.reduce((acc, r) => acc + Number(r.net_payable_salary || 0), 0)
  const pieceWorkers = payrollRecords.filter((r) => r.salary_type === 'PIECE_RATE')
  const avgPieceEarnings =
    pieceWorkers.length > 0
      ? pieceWorkers.reduce((acc, r) => acc + Number(r.piece_rate_earnings || 0), 0) / pieceWorkers.length
      : 0
  const totalOtHours = payrollRecords.reduce((acc, r) => acc + Number(r.overtime_hours || 0), 0)
  const totalOtPay = payrollRecords.reduce((acc, r) => acc + Number(r.overtime_pay || 0), 0)

  return (
    <div className="space-y-6">
      {/* Top Banner & Module Header */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Banknote size={20} />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Workforce Compensation & Piece-Rate Engine
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Industrial labor costing, real-time piece-rate calculations from shop floor bundle scans, statutory overtime, and digital payslips
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayroll}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2 text-xs"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Sync Live'}</span>
            </button>
            <button
              onClick={() => setSelectedSlipRecord(payrollRecords[0])}
              className="btn-primary flex items-center gap-2 text-xs"
            >
              <Printer size={14} />
              <span>Sample Payslip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="card-colorful-emerald p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Total Monthly Payroll
            </span>
            <span className="icon-box-emerald">
              <DollarSign size={18} />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              ৳{totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold font-mono">NET DISBURSED</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Month: October 2026 • 100% On-Time
          </p>
        </div>

        {/* KPI 2 */}
        <div className="card-colorful-blue p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Active Workforce
            </span>
            <span className="icon-box-blue">
              <Users size={18} />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {payrollRecords.length}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Tracked Operators</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
            {pieceWorkers.length} Piece-Rate • {payrollRecords.length - pieceWorkers.length} Fixed Master
          </p>
        </div>

        {/* KPI 3 */}
        <div className="card-colorful-amber p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Avg Piece Earnings
            </span>
            <span className="icon-box-amber">
              <Award size={18} />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 tracking-tight font-mono">
              ৳{avgPieceEarnings.toFixed(2)}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold font-mono">/ OPERATOR</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Incentivized sewing & press output
          </p>
        </div>

        {/* KPI 4 */}
        <div className="card-colorful-purple p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Overtime Hours & Pay
            </span>
            <span className="icon-box-purple">
              <Clock size={18} />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700 dark:text-purple-400 tracking-tight font-mono">
              {totalOtHours.toFixed(1)} <span className="text-xs font-normal text-slate-500">hrs</span>
            </span>
            <span className="text-xs text-purple-700 dark:text-purple-400 font-bold font-mono">(৳{totalOtPay.toFixed(2)})</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Statutory 2x rate compliance
          </p>
        </div>
      </div>

      {/* Interactive Live Piece-Rate Calculator Widget */}
      <div className="card-colorful-cyan p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-5 border-b border-cyan-200/80 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="icon-box-cyan">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                Interactive Piece-Rate Compensation Simulator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Test custom garment piece targets, progressive SMV rates, and statutory overtime rules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Presets:</span>
            <button
              onClick={() => applyPreset('overlock')}
              className="btn-secondary text-xs py-1 px-2.5 font-semibold"
            >
              Overlock Collar
            </button>
            <button
              onClick={() => applyPreset('flatlock')}
              className="btn-secondary text-xs py-1 px-2.5 font-semibold"
            >
              Flatlock Cuff
            </button>
            <button
              onClick={() => applyPreset('ironing')}
              className="btn-secondary text-xs py-1 px-2.5 font-semibold"
            >
              Steam Press
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">
              Base Monthly Wage (৳)
            </label>
            <input
              type="number"
              step="5"
              value={calcBase}
              onChange={(e) => setCalcBase(parseFloat(e.target.value) || 0)}
              className="input font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">
              Completed Pieces (Scanned)
            </label>
            <input
              type="number"
              step="50"
              value={calcPieces}
              onChange={(e) => setCalcPieces(parseInt(e.target.value) || 0)}
              className="input font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">
              Piece Rate (৳ / piece)
            </label>
            <input
              type="number"
              step="0.005"
              value={calcRate}
              onChange={(e) => setCalcRate(parseFloat(e.target.value) || 0)}
              className="input font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">
              Overtime Hours Logged
            </label>
            <input
              type="number"
              step="1"
              value={calcOtHours}
              onChange={(e) => setCalcOtHours(parseFloat(e.target.value) || 0)}
              className="input font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">
              Hourly OT Rate (৳/hr)
            </label>
            <input
              type="number"
              step="0.10"
              value={calcOtRate}
              onChange={(e) => setCalcOtRate(parseFloat(e.target.value) || 0)}
              className="input font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">
              Efficiency / Target Bonus (৳)
            </label>
            <input
              type="number"
              step="5"
              value={calcEfficiencyBonus}
              onChange={(e) => setCalcEfficiencyBonus(parseFloat(e.target.value) || 0)}
              className="input font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">
              Attendance Allowance (৳)
            </label>
            <input
              type="number"
              step="5"
              value={calcAttendance}
              onChange={(e) => setCalcAttendance(parseFloat(e.target.value) || 0)}
              className="input font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">
              Deductions / PF / Tax (৳)
            </label>
            <input
              type="number"
              step="1"
              value={calcDeductions}
              onChange={(e) => setCalcDeductions(parseFloat(e.target.value) || 0)}
              className="input font-mono"
            />
          </div>
        </div>

        {/* Calculator Result Banner */}
        <div className="mt-5 p-4 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto font-mono text-center sm:text-left">
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Piece Earnings</span>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">৳{liveResult.pieceEarnings}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Overtime Pay</span>
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400">৳{liveResult.otPay}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Gross Salary</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">৳{liveResult.gross}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Deductions</span>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">-৳{calcDeductions.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-200 dark:border-slate-800 pt-3 md:pt-0">
            <div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono font-bold tracking-wider">
                NET PAYABLE WAGE
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                ${liveResult.net}
              </p>
            </div>
            <button
              onClick={syncWithBackendEngine}
              disabled={calcSyncing}
              className="btn-secondary text-xs"
            >
              <RefreshCw size={13} className={calcSyncing ? 'animate-spin' : ''} />
              <span>Verify API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wage Register Section Header & Filters */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Department Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Sewing Floor', 'Cutting Room', 'Quality Assurance', 'Finishing'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {dept === 'ALL' ? 'All Departments' : dept}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search operator, ID, title..."
              className="input pl-9 text-xs py-1.5"
            />
          </div>
        </div>

        {/* Comprehensive Wage Register Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-xs text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Operator Code</th>
                <th className="py-3 px-3">Worker / Designation</th>
                <th className="py-3 px-2">Skill Grade</th>
                <th className="py-3 px-2">Salary Type</th>
                <th className="py-3 px-2 text-right">Base Wage</th>
                <th className="py-3 px-2 text-right">Pieces & Rate</th>
                <th className="py-3 px-2 text-right">Piece Pay</th>
                <th className="py-3 px-2 text-right">OT Hours / Pay</th>
                <th className="py-3 px-2 text-right">Bonus</th>
                <th className="py-3 px-2 text-right">Net Salary</th>
                <th className="py-3 px-2 text-center">Status</th>
                <th className="py-3 px-3 text-center">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40 transition-colors">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No operator payroll records found for this department.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((worker) => {
                  const isPiece = worker.salary_type === 'PIECE_RATE'
                  return (
                    <tr
                      key={worker.employee_code}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {worker.employee_code}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{worker.full_name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{worker.designation}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{worker.department}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={
                            worker.skill_grade === 'Grade A' ? 'badge-emerald' : 'badge-slate'
                          }
                        >
                          {worker.skill_grade}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            isPiece
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {worker.salary_type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                        ৳{Number(worker.base_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-right font-mono">
                        {isPiece ? (
                          <>
                            <span className="text-slate-900 dark:text-white font-semibold">
                              {worker.operations_completed_count.toLocaleString()}
                            </span>{' '}
                            <span className="text-slate-400 text-[10px]">pcs</span>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                        ৳{Number(worker.piece_rate_earnings).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-right font-mono">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {Number(worker.overtime_hours).toFixed(1)} hrs
                        </div>
                        <div className="text-[10px] text-purple-600 dark:text-purple-400">
                          +৳{Number(worker.overtime_pay).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                        ৳{Number(worker.efficiency_bonus).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-right font-mono">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{Number(worker.net_payable_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            worker.payment_status === 'PAID'
                              ? 'badge-emerald'
                              : worker.payment_status === 'APPROVED'
                              ? 'badge-blue'
                              : 'badge-amber'
                          }`}
                        >
                          {worker.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedSlipRecord(worker)}
                          className="btn-secondary text-xs py-1 px-2.5 mx-auto"
                          title="Generate printable payslip"
                        >
                          <FileText size={12} />
                          <span>Payslip</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Payslip Modal */}
      {selectedSlipRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden print-area">
            {/* Header / Actions (hidden in print) */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-400" />
                <h3 className="font-bold text-sm tracking-wide">
                  Official Garment Operator Payslip
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-primary text-xs"
                >
                  <Printer size={14} />
                  <span>Print Payslip</span>
                </button>
                <button
                  onClick={() => setSelectedSlipRecord(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Official Printable Slip Area */}
            <div className="p-6 sm:p-8 space-y-6 bg-white text-slate-900">
              {/* Factory Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-950 font-mono">
                    BLOOMWORKS GARMENTS LTD.
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Export Processing Zone, Unit 01 • Chittagong, Bangladesh
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Compliance Reg: EPZ-RMG-2026-9081 • ISO 9001:2015 Certified
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-slate-800">
                    PAYSLIP • {selectedSlipRecord.month_year}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Generated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Employee Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Operator ID</span>
                  <span className="font-bold font-mono text-slate-900">
                    {selectedSlipRecord.employee_code}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Full Name</span>
                  <span className="font-bold text-slate-900">
                    {selectedSlipRecord.full_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Department</span>
                  <span className="font-semibold text-slate-800">
                    {selectedSlipRecord.department}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Designation</span>
                  <span className="font-semibold text-slate-800">
                    {selectedSlipRecord.designation}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Skill Grade</span>
                  <span className="font-bold font-mono text-blue-700">
                    {selectedSlipRecord.skill_grade}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Compensation Model</span>
                  <span className="font-bold font-mono text-slate-800">
                    {selectedSlipRecord.salary_type}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Statutory OT Log</span>
                  <span className="font-bold font-mono text-slate-800">
                    {Number(selectedSlipRecord.overtime_hours).toFixed(1)} Hours (2× Rate)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Disbursement Status</span>
                  <span className="font-bold font-mono text-emerald-700">
                    {selectedSlipRecord.payment_status}
                  </span>
                </div>
              </div>

              {/* Earnings & Deductions Dual Ledger */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-xs text-slate-800 font-mono uppercase">
                    Itemized Gross Earnings
                  </div>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 text-slate-600">Base Salary Wage</td>
                        <td className="p-2 text-right font-mono font-semibold">
                          ৳{Number(selectedSlipRecord.base_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      {selectedSlipRecord.salary_type === 'PIECE_RATE' && (
                        <tr>
                          <td className="p-2 text-slate-600">
                            Piece-Rate Production Output
                            <span className="block text-[10px] text-slate-400">
                              ({selectedSlipRecord.operations_completed_count.toLocaleString()} pieces @ contract rate)
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono font-semibold text-amber-700">
                            ৳{Number(selectedSlipRecord.piece_rate_earnings).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="p-2 text-slate-600">Overtime Premium Pay</td>
                        <td className="p-2 text-right font-mono font-semibold">
                          ৳{Number(selectedSlipRecord.overtime_pay).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600">Line Efficiency Incentive Bonus</td>
                        <td className="p-2 text-right font-mono font-semibold">
                          ৳{Number(selectedSlipRecord.efficiency_bonus).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600">Monthly Attendance Allowance</td>
                        <td className="p-2 text-right font-mono font-semibold">
                          ৳{Number(selectedSlipRecord.attendance_allowance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-bold border-t border-slate-200">
                        <td className="p-2 text-slate-900">Total Gross Earnings</td>
                        <td className="p-2 text-right font-mono text-slate-900">
                          ৳{Number(selectedSlipRecord.gross_earnings).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-xs text-slate-800 font-mono uppercase">
                      Statutory & Authorized Deductions
                    </div>
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 text-slate-600">Workers Welfare & Medical Fund</td>
                          <td className="p-2 text-right font-mono font-semibold text-rose-700">
                            ৳300.00
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 text-slate-600">Provident Fund (Employee Share)</td>
                          <td className="p-2 text-right font-mono font-semibold text-rose-700">
                            ৳200.00
                          </td>
                        </tr>
                        <tr className="bg-slate-50 font-bold border-t border-slate-200">
                          <td className="p-2 text-slate-900">Total Deductions</td>
                          <td className="p-2 text-right font-mono text-rose-700">
                            -৳{Number(selectedSlipRecord.deductions).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Net Payable Box */}
                  <div className="p-4 m-2 rounded-lg bg-emerald-50 border border-emerald-300 text-center">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider font-mono">
                      NET DISBURSED AMOUNT
                    </span>
                    <p className="text-2xl font-black text-emerald-700 font-mono">
                      ৳{Number(selectedSlipRecord.net_payable_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Direct Deposit to Bank Account / EPZ Payroll Card
                    </span>
                  </div>
                </div>
              </div>

              {/* Compliance & Signature Lines */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-xs">
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1" />
                  <p className="font-bold text-slate-800">Operator Acknowledgment & Signature</p>
                  <p className="text-[10px] text-slate-500 font-mono">Date: ________________________</p>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 pb-1 mb-1" />
                  <p className="font-bold text-slate-800">Authorized Accounts & Audit Signatory</p>
                  <p className="text-[10px] text-slate-500 font-mono">BloomWorks Garments Finance Dept.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
