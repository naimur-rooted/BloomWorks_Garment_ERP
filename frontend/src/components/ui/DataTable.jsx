import { useState } from 'react'
import { Search, Plus } from 'lucide-react'

export default function DataTable({ columns, data, onAdd, addLabel, searchPlaceholder, loading }) {
  const [search, setSearch] = useState('')

  const filteredData = data?.filter?.((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  ) || []

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 transition-colors">
        <div className="relative max-w-full sm:max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={searchPlaceholder || 'Search table...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 transition-colors"
          />
        </div>
        {addLabel && (
          <button
            onClick={onAdd}
            className="btn-primary text-xs w-full sm:w-auto"
          >
            <Plus size={14} />
            <span>{addLabel}</span>
          </button>
        )}
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900/40 divide-y divide-slate-200 dark:divide-slate-800/80 transition-colors">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  Loading records...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No records matching search query
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
