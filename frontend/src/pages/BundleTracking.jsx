import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import {
  QrCode,
  Barcode,
  Layers,
  Sparkles,
  Printer,
  RotateCcw,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Camera,
  CameraOff,
  Boxes,
  Plus,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
  Scissors,
  Check,
  Zap,
} from 'lucide-react'
import api from '../services/api'

// Web Audio API Synthesizer for instant scanner beep/buzzer without external sound files
const playAudioFeedback = (type = 'success') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'success') {
      // High-pitched pleasant beep (880Hz, A5)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.12)
    } else {
      // Low buzz tone (220Hz, A3)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    }
  } catch {
    // Audio context may be restricted by autoplay policy
  }
}

export default function BundleTracking() {
  const [activeTab, setActiveTab] = useState('scan-station') // 'scan-station' | 'wip-pipeline' | 'printable-tickets' | 'generate'
  const [wipSummary, setWipSummary] = useState(null)
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Scanner Station State
  const [selectedStation, setSelectedStation] = useState('SEWING-LINE-04')
  const [targetStage, setTargetStage] = useState('AUTO_NEXT')
  const [operatorName, setOperatorName] = useState('Operator Fatima')
  const [manualInput, setManualInput] = useState('')
  const [lastScanResult, setLastScanResult] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [recentScans, setRecentScans] = useState([])

  // Printable Tickets Filter
  const [ticketOrderFilter, setTicketOrderFilter] = useState('ALL')
  const [ticketStageFilter, setTicketStageFilter] = useState('ALL')

  // Generate Bundles Form
  const [genForm, setGenForm] = useState({
    order_number: 'PO-8825',
    style_code: 'CREW-JERSEY-01',
    color_name: 'Bottle Green',
    size_code: 'L',
    cut_number: 'CUT-105',
    total_quantity: 100,
    bundle_size: 20,
  })
  const [genSuccess, setGenSuccess] = useState('')

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true)
      const [sumRes, bndRes] = await Promise.all([
        api.get('/tracking/wip-summary'),
        api.get('/tracking/bundles'),
      ])
      setWipSummary(sumRes.data)
      setBundles(bndRes.data)
    } catch (err) {
      console.error('Failed to load tracking data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Global Keyboard-Wedge Barcode Gun Listener
  useEffect(() => {
    let charBuffer = []
    let lastKeyTime = Date.now()

    const handleKeyDown = (e) => {
      // Ignore if user is manually typing into a text input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) && e.target.id !== 'scanner-hidden-input') {
        return
      }

      const now = Date.now()
      const diff = now - lastKeyTime
      lastKeyTime = now

      // Laser barcode guns emit chars with < 50ms intervals
      if (diff > 50) {
        charBuffer = []
      }

      if (e.key === 'Enter') {
        if (charBuffer.length >= 6) {
          const barcode = charBuffer.join('')
          executeScan(barcode, 'Physical Barcode Gun')
        }
        charBuffer = []
      } else if (e.key.length === 1) {
        charBuffer.push(e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [targetStage, selectedStation, operatorName])

  // Camera Scanner Setup via html5-qrcode
  useEffect(() => {
    let scanner = null
    if (cameraActive && activeTab === 'scan-station') {
      scanner = new Html5QrcodeScanner(
        'camera-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )
      scanner.render(
        (decodedText) => {
          executeScan(decodedText, 'Camera Scanner')
          setCameraActive(false)
        },
        (error) => {
          // ignore stream frame errors
        }
      )
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(() => {})
      }
    }
  }, [cameraActive, activeTab])

  // Execute Scan Core
  const executeScan = async (barcode, source = 'Manual') => {
    const cleanCode = barcode.trim()
    if (!cleanCode) return

    try {
      const res = await api.post('/tracking/scan', {
        barcode: cleanCode,
        target_stage: targetStage,
        station_id: selectedStation,
        operator_name: operatorName,
        defect_count: 0,
        notes: `Scanned via ${source}`,
      })

      playAudioFeedback('success')
      setLastScanResult({
        success: true,
        message: res.data.message,
        bundle: res.data.bundle,
        time: new Date().toLocaleTimeString(),
      })

      // Add to recent scans log
      setRecentScans((prev) => [
        {
          id: Date.now(),
          code: cleanCode,
          stage: res.data.new_stage,
          qty: res.data.pieces_moved,
          time: new Date().toLocaleTimeString(),
          success: true,
        },
        ...prev.slice(0, 7),
      ])

      // Re-fetch summaries
      fetchData()
      setManualInput('')
    } catch (err) {
      playAudioFeedback('error')
      const msg = err.response?.data?.detail || 'Scan failed or invalid barcode'
      setLastScanResult({
        success: false,
        message: msg,
        code: cleanCode,
        time: new Date().toLocaleTimeString(),
      })
      setRecentScans((prev) => [
        {
          id: Date.now(),
          code: cleanCode,
          stage: 'REJECTED',
          qty: 0,
          time: new Date().toLocaleTimeString(),
          success: false,
          error: msg,
        },
        ...prev.slice(0, 7),
      ])
    }
  }

  // Handle Generate Bundles
  const handleGenerate = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/tracking/generate', genForm)
      setGenSuccess(`Successfully generated ${res.data.length} bundles for Cut ${genForm.cut_number}!`)
      fetchData()
      setTimeout(() => setGenSuccess(''), 5000)
    } catch (err) {
      alert('Generation error: ' + (err.response?.data?.detail || err.message))
    }
  }

  // Handle Demo Reset
  const handleResetDemo = async () => {
    if (!confirm('Reset all demo bundles back to factory default state?')) return
    try {
      await api.post('/tracking/reset-demo')
      fetchData()
      setLastScanResult(null)
      setRecentScans([])
      alert('Demo bundles have been reset successfully!')
    } catch (err) {
      alert('Reset failed: ' + err.message)
    }
  }

  const STAGE_COLORS = {
    CUTTING: 'bg-amber-100 text-amber-800 border-amber-300',
    WASHING: 'bg-blue-100 text-blue-800 border-blue-300',
    SEWING_IN: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    SEWING_OUT_QC: 'bg-purple-100 text-purple-800 border-purple-300',
    FINISHING: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    PACKED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  }

  return (
    <div className="space-y-6">
      {/* Header & High-Level KPIs */}
      <div className="card-colorful-blue p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="icon-box-blue">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                  SHOP FLOOR BUNDLE TRACKING & SFC
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Live barcode telemetry, multi-stage WIP flow & piece-rate line control
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setRefreshing(true)
                fetchData()
              }}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleResetDemo}
              className="px-3.5 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 rounded-lg transition flex items-center gap-2"
              title="Reset demo data for a new presentation"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {wipSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-colorful-blue p-4 relative overflow-hidden group">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Active Garments (WIP)
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight mt-1">
              {wipSummary.total_pieces.toLocaleString()} <span className="text-xs font-normal text-slate-500">pcs</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-mono font-medium">
              In {wipSummary.total_bundles} physical bundles
            </div>
          </div>

          <div className="card-colorful-purple p-4 relative overflow-hidden group">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Sewing Completed (QC Passed)
            </span>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-400 font-mono tracking-tight mt-1">
              {wipSummary.metrics.completed_pieces.toLocaleString()} <span className="text-xs font-normal text-slate-500">pcs</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-mono font-medium">
              Line Target: {wipSummary.metrics.target_pieces} pcs
            </div>
          </div>

          <div className="card-colorful-cyan p-4 relative overflow-hidden group">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Line Efficiency
            </span>
            <div className="text-2xl font-black text-cyan-700 dark:text-cyan-400 font-mono tracking-tight mt-1">
              {wipSummary.metrics.sewing_efficiency_pct}%
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, wipSummary.metrics.sewing_efficiency_pct)}%` }}
              />
            </div>
          </div>

          <div className="card-colorful-emerald p-4 relative overflow-hidden group">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Packed in Cartons
            </span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight mt-1">
              {wipSummary.metrics.packed_pieces.toLocaleString()} <span className="text-xs font-normal text-slate-500">pcs</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 font-mono">
              Ready for Export Inspection
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500" />
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 rounded-xl shadow-sm text-xs overflow-x-auto transition-colors">
        <button
          onClick={() => setActiveTab('scan-station')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'scan-station'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          High-Speed Scan Station
        </button>

        <button
          onClick={() => setActiveTab('wip-pipeline')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'wip-pipeline'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Live Floor WIP Pipeline
        </button>

        <button
          onClick={() => setActiveTab('printable-tickets')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'printable-tickets'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          Printable Bundle Tickets
        </button>

        <button
          onClick={() => setActiveTab('generate')}
          className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'generate'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          Generate Cut Bundles
        </button>
      </div>

      {/* TAB 1: HIGH-SPEED SCAN STATION */}
      {activeTab === 'scan-station' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Scanner HUD */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl border border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <span className="font-mono text-sm tracking-widest text-emerald-400 font-semibold uppercase">
                    SCANNER TERMINAL READY
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-400">Station:</span>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="bg-gray-800 text-white rounded px-2.5 py-1 border border-gray-700 text-xs focus:outline-none"
                  >
                    <option value="CUTTING-EXIT">Table 01 (Cutting Exit)</option>
                    <option value="WASH-GATE">Gate 01 (Washing Transfer)</option>
                    <option value="SEWING-LINE-04">Sewing Line 04 (Line Input)</option>
                    <option value="SEWING-LINE-04-QC">Sewing Line 04 (End QC)</option>
                    <option value="FINISHING-STATION">Finishing Line 01</option>
                    <option value="PACKING-LINE">Carton Packing Station</option>
                  </select>

                  <span className="text-gray-400">Transition:</span>
                  <select
                    value={targetStage}
                    onChange={(e) => setTargetStage(e.target.value)}
                    className="bg-gray-800 text-white rounded px-2.5 py-1 border border-gray-700 text-xs focus:outline-none font-semibold text-blue-400"
                  >
                    <option value="AUTO_NEXT">Auto Progressive Step</option>
                    <option value="CUTTING">Force to Cutting</option>
                    <option value="WASHING">Force to Washing</option>
                    <option value="SEWING_IN">Force to Sewing In</option>
                    <option value="SEWING_OUT_QC">Force to Sewing QC</option>
                    <option value="FINISHING">Force to Finishing</option>
                    <option value="PACKED">Force to Packed</option>
                  </select>
                </div>
              </div>

              {/* Big Scanner Target Area */}
              <div className="py-8 text-center">
                <div className="inline-flex p-4 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 mb-3">
                  <Barcode className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Point Barcode Gun & Pull Trigger
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                  Works with any standard USB/Bluetooth scanner gun automatically. Or use the camera / simulator below.
                </p>

                {/* Manual Input / Barcode Gun Target */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    executeScan(manualInput, 'Manual Key In')
                  }}
                  className="mt-6 max-w-md mx-auto flex gap-2"
                >
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Scan barcode or type BND-..."
                    className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition shadow-md"
                  >
                    Submit
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCameraActive(!cameraActive)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition border border-gray-700"
                  >
                    {cameraActive ? <CameraOff className="w-3.5 h-3.5 text-red-400" /> : <Camera className="w-3.5 h-3.5 text-emerald-400" />}
                    {cameraActive ? 'Close Camera Scanner' : 'Use Smartphone / Webcam Camera'}
                  </button>
                </div>

                {/* Camera Box */}
                {cameraActive && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-xl max-w-xs mx-auto border border-gray-700">
                    <div id="camera-reader" className="overflow-hidden rounded-lg" />
                    <p className="text-[11px] text-gray-400 mt-2">
                      Hold the bundle QR code up to your camera
                    </p>
                  </div>
                )}
              </div>

              {/* Scan Feedback Banner */}
              {lastScanResult && (
                <div
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    lastScanResult.success
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                      : 'bg-red-950/80 border-red-500/50 text-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {lastScanResult.success ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">
                          {lastScanResult.success ? 'SCAN VERIFIED (200 OK)' : 'SCAN REJECTED'}
                        </span>
                        <span className="text-xs opacity-75">{lastScanResult.time}</span>
                      </div>
                      <p className="text-xs mt-1 font-mono">{lastScanResult.message}</p>
                      {lastScanResult.bundle && (
                        <div className="mt-2 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/30 p-2.5 rounded-lg border border-white/10 font-mono">
                          <div>Order: <span className="text-white font-bold">{lastScanResult.bundle.order_number}</span></div>
                          <div>Style: <span className="text-white">{lastScanResult.bundle.style_code}</span></div>
                          <div>Size/Color: <span className="text-white">{lastScanResult.bundle.size_code} / {lastScanResult.bundle.color_name}</span></div>
                          <div>Plies: <span className="text-white">{lastScanResult.bundle.ply_start} - {lastScanResult.bundle.ply_end}</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Hardware Simulator (For Demo to Buyers) */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                    Interactive Barcode Gun Simulator (Buyer Demo Tool)
                  </h4>
                </div>
                <span className="badge-blue font-mono font-medium">
                  Click to simulate laser gun burst
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-sans">
                Click any active bundle below to simulate a worker pointing a laser scanner gun at it. The system will inject rapid keystrokes, trigger the audio beep, and advance the bundle.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {bundles.slice(0, 6).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => executeScan(b.bundle_code, 'Simulator Click')}
                    className="flex flex-col text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group shadow-sm"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {b.bundle_code}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STAGE_COLORS[b.current_stage]}`}>
                        {b.stage_label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      {b.order_number} • {b.color_name} ({b.size_code})
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center justify-between font-mono">
                      <span>Qty: {b.quantity} pcs</span>
                      <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition text-xs font-bold">
                        Scan ⚡
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Real-time Scan Log & Audio Control */}
          <div className="space-y-6">
            <div className="card p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 font-mono">
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Terminal Audio & Hardware
                </h4>
                <button
                  onClick={() => playAudioFeedback('success')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono"
                >
                  Test Beep
                </button>
              </div>
              <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
                <div className="flex items-center justify-between">
                  <span>Hardware Wedge:</span>
                  <span className="badge-emerald font-semibold">
                    Active (Global HID)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audio Feedback:</span>
                  <span className="badge-emerald font-semibold">
                    Web Audio 880Hz
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Operator Badge:</span>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="input w-36 text-xs py-0.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Recent Scans Feed */}
            <div className="card p-5">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 font-mono">
                Live Scan Activity Stream
              </h4>
              {recentScans.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center font-mono">
                  No scans yet in this session. Trigger a scan above to see live activity.
                </p>
              ) : (
                <div className="space-y-2.5 font-mono">
                  {recentScans.map((s) => (
                    <div
                      key={s.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        s.success ? 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800' : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-blue-600 dark:text-blue-400">{s.code}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {s.success ? `Moved to ${s.stage} (+${s.qty} pcs)` : s.error}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{s.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE FLOOR WIP PIPELINE (KANBAN) */}
      {activeTab === 'wip-pipeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg font-mono">
              Factory WIP Floor Progression
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Click &apos;Advance&apos; to push bundles through physical production stages
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
            {wipSummary?.stages.map((stg) => {
              const stageBundles = bundles.filter((b) => b.current_stage === stg.key)
              return (
                <div
                  key={stg.key}
                  className="bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col min-w-[200px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 font-mono">
                    <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                      {stg.label}
                    </span>
                    <span className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full font-bold text-blue-600 dark:text-blue-400">
                      {stg.piece_count} pcs
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px]">
                    {stageBundles.length === 0 ? (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-8 font-mono">
                        No bundles in queue
                      </div>
                    ) : (
                      stageBundles.map((b) => (
                        <div
                          key={b.id}
                          className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition group shadow-sm"
                        >
                          <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {b.bundle_code}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                            {b.order_number} • {b.color_name} ({b.size_code})
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-between font-mono">
                            <span className="font-semibold text-slate-900 dark:text-white">Qty: {b.quantity} pcs</span>
                            <span className="text-[10px] text-slate-400">Plies: {b.ply_start}-{b.ply_end}</span>
                          </div>

                          {stg.key !== 'PACKED' && (
                            <button
                              onClick={() => executeScan(b.bundle_code, 'Pipeline Card')}
                              className="w-full mt-2 py-1 bg-slate-50 hover:bg-blue-600 hover:text-white dark:bg-slate-900 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 rounded text-[11px] font-semibold border border-slate-200 dark:border-slate-800 transition flex items-center justify-center gap-1 font-mono"
                            >
                              Advance Next <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PRINTABLE BUNDLE TICKETS */}
      {activeTab === 'printable-tickets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">Filter Order:</span>
              <select
                value={ticketOrderFilter}
                onChange={(e) => setTicketOrderFilter(e.target.value)}
                className="input w-40 text-xs py-1 font-mono"
              >
                <option value="ALL">All Orders</option>
                <option value="PO-8821">PO-8821 (Navy Polo)</option>
                <option value="PO-8822">PO-8822 (White Polo)</option>
              </select>

              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-2 font-mono">Filter Stage:</span>
              <select
                value={ticketStageFilter}
                onChange={(e) => setTicketStageFilter(e.target.value)}
                className="input w-36 text-xs py-1 font-mono"
              >
                <option value="ALL">All Stages</option>
                <option value="CUTTING">Cutting</option>
                <option value="WASHING">Washing</option>
                <option value="SEWING_IN">Sewing In</option>
                <option value="SEWING_OUT_QC">Sewing QC</option>
                <option value="FINISHING">Finishing</option>
                <option value="PACKED">Packed</option>
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="btn-primary flex items-center gap-2 text-xs font-mono"
            >
              <Printer className="w-4 h-4" />
              <span>Print Selected Tickets (PDF)</span>
            </button>
          </div>

          {/* Printable Ticket Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2 print:gap-2">
            {bundles
              .filter(
                (b) =>
                  (ticketOrderFilter === 'ALL' || b.order_number === ticketOrderFilter) &&
                  (ticketStageFilter === 'ALL' || b.current_stage === ticketStageFilter)
              )
              .map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded-xl border-2 border-gray-900 shadow-md flex flex-col justify-between font-sans print:border-black print:shadow-none"
                >
                  {/* Ticket Header */}
                  <div className="border-b-2 border-gray-900 pb-2 mb-2 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-gray-700">
                        BLOOMWORKS GARMENTS LTD.
                      </div>
                      <div className="text-xs font-bold text-gray-900">
                        {b.style_code} • {b.order_number}
                      </div>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 bg-gray-900 text-white rounded">
                      SIZE: {b.size_code}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-3 gap-2 items-center my-2">
                    <div className="col-span-2 space-y-1 text-xs">
                      <div><span className="text-gray-500 text-[10px]">COLOR:</span> <span className="font-bold">{b.color_name}</span></div>
                      <div><span className="text-gray-500 text-[10px]">CUT #:</span> <span className="font-bold font-mono">{b.cut_number}</span></div>
                      <div><span className="text-gray-500 text-[10px]">BUNDLE:</span> <span className="font-bold font-mono">#{b.bundle_seq} of {b.total_bundles}</span></div>
                      <div><span className="text-gray-500 text-[10px]">QUANTITY:</span> <span className="font-black text-sm text-blue-700">{b.quantity} PCS</span></div>
                      <div><span className="text-gray-500 text-[10px]">PLY RANGE:</span> <span className="font-mono font-bold text-gray-900">{b.ply_start} - {b.ply_end}</span></div>
                    </div>

                    {/* High-Contrast Crisp QR Code */}
                    <div className="flex flex-col items-center justify-center p-1 bg-white border border-gray-300 rounded">
                      <QRCodeSVG
                        value={b.bundle_code}
                        size={84}
                        level="H"
                        includeMargin={false}
                      />
                      <span className="text-[8px] font-mono text-gray-500 mt-1">SCAN QR</span>
                    </div>
                  </div>

                  {/* Machine-Readable Barcode Strip */}
                  <div className="border-t-2 border-gray-900 pt-2 text-center">
                    <div className="font-mono text-[11px] font-bold tracking-widest text-gray-900">
                      *{b.bundle_code}*
                    </div>
                    <div className="text-[9px] text-gray-500 uppercase mt-0.5">
                      Verify ply integrity at sewing line input
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: GENERATE CUT BUNDLES */}
      {activeTab === 'generate' && (
        <div className="max-w-2xl card p-6 mx-auto">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg font-mono">
                Cut Order Bundle Generation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Generate serialized bundle tickets with automatic ply ranges from cutting lays
              </p>
            </div>
          </div>

          {genSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm flex items-center gap-2 font-mono">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {genSuccess}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Buyer Order #</label>
                <input
                  type="text"
                  value={genForm.order_number}
                  onChange={(e) => setGenForm({ ...genForm, order_number: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Style Code</label>
                <input
                  type="text"
                  value={genForm.style_code}
                  onChange={(e) => setGenForm({ ...genForm, style_code: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Color Name</label>
                <input
                  type="text"
                  value={genForm.color_name}
                  onChange={(e) => setGenForm({ ...genForm, color_name: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Size Code</label>
                <input
                  type="text"
                  value={genForm.size_code}
                  onChange={(e) => setGenForm({ ...genForm, size_code: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Cut Ticket #</label>
                <input
                  type="text"
                  value={genForm.cut_number}
                  onChange={(e) => setGenForm({ ...genForm, cut_number: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Total Garments to Cut</label>
                <input
                  type="number"
                  value={genForm.total_quantity}
                  onChange={(e) => setGenForm({ ...genForm, total_quantity: parseInt(e.target.value) || 0 })}
                  required
                  min="1"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Bundle Size (Pieces per Bundle)</label>
              <select
                value={genForm.bundle_size}
                onChange={(e) => setGenForm({ ...genForm, bundle_size: parseInt(e.target.value) })}
                className="input"
              >
                <option value="10">10 Pieces / Bundle</option>
                <option value="20">20 Pieces / Bundle (Standard)</option>
                <option value="25">25 Pieces / Bundle</option>
                <option value="50">50 Pieces / Bundle</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="btn-primary"
              >
                Generate & Allocate Bundles
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
