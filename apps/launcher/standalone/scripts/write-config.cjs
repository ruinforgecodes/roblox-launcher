'use strict'

const fs = require('node:fs')
const path = require('node:path')

const appDirectory = path.resolve(__dirname, '..')
const envFile = path.join(appDirectory, '.env')
const envLines = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8').split(/\r?\n/) : []

function readEnv(name) {
  const configuredLine = envLines.find((line) => new RegExp(`^\\s*${name}\\s*=`).test(line))
  const value = process.env[name] ?? configuredLine?.split('=').slice(1).join('=') ?? ''
  return value.trim().replace(/^(['"])(.*)\1$/, '$2')
}

const clientId = readEnv('RUINFORGE_ROBLOX_CLIENT_ID')
const clientSecret = readEnv('RUINFORGE_ROBLOX_CLIENT_SECRET')

if (!/^[A-Za-z0-9._-]{8,128}$/.test(clientId)) {
  throw new Error('Set RUINFORGE_ROBLOX_CLIENT_ID in .env or in the build environment before packaging.')
}
if (clientSecret && !/^[\w.-]{16,256}$/.test(clientSecret)) {
  throw new Error('RUINFORGE_ROBLOX_CLIENT_SECRET is set but does not look like a Roblox client secret.')
}

const output = path.join(appDirectory, 'src', 'generated-config.cjs')
fs.writeFileSync(output, `'use strict'\nmodule.exports = Object.freeze(${JSON.stringify({ robloxClientId: clientId, robloxClientSecret: clientSecret }, null, 2)})\n`, 'utf8')
console.log('Roblox OAuth client configuration embedded for desktop sign-in.')
