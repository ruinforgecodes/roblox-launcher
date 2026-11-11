'use strict'

const crypto = require('node:crypto')

const AUTHORIZE_URL = 'https://apis.roblox.com/oauth/v1/authorize'
const TOKEN_URL = 'https://apis.roblox.com/oauth/v1/token'
const USERINFO_URL = 'https://apis.roblox.com/oauth/v1/userinfo'
const SCOPE = 'openid profile'
const CLIENT_ID_PATTERN = /^[A-Za-z0-9._-]{8,128}$/
const PLACE_ID_PATTERN = /^\d{1,20}$/

class LoginError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'LoginError'
    this.code = code
  }
}

function base64url(buffer) {
  return buffer.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function createPkcePair(randomBytes = crypto.randomBytes) {
  const verifier = base64url(randomBytes(32))
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest())
  return { verifier, challenge }
}

function isLoopbackRedirect(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:'
      && url.hostname === '127.0.0.1'
      && Number(url.port) > 0
      && !url.search
      && !url.hash
  } catch {
    return false
  }
}

function buildAuthorizeUrl({ clientId, redirectUri, state, codeChallenge }) {
  if (!CLIENT_ID_PATTERN.test(clientId || '')) {
    throw new LoginError('Roblox sign-in is not configured. Set RUINFORGE_ROBLOX_CLIENT_ID before building the launcher.', 'client-id-missing')
  }
  if (!isLoopbackRedirect(redirectUri)) {
    throw new LoginError('The Roblox sign-in redirect must point to a local 127.0.0.1 address.', 'invalid-redirect')
  }
  if (typeof state !== 'string' || state.length < 16) throw new LoginError('The sign-in request is missing its state value.', 'invalid-state')
  if (typeof codeChallenge !== 'string' || codeChallenge.length < 43) {
    throw new LoginError('The sign-in request is missing its PKCE challenge.', 'invalid-pkce')
  }
  const url = new URL(AUTHORIZE_URL)
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPE,
    response_type: 'code',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }).toString()
  return url.toString()
}

function normalizePlaceId(placeId) {
  const id = String(placeId ?? '')
  if (!PLACE_ID_PATTERN.test(id)) throw new LoginError('Choose a valid Roblox experience to launch.', 'invalid-place')
  return id
}

// The installed Roblox Player owns the game session, so the launcher hands the
// selected experience to it through the official deep link instead of trying to
// inject credentials into the Player.
function buildLaunchUrl(placeId) {
  return `roblox://experiences/start?placeId=${normalizePlaceId(placeId)}`
}

function buildWebLaunchUrl(placeId) {
  return `https://www.roblox.com/games/start?placeId=${normalizePlaceId(placeId)}`
}

function isAllowedRobloxUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol === 'roblox:') {
      return url.hostname === 'experiences' && url.pathname === '/start'
    }
    return url.protocol === 'https:'
      && (url.hostname === 'roblox.com' || url.hostname.endsWith('.roblox.com'))
  } catch {
    return false
  }
}

async function readJson(response) {
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof body.error_description === 'string'
      ? body.error_description.split(/\r?\n/, 1)[0].slice(0, 240)
      : `Roblox returned HTTP ${response.status}.`
    throw new LoginError(message, body.error || 'roblox-error')
  }
  return body
}

class RobloxAuth {
  constructor({ clientId, clientSecret = '', redirectUri, fetchImpl = fetch, onProgress = () => {} } = {}) {
    if (!CLIENT_ID_PATTERN.test(clientId || '')) {
      throw new LoginError('Roblox sign-in is not configured. Set RUINFORGE_ROBLOX_CLIENT_ID before building the launcher.', 'client-id-missing')
    }
    if (!isLoopbackRedirect(redirectUri)) {
      throw new LoginError('The Roblox sign-in redirect must point to a local 127.0.0.1 address.', 'invalid-redirect')
    }
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.redirectUri = redirectUri
    this.fetchImpl = fetchImpl
    this.onProgress = onProgress
  }

  tokenRequest(payload) {
    const body = new URLSearchParams(payload)
    const headers = { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' }
    if (this.clientSecret) {
      headers.authorization = `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
    } else {
      body.set('client_id', this.clientId)
    }
    return { body, headers }
  }

  async exchangeCode({ code, verifier }) {
    if (typeof code !== 'string' || code.length < 4) throw new LoginError('Roblox did not return a sign-in code.', 'invalid-code')
    this.onProgress('Exchanging the Roblox sign-in code…')
    const { body, headers } = this.tokenRequest({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: verifier,
    })
    let response
    try {
      response = await this.fetchImpl(TOKEN_URL, { method: 'POST', headers, body })
    } catch {
      throw new LoginError('Could not reach Roblox to finish sign-in. Check your internet connection and try again.', 'network')
    }
    const token = await readJson(response)
    if (typeof token.access_token !== 'string' || typeof token.refresh_token !== 'string') {
      throw new LoginError('Roblox did not return a usable session. Try signing in again.', 'invalid-token')
    }
    return token
  }

  async refreshSession(refreshToken) {
    if (typeof refreshToken !== 'string' || refreshToken.length < 4) {
      throw new LoginError('Your Roblox session expired. Sign in again.', 'invalid-refresh-token')
    }
    const { body, headers } = this.tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken })
    let response
    try {
      response = await this.fetchImpl(TOKEN_URL, { method: 'POST', headers, body })
    } catch {
      throw new LoginError('Could not reach Roblox to refresh your session. Check your internet connection.', 'network')
    }
    const token = await readJson(response)
    if (typeof token.access_token !== 'string') {
      throw new LoginError('Roblox did not return a usable session.', 'invalid-token')
    }
    return { ...token, refresh_token: token.refresh_token || refreshToken }
  }

  async fetchProfile(accessToken) {
    let response
    try {
      response = await this.fetchImpl(USERINFO_URL, {
        headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' },
      })
    } catch {
      throw new LoginError('Could not load your Roblox profile. Check your internet connection.', 'network')
    }
    const profile = await readJson(response)
    const name = [profile.preferred_username, profile.nickname, profile.name]
      .find((value) => typeof value === 'string' && value.trim())
    if (typeof profile.sub !== 'string' || !name) {
      throw new LoginError('Roblox returned an invalid profile.', 'invalid-profile')
    }
    return {
      userId: profile.sub,
      name: name.trim(),
      displayName: typeof profile.nickname === 'string' && profile.nickname.trim() ? profile.nickname.trim() : name.trim(),
      picture: typeof profile.picture === 'string' && /^https:\/\//.test(profile.picture) ? profile.picture : '',
    }
  }
}

module.exports = {
  LoginError,
  RobloxAuth,
  buildAuthorizeUrl,
  buildLaunchUrl,
  buildWebLaunchUrl,
  createPkcePair,
  isAllowedRobloxUrl,
  isLoopbackRedirect,
}
