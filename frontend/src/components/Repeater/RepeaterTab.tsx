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
      setResponse({ text: 'Error sending request', language: 'plaintext', statusCode: null, loading: false })
    } finally {
      setSending(false)
    }
  }

  if (!flow) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-xs">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Request editor */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <span className="text-xs text-gray-400 font-mono truncate flex-1">
          {flow.method} {flow.scheme}://{flow.host}{flow.path}
        </span>
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-3 py-0.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Request body editor */}
        <div className="flex flex-col w-1/2 border-r border-gray-800 overflow-hidden">
          <div className="px-2 py-1 bg-gray-900 border-b border-gray-800 text-xs text-gray-500 flex-shrink-0">
            Request Body
          </div>
          <div className="flex-1 min-h-0">
            <MonacoEditor
              value={requestBody}
              language="plaintext"
              readOnly={false}
              onChange={setRequestBody}
            />
          </div>
        </div>

        {/* Response */}
        <div className="flex flex-col w-1/2 overflow-hidden">
          <div className="px-2 py-1 bg-gray-900 border-b border-gray-800 text-xs flex-shrink-0 flex items-center gap-2">
            <span className="text-gray-500">Response</span>
            {response.statusCode !== null && (
              <span className={`font-mono ${response.statusCode >= 400 ? 'text-red-400' : 'text-green-400'}`}>
                {response.statusCode}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0 relative">
            {response.loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10 text-gray-600 text-xs">
                Waiting for response…
              </div>
            )}
            {!response.loading && !response.text && (
              <div className="flex items-center justify-center h-full text-gray-600 text-xs">
                Hit Send to see response
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
