'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const { afterEach, test } = require('node:test')
const {
  LoginError,
  RobloxAuth,
  buildAuthorizeUrl,
  buildLaunchUrl,
  buildWebLaunchUrl,
  createPkcePair,
  isAllowedRobloxUrl,
} = require('./roblox.cjs')

const originalFetch = global.fetch
const clientId = '1234567890abcdef1234567890abcdef'
const redirectUri = 'http://127.0.0.1:53682/oauth/callback'
const verifier = 'a'.repeat(64)

afterEach(() => {
  global.fetch = originalFetch
})

function stubFetch(handler) {
  const calls = []
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), options })
    return handler({ url: String(url), options })
  }
  return calls
}

test('rejects a missing Roblox client ID or a non-loopback redirect', () => {
  assert.throws(() => new RobloxAuth({ clientId: '', redirectUri }), { code: 'client-id-missing' })
  assert.throws(() => new RobloxAuth({ clientId: 'bad id!', redirectUri }), { code: 'client-id-missing' })
  assert.throws(() => new RobloxAuth({ clientId, redirectUri: 'https://evil.example/cb' }), { code: 'invalid-redirect' })
  assert.throws(
    () => new RobloxAuth({ clientId, redirectUri: 'http://127.0.0.1/oauth/callback' }),
    { code: 'invalid-redirect' },
  )
  assert.doesNotThrow(() => new RobloxAuth({ clientId, redirectUri }))
})

test('builds an OAuth authorization URL with PKCE and state', () => {
  const { challenge } = createPkcePair()
  const url = new URL(buildAuthorizeUrl({ clientId, redirectUri, state: 's'.repeat(24), codeChallenge: challenge }))
  assert.equal(url.origin + url.pathname, 'https://apis.roblox.com/oauth/v1/authorize')
  assert.equal(url.searchParams.get('client_id'), clientId)
  assert.equal(url.searchParams.get('redirect_uri'), redirectUri)
  assert.equal(url.searchParams.get('response_type'), 'code')
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256')
  assert.equal(url.searchParams.get('code_challenge'), challenge)
  assert.equal(url.searchParams.get('scope'), 'openid profile')
  assert.equal(url.searchParams.get('state'), 's'.repeat(24))
  assert.throws(
    () => buildAuthorizeUrl({ clientId, redirectUri, state: 'short', codeChallenge: challenge }),
    { code: 'invalid-state' },
  )
})

test('creates a PKCE verifier whose challenge is its SHA-256 digest', () => {
  const { verifier: created, challenge } = createPkcePair()
  assert.match(created, /^[A-Za-z0-9_-]{43,128}$/)
  const expected = crypto.createHash('sha256').update(created).digest('base64')
    .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
  assert.equal(challenge, expected)
})

test('exchanges a sign-in code with a confidential Roblox client', async () => {
  const calls = stubFetch(() => Response.json({
    access_token: 'access-1',
    refresh_token: 'refresh-1',
    expires_in: 900,
  }))
  const auth = new RobloxAuth({ clientId, clientSecret: 'secret-1', redirectUri })
  const token = await auth.exchangeCode({ code: 'code-1', verifier })

  assert.equal(token.access_token, 'access-1')
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://apis.roblox.com/oauth/v1/token')
  const body = new URLSearchParams(calls[0].options.body.toString())
  assert.equal(body.get('grant_type'), 'authorization_code')
  assert.equal(body.get('code'), 'code-1')
  assert.equal(body.get('redirect_uri'), redirectUri)
  assert.equal(body.get('code_verifier'), verifier)
  assert.equal(body.get('client_id'), null)
  assert.equal(
    calls[0].options.headers.authorization,
    `Basic ${Buffer.from(`${clientId}:secret-1`).toString('base64')}`,
  )
})

test('uses PKCE-only token requests when no client secret is configured', async () => {
  const calls = stubFetch(() => Response.json({ access_token: 'a', refresh_token: 'r' }))
  const auth = new RobloxAuth({ clientId, redirectUri })
  await auth.exchangeCode({ code: 'code-2', verifier })
  const body = new URLSearchParams(calls[0].options.body.toString())
  assert.equal(body.get('client_id'), clientId)
  assert.equal(calls[0].options.headers.authorization, undefined)
})

test('refreshes a saved Roblox session and keeps the refresh token', async () => {
  stubFetch(() => Response.json({ access_token: 'access-2', expires_in: 900 }))
  const auth = new RobloxAuth({ clientId, redirectUri })
  const token = await auth.refreshSession('refresh-1')
  assert.equal(token.access_token, 'access-2')
  assert.equal(token.refresh_token, 'refresh-1')
})

test('reads the Roblox user profile from userinfo', async () => {
  stubFetch(() => Response.json({
    sub: '42',
    preferred_username: 'NovaRift',
    nickname: 'Nova',
    picture: 'https://tr.rbxcdn.com/avatar.png',
  }))
  const auth = new RobloxAuth({ clientId, redirectUri })
  const profile = await auth.fetchProfile('access-1')
  assert.deepEqual(profile, {
    userId: '42',
    name: 'NovaRift',
    displayName: 'Nova',
    picture: 'https://tr.rbxcdn.com/avatar.png',
  })
  stubFetch(() => Response.json({ nickname: 'No ID' }))
  const broken = new RobloxAuth({ clientId, redirectUri })
  await assert.rejects(broken.fetchProfile('access-2'), { code: 'invalid-profile' })
})

test('explains a rejected Roblox token request', async () => {
  stubFetch(() => Response.json({ error: 'invalid_grant', error_description: 'Invalid code.' }, { status: 400 }))
  const auth = new RobloxAuth({ clientId, redirectUri })
  await assert.rejects(auth.exchangeCode({ code: 'code-3', verifier }), (error) => {
    assert.ok(error instanceof LoginError)
    assert.equal(error.code, 'invalid_grant')
    assert.match(error.message, /Invalid code/)
    return true
  })
})

test('builds official launch links for a numeric place ID only', () => {
  assert.equal(buildLaunchUrl('920587237'), 'roblox://experiences/start?placeId=920587237')
  assert.equal(buildWebLaunchUrl(920587237), 'https://www.roblox.com/games/start?placeId=920587237')
  assert.throws(() => buildLaunchUrl('920587237&evil=1'), { code: 'invalid-place' })
  assert.throws(() => buildWebLaunchUrl('../settings'), { code: 'invalid-place' })
})

test('only allows Roblox addresses for external navigation', () => {
  assert.equal(isAllowedRobloxUrl('https://www.roblox.com/games/start?placeId=1'), true)
  assert.equal(isAllowedRobloxUrl('https://apis.roblox.com/oauth/v1/authorize'), true)
  assert.equal(isAllowedRobloxUrl('roblox://experiences/start?placeId=1'), true)
  assert.equal(isAllowedRobloxUrl('http://www.roblox.com/games'), false)
  assert.equal(isAllowedRobloxUrl('https://roblox.com.attacker.example/'), false)
  assert.equal(isAllowedRobloxUrl('roblox://settings/reset'), false)
  assert.equal(isAllowedRobloxUrl('not a url'), false)
})
