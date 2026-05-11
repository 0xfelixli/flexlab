import { useEffect, useState } from 'react'
import { fetchContent, updateFlow, replayFlow } from '../../api/flows'
import { MonacoEditor } from '../FlowDetail/MonacoEditor'
import { syntaxToLanguage } from '../FlowDetail/utils'
import { useFlowStore } from '../../stores/flowStore'

interface RepeaterTabProps {
  flowId: string
}

interface ResponseState {
  text: string
  language: string
  statusCode: number | null
  loading: boolean
}

export function RepeaterTab({ flowId }: RepeaterTabProps) {
  const flow = useFlowStore((s) => s.flows.get(flowId))
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState<ResponseState>({
    text: '',
    language: 'plaintext',
    statusCode: null,
    loading: false,
  })
  const [sending, setSending] = useState(false)

  // Load initial request body
  useEffect(() => {
    fetchContent(flowId, 'request')
      .then((cv) => setRequestBody(cv.text))
      .catch(() => {})
  }, [flowId])

  const handleSend = async () => {
    setSending(true)
    setResponse((r) => ({ ...r, loading: true }))
    try {
      // Patch body then replay
      await updateFlow(flowId, { request: { content: requestBody } })
      await replayFlow(flowId)
      // Poll for response — WebSocket will update the store
      // Wait briefly then fetch response content
      await new Promise((r) => setTimeout(r, 600))
      const cv = await fetchContent(flowId, 'response')
      const updatedFlow = useFlowStore.getState().flows.get(flowId)
      setResponse({
        text: cv.text,
        language: syntaxToLanguage(cv.syntax_highlight),
        statusCode: updatedFlow?.statusCode ?? null,
        loading: false,
      })
    } catch {
      setResponse({
        text: 'Error sending request',
        language: 'plaintext',
        statusCode: null,
        loading: false,
      })
    } finally {
      setSending(false)
    }
  }

  if (!flow) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0e15] text-xs text-slate-500">
        Loading repeater flow…
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0e15]">
      <div className="flex h-10 flex-shrink-0 items-center gap-2 border-b border-slate-800/80 bg-[#0f1622] px-3">
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-slate-300">
          {flow.method} {flow.scheme}://{flow.host}{flow.path}
        </span>
        <button
          onClick={handleSend}
          disabled={sending}
          className="h-7 flex-shrink-0 rounded-md bg-cyan-500 px-3 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex w-1/2 flex-col overflow-hidden border-r border-slate-800/80">
          <div className="flex h-8 flex-shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0b1018] px-3 text-xs">
            <span className="font-medium text-slate-300">Request Body</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
              editable
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <MonacoEditor
              value={requestBody}
              language="plaintext"
              readOnly={false}
              onChange={setRequestBody}
            />
          </div>
        </div>

        <div className="flex w-1/2 flex-col overflow-hidden">
          <div className="flex h-8 flex-shrink-0 items-center gap-2 border-b border-slate-800/80 bg-[#0b1018] px-3 text-xs">
            <span className="font-medium text-slate-300">Response</span>
            {response.statusCode !== null && (
              <span className={`rounded border border-slate-700/70 bg-slate-950/60 px-1.5 py-0.5 font-mono text-[11px] ${response.statusCode >= 400 ? 'text-red-300' : 'text-emerald-300'}`}>
                {response.statusCode}
              </span>
            )}
          </div>
          <div className="relative min-h-0 flex-1">
            {response.loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0e15]/90 text-xs text-slate-500">
                Waiting for response…
              </div>
            )}
            {!response.loading && !response.text && (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <div>
                  <div className="text-sm font-medium text-slate-300">Ready to replay</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Edit the request body, then send it to inspect the response.
                  </div>
                </div>
              </div>
            )}
            {response.text && (
              <MonacoEditor value={response.text} language={response.language} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
