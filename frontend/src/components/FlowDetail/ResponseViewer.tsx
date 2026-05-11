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
  text: string
  language: string
  loading: boolean
}

export function ResponseViewer({ flow }: ResponseViewerProps) {
  const [body, setBody] = useState<BodyState>({ text: '', language: 'plaintext', loading: false })

  useEffect(() => {
    if (flow.statusCode === null) return

    setBody((b) => ({ ...b, loading: true }))
    fetchContent(flow.id, 'response')
      .then((cv) => setBody({ text: cv.text, language: syntaxToLanguage(cv.syntax_highlight), loading: false }))
      .catch(() => setBody({ text: '', language: 'plaintext', loading: false }))
  }, [flow.id, flow.statusCode])

  if (flow.statusCode === null) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-xs">
        No response yet
      </div>
    )
  }

  const statusLine = formatStatusLine(
    flow.httpVersion,
    flow.statusCode,
    flow.responseReason ?? '',
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Status line */}
      <div className="flex-shrink-0 px-3 py-1.5 bg-gray-900 border-b border-gray-800 font-mono text-xs truncate">
        <span className={statusColor(flow.statusCode)}>{statusLine}</span>
      </div>

      {/* Headers */}
      <div className="flex-shrink-0 max-h-36 overflow-y-auto border-b border-gray-800 bg-gray-950">
        {(flow.responseHeaders ?? []).map(([name, value], i) => (
          <div key={i} className="flex px-3 py-0.5 text-xs hover:bg-gray-900/50">
            <span className="text-gray-500 flex-shrink-0 w-44 truncate">{name}</span>
            <span className="text-gray-300 truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 relative">
        {body.loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10 text-gray-600 text-xs">
            Loading…
          </div>
        )}
        <MonacoEditor value={body.text} language={body.language} />
      </div>
    </div>
  )
}
