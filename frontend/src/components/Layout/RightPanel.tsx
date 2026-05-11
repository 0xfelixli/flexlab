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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top tab bar */}
      <div className="flex-shrink-0 flex items-center bg-gray-900 border-b border-gray-800 text-xs overflow-x-auto">
        {/* Inspector tab */}
        <button
          onClick={() => setActiveRepeater(null as unknown as string)}
          className={[
            'px-3 py-2 flex-shrink-0 transition-colors border-b-2',
            showInspector
              ? 'text-gray-200 border-blue-500'
              : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-800',
          ].join(' ')}
        >
          Inspector
        </button>

        {/* Repeater tabs */}
        {repeaterTabs.map((tab) => (
          <div
            key={tab.flowId}
            className={[
              'flex items-center gap-1 px-3 py-2 flex-shrink-0 cursor-pointer border-b-2 transition-colors',
              activeRepeaterId === tab.flowId
                ? 'text-gray-200 border-orange-400'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-800',
            ].join(' ')}
            onClick={() => setActiveRepeater(tab.flowId)}
          >
            <span className="font-mono text-orange-400/70 mr-0.5">R</span>
            <span className="max-w-32 truncate">{tab.label}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeRepeaterTab(tab.flowId) }}
              className="text-gray-600 hover:text-gray-400 ml-1 leading-none"
            >
              ×
            </button>
          </div>
        ))}

        {/* Send to Repeater button */}
        {selectedId && showInspector && (
          <button
            onClick={handleSendToRepeater}
            className="ml-auto mr-2 px-2 py-0.5 flex-shrink-0 rounded text-xs text-orange-400 border border-orange-400/30 hover:bg-orange-400/10 transition-colors"
          >
            Send to Repeater
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {showInspector ? (
          <DetailPanel />
        ) : (
          <RepeaterTab flowId={activeRepeaterId!} />
        )}
      </div>
    </div>
  )
}
