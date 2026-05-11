import { useFlowStore } from '../../stores/flowStore'
import { RequestViewer } from './RequestViewer'

export function DetailPanel() {
  const flows = useFlowStore((s) => s.flows)
  const selectedId = useFlowStore((s) => s.selectedId)
  const flow = selectedId ? flows.get(selectedId) : null

  if (!flow) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-xs">
        Select a flow to inspect
      </div>
    )
  }

  return <RequestViewer flow={flow} />
}
