import { useUiStore } from '../../stores/uiStore'
import { useFlowStore } from '../../stores/flowStore'

interface ToolbarProps {
  onClear: () => void
}

export function Toolbar({ onClear }: ToolbarProps) {
  const interceptEnabled = useUiStore((s) => s.interceptEnabled)
  const toggleIntercept = useUiStore((s) => s.toggleIntercept)
  const connectionStatus = useFlowStore((s) => s.connectionStatus)
  const flowCount = useFlowStore((s) => s.flows.size)

  const statusClasses = {
    idle: 'bg-slate-500',
    connecting: 'bg-sky-400',
    connected: 'bg-emerald-400',
    disconnected: 'bg-red-400',
  }[connectionStatus]

  return (
    <div className="flex h-11 flex-shrink-0 items-center gap-2 border-b border-slate-800/90 bg-[#0c111a]/95 px-3 shadow-[0_1px_0_rgba(255,255,255,0.03)]">
      <div className="mr-3 flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded-md border border-cyan-400/20 bg-cyan-400/10 text-[11px] font-bold text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
          F
        </div>
        <div className="leading-none">
          <div className="text-[13px] font-semibold tracking-wide text-slate-100">
            FlexLab
          </div>
          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
            traffic workbench
          </div>
        </div>
      </div>

      <div className="flex h-6 items-center gap-2 rounded-md border border-slate-700/70 bg-slate-950/50 px-2 text-[11px] font-medium text-slate-300">
        <span className={`h-1.5 w-1.5 rounded-full ${statusClasses}`} />
        <span>mitmweb</span>
        <span className="text-slate-500">{connectionStatus}</span>
      </div>

      <div className="mx-1 h-5 w-px bg-slate-800" />

      <button
        onClick={toggleIntercept}
        className={[
          'h-7 rounded-md px-2.5 text-xs font-medium transition-colors',
          interceptEnabled
            ? 'border border-amber-400/40 bg-amber-400/15 text-amber-200 hover:bg-amber-400/20'
            : 'border border-slate-700/70 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:bg-slate-800',
        ].join(' ')}
      >
        {interceptEnabled ? 'Intercepting' : 'Intercept'}
      </button>

      <button
        className="h-7 rounded-md border border-slate-700/70 bg-slate-900/70 px-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800"
        onClick={onClear}
      >
        Clear
      </button>

      <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-500">
        <span>
          <span className="font-mono text-slate-300">{flowCount}</span> flows
        </span>
        <span className="hidden sm:inline">Native mitmweb API</span>
      </div>
    </div>
  )
}
