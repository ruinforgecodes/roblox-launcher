'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { afterEach, test } = require('node:test')
const AdmZip = require('adm-zip')
const { archiveIndex, installMrpack, safeRelativePath } = require('./mrpack.cjs')

const originalFetch = global.fetch
const temporaryDirectories = []

afterEach(async () => {
  global.fetch = originalFetch
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })))
})

test('rejects absolute paths, traversal, and drive-qualified archive paths', () => {
  for (const candidate of ['../outside.txt', 'mods/../../outside.jar', '/absolute/file', 'C:/outside.txt', 'mods\\..\\outside.jar']) {
    assert.throws(() => safeRelativePath(candidate), { message: /unsafe|invalid/i })
  }
  assert.equal(safeRelativePath('client-overrides/resourcepacks/RuinForge Ember UI.zip'), path.join('client-overrides', 'resourcepacks', 'RuinForge Ember UI.zip'))
})

test('reads the Modrinth manifest and extracts client-overrides into the profile folder', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ruinforge-mrpack-test-'))
  temporaryDirectories.push(root)
  const packPath = path.join(root, 'sample.mrpack')
  const profilePath = path.join(root, 'game')
  const modBytes = Buffer.from('known test mod bytes')
  const modHash = crypto.createHash('sha1').update(modBytes).digest('hex')
  const archive = new AdmZip()
  archive.addFile('modrinth.index.json', Buffer.from(JSON.stringify({
    formatVersion: 1,
    game: 'minecraft',
    name: 'Test RuinForge Pack',
    versionId: 'test',
    dependencies: { minecraft: '26.3', 'fabric-loader': '0.20.1' },
    files: [{
      path: 'mods/sample.jar',
      hashes: { sha1: modHash },
      downloads: ['https://cdn.modrinth.com/test/sample.jar'],
      fileSize: modBytes.length,
      env: { client: 'required', server: 'unsupported' },
    }],
  })))
  archive.addFile('client-overrides/config/ruinforge.txt', Buffer.from('custom configuration'))
  archive.addFile('client-overrides/resourcepacks/RuinForge Ember UI.zip', Buffer.from('resource pack'))
  await fs.writeFile(packPath, archive.toBuffer())
  global.fetch = async (input) => {
    assert.equal(new URL(input).origin, 'https://cdn.modrinth.com')
    return {
      ok: true,
      url: 'https://cdn.modrinth.com/test/sample.jar',
      headers: new Headers({ 'content-length': String(modBytes.length) }),
      body: require('node:stream').Readable.toWeb(require('node:stream').Readable.from([modBytes])),
    }
  }

  const manifest = archiveIndex(new AdmZip(packPath))
  assert.equal(manifest.name, 'Test RuinForge Pack')
  const installed = await installMrpack(packPath, profilePath)

  assert.equal(installed.name, 'Test RuinForge Pack')
  assert.equal(installed.minecraftVersion, '26.3')
  assert.equal(installed.fabricLoader, '0.20.1')
  assert.equal(await fs.readFile(path.join(profilePath, 'mods', 'sample.jar'), 'utf8'), modBytes.toString())
  assert.equal(await fs.readFile(path.join(profilePath, 'config', 'ruinforge.txt'), 'utf8'), 'custom configuration')
  assert.equal(await fs.readFile(path.join(profilePath, 'resourcepacks', 'RuinForge Ember UI.zip'), 'utf8'), 'resource pack')
})

test('rejects mod downloads from any host other than the official Modrinth CDN', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ruinforge-mrpack-test-'))
  temporaryDirectories.push(root)
  const packPath = path.join(root, 'untrusted.mrpack')
  const archive = new AdmZip()
  archive.addFile('modrinth.index.json', Buffer.from(JSON.stringify({
    formatVersion: 1,
    game: 'minecraft',
    name: 'Untrusted URL test',
    versionId: 'test',
    dependencies: { minecraft: '26.3', 'fabric-loader': '0.20.1' },
    files: [{
      path: 'mods/mod.jar',
      hashes: { sha1: '0'.repeat(40) },
      downloads: ['https://untrusted.example/mod.jar'],
      fileSize: 1,
      env: { client: 'required', server: 'unsupported' },
    }],
  })))
  await fs.writeFile(packPath, archive.toBuffer())

  await assert.rejects(installMrpack(packPath, path.join(root, 'game')), /untrusted download source/i)
})

test('rejects a Minecraft version manifest with an invalid schema', () => {
  const archive = new AdmZip()
  archive.addFile('modrinth.index.json', Buffer.from(JSON.stringify({ formatVersion: 1, name: 'Not a game profile' })))
  assert.throws(() => archiveIndex(archive), /invalid or unsupported/i)
})
