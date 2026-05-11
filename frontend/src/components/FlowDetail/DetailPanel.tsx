import { useState } from 'react'
import { useFlowStore } from '../../stores/flowStore'
import { RequestViewer } from './RequestViewer'
import { ResponseViewer } from './ResponseViewer'

type Tab = 'request' | 'response'

export function DetailPanel() {
  const flows = useFlowStore((s) => s.flows)
  const selectedId = useFlowStore((s) => s.selectedId)
  const flow = selectedId ? flows.get(selectedId) : null
  const [tab, setTab] = useState<Tab>('request')

  if (!flow) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-xs">
        Select a flow to inspect
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex-shrink-0 flex bg-gray-900 border-b border-gray-800 text-xs">
        {(['request', 'response'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-2 capitalize transition-colors border-b-2',
              tab === t
                ? 'text-blue-400 border-blue-500 bg-gray-950'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-800',
            ].join(' ')}
          >
            {t}
            {t === 'response' && flow.statusCode !== null && (
              <span className={`ml-1.5 font-mono ${flow.statusCode >= 400 ? 'text-red-400' : flow.statusCode >= 300 ? 'text-blue-400' : 'text-green-400'}`}>
                {flow.statusCode}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0">
        {tab === 'request' ? (
          <RequestViewer flow={flow} />
        ) : (
          <ResponseViewer flow={flow} />
        )}
      </div>
    </div>
  )
}
