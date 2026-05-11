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
      className="flex flex-col h-screen w-screen bg-gray-950 text-gray-100 overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      <Toolbar onClear={onClear} />

      <div className="flex flex-1 overflow-hidden">
        {/* Flow list panel */}
        <div
          className="flex-shrink-0 overflow-hidden flex flex-col"
          style={{ width: listWidth }}
        >
          {listPanel}
        </div>

        {/* Resize handle */}
        <div
          className="w-1 flex-shrink-0 cursor-col-resize bg-gray-800 hover:bg-blue-600 active:bg-blue-500 transition-colors"
          onMouseDown={onHandleMouseDown}
        />

        {/* Detail panel */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {detailPanel}
        </div>
      </div>
    </div>
  )
}
