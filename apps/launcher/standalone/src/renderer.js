'use strict'

const api = window.ruinforge
const elements = Object.fromEntries([
  'home-view', 'library-view', 'tools-view', 'settings-view', 'page-name', 'account-button', 'home-signin',
  'settings-account-button', 'play-button', 'play-label', 'open-folder', 'library-folder-button',
  'settings-folder-button', 'library-folder', 'status-message', 'progress-bar', 'install-status',
  'memory-setting', 'java-setting', 'sidebar-avatar', 'sidebar-name', 'sidebar-status', 'account-dot',
  'home-account-heading', 'home-account-description', 'settings-account-description', 'import-button',
  'device-overlay', 'login-waiting', 'login-code-card', 'login-code', 'open-microsoft',
  'cancel-login', 'close-device', 'message-toast', 'login-error',
].map((id) => [id, document.getElementById(id)]))

const pageNames = { home: 'HOME', library: 'MY LIBRARY', tools: 'TOOLBOX', settings: 'SETTINGS' }
let selectedPackPath = ''
let selectedPackFolder = ''
let loginWindowUrl = 'https://microsoft.com/devicelogin'
let isBusy = false
let toastTimeout

function showToast(message) {
  if (!message) return
  elements['message-toast'].textContent = message
  elements['message-toast'].classList.remove('hidden')
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => elements['message-toast'].classList.add('hidden'), 5000)
}

function setStatus(message, state = 'idle', current = 0, total = 0) {
  elements['status-message'].textContent = message
  const progress = elements['progress-bar']
  progress.parentElement.classList.toggle('running', state === 'running')
  if (Number.isFinite(total) && total > 0) {
    progress.parentElement.classList.remove('running')
    progress.style.width = `${Math.max(3, Math.min(100, Math.round((current / total) * 100)))}%`
  } else if (state === 'ready') {
    progress.style.width = '100%'
  } else if (state === 'idle') {
    progress.style.width = '0%'
  }
  elements['play-label'].textContent = state === 'running' ? 'WORKING…' : state === 'playing' ? 'MINECRAFT OPEN' : 'PLAY RUINFORGE'
  elements['play-button'].disabled = isBusy || (!window.ruinforgeAccount && state !== 'playing')
}

function setAccount(account) {
  window.ruinforgeAccount = account || null
  const name = account?.name || 'Not signed in'
  elements['sidebar-name'].textContent = name
  elements['sidebar-status'].textContent = account ? 'Minecraft Java account' : 'Sign in to play'
  elements['sidebar-avatar'].textContent = account ? Array.from(name)[0].toUpperCase() : 'R'
  elements['account-dot'].classList.toggle('online', !!account)
  elements['account-button'].innerHTML = account
    ? '<span>●</span> ACCOUNT'
    : 'SIGN IN <span>↗</span>'
  elements['home-account-heading'].textContent = account ? `Welcome back, ${name}.` : 'Minecraft, your way.'
  elements['home-account-description'].textContent = account
    ? 'Your account is connected. Your password is never stored in RuinForge.'
    : "Secure Microsoft sign-in. Your password is only entered on Microsoft's page."
  elements['settings-account-description'].textContent = account
    ? `Signed in as ${name}. Your Microsoft refresh token is encrypted by Windows.`
    : 'Sign in to play with the Minecraft Java account you own.'
  elements['settings-account-button'].textContent = account ? 'SIGN OUT' : 'SIGN IN'
  elements['play-label'].textContent = account ? 'PLAY RUINFORGE' : 'SIGN IN TO PLAY'
  elements['play-button'].disabled = !account || isBusy
}

function setBusy(value) {
  isBusy = value
  elements['play-button'].disabled = value || !window.ruinforgeAccount
  elements['play-button'].querySelector('.play-glyph').textContent = value ? '◌' : '▶'
  for (const id of ['account-button', 'home-signin', 'settings-account-button', 'import-button']) {
    elements[id].disabled = value
  }
  elements['play-label'].textContent = value ? 'WORKING…' : window.ruinforgeAccount ? 'PLAY RUINFORGE' : 'SIGN IN TO PLAY'
}

async function safely(action) {
  try {
    return await action()
  } catch (error) {
    setBusy(false)
    const message = error?.message || 'Something went wrong. Try again.'
    setStatus(message, 'error')
    showToast(message)
    return undefined
  }
}

function openDialog() {
  elements['device-overlay'].classList.remove('hidden')
  elements['login-waiting'].classList.remove('hidden')
  elements['login-code-card'].classList.add('hidden')
  elements['login-error'].classList.add('hidden')
  elements['login-error'].textContent = ''
  elements['login-code'].textContent = '----'
  elements['open-microsoft'].disabled = true
}

function closeDialog() {
  elements['device-overlay'].classList.add('hidden')
  api.cancelSignIn().catch(() => {})
  setBusy(false)
}

for (const button of document.querySelectorAll('.nav-item[data-view]')) {
  button.addEventListener('click', () => {
    for (const nav of document.querySelectorAll('.nav-item[data-view]')) nav.classList.toggle('active', nav === button)
    for (const view of document.querySelectorAll('.view')) view.classList.toggle('active-view', view.id === `${button.dataset.view}-view`)
    elements['page-name'].textContent = pageNames[button.dataset.view]
  })
}

async function startMicrosoftSignIn() {
  if (isBusy) return
  setBusy(true)
  setStatus('Waiting for secure Microsoft sign-in…', 'running')
  openDialog()
  try {
    const result = await api.signIn()
    elements['device-overlay'].classList.add('hidden')
    if (result?.ok && result.account) {
      setAccount(result.account)
      setStatus(`Welcome, ${result.account.name}. RuinForge is ready.`, 'ready')
      showToast('Microsoft account connected securely.')
    }
  } catch (error) {
    const message = error?.message || 'Microsoft sign-in failed. Check your internet connection and try again.'
    elements['login-waiting'].classList.add('hidden')
    elements['login-code-card'].classList.add('hidden')
    elements['login-error'].textContent = message
    elements['login-error'].classList.remove('hidden')
    setStatus(message, 'error')
    showToast(message)
  } finally {
    setBusy(false)
  }
}

for (const id of ['account-button', 'home-signin']) {
  elements[id].addEventListener('click', () => {
    if (window.ruinforgeAccount) {
      document.querySelector('[data-view="settings"]').click()
      return
    }
    startMicrosoftSignIn()
  })
}

elements['settings-account-button'].addEventListener('click', () => {
  if (window.ruinforgeAccount) {
    safely(async () => {
      await api.signOut()
      setAccount(null)
      setStatus('You are signed out. Sign in with Microsoft to play.', 'idle')
      showToast('Signed out. Your Minecraft worlds and files were not changed.')
    })
  } else {
    startMicrosoftSignIn()
  }
})

elements['play-button'].addEventListener('click', () => {
  if (isBusy || !window.ruinforgeAccount) return
  setBusy(true)
  setStatus('Installing your profile and launching Minecraft…', 'running')
  safely(async () => {
    const result = await api.installAndPlay(selectedPackPath || undefined)
    if (result?.ok) {
      selectedPackPath = ''
      setStatus(`${result.profile} is running. Have fun!`, 'playing')
      showToast(`RuinForge is running with Java ${result.javaVersion}.`)
    }
  }).finally(() => setBusy(false))
})

for (const id of ['open-folder', 'library-folder-button', 'settings-folder-button']) {
  elements[id].addEventListener('click', () => safely(() => api.openFolder(selectedPackFolder || undefined)))
}

elements['import-button'].addEventListener('click', async () => {
  const selection = await safely(() => api.choosePack())
  if (!selection || selection.canceled) return
  selectedPackPath = selection.path
  selectedPackFolder = selection.folder
  elements['library-folder'].textContent = selection.folder
  elements['install-status'].innerHTML = '<i></i> PACK SELECTED'
  setStatus(`${selection.name} selected. Sign in and press Play to import it.`, 'idle')
  showToast(`Selected ${selection.name}. Its downloads will be verified during install.`)
  document.querySelector('[data-view="home"]').click()
})

elements['memory-setting'].addEventListener('change', async () => {
  const memoryGb = Number(elements['memory-setting'].value)
  const result = await safely(() => api.saveMemory(memoryGb))
  if (result) showToast(`Minecraft memory set to ${result.memoryGb} GB.`)
})

for (const button of document.querySelectorAll('[data-tool-folder]')) {
  button.addEventListener('click', () => safely(() => api.openToolFolder(button.dataset.toolFolder)))
}

for (const button of document.querySelectorAll('[data-resource]')) {
  button.addEventListener('click', () => safely(() => api.openResource(button.dataset.resource)))
}

elements['open-microsoft'].addEventListener('click', async () => {
  await safely(async () => {
    const url = new URL(loginWindowUrl)
    if (url.protocol !== 'https:' || !['microsoft.com', 'www.microsoft.com'].includes(url.hostname)) {
      throw new Error('Microsoft returned an unexpected sign-in address.')
    }
    await api.openMicrosoftSignIn(url.toString())
  })
})

elements['cancel-login'].addEventListener('click', closeDialog)
elements['close-device'].addEventListener('click', closeDialog)
elements['device-overlay'].addEventListener('click', (event) => {
  if (event.target === elements['device-overlay']) closeDialog()
})

api.on('launcher:device-code', (data) => {
  loginWindowUrl = data.verificationUrl
  elements['login-code'].textContent = data.userCode
  elements['login-waiting'].classList.add('hidden')
  elements['login-code-card'].classList.remove('hidden')
  elements['open-microsoft'].disabled = false
})

api.on('launcher:progress', (data) => {
  if (!data || typeof data.message !== 'string') return
  const state = data.stage === 'playing' ? 'playing' : data.stage === 'ready' ? 'ready' : ['error', 'idle'].includes(data.stage) ? data.stage : 'running'
  setStatus(data.message, state, data.current, data.total)
  if (data.stage === 'error') setBusy(false)
})

api.on('launcher:account', setAccount)
api.on('launcher:game-exit', ({ code, error }) => {
  setBusy(false)
  if (error) {
    setStatus(`Minecraft could not start: ${error}`, 'error')
    showToast(`Minecraft could not start: ${error}`)
  } else {
    setStatus(`Minecraft closed${Number.isInteger(code) && code !== 0 ? ` with exit code ${code}` : ''}. Your worlds and files are safe.`, 'idle')
  }
})

async function initialize() {
  try {
    const state = await api.initialState()
    setAccount(state.account)
    elements['library-folder'].textContent = state.folder
    const availableGb = Math.max(2, Math.min(16, Math.floor((navigator.deviceMemory || 8) * 0.75)))
    const maxMemory = Math.min(16, availableGb)
    for (let gb = 2; gb <= maxMemory; gb++) {
      const option = document.createElement('option')
      option.value = String(gb)
      option.textContent = String(gb)
      option.selected = gb === state.settings.memoryGb
      elements['memory-setting'].append(option)
    }
    if (!elements['memory-setting'].selectedOptions.length && elements['memory-setting'].options.length) {
      elements['memory-setting'].value = elements['memory-setting'].options[Math.max(0, elements['memory-setting'].options.length - 1)].value
    }
    elements['java-setting'].textContent = state.java.available ? 'JAVA 25 READY' : 'AUTO-INSTALLS ON FIRST PLAY'
    elements['java-setting'].classList.toggle('ready', true)
    if (!state.pack.available) {
      elements['install-status'].innerHTML = '<i></i> CHOOSE A PACK'
      setStatus('The bundled RuinForge pack was not found. Import an .mrpack file from My library.', 'error')
    } else {
      setStatus(state.account ? `Welcome back, ${state.account.name}. Press Play to install or launch.` : 'Your profile is ready. Sign in with Microsoft to play.', 'idle')
    }
  } catch (error) {
    setStatus(error.message || 'Could not load launcher settings.', 'error')
    showToast(error.message || 'Could not load launcher settings.')
  }
}

initialize()
