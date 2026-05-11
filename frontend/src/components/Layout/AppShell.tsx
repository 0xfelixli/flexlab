import { useState, useRef, useCallback } from 'react'
import { Toolbar } from './Toolbar'

const MIN_LIST_WIDTH = 220
const MAX_LIST_WIDTH = 700
const DEFAULT_LIST_WIDTH = 420

interface AppShellProps {
  listPanel: React.ReactNode
  detailPanel: React.ReactNode
  onClear: () => void
}

export function AppShell({ listPanel, detailPanel, onClear }: AppShellProps) {
  const [listWidth, setListWidth] = useState(DEFAULT_LIST_WIDTH)
  const dragging = useRef(false)

  const onHandleMouseDown = useCallback(() => {
    dragging.current = true
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    setListWidth((w) =>
      Math.max(MIN_LIST_WIDTH, Math.min(MAX_LIST_WIDTH, w + e.movementX)),
    )
  }, [])

  const stopDrag = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden bg-[#090c12] text-slate-100 antialiased"
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      <Toolbar onClear={onClear} />

      <div className="flex min-h-0 flex-1 overflow-hidden border-t border-white/[0.03]">
        <div
          className="flex flex-shrink-0 flex-col overflow-hidden border-r border-slate-800/80 bg-[#0d121b]"
          style={{ width: listWidth }}
        >
          {listPanel}
        </div>

        <div
          className="group w-1 flex-shrink-0 cursor-col-resize bg-[#111827] transition-colors hover:bg-cyan-500/60 active:bg-cyan-400"
          onMouseDown={onHandleMouseDown}
        >
          <div className="mx-auto h-full w-px bg-white/5 group-hover:bg-cyan-200/60" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#0a0e15]">
          {detailPanel}
        </div>
      </div>
    </div>
  )
}
