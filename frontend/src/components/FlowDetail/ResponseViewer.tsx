import { useEffect, useState } from 'react'
import { fetchContent } from '../../api/flows'
import { syntaxToLanguage, formatStatusLine } from './utils'
import { MonacoEditor } from './MonacoEditor'
import { statusColor } from '../FlowList/utils'
import type { FlowDetail } from '../../types/flow'

interface ResponseViewerProps {
  flow: FlowDetail
}

interface BodyState {
  flowId: string | null
  text: string
  language: string
}

export function ResponseViewer({ flow }: ResponseViewerProps) {
  const [body, setBody] = useState<BodyState>({
    flowId: null,
    text: '',
    language: 'plaintext',
  })

  useEffect(() => {
    if (flow.statusCode === null) return

    let cancelled = false
    fetchContent(flow.id, 'response')
      .then((cv) => {
        if (!cancelled) {
          setBody({
            flowId: flow.id,
            text: cv.text,
            language: syntaxToLanguage(cv.syntax_highlight),
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBody({ flowId: flow.id, text: '', language: 'plaintext' })
        }
      })

    return () => {
      cancelled = true
    }
  }, [flow.id, flow.statusCode])

  if (flow.statusCode === null) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0e15] px-6 text-center">
        <div>
          <div className="text-sm font-medium text-slate-300">No response yet</div>
          <div className="mt-1 text-xs text-slate-500">
            The response viewer will update when this flow receives a response.
          </div>
        </div>
      </div>
    )
  }

  const statusLine = formatStatusLine(
    flow.httpVersion,
    flow.statusCode,
    flow.responseReason ?? '',
  )
  const loading = body.flowId !== flow.id

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0e15]">
      <div className="flex h-9 flex-shrink-0 items-center gap-2 border-b border-slate-800/80 bg-[#0f1622] px-3">
        <span className={`rounded border border-slate-700/70 bg-slate-950/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold ${statusColor(flow.statusCode)}`}>
          {flow.statusCode}
        </span>
        <span className="truncate font-mono text-[12px] text-slate-300">{statusLine}</span>
      </div>

      <div className="max-h-40 flex-shrink-0 overflow-y-auto border-b border-slate-800/80 bg-[#0b1018] py-1">
        {(flow.responseHeaders ?? []).map(([name, value], i) => (
          <div key={i} className="flex px-3 py-1 text-xs hover:bg-slate-800/35">
            <span className="w-44 flex-shrink-0 truncate font-mono text-[11px] text-slate-500">{name}</span>
            <span className="truncate text-slate-300">{value}</span>
          </div>
        ))}
      </div>

      <div className="relative min-h-0 flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0e15]/90 text-xs text-slate-500">
            Loading…
          </div>
        )}
        <MonacoEditor value={body.text} language={body.language} />
      </div>
    </div>
  )
}
