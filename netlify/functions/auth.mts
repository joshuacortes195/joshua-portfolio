// github login for the admin dashboard
// needs GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET set in the netlify environment variables

// the only github account allowed into the dashboard
const ADMIN = (process.env.ADMIN_GITHUB_USER ?? 'joshuacortes195').toLowerCase()

// sends the browser somewhere else, optionally setting a cookie on the way
function redirect(to: string, cookie?: string) {
  const headers = new Headers({ Location: to })
  if (cookie) headers.set('Set-Cookie', cookie)
  return new Response(null, { status: 302, headers })
}

// reads one cookie out of the request
function readCookie(req: Request, name: string) {
  const match = (req.headers.get('cookie') ?? '').match(new RegExp(`(?:^|; )${name}=([^;]+)`))
  return match?.[1]
}

export default async (req: Request) => {
  const url = new URL(req.url)
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) return redirect('/admin/#error=not_set_up')

  // step 1: send me to github to approve the login
  if (url.pathname.endsWith('/login')) {
    const state = crypto.randomUUID()
    const to = new URL('https://github.com/login/oauth/authorize')
    to.searchParams.set('client_id', clientId)
    to.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback`)
    // enough to commit to public repos, nothing private
    to.searchParams.set('scope', 'public_repo')
    to.searchParams.set('state', state)
    // remembers the state so the callback can check the login started here
    return redirect(to.toString(), `admin_state=${state}; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`)
  }

  // step 2: github sends me back with a code
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state || state !== readCookie(req, 'admin_state')) return redirect('/admin/#error=login_failed')

  // swaps the code for a token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  const { access_token: token } = (await tokenRes.json()) as { access_token?: string }
  if (!token) return redirect('/admin/#error=login_failed')

  // checks who just logged in, anyone but me gets turned away
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-admin' },
  })
  const user = (await userRes.json()) as { login?: string }
  if (!userRes.ok || user.login?.toLowerCase() !== ADMIN) return redirect('/admin/#error=not_allowed')

  // hands the token to the dashboard in the url hash, which never reaches a server
  return redirect(`/admin/#token=${token}`, 'admin_state=; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
}

// the two addresses this function answers on
export const config = { path: ['/api/auth/login', '/api/auth/callback'] }
