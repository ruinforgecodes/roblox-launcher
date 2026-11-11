'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const path = require('node:path')
const { createWriteStream } = require('node:fs')
const { Readable, Transform } = require('node:stream')
const { pipeline } = require('node:stream/promises')
const AdmZip = require('adm-zip')

const MAX_PACK_SIZE = 512 * 1024 * 1024
const MAX_ENTRY_COUNT = 20_000
const MAX_UNCOMPRESSED_SIZE = 2 * 1024 * 1024 * 1024
const MODRINTH_DOWNLOAD_ORIGIN = 'https://cdn.modrinth.com'

function safeRelativePath(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 1024 || value.includes('\0')) {
    throw new Error('The modpack contains an invalid file path.')
  }
  const normalized = value.replaceAll('\\', '/')
  if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
    throw new Error('The modpack contains an unsafe absolute file path.')
  }
  const parts = normalized.split('/')
  const windowsNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i
  if (parts.some((part) => part === ''
    || part === '.'
    || part === '..'
    || /[:<>|"*?]/.test(part)
    || /[. ]$/.test(part)
    || windowsNames.test(part))) {
    throw new Error('The modpack contains an unsafe relative file path.')
  }
  return parts.join(path.sep)
}

function resolveInside(root, relativePath) {
  const destination = path.resolve(root, safeRelativePath(relativePath))
  const relative = path.relative(root, destination)
  if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('The modpack contains a file path outside its profile folder.')
  }
  return destination
}

function archiveIndex(archive) {
  if (archive.getEntries().length > MAX_ENTRY_COUNT) {
    throw new Error('This modpack has too many archive entries to import safely.')
  }
  let uncompressedBytes = 0
  const indexEntry = archive.getEntry('modrinth.index.json')
  if (!indexEntry || indexEntry.isDirectory) throw new Error('This file is not a Modrinth modpack.')
  const index = JSON.parse(indexEntry.getData().toString('utf8'))
  if (index.formatVersion !== 1 || typeof index.name !== 'string' || typeof index.dependencies?.minecraft !== 'string') {
    throw new Error('The Modrinth modpack manifest is invalid or unsupported.')
  }
  if (!Array.isArray(index.files) || index.files.length > MAX_ENTRY_COUNT) {
    throw new Error('The modpack contains an invalid or oversized file manifest.')
  }
  for (const entry of archive.getEntries()) {
    if (entry.header?.attr && ((entry.header.attr >>> 16) & 0xF000) === 0xA000) {
      throw new Error('The modpack contains an unsupported symbolic link.')
    }
    uncompressedBytes += Number(entry.header?.size) || 0
    if (uncompressedBytes > MAX_UNCOMPRESSED_SIZE) {
      throw new Error('The modpack is too large to import safely.')
    }
  }
  return index
}

function sha1(buffer) {
  return crypto.createHash('sha1').update(buffer).digest('hex')
}

async function downloadFile(url, destination, expectedHash, signal) {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || parsed.origin !== MODRINTH_DOWNLOAD_ORIGIN) {
    throw new Error('The modpack links to an untrusted download source. Only official Modrinth downloads are allowed.')
  }
  const response = await fetch(parsed, { signal })
  if (!response.ok) throw new Error(`Modrinth could not download a modpack file (HTTP ${response.status}).`)
  if (!response.url || new URL(response.url).origin !== MODRINTH_DOWNLOAD_ORIGIN) {
    throw new Error('Modrinth redirected a file download to an untrusted source.')
  }
  const sizeHeader = Number(response.headers.get('content-length'))
  if (Number.isFinite(sizeHeader) && sizeHeader > MAX_PACK_SIZE) {
    throw new Error('A modpack file exceeds the 512 MB per-file import limit.')
  }
  if (!response.body) throw new Error('Modrinth returned an empty modpack file download.')
  const temporary = `${destination}.${crypto.randomUUID()}.download`
  const digest = crypto.createHash('sha1')
  let downloadedBytes = 0
  const verify = new Transform({
    transform(chunk, _encoding, callback) {
      downloadedBytes += chunk.length
      if (downloadedBytes > MAX_PACK_SIZE) {
        callback(new Error('A modpack file exceeds the 512 MB per-file import limit.'))
        return
      }
      digest.update(chunk)
      callback(null, chunk)
    },
  })
  try {
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await pipeline(Readable.fromWeb(response.body), verify, createWriteStream(temporary, { flags: 'wx' }), { signal })
    if (digest.digest('hex') !== expectedHash.toLowerCase()) {
      throw new Error(`A downloaded modpack file did not match its SHA-1 checksum: ${path.basename(destination)}`)
    }
    await fs.rename(temporary, destination)
  } catch (error) {
    await fs.rm(temporary, { force: true })
    throw error
  }
}

async function extractEntry(entry, destination, relativeName = entry.entryName) {
  const mode = (entry.header?.attr >>> 16) & 0xF000
  if (mode === 0xA000) throw new Error('The modpack contains an unsupported symbolic link.')
  if (entry.isDirectory) {
    const directoryName = relativeName.replace(/[\\/]+$/, '')
    if (directoryName) await fs.mkdir(resolveInside(destination, directoryName), { recursive: true })
    return
  }
  const relative = safeRelativePath(relativeName)
  const target = resolveInside(destination, relative)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, entry.getData())
}

async function installMrpack(packPath, profilePath, {
  signal,
  onProgress = () => {},
  shouldStop = () => false,
} = {}) {
  const stat = await fs.stat(packPath)
  if (!stat.isFile() || stat.size > MAX_PACK_SIZE) {
    throw new Error('The selected modpack is not a valid .mrpack file or exceeds the 512 MB size limit.')
  }
  const archive = new AdmZip(packPath)
  const manifest = archiveIndex(archive)
  const profileRoot = path.resolve(profilePath)
  await fs.mkdir(profileRoot, { recursive: true })
  const files = manifest.files.filter((file) => file.env?.client !== 'unsupported')
  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted || shouldStop()) throw new Error('Modpack installation was cancelled.')
    const item = files[i]
    const relative = safeRelativePath(item.path)
    const file = item.fileSize
    if (!file || !Number.isSafeInteger(file) || file < 0 || file > MAX_PACK_SIZE) {
      throw new Error(`The modpack manifest has an invalid file size: ${path.basename(relative)}`)
    }
    const downloads = Array.isArray(item.downloads) ? item.downloads : []
    const expectedHash = typeof item.hashes?.sha1 === 'string' ? item.hashes.sha1 : ''
    if (!/^[\da-f]{40}$/i.test(expectedHash) || downloads.length === 0) {
      throw new Error(`The modpack file is missing its official download URL or SHA-1 checksum: ${path.basename(relative)}`)
    }
    const destination = resolveInside(profileRoot, relative)
    let installed = false
    let lastError
    for (const url of downloads) {
      try {
        const existing = await fs.readFile(destination).catch(() => undefined)
        if (existing && sha1(existing) === expectedHash.toLowerCase()) {
          installed = true
          break
        }
        await downloadFile(url, destination, expectedHash, signal)
        installed = true
        break
      } catch (error) {
        if (signal?.aborted) throw error
        lastError = error
      }
    }
    if (!installed) throw lastError || new Error(`Could not install modpack file: ${path.basename(relative)}`)
    onProgress({
      stage: 'mods',
      current: i + 1,
      total: files.length,
      label: `Installing modpack files (${i + 1}/${files.length})`,
    })
  }

  if (signal?.aborted || shouldStop()) throw new Error('Modpack installation was cancelled.')
  const archiveEntries = archive.getEntries()
  const overridePrefixes = ['client-overrides/', 'overrides/']
    .filter((prefix) => archiveEntries.some((entry) => entry.entryName.startsWith(prefix)))
  for (const overridePrefix of overridePrefixes) {
    const overrideEntries = archiveEntries.filter((entry) => entry.entryName.startsWith(overridePrefix))
    for (const [i, entry] of overrideEntries.entries()) {
      if (signal?.aborted || shouldStop()) throw new Error('Modpack installation was cancelled.')
      const relative = entry.entryName.slice(overridePrefix.length)
      if (relative) {
        await extractEntry(entry, profileRoot, relative)
      }
      onProgress({
        stage: 'overrides',
        current: i + 1,
        total: overrideEntries.length,
        label: 'Setting up your RuinForge profile',
      })
    }
  }
  const fabricLoader = manifest.dependencies['fabric-loader']
  if (typeof fabricLoader !== 'string') throw new Error('This RuinForge modpack does not specify a Fabric loader version.')
  return {
    name: manifest.name,
    minecraftVersion: manifest.dependencies.minecraft,
    fabricLoader,
    profileVersionId: `fabric-loader-${fabricLoader}-${manifest.dependencies.minecraft}`,
    gameDirectory: profileRoot,
  }
}

module.exports = { archiveIndex, installMrpack, safeRelativePath }
