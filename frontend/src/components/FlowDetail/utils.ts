const SYNTAX_TO_MONACO: Record<string, string> = {
  json: 'json',
  xml: 'xml',
  html: 'html',
  javascript: 'javascript',
  css: 'css',
  yaml: 'yaml',
  graphql: 'graphql',
}

/** Map mitmproxy's syntax_highlight value to a Monaco language ID. */
export function syntaxToLanguage(syntaxHighlight: string): string {
  return SYNTAX_TO_MONACO[syntaxHighlight] ?? 'plaintext'
}

/** Extract Content-Type value from a headers array (case-insensitive). */
export function getRequestContentType(headers: [string, string][]): string {
  return headers.find(([k]) => k.toLowerCase() === 'content-type')?.[1] ?? ''
}

/** Format HTTP response status line. */
export function formatStatusLine(httpVersion: string, statusCode: number, reason: string): string {
  return reason ? `${httpVersion} ${statusCode} ${reason}` : `${httpVersion} ${statusCode}`
}
