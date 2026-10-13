// github login for the admin dashboard
// needs GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET set in the netlify environment variables

// the only github account allowed into the dashboard, checked by name and by account number
const ADMIN = (process.env.ADMIN_GITHUB_USER ?? 'joshuacortes195').toLowerCase()
const ADMIN_ID = 229831570

// cookie that remembers a login in progress, the __Host- name ties it to this site over https
const STATE_COOKIE = '__Host-admin_state'
const COOKIE_RULES = 'Path=/; Secure; HttpOnly; SameSite=Lax'
const CLEAR_STATE = `${STATE_COOKIE}=; ${COOKIE_RULES}; Max-Age=0`

// what the dashboard's one-time login marker and a github token are allowed to look like
const MARKER_SHAPE = /^[A-Za-z0-9_-]{43}$/
const TOKEN_SHAPE = /^[A-Za-z0-9_]{20,255}$/

// headers on every answer: never cached, and the address is never passed on to another site
function baseHeaders() {
  return new Headers({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' })
}

// sends the browser somewhere else, optionally setting a cookie on the way
function redirect(to: string, cookie?: string) {
  const headers = baseHeaders()
  headers.set('Location', to)
  if (cookie) headers.set('Set-Cookie', cookie)
  return new Response(null, { status: 302, headers })
}

// an empty answer with just a status, for the sign out call
function reply(status: number) {
  return new Response(null, { status, headers: baseHeaders() })
}

// reads one cookie out of the request
function readCookie(req: Request, name: string) {
  const match = (req.headers.get('cookie') ?? '').match(new RegExp(`(?:^|; )${name}=([^;]+)`))
  return match?.[1]
}

// asks github to cancel a token so it stops working everywhere
async function revoke(clientId: string, clientSecret: string, token: string) {
  try {
    const res = await fetch(`https://api.github.com/applications/${clientId}/token`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-admin',
      },
      body: JSON.stringify({ access_token: token }),
    })
    return res.ok
  } catch {
    return false
  }
}

export default async (req: Request) => {
  const url = new URL(req.url)
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  // back to the dashboard on a clean address, with the result in the hash and the login cookie cleared
  const backToAdmin = (hash: string) => redirect(`${url.origin}/admin/#${hash}`, CLEAR_STATE)

  // sign out: the dashboard posts its token here so github cancels it
  if (url.pathname.endsWith('/logout')) {
    if (req.method !== 'POST') return reply(405)
    // only the dashboard on this same site may call it
    if (req.headers.get('origin') !== url.origin) return reply(403)
    if (!clientId || !clientSecret) return reply(503)
    const body = (await req.json().catch(() => null)) as { token?: unknown } | null
    const token = body?.token
    if (typeof token !== 'string' || !TOKEN_SHAPE.test(token)) return reply(400)
    return reply((await revoke(clientId, clientSecret, token)) ? 204 : 502)
  }

  if (!clientId || !clientSecret) return backToAdmin('error=not_set_up')

  // step 1: send me to github to approve the login
  if (url.pathname.endsWith('/login')) {
    // the dashboard sends a one-time marker it made when sign in was clicked
    const marker = url.searchParams.get('marker') ?? ''
    if (!MARKER_SHAPE.test(marker)) return backToAdmin('error=login_failed')

    const state = crypto.randomUUID()
    const to = new URL('https://github.com/login/oauth/authorize')
    to.searchParams.set('client_id', clientId)
    to.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback`)
    // lets the dashboard commit here and read my private repos for the import list
    to.searchParams.set('scope', 'repo')
    to.searchParams.set('state', state)
    // remembers the state and the marker so the callback can check the login started here
    return redirect(to.toString(), `${STATE_COOKIE}=${state}.${marker}; ${COOKIE_RULES}; Max-Age=600`)
  }

  // step 2: github sends me back with a code
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  // the cookie holds the state and the marker, with a dot between them
  const [savedState, marker = ''] = (readCookie(req, STATE_COOKIE) ?? '').split('.')
  if (!code || !state || state !== savedState || !MARKER_SHAPE.test(marker)) return backToAdmin('error=login_failed')

  // swaps the code for a token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  const { access_token: token } = (await tokenRes.json().catch(() => ({}))) as { access_token?: string }
  if (!token) return backToAdmin('error=login_failed')

  // checks who just logged in, anyone but me gets turned away
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-admin' },
  })
  const user = (await userRes.json().catch(() => ({}))) as { login?: string; id?: number }
  if (!userRes.ok || user.id !== ADMIN_ID || user.login?.toLowerCase() !== ADMIN) {
    // a stranger's token is cancelled on the spot so nothing is left behind
    await revoke(clientId, clientSecret, token)
    return backToAdmin('error=not_allowed')
  }

  // hands the token to the dashboard in the url hash, which never reaches a server, next to the marker it asked for
  return backToAdmin(`token=${token}&marker=${marker}`)
}

// the three addresses this function answers on
export const config = { path: ['/api/auth/login', '/api/auth/callback', '/api/auth/logout'] }
