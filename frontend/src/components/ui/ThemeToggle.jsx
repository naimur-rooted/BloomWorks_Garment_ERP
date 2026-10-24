import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ variant = 'pill' }) {
  const { theme, toggleTheme, isDark } = useTheme()

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
        title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600" />}
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all shadow-sm"
      title={isDark ? 'Switch to Corporate Light Mode' : 'Switch to Refined Dark Mode'}
      aria-label="Toggle theme"
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Moon size={14} className="text-indigo-400 transition-transform duration-200 rotate-0" />
        ) : (
          <Sun size={14} className="text-amber-500 transition-transform duration-200 rotate-0" />
        )}
      </div>
      <span className="font-medium tracking-tight">
        {isDark ? 'Dark' : 'Light'}
      </span>
      {/* Mini toggle switch track */}
      <div className="w-7 h-4 rounded-full bg-slate-300 dark:bg-slate-700 relative transition-colors duration-200 flex items-center px-0.5 ml-0.5">
        <div
          className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm ${
            isDark ? 'translate-x-3 bg-indigo-400' : 'translate-x-0 bg-white'
          }`}
        />
      </div>
    </button>
  )
}
