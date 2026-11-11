'use strict'

const DEVICE_CODE_URL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode'
const TOKEN_URL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token'
const XBOX_AUTH_URL = 'https://user.auth.xboxlive.com/user/authenticate'
const XSTS_AUTH_URL = 'https://xsts.auth.xboxlive.com/xsts/authorize'
const MINECRAFT_LOGIN_URL = 'https://api.minecraftservices.com/authentication/login_with_xbox'
const MINECRAFT_PROFILE_URL = 'https://api.minecraftservices.com/minecraft/profile'
const CLIENT_ID_PATTERN = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i
const SCOPE = 'XboxLive.signin offline_access'

class LoginError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'LoginError'
    this.code = code
  }
}

async function postJson(url, payload, signal, service) {
  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new LoginError('Could not reach the Minecraft or Xbox sign-in service. Check your internet connection and try again.', 'network')
  }

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (Number(body.XErr) === 2148916233) {
      throw new LoginError('This Microsoft account needs an Xbox profile before it can sign in to Minecraft. Finish setting up your Xbox profile and try again.', 'xbox-profile-required')
    }
    if (Number(body.XErr) === 2148916235) {
      throw new LoginError('Xbox services are not available for this account’s country or region. Check the Microsoft account region and try again.', 'xbox-region-unavailable')
    }
    if (Number(body.XErr) === 2148916238) {
      throw new LoginError('The Xbox account is restricted by its age or family settings. Check the Microsoft family settings and try again.', 'xbox-account-restricted')
    }
    if (response.status === 404 && url === MINECRAFT_PROFILE_URL) {
      throw new LoginError('This Microsoft account does not appear to own Minecraft Java Edition.', 'minecraft-not-owned')
    }
    if (response.status === 403 && service === 'Xbox account sign-in') {
      throw new LoginError('Microsoft sign-in succeeded, but Xbox refused this account (HTTP 403). Sign in to xbox.com with the same Microsoft account and finish creating its Xbox profile. If it already has a profile, check its country/region and age or family restrictions, then try again.', 'xbox-account-forbidden')
    }
    if (response.status === 403 && service === 'Xbox access verification') {
      throw new LoginError('Xbox blocked this account while verifying Minecraft access (HTTP 403). Check that its Xbox profile is fully set up and that its country/region and age or family settings allow Xbox services, then try again.', 'xbox-access-forbidden')
    }
    if (response.status === 403 && service === 'Minecraft game sign-in') {
      const requestId = [response.headers.get('x-request-id'), response.headers.get('x-correlation-id')]
        .find((value) => typeof value === 'string' && /^[\da-f-]{16,80}$/i.test(value))
      throw new LoginError(
        `Microsoft sign-in and Xbox verification worked, but Minecraft's game-session service refused the request (HTTP 403). This alone does not mean you do not own Java. First, verify minecraft.net and the official Minecraft Launcher show your Java profile while signed into this exact Microsoft account. If they do, this is likely an account-session or service-side authentication issue; try signing out of Microsoft in your browser, then sign in again. Don't buy the game again.${requestId ? ` Support reference: ${requestId}.` : ''}`,
        'minecraft-access-forbidden',
      )
    }
    const message = typeof body.error_description === 'string'
      ? body.error_description.split(/\r?\n/, 1)[0].slice(0, 240)
      : `${service || 'Sign-in service'} returned HTTP ${response.status}.`
    throw new LoginError(message, body.error || 'service-error')
  }
  return body
}

async function postForm(url, payload, signal) {
  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams(payload),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new LoginError('Could not connect to Microsoft. Check your internet connection and try again.', 'network')
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const description = typeof body.error_description === 'string'
      ? body.error_description.split(/\r?\n/, 1)[0]
      : ''
    if (/\bAADSTS70002\b|client application must be marked as ["']?mobile/i.test(description)) {
      throw new LoginError(
        'Microsoft rejected the launcher app registration. In Microsoft Entra, open App registrations > RuinForge > Authentication, add the "Mobile and desktop applications" platform, and enable "Allow public client flows" in Advanced settings. Then try again. A Gmail address works only if it is also the Microsoft account that owns Minecraft Java.',
        'client-app-not-configured',
      )
    }
    const message = description
      ? description.slice(0, 240)
      : `Microsoft sign-in returned HTTP ${response.status}.`
    throw new LoginError(message, body.error || 'microsoft-error')
  }
  return body
}

function wait(ms, signal) {
  if (signal?.aborted) return Promise.reject(signal.reason || new Error('Sign-in cancelled'))
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(finish, ms)
    function finish() {
      signal?.removeEventListener('abort', abort)
      resolve()
    }
    function abort() {
      clearTimeout(timeout)
      signal.removeEventListener('abort', abort)
      reject(signal.reason || new Error('Sign-in cancelled'))
    }
    signal?.addEventListener('abort', abort, { once: true })
  })
}

function isMicrosoftSignInUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
      && ['microsoft.com', 'www.microsoft.com'].includes(url.hostname)
      && (url.pathname === '/devicelogin' || url.pathname === '/link')
  } catch {
    return false
  }
}

class MicrosoftMinecraftAuth {
  constructor(clientId, { onDeviceCode = () => {}, onProgress = () => {} } = {}) {
    if (!CLIENT_ID_PATTERN.test(clientId)) throw new LoginError('The RuinForge Microsoft sign-in is not configured correctly.', 'client-id-missing')
    this.clientId = clientId
    this.onDeviceCode = onDeviceCode
    this.onProgress = onProgress
  }

  async requestDeviceCode(signal) {
    const response = await postForm(DEVICE_CODE_URL, { client_id: this.clientId, scope: SCOPE }, signal)
    const verificationUrl = response.verification_uri || response.verification_url
    if (typeof response.device_code !== 'string'
      || typeof response.user_code !== 'string'
      || typeof verificationUrl !== 'string'
      || !verificationUrl.startsWith('https://')
      || !Number.isFinite(response.expires_in)) {
      throw new LoginError('Microsoft returned an invalid device sign-in response. Please try again later.', 'invalid-device-code')
    }
    return {
      deviceCode: response.device_code,
      userCode: response.user_code,
      verificationUrl,
      message: typeof response.message === 'string' ? response.message : '',
      interval: Math.max(Number(response.interval) || 5, 1),
      expiresAt: Date.now() + response.expires_in * 1000,
    }
  }

  async pollForMicrosoftToken(device, signal) {
    while (Date.now() < device.expiresAt) {
      await wait(device.interval * 1000, signal)
      const response = await postForm(TOKEN_URL, {
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        client_id: this.clientId,
        device_code: device.deviceCode,
      }, signal).catch((error) => {
        if (error.code === 'authorization_pending') return undefined
        if (error.code === 'slow_down') {
          device.interval += 5
          return undefined
        }
        if (error.code === 'authorization_declined') throw new LoginError('You declined the Microsoft sign-in request.', 'authorization-declined')
        if (error.code === 'expired_token') throw new LoginError('The Microsoft sign-in code expired. Start sign-in again.', 'device-code-expired')
        throw error
      })
      if (response?.access_token && response.refresh_token) return response
    }
    throw new LoginError('The Microsoft sign-in code expired. Start sign-in again.', 'device-code-expired')
  }

  async refreshMicrosoftToken(refreshToken, signal) {
    return postForm(TOKEN_URL, {
      client_id: this.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: SCOPE,
    }, signal)
  }

  async exchangeForMinecraftProfile(microsoftAccessToken, signal) {
    this.onProgress('Connecting to Xbox...')
    const xbox = await postJson(XBOX_AUTH_URL, {
      Properties: {
        AuthMethod: 'RPS',
        SiteName: 'user.auth.xboxlive.com',
        RpsTicket: `d=${microsoftAccessToken}`,
      },
      RelyingParty: 'http://auth.xboxlive.com',
      TokenType: 'JWT',
    }, signal, 'Xbox account sign-in')
    if (typeof xbox.Token !== 'string' || typeof xbox.DisplayClaims?.xui?.[0]?.uhs !== 'string') {
      throw new LoginError('Xbox did not return a valid sign-in session.', 'invalid-xbox-response')
    }

    this.onProgress('Verifying Minecraft access...')
    const xsts = await postJson(XSTS_AUTH_URL, {
      Properties: {
        SandboxId: 'RETAIL',
        UserTokens: [xbox.Token],
      },
      RelyingParty: 'rp://api.minecraftservices.com/',
      TokenType: 'JWT',
    }, signal, 'Xbox access verification')
    if (typeof xsts.Token !== 'string') {
      throw new LoginError('Xbox could not verify this Minecraft sign-in.', 'invalid-xsts-response')
    }

    const minecraft = await postJson(MINECRAFT_LOGIN_URL, {
      identityToken: `XBL3.0 x=${xbox.DisplayClaims.xui[0].uhs};${xsts.Token}`,
      ensureLegacyEnabled: true,
    }, signal, 'Minecraft game sign-in')
    if (typeof minecraft.access_token !== 'string') {
      throw new LoginError('Minecraft did not return a valid game session.', 'invalid-minecraft-response')
    }
    const profile = await fetch(MINECRAFT_PROFILE_URL, {
      headers: { authorization: `Bearer ${minecraft.access_token}`, accept: 'application/json' },
      signal,
    })
    if (!profile.ok) {
      if (profile.status === 404) {
        throw new LoginError('This Microsoft account does not appear to own Minecraft Java Edition.', 'minecraft-not-owned')
      }
      throw new LoginError(`Could not load the Minecraft profile (HTTP ${profile.status}). Please try again.`, 'minecraft-profile-error')
    }
    const user = await profile.json()
    if (typeof user.id !== 'string' || typeof user.name !== 'string') {
      throw new LoginError('Minecraft returned an invalid Java profile.', 'invalid-profile')
    }
    return {
      name: user.name,
      uuid: user.id.replaceAll('-', ''),
      minecraftAccessToken: minecraft.access_token,
    }
  }

  async login(signal) {
    this.onProgress('Requesting a secure Microsoft sign-in code...')
    const device = await this.requestDeviceCode(signal)
    this.onDeviceCode({
      userCode: device.userCode,
      verificationUrl: device.verificationUrl,
      message: device.message,
    })
    this.onProgress('Waiting for Microsoft approval...')
    const token = await this.pollForMicrosoftToken(device, signal)
    const profile = await this.exchangeForMinecraftProfile(token.access_token, signal)
    return { ...profile, refreshToken: token.refresh_token }
  }

  async authenticate(refreshToken, signal) {
    this.onProgress('Refreshing your secure Microsoft session...')
    const token = await this.refreshMicrosoftToken(refreshToken, signal)
    if (typeof token.access_token !== 'string' || typeof token.refresh_token !== 'string') {
      throw new LoginError('Microsoft sign-in expired. Sign in again to continue.', 'invalid-refresh-response')
    }
    const profile = await this.exchangeForMinecraftProfile(token.access_token, signal)
    return { ...profile, refreshToken: token.refresh_token }
  }
}

module.exports = { LoginError, MicrosoftMinecraftAuth, isMicrosoftSignInUrl }
