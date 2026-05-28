import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start'

const ONE_MEGABYTE = 1024 * 1024
const ROUTER_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const SERVER_FUNCTION_METHODS = new Set(['GET', 'POST', 'OPTIONS'])

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
  secFetchSite: ['same-origin', 'same-site'],
})

const securityMiddleware = createMiddleware().server(
  async ({ handlerType, next, request }) => {
    const allowedMethods =
      handlerType === 'serverFn' ? SERVER_FUNCTION_METHODS : ROUTER_METHODS

    if (!allowedMethods.has(request.method)) {
      return textResponse(request, 'Method Not Allowed', 405, {
        Allow: Array.from(allowedMethods).join(', '),
      })
    }

    if (request.method === 'OPTIONS') {
      return withSecurityHeaders(new Response(null, { status: 204 }), request)
    }

    if (hasOversizedMutationBody(request)) {
      return textResponse(request, 'Payload Too Large', 413)
    }

    const result = await next()

    return {
      ...result,
      response: withSecurityHeaders(result.response, request),
    }
  },
)

export const startInstance = createStart(() => ({
  requestMiddleware: [securityMiddleware, csrfMiddleware],
}))

function hasOversizedMutationBody(request: Request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return false
  }

  const contentLength = request.headers.get('content-length')
  if (!contentLength) {
    return false
  }

  const bodyBytes = Number.parseInt(contentLength, 10)

  return Number.isFinite(bodyBytes) && bodyBytes > ONE_MEGABYTE
}

function textResponse(
  request: Request,
  body: string,
  status: number,
  headers?: HeadersInit,
) {
  return withSecurityHeaders(new Response(body, { status, headers }), request)
}

function withSecurityHeaders(response: Response, request: Request) {
  const headers = new Headers(response.headers)

  headers.set('Content-Security-Policy', getContentSecurityPolicy(request))
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  headers.set('Origin-Agent-Cluster', '?1')
  headers.set(
    'Permissions-Policy',
    [
      'accelerometer=()',
      'autoplay=(self)',
      'camera=()',
      'display-capture=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
    ].join(', '),
  )
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')

  if (isHttpsRequest(request)) {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    )
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

function getContentSecurityPolicy(request: Request) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const scriptSrc = ["'self'", "'unsafe-inline'"]
  const connectSrc = ["'self'"]

  if (isDevelopment) {
    scriptSrc.push("'unsafe-eval'")
    connectSrc.push(
      'ws:',
      'http://localhost:*',
      'http://127.0.0.1:*',
      'http://[::1]:*',
    )
  }

  const policy = [
    ['default-src', "'self'"],
    ['script-src', ...scriptSrc],
    ['script-src-attr', "'none'"],
    ['style-src', "'self'", "'unsafe-inline'"],
    ['img-src', "'self'", 'data:', 'blob:'],
    ['font-src', "'self'", 'data:'],
    ['media-src', "'self'", 'blob:'],
    ['connect-src', ...connectSrc],
    ['frame-src', "'self'", 'https://player.bilibili.com'],
    ['object-src', "'none'"],
    ['base-uri', "'self'"],
    ['form-action', "'self'"],
    ['manifest-src', "'self'"],
    ['worker-src', "'self'", 'blob:'],
  ]

  if (isHttpsRequest(request) && !isDevelopment) {
    policy.push(['upgrade-insecure-requests'])
  }

  return policy.map((directive) => directive.join(' ')).join('; ')
}

function isHttpsRequest(request: Request) {
  return (
    new URL(request.url).protocol === 'https:' ||
    request.headers.get('x-forwarded-proto') === 'https'
  )
}
