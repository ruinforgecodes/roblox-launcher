'use strict'

const { app, BrowserWindow, dialog, ipcMain, nativeTheme, safeStorage, shell } = require('electron')
const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { spawn, spawnSync } = require('node:child_process')
const { pipeline } = require('node:stream/promises')
const { Readable } = require('node:stream')
const { createHash } = require('node:crypto')
const { Client } = require('minecraft-launcher-core')
const AdmZip = require('adm-zip')
const { MicrosoftMinecraftAuth, LoginError, isMicrosoftSignInUrl } = require('./microsoft.cjs')
const { installMrpack } = require('./mrpack.cjs')
const { microsoftClientId } = require('./generated-config.cjs')

const FABRIC_PROFILE_URL = 'https://meta.fabricmc.net/v2/versions/loader'
const ADOPTIUM_ASSETS_URL = 'https://api.adoptium.net/v3/assets/latest/25/hotspot?architecture=x64&image_type=jre&os=windows&vendor=eclipse'
const MAX_JAVA_DOWNLOAD_SIZE = 350 * 1024 * 1024
const MIN_JAVA_MAJOR_VERSION = 25
const APP_NAME = 'RuinForge Launcher'
const TOOL_FOLDERS = Object.freeze({
  worlds: 'saves',
  screenshots: 'screenshots',
  resourcepacks: 'resourcepacks',
  shaderpacks: 'shaderpacks',
  mods: 'mods',
  logs: 'logs',
  config: 'config',
})
const TRUSTED_RESOURCES = Object.freeze({
  modrinth: 'https://modrinth.com/',
  fabric: 'https://fabricmc.net/',
  wiki: 'https://minecraft.wiki/',
  help: 'https://help.minecraft.net/',
})

app.setName(APP_NAME)
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  let mainWindow
  let busy = false
  let loginController
  let stopRequested = false
  let minecraftProcess
  let launcher
  let activeJavaPath
  const profilePath = path.join(app.getPath('userData'), 'instances', 'RuinForge-26.3')
  const accountsFile = path.join(app.getPath('userData'), 'account.enc')
  const settingsFile = path.join(app.getPath('userData'), 'settings.json')
  const bundledPack = app.isPackaged
    ? path.join(process.resourcesPath, 'packs', 'RuinForge-Client-3.26.3+mc26.3.mrpack')
    : path.resolve(__dirname, '..', '..', '..', '..', 'release', 'RuinForge-Client-3.26.3+mc26.3.mrpack')

  function send(channel, payload) {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload)
  }

  function emitProgress(message, stage = 'setup', current = 0, total = 0) {
    send('launcher:progress', { message, stage, current, total })
  }

  function handleError(error) {
    if (error?.name === 'AbortError' || error?.code === 'ABORT_ERR') return 'Sign-in or installation was cancelled.'
    return error instanceof Error ? error.message : 'Something went wrong. Check your internet connection and try again.'
  }

  async function getSavedAccount() {
    const bytes = await fs.readFile(accountsFile).catch((error) => {
      if (error.code === 'ENOENT') return undefined
      throw error
    })
    if (!bytes) return undefined
    if (!safeStorage.isEncryptionAvailable()) {
      await fs.rm(accountsFile, { force: true })
      return undefined
    }
    try {
      const account = JSON.parse(safeStorage.decryptString(bytes))
      if (typeof account.refreshToken !== 'string'
        || typeof account.uuid !== 'string'
        || typeof account.name !== 'string') {
        throw new Error('Stored account is incomplete.')
      }
      return account
    } catch (error) {
      await fs.rm(accountsFile, { force: true })
      throw new Error(`The saved Microsoft sign-in could not be read. Please sign in again. ${error.message}`)
    }
  }

  async function saveAccount(account) {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Windows secure credential storage is not available, so RuinForge cannot safely save this account. Restart Windows and try again.')
    }
    const encrypted = safeStorage.encryptString(JSON.stringify({
      name: account.name,
      uuid: account.uuid,
      refreshToken: account.refreshToken,
    }))
    await fs.mkdir(path.dirname(accountsFile), { recursive: true })
    const temporaryFile = `${accountsFile}.${crypto.randomUUID()}.tmp`
    await fs.writeFile(temporaryFile, encrypted)
    await fs.rename(temporaryFile, accountsFile)
  }

  async function saveSettings(settings) {
    await fs.mkdir(path.dirname(settingsFile), { recursive: true })
    await fs.writeFile(settingsFile, `${JSON.stringify(settings, null, 2)}\n`, 'utf8')
  }

  async function loadSettings() {
    const defaults = { memoryGb: Math.max(4, Math.min(8, Math.floor(os.totalmem() / (1024 ** 3) / 3))) }
    const raw = await fs.readFile(settingsFile, 'utf8').catch((error) => {
      if (error.code === 'ENOENT') return undefined
      throw error
    })
    if (!raw) return defaults
    try {
      const settings = JSON.parse(raw)
      const memoryGb = Number(settings.memoryGb)
      return { memoryGb: Number.isInteger(memoryGb) && memoryGb >= 2 && memoryGb <= 16 ? memoryGb : defaults.memoryGb }
    } catch (error) {
      throw new Error(`Launcher settings could not be read: ${error.message}`)
    }
  }

  async function findJava() {
    if (activeJavaPath) return activeJavaPath
    const fromPath = spawnSync('where.exe', ['java'], { windowsHide: true, encoding: 'utf8' })
    const candidates = new Set(
      typeof fromPath.stdout === 'string' && fromPath.status === 0
        ? fromPath.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
        : [],
    )
    for (const candidate of [
      path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Eclipse Adoptium'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Eclipse Adoptium'),
      path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Java'),
    ]) {
      const entries = await fs.readdir(candidate, { withFileTypes: true }).catch(() => [])
      for (const entry of entries) {
        if (entry.isDirectory()) candidates.add(path.join(candidate, entry.name, 'bin', 'java.exe'))
      }
    }
    for (const javaPath of candidates) {
      const check = spawnSync(javaPath, ['-version'], { windowsHide: true, encoding: 'utf8', timeout: 5000 })
      const info = `${check.stdout || ''}\n${check.stderr || ''}`
      const version = info.match(/version\s+"(?:1\.)?(\d+)/i)
      if (check.status === 0 && version && Number(version[1]) >= MIN_JAVA_MAJOR_VERSION) {
        activeJavaPath = javaPath
        return javaPath
      }
    }
    return undefined
  }

  async function downloadJava() {
    emitProgress('Finding the official Java 25 runtime for Minecraft...', 'java')
    const metadataResponse = await fetch(ADOPTIUM_ASSETS_URL)
    if (!metadataResponse.ok) {
      throw new Error(`Could not check the Eclipse Adoptium Java 25 download (HTTP ${metadataResponse.status}).`)
    }
    const assets = await metadataResponse.json()
    const asset = assets.find((item) => item.binary?.package?.link && item.binary?.package?.checksum)
    const packageInfo = asset?.binary?.package
    const archiveUrl = typeof packageInfo?.link === 'string' ? new URL(packageInfo.link) : undefined
    const expectedChecksum = packageInfo?.checksum
    if (!archiveUrl
      || archiveUrl.protocol !== 'https:'
      || archiveUrl.hostname !== 'github.com'
      || !archiveUrl.pathname.toLowerCase().startsWith('/adoptium/temurin25-binaries/releases/download/')
      || typeof expectedChecksum !== 'string'
      || !/^[\da-f]{64}$/i.test(expectedChecksum)) {
      throw new Error('Eclipse Adoptium did not return a valid Java runtime download.')
    }
    emitProgress('Downloading the free Java 25 runtime for Minecraft...', 'java')
    const response = await fetch(archiveUrl, { redirect: 'follow' })
    if (!response.ok || !response.body) {
      throw new Error(`Could not download Java 25 from Eclipse Adoptium (HTTP ${response.status}). Try again later.`)
    }
    const finalUrl = new URL(response.url)
    const finalPath = finalUrl.pathname.toLowerCase()
    if (finalUrl.protocol !== 'https:'
      || (finalUrl.hostname !== 'github.com'
        && finalUrl.hostname !== 'release-assets.githubusercontent.com'
        && finalUrl.hostname !== 'objects.githubusercontent.com')
      || (finalUrl.hostname === 'github.com' && !finalPath.startsWith('/adoptium/temurin25-binaries/releases/download/'))) {
      throw new Error('Eclipse Adoptium redirected the Java download to an untrusted source.')
    }
    const length = Number(response.headers.get('content-length'))
    if (Number.isFinite(length) && length > MAX_JAVA_DOWNLOAD_SIZE) {
      throw new Error('The Java runtime download exceeds the safe 350 MB size limit.')
    }
    const archivePath = path.join(app.getPath('userData'), 'runtime', 'java25.zip')
    const temporaryPath = `${archivePath}.download`
    await fs.mkdir(path.dirname(archivePath), { recursive: true })
    let downloadedBytes = 0
    const hash = createHash('sha256')
    const counter = new (require('node:stream').Transform)({
      transform(chunk, encoding, callback) {
        downloadedBytes += chunk.length
        if (downloadedBytes > MAX_JAVA_DOWNLOAD_SIZE) {
          callback(new Error('The Java runtime download exceeds the safe 350 MB size limit.'))
          return
        }
        hash.update(chunk)
        emitProgress('Downloading Java 25...', 'java', downloadedBytes, Number.isFinite(length) ? length : 0)
        callback(null, chunk)
      },
    })
    try {
      await pipeline(Readable.fromWeb(response.body), counter, require('node:fs').createWriteStream(temporaryPath))
      if (hash.digest('hex').toLowerCase() !== expectedChecksum.toLowerCase()) {
        throw new Error('The downloaded Java runtime failed its official SHA-256 integrity check.')
      }
      await fs.rename(temporaryPath, archivePath)
      const archive = new AdmZip(archivePath)
      const root = path.join(app.getPath('userData'), 'runtime', 'java25')
      for (const entry of archive.getEntries()) {
        if (entry.isDirectory) continue
        const name = entry.entryName.replaceAll('\\', '/')
        const parts = name.split('/')
        if (name.startsWith('/') || /^[a-zA-Z]:/.test(name) || parts.some((part) => part === '..' || part === '')) {
          throw new Error('The Java runtime archive contains an unsafe file path.')
        }
        const target = path.resolve(root, ...parts)
        const relative = path.relative(root, target)
        if (relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
          throw new Error('The Java runtime archive contains an unsafe file path.')
        }
        await fs.mkdir(path.dirname(target), { recursive: true })
        await fs.writeFile(target, entry.getData())
      }
      const javaName = await findRuntimeExecutable(root)
      if (!javaName) throw new Error('The Java archive did not include a usable Windows Java 25 runtime.')
      activeJavaPath = javaName
      return javaName
    } catch (error) {
      await fs.rm(temporaryPath, { force: true })
      throw error
    } finally {
      await fs.rm(archivePath, { force: true })
    }
  }

  async function findRuntimeExecutable(root) {
    async function walk(directory, depth) {
      if (depth > 5) return undefined
      const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => [])
      for (const entry of entries) {
        if (!entry.isDirectory() && entry.name.toLowerCase() === 'java.exe') {
          const candidate = path.join(directory, entry.name)
          const check = spawnSync(candidate, ['-version'], { windowsHide: true, encoding: 'utf8', timeout: 5000 })
          const output = `${check.stdout || ''}\n${check.stderr || ''}`
          const version = output.match(/version\s+"(?:1\.)?(\d+)/i)
          if (check.status === 0 && version && Number(version[1]) === MIN_JAVA_MAJOR_VERSION) return candidate
        }
      }
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const result = await walk(path.join(directory, entry.name), depth + 1)
          if (result) return result
        }
      }
      return undefined
    }
    return walk(root, 0)
  }

  async function getPackInfo(packPath) {
    const stat = await fs.stat(packPath)
    if (!stat.isFile() || stat.size > 512 * 1024 * 1024) {
      throw new Error('This file is not a valid .mrpack file or exceeds the 512 MB size limit.')
    }
    const archive = new AdmZip(packPath)
    const entry = archive.getEntry('modrinth.index.json')
    if (!entry || entry.isDirectory) throw new Error('The selected file is not a valid Modrinth modpack.')
    const index = JSON.parse(entry.getData().toString('utf8'))
    if (typeof index.dependencies?.minecraft !== 'string'
      || !/^[\w.+-]{1,50}$/.test(index.dependencies.minecraft)
      || typeof index.dependencies?.['fabric-loader'] !== 'string'
      || !/^[\w.+-]{1,50}$/.test(index.dependencies['fabric-loader'])) {
      throw new Error('The modpack must declare both a Minecraft version and Fabric loader.')
    }
    return index
  }

  function getInstanceDirectory(index) {
    const name = typeof index.name === 'string'
      ? index.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
      : 'Minecraft'
    if (index.dependencies.minecraft === '26.3' && /^RuinForge Client 3\.26\.3$/i.test(index.name)) return profilePath
    const folderName = `${name || 'Minecraft'}-${index.dependencies.minecraft}`
    if (!/^[\w.-]{1,100}$/.test(folderName)) throw new Error('The modpack has an unsafe profile name.')
    return path.join(app.getPath('userData'), 'instances', folderName)
  }

  async function prepareFabric(root, info) {
    const versionId = info.profileVersionId
    const versionFile = path.join(root, 'versions', versionId, `${versionId}.json`)
    const existing = await fs.readFile(versionFile, 'utf8').then(JSON.parse).catch(() => undefined)
    if (existing && existing.inheritsFrom === info.minecraftVersion && existing.mainClass) return versionId
    emitProgress('Setting up the official Fabric game profile...', 'fabric')
    const url = `${FABRIC_PROFILE_URL}/${encodeURIComponent(info.minecraftVersion)}/${encodeURIComponent(info.fabricLoader)}/profile/json`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Fabric does not have loader ${info.fabricLoader} for Minecraft ${info.minecraftVersion} (HTTP ${response.status}).`)
    }

    const profile = await response.json()
    if (profile.id !== versionId || profile.inheritsFrom !== info.minecraftVersion || !profile.mainClass) {
      throw new Error('Fabric returned a profile that does not match the selected modpack.')
    }
    await fs.mkdir(path.dirname(versionFile), { recursive: true })
    await fs.writeFile(versionFile, `${JSON.stringify(profile, null, 2)}\n`, 'utf8')
    return versionId
  }

  function mclcAuthorization(account, minecraftAccessToken) {
    return {
      access_token: minecraftAccessToken,
      client_token: account.uuid,
      uuid: account.uuid,
      name: account.name,
      user_properties: {},
      meta: { type: 'msa', demo: false },
    }
  }

  async function doInstallAndPlay(customPackPath) {
    const account = await getSavedAccount()
    if (!account) throw new Error('Sign in with Microsoft before installing or playing Minecraft.')
    const settings = await loadSettings()
    const packPath = customPackPath || bundledPack
    if (!path.extname(packPath).toLowerCase().endsWith('mrpack')) {
      throw new Error('Choose a Modrinth .mrpack file.')
    }
    const info = await getPackInfo(packPath)
    const currentProfilePath = getInstanceDirectory(info)
    await fs.mkdir(currentProfilePath, { recursive: true })
    const java = await findJava() || await downloadJava()
    if (stopRequested) throw new Error('Minecraft launch was cancelled.')
    const accountAuth = new MicrosoftMinecraftAuth(microsoftClientId, {
      onProgress: (message) => emitProgress(message, 'account'),
    })
    const currentAccount = await accountAuth.authenticate(account.refreshToken)
    await saveAccount({ ...currentAccount, name: account.name, uuid: account.uuid })
    const profileId = await prepareFabric(currentProfilePath, {
      profileVersionId: `fabric-loader-${info.dependencies['fabric-loader']}-${info.dependencies.minecraft}`,
      minecraftVersion: info.dependencies.minecraft,
      fabricLoader: info.dependencies['fabric-loader'],
    })
    const installed = await installMrpack(packPath, currentProfilePath, {
      onProgress: (progress) => emitProgress(progress.label, progress.stage, progress.current, progress.total),
      shouldStop: () => stopRequested,
    })
    if (stopRequested) throw new Error('Minecraft launch was cancelled.')
    emitProgress('Checking and installing Minecraft files...', 'minecraft')
    launcher = new Client()
    launcher.on('progress', (progress) => {
      if (progress && Number.isFinite(progress.task) && Number.isFinite(progress.total)) {
        emitProgress('Downloading Minecraft game files...', 'minecraft', progress.task, progress.total)
      }
    })
    launcher.on('debug', () => {})
    launcher.on('data', () => {})
    const memoryGb = Math.max(2, Math.min(16, settings.memoryGb))
    emitProgress('Preparing your RuinForge game files...', 'minecraft')
    minecraftProcess = await launcher.launch({
      root: currentProfilePath,
      version: {
        number: installed.minecraftVersion,
        type: 'release',
        custom: profileId,
      },
      javaPath: java,
      memory: { min: '2G', max: `${memoryGb}G` },
      authorization: mclcAuthorization(currentAccount, currentAccount.minecraftAccessToken),
      timeout: 30_000,
      overrides: {
        gameDirectory: currentProfilePath,
      },
    })
    if (!minecraftProcess) throw new Error('The Minecraft launcher could not start the Java process.')
    minecraftProcess.on('error', (error) => {
      send('launcher:game-exit', { error: error.message })
    })
    minecraftProcess.on('close', (code) => {
      minecraftProcess = undefined
      send('launcher:game-exit', { code })
    })
    emitProgress('RuinForge is running. Have fun!', 'playing')
    return { ok: true, profile: installed.name, javaVersion: '25', folder: currentProfilePath }
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1180,
      height: 760,
      minWidth: 920,
      minHeight: 640,
      backgroundColor: '#0e0d0e',
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
      if (url.startsWith('https://')) shell.openExternal(url)
      return { action: 'deny' }
    })
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
  }

  ipcMain.handle('launcher:initial-state', async () => {
    const [account, settings, javaPath, packExists] = await Promise.all([
      getSavedAccount(),
      loadSettings(),
      findJava(),
      fs.access(bundledPack).then(() => true).catch(() => false),
    ])
    return {
      account: account ? { name: account.name, uuid: account.uuid } : null,
      settings,
      java: javaPath ? { available: true, managed: false } : { available: false, managed: true },
      pack: { available: packExists, version: '26.3', loader: 'Fabric 0.20.1' },
      folder: profilePath,
    }
  })

  ipcMain.handle('launcher:sign-in', async () => {
    if (busy) throw new Error('Another launcher task is already running.')
    busy = true
    loginController = new AbortController()
    const auth = new MicrosoftMinecraftAuth(microsoftClientId, {
      onDeviceCode: (code) => {
        send('launcher:device-code', code)
        if (code.verificationUrl === 'https://microsoft.com/devicelogin'
          || code.verificationUrl === 'https://www.microsoft.com/link') {
          shell.openExternal(code.verificationUrl)
        }
      },
      onProgress: (message) => emitProgress(message, 'account'),
    })
    try {
      const account = await auth.login(loginController.signal)
      await saveAccount(account)
      emitProgress(`Welcome, ${account.name}. Your account is saved securely on this Windows PC.`, 'ready')
      return { ok: true, account: { name: account.name, uuid: account.uuid } }
    } catch (error) {
      emitProgress(handleError(error), 'error')
      if (error instanceof LoginError && error.code === 'authorization_pending') {
        return { ok: false, message: 'Microsoft sign-in is still pending.' }
      }
      throw new Error(handleError(error))
    } finally {
      loginController = undefined
      busy = false
    }
  })

  ipcMain.handle('launcher:cancel-sign-in', () => {
    loginController?.abort()
    return { ok: true }
  })

  ipcMain.handle('launcher:sign-out', async () => {
    if (minecraftProcess) throw new Error('Close Minecraft before signing out.')
    await fs.rm(accountsFile, { force: true })
    send('launcher:account', null)
    return { ok: true }
  })

  ipcMain.handle('launcher:choose-pack', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Choose a Minecraft Modrinth modpack',
      buttonLabel: 'Select modpack',
      properties: ['openFile'],
      filters: [{ name: 'Modrinth modpacks', extensions: ['mrpack'] }],
    })
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    const selected = result.filePaths[0]
    const manifest = await getPackInfo(selected)
    return {
      canceled: false,
      path: selected,
      name: typeof manifest.name === 'string' ? manifest.name : path.basename(selected),
      version: manifest.dependencies.minecraft,
      folder: getInstanceDirectory(manifest),
    }
  })

  ipcMain.handle('launcher:open-microsoft', async (_event, target) => {
    if (!isMicrosoftSignInUrl(target)) {
      throw new Error('RuinForge only opens Microsoft’s official secure sign-in page.')
    }
    await shell.openExternal(target)
    return { ok: true }
  })

  ipcMain.handle('launcher:save-memory', async (_event, memoryGb) => {
    if (!Number.isInteger(memoryGb) || memoryGb < 2 || memoryGb > 16) {
      throw new Error('Choose a Minecraft memory limit between 2 and 16 GB.')
    }
    await saveSettings({ ...(await loadSettings()), memoryGb })
    return { memoryGb }
  })

  ipcMain.handle('launcher:install-play', async (_event, packPath) => {
    if (busy) throw new Error('A launcher task is already in progress.')
    const chosenPack = typeof packPath === 'string' && packPath ? path.resolve(packPath) : undefined
    if (chosenPack && path.extname(chosenPack).toLowerCase() !== '.mrpack') {
      throw new Error('Choose a .mrpack modpack file.')
    }
    busy = true
    stopRequested = false
    try {
      return await doInstallAndPlay(chosenPack)
    } catch (error) {
      emitProgress(handleError(error), 'error')
      throw new Error(handleError(error))
    } finally {
      busy = false
      launcher = undefined
    }
  })

  ipcMain.handle('launcher:open-folder', async (_event, instanceDirectory) => {
    const instancesRoot = path.resolve(app.getPath('userData'), 'instances')
    const directory = typeof instanceDirectory === 'string' ? path.resolve(instanceDirectory) : profilePath
    const relative = path.relative(instancesRoot, directory)
    if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error('Choose a valid RuinForge game folder.')
    }
    await fs.mkdir(directory, { recursive: true })
    const error = await shell.openPath(directory)
    if (error) throw new Error(`Could not open the RuinForge game folder: ${error}`)
    return { ok: true }
  })

  ipcMain.handle('launcher:open-tool-folder', async (_event, folderId) => {
    const folderName = Object.hasOwn(TOOL_FOLDERS, folderId) ? TOOL_FOLDERS[folderId] : undefined
    if (!folderName) throw new Error('Choose a valid Minecraft folder.')
    const directory = path.join(profilePath, folderName)
    await fs.mkdir(directory, { recursive: true })
    const error = await shell.openPath(directory)
    if (error) throw new Error(`Could not open the ${folderName} folder: ${error}`)
    return { ok: true }
  })

  ipcMain.handle('launcher:open-resource', async (_event, resourceId) => {
    const url = Object.hasOwn(TRUSTED_RESOURCES, resourceId) ? TRUSTED_RESOURCES[resourceId] : undefined
    if (!url) throw new Error('Choose a trusted Minecraft resource.')
    await shell.openExternal(url)
    return { ok: true }
  })

  ipcMain.handle('launcher:cancel-install', () => {
    stopRequested = true
    if (minecraftProcess) {
      minecraftProcess.kill()
      minecraftProcess = undefined
    }
    return { ok: true }
  })

  app.whenReady().then(async () => {
    createWindow()
    nativeTheme.themeSource = 'dark'
  }).catch((error) => {
    dialog.showErrorBox(APP_NAME, handleError(error))
    app.quit()
  })

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
  app.on('before-quit', () => {
    loginController?.abort()
  })
}
