export function formatBytes(bytes: number | null): string {
  if (bytes === null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-400',
  POST: 'text-blue-400',
  PUT: 'text-yellow-400',
  PATCH: 'text-orange-400',
  DELETE: 'text-red-400',
  HEAD: 'text-purple-400',
  OPTIONS: 'text-cyan-400',
}

export function methodColor(method: string): string {
  return METHOD_COLORS[method] ?? 'text-gray-400'
}

export function statusColor(code: number | null): string {
  if (code === null) return 'text-gray-500'
  if (code < 300) return 'text-green-400'
  if (code < 400) return 'text-blue-400'
  if (code < 500) return 'text-yellow-400'
  return 'text-red-400'
}
