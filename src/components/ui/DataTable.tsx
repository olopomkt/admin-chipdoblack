import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react'
import { TableSkeleton } from './Skeleton'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: string[]
  pageSize?: number
  onRowClick?: (row: T) => void
  exportable?: boolean
  exportFilename?: string
  emptyMessage?: string
  filters?: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  searchKeys,
  pageSize = 20,
  onRowClick,
  exportable,
  exportFilename = 'export',
  emptyMessage = 'Nenhum registro encontrado',
  filters,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (!search) return data
    const lower = search.toLowerCase()
    const keys = searchKeys || columns.map(c => c.key)
    return data.filter(row =>
      keys.some(k => String(row[k] ?? '').toLowerCase().includes(lower))
    )
  }, [data, search, searchKeys, columns])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const exportCSV = () => {
    const header = columns.map(c => c.label).join(',')
    const rows = filtered.map(row =>
      columns.map(c => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFilename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <TableSkeleton rows={pageSize > 10 ? 10 : pageSize} cols={columns.length} />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {searchable && (
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt2" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt0 placeholder-txt2 focus:outline-none focus:border-ember/50"
            />
          </div>
        )}
        {filters}
        {exportable && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt1 hover:text-txt0 transition-colors"
          >
            <Download size={14} />
            CSV
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-coal">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg3 border-b border-coal">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  className={`px-4 py-3 text-left text-txt2 font-medium ${
                    col.sortable !== false ? 'cursor-pointer hover:text-txt0 select-none' : ''
                  } ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-txt2">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-coal/50 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-bg3' : ''
                  }`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 text-txt1 ${col.className || ''}`}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-txt2">
          <span>
            {sorted.length} registro{sorted.length !== 1 ? 's' : ''} — Página {page + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-bg3 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded hover:bg-bg3 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
