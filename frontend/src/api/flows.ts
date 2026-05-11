import { api } from './client'
import type { MitmFlow } from '../types/flow'

export interface ContentView {
  text: string
  view_name: string
  syntax_highlight: string
  description: string
}

export async function fetchFlows(): Promise<MitmFlow[]> {
  return api.get('/flows').json<MitmFlow[]>()
}

export async function fetchContent(
  flowId: string,
  message: 'request' | 'response',
  view = 'auto',
): Promise<ContentView> {
  return api.get(`/flows/${flowId}/${message}/content/${view}`).json<ContentView>()
}

export async function resumeFlow(flowId: string): Promise<void> {
  await api.post(`/flows/${flowId}/resume`)
}

export async function killFlow(flowId: string): Promise<void> {
  await api.post(`/flows/${flowId}/kill`)
}

export async function replayFlow(flowId: string): Promise<void> {
  await api.post(`/flows/${flowId}/replay`)
}

export async function duplicateFlow(flowId: string): Promise<string> {
  return api.post(`/flows/${flowId}/duplicate`).text()
}

export async function updateFlow(
  flowId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await api.put(`/flows/${flowId}`, { json: patch })
}

export async function setIntercept(expr: string): Promise<void> {
  await api.put('/options', { json: { intercept: expr } })
}

export async function clearFlows(): Promise<void> {
  await api.post('/clear')
}
