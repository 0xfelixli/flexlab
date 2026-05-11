import ky from 'ky'

export function getApiBaseUrl(
  configured = import.meta.env.VITE_MITMWEB_URL ?? '',
): string {
  return configured.replace(/\/+$/, '')
}

export function joinApiPath(path: string, configured?: string): string {
  const baseUrl = getApiBaseUrl(configured)
  return baseUrl ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : path
}

/** Read the _xsrf cookie value set by mitmproxy's Tornado server. */
export function getXsrfToken(cookie = document.cookie): string {
  const match = cookie.match(/(?:^|;\s*)_xsrf=([^;]+)/)
  return match ? match[1] : ''
}

export const api = ky.create({
  hooks: {
    beforeRequest: [
      ({ request }) => {
        if (!['GET', 'HEAD'].includes(request.method)) {
          const headers = new Headers(request.headers)
          headers.set('X-Xsrftoken', getXsrfToken())
          return new Request(request, { headers })
        }
      },
    ],
  },
})
