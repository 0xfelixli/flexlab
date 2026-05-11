interface ToolbarProps {
  onClear: () => void
}

export function Toolbar({ onClear }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 h-9 px-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
      <span className="text-sm font-semibold text-gray-100 tracking-wide mr-3">
        FlexLab
      </span>

      <div className="w-px h-4 bg-gray-700 mx-1" />

      <button
        className="px-2 py-0.5 text-xs rounded text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  )
}
