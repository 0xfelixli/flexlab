import { useState } from 'react'
import { useFlowStore } from '../../stores/flowStore'
import { resumeFlow, killFlow } from '../../api/flows'
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
      <div className="flex h-full items-center justify-center bg-[#0a0e15] px-6 text-center">
        <div>
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-lg border border-slate-700/70 bg-slate-900 text-[12px] font-semibold text-slate-400">
            INS
          </div>
          <div className="text-sm font-medium text-slate-300">Select a flow</div>
          <div className="mt-1 text-xs text-slate-500">
            Request and response details will appear here.
          </div>
        </div>
      </div>
    )
  }

  const handleResume = () => resumeFlow(flow.id).catch(() => {})
  const handleKill = () => killFlow(flow.id).catch(() => {})

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-10 flex-shrink-0 items-center border-b border-slate-800/80 bg-[#0b1018] text-xs">
        {(['request', 'response'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'h-full flex-shrink-0 border-b-2 px-4 capitalize transition-colors',
              tab === t
                ? 'border-cyan-300 bg-cyan-400/[0.05] text-cyan-100'
                : 'border-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300',
            ].join(' ')}
          >
            {t}
            {t === 'response' && flow.statusCode !== null && (
              <span className={`ml-1.5 font-mono ${flow.statusCode >= 400 ? 'text-red-300' : flow.statusCode >= 300 ? 'text-sky-300' : 'text-emerald-300'}`}>
                {flow.statusCode}
              </span>
            )}
          </button>
        ))}

        {flow.intercepted && (
          <div className="ml-auto flex items-center gap-1 pr-2">
            <button
              onClick={handleResume}
              className="h-7 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-300/15"
            >
              Resume
            </button>
            <button
              onClick={handleKill}
              className="h-7 rounded-md border border-red-300/30 bg-red-300/10 px-2.5 text-xs font-medium text-red-200 transition-colors hover:bg-red-300/15"
            >
              Kill
            </button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1">
        {tab === 'request' ? (
          <RequestViewer flow={flow} />
        ) : (
          <ResponseViewer flow={flow} />
        )}
      </div>
    </div>
  )
}
