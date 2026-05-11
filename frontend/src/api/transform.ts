import type { MitmFlow, FlowSummary, FlowDetail } from '../types/flow'

export function toFlowSummary(f: MitmFlow): FlowSummary {
  const duration =
    f.response?.timestamp_end != null && f.request?.timestamp_start != null
      ? f.response.timestamp_end - f.request.timestamp_start
      : null

  return {
    id: f.id,
    type: f.type,
    intercepted: f.intercepted,
    marked: f.marked,
    isReplay: f.is_replay != null,
    timestamp: f.timestamp_created,
    method: f.request?.method ?? '',
    scheme: f.request?.scheme ?? '',
    host: f.request?.pretty_host ?? f.request?.host ?? '',
    port: f.request?.port ?? 0,
    path: f.request?.path ?? '',
    statusCode: f.response?.status_code ?? null,
    responseSize: f.response?.contentLength ?? null,
    duration,
  }
}

export function toFlowDetail(f: MitmFlow): FlowDetail {
  return {
    ...toFlowSummary(f),
    httpVersion: f.request?.http_version ?? '',
    requestHeaders: f.request?.headers ?? [],
    responseHeaders: f.response?.headers ?? null,
    responseReason: f.response?.reason ?? null,
    comment: f.comment,
    error: f.error ?? null,
  }
}
