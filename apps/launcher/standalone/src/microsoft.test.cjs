'use strict'

const assert = require('node:assert/strict')
const { afterEach, test } = require('node:test')
const { MicrosoftMinecraftAuth, isMicrosoftSignInUrl } = require('./microsoft.cjs')

const originalFetch = global.fetch
const clientId = '00000000-0000-4000-8000-000000000001'

afterEach(() => {
  global.fetch = originalFetch
})

test('rejects a missing or invalid desktop application client ID', () => {
  assert.throws(() => new MicrosoftMinecraftAuth(''), { code: 'client-id-missing' })
  assert.throws(() => new MicrosoftMinecraftAuth('not-a-client-id'), { code: 'client-id-missing' })
})

test('only accepts Microsoft device-code sign-in pages for external navigation', () => {
  assert.equal(isMicrosoftSignInUrl('https://microsoft.com/devicelogin'), true)
  assert.equal(isMicrosoftSignInUrl('https://www.microsoft.com/link'), true)
  assert.equal(isMicrosoftSignInUrl('http://microsoft.com/devicelogin'), false)
  assert.equal(isMicrosoftSignInUrl('https://evil.example/devicelogin'), false)
  assert.equal(isMicrosoftSignInUrl('https://microsoft.com.attacker.example/devicelogin'), false)
  assert.equal(isMicrosoftSignInUrl('https://microsoft.com/devicelogin?redirect=evil.example'), true)
  assert.equal(isMicrosoftSignInUrl('not a url'), false)
})

test('explains how to fix a Microsoft app registration that blocks desktop sign-in', async () => {
  global.fetch = async () => Response.json({
    error: 'unauthorized_client',
    error_description: 'AADSTS70002: The provided client is not supported for this feature. The client application must be marked as "mobile".',
  }, { status: 400 })

  const auth = new MicrosoftMinecraftAuth(clientId)
  await assert.rejects(
    auth.requestDeviceCode(new AbortController().signal),
    {
      code: 'client-app-not-configured',
      message: /Mobile and desktop applications.*Allow public client flows.*Gmail address works only if it is also the Microsoft account/s,
    },
  )
})

test('completes secure Microsoft, Xbox, and Minecraft sign-in without a password', async () => {
  const calls = []
  const onDeviceCode = []
  const payloads = {
    'login.microsoftonline.com/consumers/oauth2/v2.0/devicecode': {
      device_code: 'device-code-do-not-log',
      user_code: 'ABCD-EFGH',
      verification_uri: 'https://microsoft.com/devicelogin',
      expires_in: 30,
      interval: 1,
    },
    'login.microsoftonline.com/consumers/oauth2/v2.0/token': {
      access_token: 'microsoft-access-token',
      refresh_token: 'microsoft-refresh-token',
    },
    'user.auth.xboxlive.com/user/authenticate': {
      Token: 'xbox-token',
      DisplayClaims: { xui: [{ uhs: 'xbox-user-hash' }] },
    },
    'xsts.auth.xboxlive.com/xsts/authorize': { Token: 'xsts-token' },
    'api.minecraftservices.com/authentication/login_with_xbox': { access_token: 'minecraft-access-token' },
    'api.minecraftservices.com/minecraft/profile': { id: '550e8400-e29b-41d4-a716-446655440000', name: 'RuinPlayer' },
  }
  global.fetch = async (input, options) => {
    const url = new URL(input)
    const key = `${url.host}${url.pathname}`
    calls.push({ key, body: options.body, headers: options.headers })
    return Response.json(payloads[key], { status: 200 })
  }
  const auth = new MicrosoftMinecraftAuth(clientId, {
    onDeviceCode: (code) => onDeviceCode.push(code),
  })

  const account = await auth.login(new AbortController().signal)

  assert.deepEqual(account, {
    name: 'RuinPlayer',
    uuid: '550e8400e29b41d4a716446655440000',
    minecraftAccessToken: 'minecraft-access-token',
    refreshToken: 'microsoft-refresh-token',
  })
  assert.equal(onDeviceCode[0].userCode, 'ABCD-EFGH')
  assert.equal(onDeviceCode[0].verificationUrl, 'https://microsoft.com/devicelogin')
  assert.equal(calls.length, 6)
  assert.equal(new URLSearchParams(calls[0].body).get('client_id'), clientId)
  assert.equal(new URLSearchParams(calls[0].body).get('scope'), 'XboxLive.signin offline_access')
  assert.equal(calls.some((call) => String(call.body).includes('password=')), false)
  assert.equal(JSON.stringify(calls).includes('microsoft-refresh-token'), false)
})

test('explains an Xbox HTTP 403 after Microsoft device-code sign-in', async () => {
  const payloads = {
    'user.auth.xboxlive.com/user/authenticate': {
      error: 'Forbidden',
    },
  }
  global.fetch = async (input) => {
    const url = new URL(input)
    const body = payloads[`${url.host}${url.pathname}`]
    if (!body) throw new Error(`Unexpected authentication host: ${url.host}`)
    return Response.json(body, { status: 403 })
  }

  const auth = new MicrosoftMinecraftAuth(clientId)
  await assert.rejects(
    auth.exchangeForMinecraftProfile('microsoft-access-token', new AbortController().signal),
    {
      code: 'xbox-account-forbidden',
      message: /Microsoft sign-in succeeded, but Xbox refused this account.*HTTP 403.*xbox\.com.*country\/region.*age or family restrictions/i,
    },
  )
})

test('identifies an Xbox profile error even when Xbox responds with HTTP 403', async () => {
  global.fetch = async () => Response.json({ XErr: 2148916233 }, { status: 403 })

  const auth = new MicrosoftMinecraftAuth(clientId)
  await assert.rejects(
    auth.exchangeForMinecraftProfile('microsoft-access-token', new AbortController().signal),
    { code: 'xbox-profile-required', message: /needs an Xbox profile/i },
  )
})

test('does not imply Minecraft ownership is missing when game-session creation is forbidden', async () => {
  const auth = new MicrosoftMinecraftAuth(clientId)
  global.fetch = async (input) => {
    const url = new URL(input)
    if (url.host === 'user.auth.xboxlive.com') {
      return Response.json({ Token: 'xbox', DisplayClaims: { xui: [{ uhs: 'hash' }] } })
    }
    if (url.host === 'xsts.auth.xboxlive.com') return Response.json({ Token: 'xsts' })
    if (url.pathname.endsWith('login_with_xbox')) {
      return Response.json({ error: 'Forbidden' }, {
        status: 403,
        headers: { 'x-request-id': '01234567-89ab-cdef-0123-456789abcdef' },
      })
    }
    throw new Error(`Unexpected authentication host: ${url.host}`)
  }

  await assert.rejects(
    auth.exchangeForMinecraftProfile('microsoft-access-token', new AbortController().signal),
    {
      code: 'minecraft-access-forbidden',
      message: /does not mean you do not own Java.*official Minecraft Launcher.*Don't buy the game again.*Support reference: 01234567-89ab-cdef-0123-456789abcdef/,
    },
  )
})

test('uses the official Xbox and Minecraft services for token exchange', async () => {
  const requests = []
  global.fetch = async (input, options) => {
    const url = new URL(input)
    const body = options.body ? JSON.parse(options.body) : undefined
    requests.push({ url: `${url.host}${url.pathname}`, body, headers: options.headers })
    if (url.host === 'user.auth.xboxlive.com') {
      return Response.json({ Token: 'xbox', DisplayClaims: { xui: [{ uhs: 'hash' }] } })
    }
    if (url.host === 'xsts.auth.xboxlive.com') return Response.json({ Token: 'xsts' })
    if (url.pathname.endsWith('login_with_xbox')) return Response.json({ access_token: 'minecraft' })
    if (url.pathname.endsWith('/minecraft/profile')) {
      assert.equal(options.headers.authorization, 'Bearer minecraft')
      return Response.json({ id: 'player-id', name: 'RuinPlayer' })
    }
    throw new Error(`Unexpected authentication host: ${url.host}`)
  }

  const auth = new MicrosoftMinecraftAuth(clientId)
  await auth.exchangeForMinecraftProfile('microsoft-token', new AbortController().signal)

  assert.deepEqual(requests.map((request) => request.url), [
    'user.auth.xboxlive.com/user/authenticate',
    'xsts.auth.xboxlive.com/xsts/authorize',
    'api.minecraftservices.com/authentication/login_with_xbox',
    'api.minecraftservices.com/minecraft/profile',
  ])
  assert.equal(requests[0].body.Properties.RpsTicket, 'd=microsoft-token')
  assert.equal(requests[1].body.RelyingParty, 'rp://api.minecraftservices.com/')
  assert.equal(requests[2].body.identityToken, 'XBL3.0 x=hash;xsts')
  assert.equal(requests[3].headers.authorization, 'Bearer minecraft')
})
