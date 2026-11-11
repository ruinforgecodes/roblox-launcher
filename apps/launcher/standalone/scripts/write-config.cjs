const fs = require('node:fs')
const path = require('node:path')

const appDirectory = path.resolve(__dirname, '..')
const envFile = path.join(appDirectory, '.env')
const envLines = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8').split(/\r?\n/) : []
const configuredLine = envLines.find((line) => /^\s*RUINFORGE_MICROSOFT_CLIENT_ID\s*=/.test(line))
const clientId = (process.env.RUINFORGE_MICROSOFT_CLIENT_ID ?? configuredLine?.split('=').slice(1).join('=') ?? '')
  .trim()
  .replace(/^(['"])(.*)\1$/, '$2')

if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(clientId)) {
  throw new Error('Set RUINFORGE_MICROSOFT_CLIENT_ID in .env or in the build environment before packaging.')
}

const output = path.join(appDirectory, 'src', 'generated-config.cjs')
fs.writeFileSync(output, `'use strict'\nmodule.exports = Object.freeze({ microsoftClientId: ${JSON.stringify(clientId)} })\n`, 'utf8')
console.log('Microsoft public client ID embedded for desktop sign-in.')
