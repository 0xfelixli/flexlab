import { useMemo, useRef } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useFlowStore } from '../../stores/flowStore'
import { formatBytes, formatDuration, methodColor, statusColor } from './utils'
import type { FlowSummary } from '../../types/flow'

const col = createColumnHelper<FlowSummary>()

const columns = [
  col.accessor('method', {
    header: 'Method',
    size: 72,
    cell: (info) => (
      <span className={`font-mono text-xs font-semibold ${methodColor(info.getValue())}`}>
        {info.getValue()}
      </span>
    ),
  }),
  col.accessor('host', {
    header: 'Host',
    size: 180,
    cell: (info) => (
      <span className="text-gray-300 truncate block">{info.getValue()}</span>
    ),
  }),
  col.accessor('path', {
    header: 'Path',
    size: 999, // flex-grow
    cell: (info) => (
      <span className="text-gray-400 truncate block font-mono text-xs">
        {info.getValue()}
      </span>
    ),
  }),
  col.accessor('statusCode', {
    header: 'Status',
    size: 56,
    cell: (info) => {
      const code = info.getValue()
      return (
        <span className={`font-mono text-xs ${statusColor(code)}`}>
          {code ?? '—'}
        </span>
      )
    },
  }),
  col.accessor('responseSize', {
    header: 'Size',
    size: 72,
    cell: (info) => (
      <span className="text-gray-500 text-xs tabular-nums">
        {formatBytes(info.getValue())}
      </span>
    ),
  }),
  col.accessor('duration', {
    header: 'Time',
    size: 72,
    cell: (info) => (
      <span className="text-gray-500 text-xs tabular-nums">
        {formatDuration(info.getValue())}
      </span>
    ),
  }),
]

const ROW_HEIGHT = 28

export function FlowList() {
  const flows = useFlowStore((s) => s.flows)
  const selectedId = useFlowStore((s) => s.selectedId)
  const selectFlow = useFlowStore((s) => s.selectFlow)

  // Sort newest first
  const data = useMemo(
    () => Array.from(flows.values()).sort((a, b) => b.timestamp - a.timestamp),
    [flows],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const { rows } = table.getRowModel()
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  })

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs">
      {/* Header */}
      <div className="flex flex-shrink-0 bg-gray-900 border-b border-gray-800 text-gray-500 uppercase tracking-wide">
        {table.getFlatHeaders().map((header) => (
          <div
            key={header.id}
            className="px-2 py-1.5 font-medium flex-shrink-0 truncate"
            style={{ width: header.column.columnDef.size === 999 ? undefined : header.column.columnDef.size, flex: header.column.columnDef.size === 999 ? '1 1 0' : undefined }}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </div>
        ))}
      </div>

      {/* Virtual rows */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const row = rows[virtualItem.index]
            const flow = row.original
            const isSelected = flow.id === selectedId
            const isIntercepted = flow.intercepted

            return (
              <div
                key={row.id}
                className={[
                  'flex items-center absolute inset-x-0 cursor-pointer select-none border-b border-gray-800/50',
                  isSelected
                    ? 'bg-blue-900/40 border-l-2 border-l-blue-500'
                    : isIntercepted
                      ? 'bg-yellow-900/20 border-l-2 border-l-yellow-500 hover:bg-yellow-900/30'
                      : 'hover:bg-gray-800/60',
                ].join(' ')}
                style={{ top: virtualItem.start, height: ROW_HEIGHT }}
                onClick={() => selectFlow(flow.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className="px-2 overflow-hidden flex-shrink-0"
                    style={{
                      width: cell.column.columnDef.size === 999 ? undefined : cell.column.columnDef.size,
                      flex: cell.column.columnDef.size === 999 ? '1 1 0' : undefined,
                      minWidth: 0,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer: flow count */}
      <div className="flex-shrink-0 px-2 py-1 bg-gray-900 border-t border-gray-800 text-gray-600 text-xs">
        {flows.size} flows
      </div>
    </div>
  )
}
