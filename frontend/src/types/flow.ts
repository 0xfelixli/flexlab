// ─── mitmproxy wire types ────────────────────────────────────────────────────
// Matches flow_to_json() in mitmproxy/tools/web/app.py exactly.

export interface MitmCert {
  keyinfo: [string, number]
  sha256: string
  notbefore: number
  notafter: number
  serial: string
  subject: [string, string][]
  issuer: [string, string][]
  altnames: string[]
}

export interface MitmClientConn {
  id: string
  peername: [string, number] | null
  sockname: [string, number] | null
  tls_established: boolean
  cert: MitmCert | null
  sni: string | null
  cipher: string | null
  alpn: string | null
  tls_version: string | null
  timestamp_start: number | null
  timestamp_tls_setup: number | null
  timestamp_end: number | null
}

export interface MitmServerConn {
  id: string
  peername: [string, number] | null
  sockname: [string, number] | null
  address: [string, number] | null
  tls_established: boolean
  cert: MitmCert | null
  sni: string | null
  cipher: string | null
  alpn: string | null
  tls_version: string | null
  timestamp_start: number | null
  timestamp_tcp_setup: number | null
  timestamp_tls_setup: number | null
  timestamp_end: number | null
}

export interface MitmRequest {
  method: string
  scheme: string
  host: string
  port: number
  path: string
  http_version: string
  headers: [string, string][]
  contentLength: number | null
  contentHash: string | null
  timestamp_start: number | null
  timestamp_end: number | null
  pretty_host: string
}

export interface MitmResponse {
  http_version: string
  status_code: number
  reason: string
  headers: [string, string][]
  contentLength: number | null
  contentHash: string | null
  timestamp_start: number | null
  timestamp_end: number | null
  trailers?: [string, string][]
}

export interface MitmFlow {
  id: string
  intercepted: boolean
  is_replay: 'client' | 'server' | null
  type: 'http' | 'tcp' | 'udp' | 'dns'
  modified: boolean
  marked: string // emoji string or ""
  comment: string
  timestamp_created: number
  client_conn?: MitmClientConn
  server_conn?: MitmServerConn
  error?: { msg: string; timestamp: number }
  // HTTP-specific
  request?: MitmRequest
  response?: MitmResponse
}

// ─── Internal app types ───────────────────────────────────────────────────────

/** Lightweight representation used in the flow list. */
export interface FlowSummary {
  id: string
  type: 'http' | 'tcp' | 'udp' | 'dns'
  intercepted: boolean
  marked: string
  isReplay: boolean
  timestamp: number
  // HTTP fields
  method: string
  scheme: string
  host: string
  port: number
  path: string
  statusCode: number | null
  responseSize: number | null
  /** Seconds from request start to response end. Null if response not yet received. */
  duration: number | null
}

/** Full representation used in the detail panel. Body content is NOT included — fetch lazily. */
export interface FlowDetail extends FlowSummary {
  httpVersion: string
  requestHeaders: [string, string][]
  responseHeaders: [string, string][] | null
  responseReason: string | null
  comment: string
  error: { msg: string; timestamp: number } | null
}
