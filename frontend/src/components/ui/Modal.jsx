import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative card w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-100 shadow-xl transition-colors">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10 transition-colors">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-4 sm:px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
