import { useUiStore } from '../../stores/uiStore'
import { useFlowStore } from '../../stores/flowStore'
import { duplicateFlow } from '../../api/flows'
import { DetailPanel } from '../FlowDetail/DetailPanel'
import { RepeaterTab } from '../Repeater/RepeaterTab'

export function RightPanel() {
  const { repeaterTabs, activeRepeaterId, openRepeaterTab, closeRepeaterTab, setActiveRepeater } = useUiStore()
  const selectedId = useFlowStore((s) => s.selectedId)
  const flows = useFlowStore((s) => s.flows)

  // null = Inspector tab is active
  const showInspector = activeRepeaterId === null

  const handleSendToRepeater = async () => {
    if (!selectedId) return
    const flow = flows.get(selectedId)
    if (!flow) return
    const dupId = (await duplicateFlow(selectedId)).replace(/^"|"$/g, '')
    const label = `${flow.method} ${flow.path}`
    openRepeaterTab(dupId, label)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-10 flex-shrink-0 items-center overflow-x-auto border-b border-slate-800/80 bg-[#0f1622] text-xs">
        <button
          onClick={() => setActiveRepeater(null)}
          className={[
            'h-full flex-shrink-0 border-b-2 px-4 font-medium transition-colors',
            showInspector
              ? 'border-cyan-300 bg-cyan-400/[0.06] text-slate-100'
              : 'border-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300',
          ].join(' ')}
        >
          Inspector
        </button>

        {repeaterTabs.map((tab) => (
          <div
            key={tab.flowId}
            className={[
              'flex h-full flex-shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-3 transition-colors',
              activeRepeaterId === tab.flowId
                ? 'border-orange-300 bg-orange-400/[0.06] text-slate-100'
                : 'border-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300',
            ].join(' ')}
            onClick={() => setActiveRepeater(tab.flowId)}
          >
            <span className="mr-0.5 rounded border border-orange-300/20 bg-orange-300/10 px-1 font-mono text-[10px] text-orange-200">
              R
            </span>
            <span className="max-w-32 truncate">{tab.label}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeRepeaterTab(tab.flowId) }}
              className="ml-1 rounded px-1 text-slate-600 hover:bg-slate-700/60 hover:text-slate-300"
              aria-label={`Close ${tab.label}`}
            >
              ×
            </button>
          </div>
        ))}

        {selectedId && showInspector && (
          <button
            onClick={handleSendToRepeater}
            className="ml-auto mr-2 h-7 flex-shrink-0 rounded-md border border-orange-300/30 bg-orange-300/10 px-2.5 text-xs font-medium text-orange-200 transition-colors hover:bg-orange-300/15"
          >
            Send to Repeater
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 bg-[#0a0e15]">
        {showInspector ? (
          <DetailPanel />
        ) : (
          <RepeaterTab flowId={activeRepeaterId!} />
        )}
      </div>
    </div>
  )
}
