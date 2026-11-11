'use strict'

const { app, BrowserWindow, dialog, ipcMain, nativeTheme, safeStorage, session, shell } = require('electron')
const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const http = require('node:http')
const path = require('node:path')
const {
  LoginError,
  RobloxAuth,
  buildAuthorizeUrl,
  buildLaunchUrl,
  buildWebLaunchUrl,
  createPkcePair,
  isAllowedRobloxUrl,
} = require('./roblox.cjs')
const { robloxClientId, robloxClientSecret } = require('./generated-config.cjs')

const APP_NAME = 'RuinForge Launcher'
const CALLBACK_PATH = '/oauth/callback'
const CALLBACK_PORT = 53682
const SIGN_IN_TIMEOUT_MS = 5 * 60 * 1000
const TRUSTED_LINKS = Object.freeze({
  support: 'https://www.roblox.com/support',
  status: 'https://status.roblox.com/',
  create: 'https://create.roblox.com/',
})

app.setName(APP_NAME)

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  let mainWindow
  let signInController
  let activeExperience
  let memorySession
  const userData = app.getPath('userData')
  const sessionFile = path.join(userData, 'session.enc')
  const settingsFile = path.join(userData, 'settings.json')
  const libraryFile = path.join(userData, 'library.json')
  const dataFolder = path.join(userData, 'data')

  const defaultSettings = {
    autoUpdate: true,
    closeOnLaunch: false,
    lowLatency: false,
    graphics: 'auto',
    region: 'auto',
  }

  function send(channel, payload) {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload)
  }

  function emitProgress(message, stage = 'setup', current = 0, total = 0) {
    send('launcher:progress', { message, stage, current, total })
  }

  function handleError(error) {
    if (error?.name === 'AbortError' || error?.code === 'ABORT_ERR') return 'Roblox sign-in was cancelled.'
    return error instanceof Error ? error.message : 'Something went wrong. Check your internet connection and try again.'
  }

  async function readJsonFile(file, fallback) {
    const raw = await fs.readFile(file, 'utf8').catch((error) => {
      if (error.code === 'ENOENT') return undefined
      throw error
    })
    if (!raw) return fallback
    try {
      return JSON.parse(raw)
    } catch {
      return fallback
    }
  }

  async function writeJsonFile(file, value) {
    await fs.mkdir(path.dirname(file), { recursive: true })
    const temporaryFile = `${file}.${crypto.randomUUID()}.tmp`
    await fs.writeFile(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
    await fs.rename(temporaryFile, file)
  }

  async function loadSettings() {
    const saved = await readJsonFile(settingsFile, {})
    return {
      autoUpdate: saved.autoUpdate !== false,
      closeOnLaunch: saved.closeOnLaunch === true,
      lowLatency: saved.lowLatency === true,
      graphics: ['auto', 'high', 'balanced', 'performance'].includes(saved.graphics) ? saved.graphics : defaultSettings.graphics,
      region: ['auto', 'us', 'eu', 'asia'].includes(saved.region) ? saved.region : defaultSettings.region,
    }
  }

  async function loadLibrary() {
    const saved = await readJsonFile(libraryFile, {})
    return {
      favorites: Array.isArray(saved.favorites) ? saved.favorites.filter((id) => /^\d{1,20}$/.test(String(id))).slice(0, 200) : [],
      recent: Array.isArray(saved.recent)
        ? saved.recent
          .filter((item) => item && /^\d{1,20}$/.test(String(item.placeId)))
          .slice(0, 12)
          .map((item) => ({ placeId: String(item.placeId), name: String(item.name || 'Experience').slice(0, 80), at: Number(item.at) || Date.now() }))
        : [],
      installed: Array.isArray(saved.installed) ? saved.installed.filter((id) => /^\d{1,20}$/.test(String(id))).slice(0, 200) : [],
    }
  }

  function encryptionAvailable() {
    return safeStorage.isEncryptionAvailable()
  }

  async function getSavedSession() {
    if (memorySession) return memorySession
    if (!encryptionAvailable()) return undefined
    const bytes = await fs.readFile(sessionFile).catch(() => undefined)
    if (!bytes) return undefined
    try {
      const session = JSON.parse(safeStorage.decryptString(bytes))
      if (typeof session.refreshToken !== 'string' || typeof session.userId !== 'string' || typeof session.name !== 'string') {
        throw new Error('Stored session is incomplete.')
      }
      return session
    } catch {
      await fs.rm(sessionFile, { force: true })
      return undefined
    }
  }

  async function saveSession(session) {
    memorySession = session
    if (!encryptionAvailable()) return false
    const encrypted = safeStorage.encryptString(JSON.stringify(session))
    await fs.mkdir(path.dirname(sessionFile), { recursive: true })
    const temporaryFile = `${sessionFile}.${crypto.randomUUID()}.tmp`
    await fs.writeFile(temporaryFile, encrypted)
    await fs.rename(temporaryFile, sessionFile)
    return true
  }

  function publicAccount(session) {
    if (!session) return null
    return {
      userId: String(session.userId),
      name: String(session.name),
      displayName: String(session.displayName || session.name),
      premium: Boolean(session.premium),
    }
  }

  async function findRobloxPlayer() {
    if (process.platform !== 'win32') return false
    const localAppData = process.env.LOCALAPPDATA
    if (!localAppData) return false
    const versions = path.join(localAppData, 'Roblox', 'Versions')
    const entries = await fs.readdir(versions, { withFileTypes: true }).catch(() => [])
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const exists = await fs.access(path.join(versions, entry.name, 'RobloxPlayerBeta.exe')).then(() => true).catch(() => false)
      if (exists) return true
    }
    return false
  }

  function startCallbackServer(expectedState, signal) {
    return new Promise((resolve, reject) => {
      let settled = false
      const server = http.createServer((request, response) => {
        const url = new URL(request.url || '/', 'http://127.0.0.1')
        if (url.pathname !== CALLBACK_PATH) {
          response.writeHead(404).end('Not found')
          return
        }
        const finish = (status, body) => {
          response.writeHead(status, { 'content-type': 'text/html; charset=utf-8' })
          response.end(`<!doctype html><meta charset="utf-8"><title>RuinForge</title><body style="font-family:Segoe UI,sans-serif;background:#0d0c10;color:#f4efff;display:grid;place-items:center;height:100vh;margin:0"><p style="font-size:15px">${body}</p>`)
        }
        if (url.searchParams.get('state') !== expectedState) {
          finish(400, 'This sign-in response was not started by RuinForge. You can close this tab.')
          return
        }
        const error = url.searchParams.get('error')
        if (error) {
          settled = true
          cleanup()
          reject(new LoginError(error === 'access_denied' ? 'You declined the Roblox sign-in request.' : 'Roblox sign-in failed. Try again.', error))
          finish(200, 'Sign-in was not completed. You can close this tab.')
          return
        }
        const code = url.searchParams.get('code')
        if (!code) {
          finish(400, 'Roblox did not return a sign-in code. You can close this tab.')
          return
        }
        settled = true
        cleanup()
        finish(200, 'Roblox is connected to RuinForge. You can close this tab and return to the launcher.')
        resolve(code)
      })

      const timeout = setTimeout(() => {
        if (settled) return
        settled = true
        cleanup()
        reject(new LoginError('Roblox sign-in timed out. Start sign-in again.', 'timeout'))
      }, SIGN_IN_TIMEOUT_MS)

      function abort() {
        if (settled) return
        settled = true
        cleanup()
        reject(Object.assign(new Error('Roblox sign-in was cancelled.'), { name: 'AbortError' }))
      }

      function cleanup() {
        clearTimeout(timeout)
        signal?.removeEventListener('abort', abort)
        if (server.listening) server.close()
      }

      server.on('error', (error) => {
        if (settled) return
        settled = true
        cleanup()
        reject(new LoginError(
          error.code === 'EADDRINUSE'
            ? `Port ${CALLBACK_PORT} is already in use, so Roblox cannot return to the launcher. Close the other app using it and try again.`
            : `Could not start the local Roblox sign-in listener: ${error.message}`,
          'callback-server-error',
        ))
      })

      server.listen(CALLBACK_PORT, '127.0.0.1')
      if (signal?.aborted) {
        abort()
      } else {
        signal?.addEventListener('abort', abort, { once: true })
      }
    })
  }

  async function performSignIn(signal) {
    if (!robloxClientId) {
      throw new LoginError(
        'Roblox sign-in is not configured in this build. Set RUINFORGE_ROBLOX_CLIENT_ID and rebuild the launcher.',
        'client-id-missing',
      )
    }
    const redirectUri = `http://127.0.0.1:${CALLBACK_PORT}${CALLBACK_PATH}`
    const { verifier, challenge } = createPkcePair()
    const state = crypto.randomBytes(24).toString('hex')
    const authorizeUrl = buildAuthorizeUrl({ clientId: robloxClientId, redirectUri, state, codeChallenge: challenge })
    const codePromise = startCallbackServer(state, signal)
    emitProgress('Opening Roblox sign-in in your browser…', 'signin')
    await shell.openExternal(authorizeUrl)
    emitProgress('Waiting for you to approve RuinForge on Roblox…', 'signin')
    const code = await codePromise
    const auth = new RobloxAuth({
      clientId: robloxClientId,
      clientSecret: robloxClientSecret,
      redirectUri,
      onProgress: (message) => emitProgress(message, 'signin'),
    })
    const token = await auth.exchangeCode({ code, verifier })
    emitProgress('Loading your Roblox profile…', 'signin')
    const profile = await auth.fetchProfile(token.access_token)
    const session = {
      refreshToken: token.refresh_token,
      userId: profile.userId,
      name: profile.name,
      displayName: profile.displayName,
      premium: false,
    }
    const persisted = await saveSession(session)
    if (!persisted) {
      emitProgress('Windows credential storage is unavailable, so this session lasts until you close RuinForge.', 'signin')
    }
    return session
  }

  async function launchExperience(placeId, experienceName) {
    const session = await getSavedSession()
    if (!session) throw new Error('Sign in with Roblox before launching an experience.')
    const settings = await loadSettings()
    emitProgress(`Checking the Roblox Player…`, 'launch')
    const playerInstalled = await findRobloxPlayer()
    if (process.platform === 'win32' && !playerInstalled) {
      throw new Error('The Roblox Player is not installed. Install it from roblox.com/download once, then try again.')
    }
    emitProgress(`Requesting a ${settings.region === 'auto' ? 'nearby' : settings.region.toUpperCase()} server for ${experienceName}…`, 'launch')
    try {
      await shell.openExternal(buildLaunchUrl(placeId))
    } catch {
      emitProgress('The Roblox Player did not answer, so the experience is opening on roblox.com…', 'launch')
      await shell.openExternal(buildWebLaunchUrl(placeId))
    }
    activeExperience = { placeId: String(placeId), name: String(experienceName || 'Experience'), startedAt: Date.now() }
    const library = await loadLibrary()
    const recent = [
      { placeId: activeExperience.placeId, name: activeExperience.name, at: Date.now() },
      ...library.recent.filter((item) => item.placeId !== activeExperience.placeId),
    ].slice(0, 12)
    const installed = library.installed.includes(activeExperience.placeId)
      ? library.installed
      : [...library.installed, activeExperience.placeId].slice(0, 200)
    await writeJsonFile(libraryFile, { ...library, recent, installed })
    emitProgress(`${activeExperience.name} is starting in the Roblox Player.`, 'playing')
    if (settings.closeOnLaunch && mainWindow) mainWindow.minimize()
    return { ok: true, placeId: activeExperience.placeId, playerInstalled, library: { ...library, recent, installed } }
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1300,
      height: 840,
      minWidth: 1000,
      minHeight: 680,
      backgroundColor: '#0b0a0f',
      autoHideMenuBar: true,
      show: false,
      title: 'RuinForge Launcher',
      icon: path.join(__dirname, '..', 'assets', 'ruinforge.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    })
    mainWindow.once('ready-to-show', () => mainWindow.show())
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (isAllowedRobloxUrl(url)) shell.openExternal(url)
      return { action: 'deny' }
    })
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
  }

  ipcMain.handle('launcher:initial-state', async () => {
    const [session, settings, library, playerInstalled] = await Promise.all([
      getSavedSession(),
      loadSettings(),
      loadLibrary(),
      findRobloxPlayer(),
    ])
    return {
      account: publicAccount(session),
      encrypted: encryptionAvailable(),
      settings,
      library,
      playerInstalled,
      region: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      platform: process.platform,
      version: app.getVersion(),
      folder: dataFolder,
    }
  })

  ipcMain.handle('launcher:sign-in', async () => {
    if (signInController) throw new Error('Roblox sign-in is already in progress.')
    signInController = new AbortController()
    try {
      const session = await performSignIn(signInController.signal)
      const account = publicAccount(session)
      send('launcher:account', account)
      emitProgress(`Roblox connected as ${account.name}.`, 'ready')
      return { ok: true, account }
    } catch (error) {
      emitProgress(handleError(error), 'error')
      throw new Error(handleError(error))
    } finally {
      signInController = undefined
    }
  })

  ipcMain.handle('launcher:cancel-sign-in', () => {
    signInController?.abort()
    return { ok: true }
  })

  ipcMain.handle('launcher:sign-out', async () => {
    memorySession = undefined
    await fs.rm(sessionFile, { force: true })
    activeExperience = undefined
    send('launcher:account', null)
    return { ok: true }
  })

  ipcMain.handle('launcher:launch-experience', async (_event, placeId, experienceName) => launchExperience(placeId, experienceName))

  ipcMain.handle('launcher:leave-experience', () => {
    activeExperience = undefined
    return { ok: true }
  })

  ipcMain.handle('launcher:save-settings', async (_event, patch) => {
    const current = await loadSettings()
    const next = { ...current }
    if (typeof patch?.autoUpdate === 'boolean') next.autoUpdate = patch.autoUpdate
    if (typeof patch?.closeOnLaunch === 'boolean') next.closeOnLaunch = patch.closeOnLaunch
    if (typeof patch?.lowLatency === 'boolean') next.lowLatency = patch.lowLatency
    if (['auto', 'high', 'balanced', 'performance'].includes(patch?.graphics)) next.graphics = patch.graphics
    if (['auto', 'us', 'eu', 'asia'].includes(patch?.region)) next.region = patch.region
    await writeJsonFile(settingsFile, next)
    return next
  })

  ipcMain.handle('launcher:save-library', async (_event, library) => {
    const current = await loadLibrary()
    const next = {
      favorites: Array.isArray(library?.favorites) ? library.favorites.filter((id) => /^\d{1,20}$/.test(String(id))).slice(0, 200) : current.favorites,
      recent: Array.isArray(library?.recent)
        ? library.recent.slice(0, 12).map((item) => ({ placeId: String(item.placeId), name: String(item.name || 'Experience').slice(0, 80), at: Number(item.at) || Date.now() }))
        : current.recent,
      installed: Array.isArray(library?.installed) ? library.installed.filter((id) => /^\d{1,20}$/.test(String(id))).slice(0, 200) : current.installed,
    }
    await writeJsonFile(libraryFile, next)
    return next
  })

  ipcMain.handle('launcher:open-folder', async (_event, which) => {
    const folder = which === 'logs' ? path.join(userData, 'logs') : dataFolder
    await fs.mkdir(folder, { recursive: true })
    const error = await shell.openPath(folder)
    if (error) throw new Error(`Could not open the RuinForge folder: ${error}`)
    return { ok: true, folder }
  })

  ipcMain.handle('launcher:open-external', async (_event, target) => {
    if (!isAllowedRobloxUrl(target)) throw new Error('RuinForge only opens Roblox addresses.')
    await shell.openExternal(target)
    return { ok: true }
  })

  ipcMain.handle('launcher:open-trusted-link', async (_event, linkId) => {
    const url = Object.hasOwn(TRUSTED_LINKS, linkId) ? TRUSTED_LINKS[linkId] : undefined
    if (!url) throw new Error('Choose a support link.')
    await shell.openExternal(url)
    return { ok: true }
  })

  // The renderer needs no network access at all: every Roblox request happens in
  // this main process. Enforcing the policy as a response header (instead of a
  // meta tag in index.html) keeps the packaged app locked down without blocking
  // embedded preview harnesses that inject their own same-origin bridge.
  const CONTENT_SECURITY_POLICY = [
    "default-src 'self'",
    "img-src 'self' data:",
    "style-src 'self'",
    "script-src 'self'",
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ')

  app.whenReady().then(async () => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [CONTENT_SECURITY_POLICY],
        },
      })
    })
    createWindow()
    nativeTheme.themeSource = 'dark'
    await fs.mkdir(dataFolder, { recursive: true })
  }).catch((error) => {
    dialog.showErrorBox(APP_NAME, handleError(error))
    app.quit()
  })

  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app.on('window-all-closed', () => {
    app.quit()
  })
}
