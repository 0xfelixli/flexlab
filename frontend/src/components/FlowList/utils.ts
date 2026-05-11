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
  GET: 'text-green-300 bg-green-400/10 border-green-400/20',
  POST: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
  PUT: 'text-yellow-300 bg-yellow-400/10 border-yellow-400/20',
  PATCH: 'text-orange-300 bg-orange-400/10 border-orange-400/20',
  DELETE: 'text-red-300 bg-red-400/10 border-red-400/20',
  HEAD: 'text-violet-300 bg-violet-400/10 border-violet-400/20',
  OPTIONS: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',
}

export function methodColor(method: string): string {
  return METHOD_COLORS[method] ?? 'text-gray-300 bg-gray-400/10 border-gray-400/20'
}

export function statusColor(code: number | null): string {
  if (code === null) return 'text-gray-500'
  if (code < 300) return 'text-green-300'
  if (code < 400) return 'text-blue-300'
  if (code < 500) return 'text-yellow-300'
  return 'text-red-300'
}
