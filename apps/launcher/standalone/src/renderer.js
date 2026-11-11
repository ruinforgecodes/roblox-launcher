'use strict'

/* ------------------------------------------------------------------ catalog
 * Original sample experiences for the preview build. The desktop launcher
 * resolves real experiences through Roblox; nothing here is scraped or faked
 * from a live Roblox account.
 */
const CATALOG = [
  {
    id: '90001', name: 'Neon Rift', creator: 'Vantablack Studio', genre: 'Adventure',
    players: 214000, rating: 96, updatedDays: 2, maxPlayers: 50, age: '13+', featured: true,
    art: ['#ff2e63', '#5b1bff', '#00e5ff'],
    tags: ['Story', 'Open world', 'Co-op'],
    description: 'Fall through a crack in the city and race a collapsing skyline across five neon districts. Every run rewrites the map.',
  },
  {
    id: '90002', name: 'Skyfall Arena', creator: 'Kestrel Interactive', genre: 'Battle',
    players: 168000, rating: 93, updatedDays: 5, maxPlayers: 40, age: '13+',
    art: ['#1f7cff', '#7b2cff', '#ffcf5c'],
    tags: ['PvP', 'Arena', 'Ranked'],
    description: 'Ten teams, one floating island, and a shrinking storm wall. Climb the ranked ladder with movement tools you can chain.',
  },
  {
    id: '90003', name: 'Metro Tycoon', creator: 'Copperline Games', genre: 'Tycoon',
    players: 121000, rating: 91, updatedDays: 8, maxPlayers: 20, age: '9+',
    art: ['#ffb340', '#b45309', '#63e6be'],
    tags: ['Build', 'Economy', 'Chill'],
    description: 'Lay track, buy rolling stock, and keep thousands of commuters moving. Late-game is a full city transit network.',
  },
  {
    id: '90004', name: 'Drift Circuit', creator: 'Apex Loop', genre: 'Racing',
    players: 98000, rating: 90, updatedDays: 3, maxPlayers: 24, age: '9+',
    art: ['#ff4d6d', '#2b0a3d', '#ffd166'],
    tags: ['Drift', 'Cars', 'Time trial'],
    description: 'Tune a rear-wheel-drive build and hold the angle through eight mountain sectors. Ghost replays every weekend.',
  },
  {
    id: '90005', name: 'Hollow Signal', creator: 'Nightjar Collective', genre: 'Horror',
    players: 76000, rating: 94, updatedDays: 11, maxPlayers: 8, age: '13+',
    art: ['#243b2f', '#0b1410', '#a3ff8f'],
    tags: ['Survival', 'Atmosphere', 'Co-op'],
    description: 'A radio station keeps transmitting from a town that no longer exists. Keep the generator running and answer it.',
  },
  {
    id: '90006', name: 'Tower of Echoes', creator: 'Rung Up', genre: 'Obby',
    players: 143000, rating: 89, updatedDays: 1, maxPlayers: 30, age: '9+',
    art: ['#8b5cf6', '#22d3ee', '#fef08a'],
    tags: ['Climb', 'Precision', 'Daily'],
    description: 'Three hundred floors of timed jumps with a ghost of your best run right behind you. One new floor every day.',
  },
  {
    id: '90007', name: 'Wildwood RP', creator: 'Fern & Fox', genre: 'Roleplay',
    players: 88000, rating: 87, updatedDays: 6, maxPlayers: 60, age: '13+',
    art: ['#2f7d5e', '#123c2c', '#ffd9a0'],
    tags: ['Roleplay', 'Farming', 'Social'],
    description: 'Run a forest town with friends: staff the general store, run the ferry, or just keep the campfire going.',
  },
  {
    id: '90008', name: 'Blockfront Siege', creator: 'Ironkite', genre: 'Battle',
    players: 132000, rating: 92, updatedDays: 4, maxPlayers: 64, age: '13+',
    art: ['#6b7f3a', '#2c3a17', '#ffa94d'],
    tags: ['Shooter', 'Squads', 'Objective'],
    description: 'Forty-minute objective rounds across destructible towns. Dig in, hold the line, or flank with a smoke push.',
  },
  {
    id: '90009', name: 'Deepwater Depths', creator: 'Tidewell', genre: 'Adventure',
    players: 61000, rating: 95, updatedDays: 9, maxPlayers: 12, age: '9+',
    art: ['#0aa4c9', '#04263f', '#a5f3fc'],
    tags: ['Exploration', 'Mystery', 'Co-op'],
    description: 'Pilot a two-person sub through trenches and map a bioluminescent ecosystem that reacts to your light.',
  },
  {
    id: '90010', name: 'Mecha Meltdown', creator: 'Gearworks', genre: 'Battle',
    players: 57000, rating: 88, updatedDays: 13, maxPlayers: 32, age: '13+',
    art: ['#f97316', '#3f1d0b', '#9ca3af'],
    tags: ['Mechs', 'PvP', 'Loadouts'],
    description: 'Build a frame from salvaged parts and fight in a reactor that is already melting down. Heat is a weapon and a clock.',
  },
  {
    id: '90011', name: 'Cozy Cafe Stories', creator: 'Paper Lantern', genre: 'Roleplay',
    players: 69000, rating: 90, updatedDays: 7, maxPlayers: 24, age: '9+',
    art: ['#f472b6', '#4a1d3d', '#ffe4b5'],
    tags: ['Social', 'Cooking', 'Decor'],
    description: 'Take orders, brew drinks, and decorate the corner shop. Regulars remember how you made their usual.',
  },
  {
    id: '90012', name: 'Vault Heist', creator: 'Lockpick Labs', genre: 'Adventure',
    players: 45000, rating: 86, updatedDays: 16, maxPlayers: 16, age: '13+',
    art: ['#eab308', '#1c1917', '#38bdf8'],
    tags: ['Puzzle', 'Stealth', 'Squad'],
    description: 'Four players, three alarms, one vault. Every guard patrol is randomised, so plan on the move.',
  },
  {
    id: '90013', name: 'Stunt Park Zero', creator: 'Apex Loop', genre: 'Racing',
    players: 52000, rating: 84, updatedDays: 21, maxPlayers: 20, age: '9+',
    art: ['#22d3ee', '#0f172a', '#f43f5e'],
    tags: ['Stunts', 'Sandbox', 'Score'],
    description: 'A skate-park sized for cars. Chain flips for a multiplier and post your line to the weekly board.',
  },
  {
    id: '90014', name: 'Pixel Farm', creator: 'Sunbeam', genre: 'Simulator',
    players: 74000, rating: 89, updatedDays: 10, maxPlayers: 16, age: '9+',
    art: ['#84cc16', '#365314', '#fde68a'],
    tags: ['Farming', 'Upgrades', 'Chill'],
    description: 'Plant, water, harvest, repeat until the barn is a factory. Neighbours can trade seeds and borrow tools.',
  },
  {
    id: '90015', name: 'Orbital Outpost', creator: 'Vacuum Theory', genre: 'Sandbox',
    players: 39000, rating: 92, updatedDays: 14, maxPlayers: 12, age: '9+',
    art: ['#818cf8', '#111827', '#67e8f9'],
    tags: ['Building', 'Space', 'Co-op'],
    description: 'Assemble a station module by module, then keep the air inside it. Solar storms rearrange the build order.',
  },
  {
    id: '90016', name: 'Rift Royale', creator: 'Vantablack Studio', genre: 'Battle',
    players: 187000, rating: 91, updatedDays: 2, maxPlayers: 60, age: '13+',
    art: ['#e11d48', '#4c1d95', '#facc15'],
    tags: ['Battle royale', 'Squads', 'Season 4'],
    description: 'Drop into a shifting rift, loot fast, and outrun the collapse. Season 4 adds a grapple gadget and a moving zone.',
  },
  {
    id: '90017', name: 'Mirror Maze', creator: 'Rung Up', genre: 'Obby',
    players: 41000, rating: 83, updatedDays: 18, maxPlayers: 20, age: '9+',
    art: ['#c084fc', '#1e1b4b', '#e2e8f0'],
    tags: ['Puzzle', 'Precision', 'Solo'],
    description: 'Every corridor looks identical and one of them is real. Short runs, sharp puzzles, instant restarts.',
  },
  {
    id: '90018', name: 'Harbor Nights', creator: 'Copperline Games', genre: 'Roleplay',
    players: 34000, rating: 88, updatedDays: 24, maxPlayers: 40, age: '13+',
    art: ['#38bdf8', '#0c2340', '#fbbf24'],
    tags: ['Roleplay', 'Boats', 'Night'],
    description: 'Run the docks after dark: ferry passengers, repair hulls, and keep the lighthouse honest.',
  },
]

const GENRES = ['All', 'Adventure', 'Battle', 'Racing', 'Tycoon', 'Horror', 'Obby', 'Roleplay', 'Simulator', 'Sandbox']

const DEMO_PROFILES = [
  { userId: 'demo-1', name: 'NovaRift', displayName: 'Nova', premium: true, hue: 12 },
  { userId: 'demo-2', name: 'PixelSmith', displayName: 'Pixel', premium: false, hue: 265 },
  { userId: 'demo-3', name: 'CoreRunner', displayName: 'Core', premium: true, hue: 185 },
]

const SETTINGS_DEFAULTS = {
  closeOnLaunch: false,
  autoUpdate: true,
  lowLatency: false,
  graphics: 'auto',
  region: 'auto',
}

const LIBRARY_DEFAULTS = { favorites: [], recent: [], installed: [] }

const DOWNLOAD_SEED = [
  { id: 'player', icon: '▶', name: 'Roblox Player', detail: 'Client 0.678.1 · 182 MB', progress: 100, phase: 'done', status: 'UP TO DATE' },
  { id: 'assets', icon: '▦', name: 'Shared asset cache', detail: '1,284 assets · 1.6 GB', progress: 100, phase: 'done', status: 'UP TO DATE' },
  { id: 'launcher', icon: '◆', name: 'RuinForge launcher', detail: 'Version 1.0.0 · 12 MB', progress: 100, phase: 'done', status: 'UP TO DATE' },
  { id: 'voice', icon: '◍', name: 'Spatial voice module', detail: 'Optional add-on · 38 MB', progress: 0, phase: 'ready', status: 'NOT INSTALLED' },
]

const STORE_KEY = 'ruinforge.preview.v2'
const REGION_LABELS = { auto: 'Closest to me', us: 'US East', eu: 'EU West', asia: 'Asia Pacific' }
const SERVER_CALLSIGNS = ['Ashfall', 'Brightport', 'Cinder', 'Dawnline', 'Ember', 'Foxglove', 'Glassbay', 'Harbor', 'Ironwood', 'Juniper', 'Kite', 'Lumen']

const $ = (id) => document.getElementById(id)
const catalogById = new Map(CATALOG.map((experience) => [experience.id, experience]))

const state = {
  mode: 'preview',
  version: '1.0.0',
  account: null,
  settings: { ...SETTINGS_DEFAULTS },
  library: { favorites: [], recent: [], installed: [] },
  downloads: DOWNLOAD_SEED.map((item) => ({ ...item })),
  view: 'home',
  genre: 'All',
  sort: 'popular',
  query: '',
  libraryTab: 'all',
  selectedId: null,
  serverExperienceId: CATALOG[0].id,
  pendingPlaceId: null,
  playing: null,
  playerInstalled: null,
  storagePath: '',
  updating: false,
}

let toastTimer
let playingTimer
let updateTimer

/* ------------------------------------------------------------------ helpers */

function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function showToast(message) {
  if (!message) return
  const toast = $('toast')
  toast.textContent = message
  toast.classList.remove('hidden')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 4600)
}

function hashString(value) {
  let hash = 2166136261
  for (const character of String(value)) {
    hash ^= character.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

function formatPlayers(count) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`
  return String(count)
}

function formatUpdated(days) {
  if (days <= 1) return 'Updated today'
  if (days < 7) return `Updated ${days} days ago`
  const weeks = Math.round(days / 7)
  return weeks <= 1 ? 'Updated last week' : `Updated ${weeks} weeks ago`
}

function formatMb(megabytes) {
  return megabytes >= 1024 ? `${(megabytes / 1024).toFixed(1)} GB` : `${Math.round(megabytes)} MB`
}

function artFor(experience, width = 640, height = 360) {
  const [first, second, third = '#ffffff'] = experience.art
  const seed = hashString(experience.id)
  const initial = experience.name.trim().charAt(0).toUpperCase()
  const orbit = 40 + (seed % 90)
  const circleX = width * (0.12 + ((seed >> 3) % 30) / 100)
  const circleY = height * (0.55 + ((seed >> 7) % 25) / 100)
  const stripeOffset = (seed % 40) + 10
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${first}"/><stop offset="1" stop-color="${second}"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.76" cy="0.18" r="0.85">
        <stop offset="0" stop-color="${third}" stop-opacity="0.75"/>
        <stop offset="1" stop-color="${third}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#glow)"/>
    <g opacity="0.16" stroke="#ffffff" stroke-width="${Math.max(2, width / 300)}" fill="none">
      <path d="M${-width + stripeOffset} ${height} L${width * 0.9} ${-height * 0.2}"/>
      <path d="M${-width * 0.6 + stripeOffset} ${height} L${width * 1.3} ${-height * 0.2}"/>
      <path d="M${-width * 0.2 + stripeOffset} ${height} L${width * 1.7} ${-height * 0.2}"/>
    </g>
    <circle cx="${circleX.toFixed(0)}" cy="${circleY.toFixed(0)}" r="${orbit}" fill="#08070b" opacity="0.22"/>
    <circle cx="${(width * 0.82).toFixed(0)}" cy="${(height * 0.7).toFixed(0)}" r="${(orbit * 0.55).toFixed(0)}" fill="#ffffff" opacity="0.12"/>
    <text x="${(width * 0.88).toFixed(0)}" y="${(height * 0.97).toFixed(0)}" text-anchor="end"
      font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(height * 0.55)}" font-weight="800"
      fill="#ffffff" opacity="0.2">${initial}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function avatarFor(account, size = 96) {
  const name = account?.name || '?'
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const hue = Number.isFinite(account?.hue) ? account.hue : hashString(name) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${hue} 82% 58%)"/>
        <stop offset="1" stop-color="hsl(${(hue + 58) % 360} 76% 42%)"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="48" fill="url(#a)"/>
    <text x="48" y="62" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
      font-size="44" font-weight="800" fill="#ffffff">${initial}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function serversFor(experience, region = 'auto') {
  const seed = hashString(experience.id)
  const basePing = { us: 28, eu: 86, asia: 151 }
  const regions = region === 'auto' ? ['us', 'eu', 'asia'] : [region]
  const servers = []
  for (const regionId of regions) {
    for (let index = 0; index < 4; index += 1) {
      const ping = basePing[regionId] + ((seed >> (index * 3)) % 34) + index * 6
      const capacity = Math.round(experience.maxPlayers * (0.4 + ((seed >> (index * 2)) % 12) / 20))
      const callSign = SERVER_CALLSIGNS[(seed + index + regionId.length * 5) % SERVER_CALLSIGNS.length]
      servers.push({
        id: `${regionId}-${index}`,
        region: regionId,
        name: `${REGION_LABELS[regionId]} · ${callSign}-${String(index + 1).padStart(2, '0')}`,
        ping,
        players: Math.max(2, Math.min(experience.maxPlayers, capacity)),
        capacity: experience.maxPlayers,
      })
    }
  }
  return servers.sort((left, right) => left.ping - right.ping)
}

function pingClass(ping) {
  if (ping < 60) return 'ping-dot'
  if (ping < 110) return 'ping-dot medium'
  return 'ping-dot high'
}

/* ------------------------------------------------------------------- bridge
 * The preview build has no Electron IPC (or has an older bridge), so it runs a
 * clearly labelled simulation and stores its state in localStorage. The
 * desktop build talks to the real Roblox OAuth + Player hand-off in main.cjs.
 */
const desktopApi = (() => {
  const api = window.ruinforge
  const supported = api
    && api.desktop === true
    && typeof api.initialState === 'function'
    && typeof api.signIn === 'function'
    && typeof api.launchExperience === 'function'
  return supported ? api : null
})()

function readPreviewStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writePreviewStore() {
  if (bridge.isDesktop) return
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      account: state.account,
      settings: state.settings,
      library: state.library,
      downloads: state.downloads.map(({ id, progress, phase, status, detail }) => ({ id, progress, phase, status, detail })),
    }))
  } catch {
    /* storage can be unavailable in hardened browsers */
  }
}

const bridge = {
  isDesktop: Boolean(desktopApi),

  async load() {
    if (desktopApi) {
      const initial = await desktopApi.initialState()
      return {
        account: initial.account,
        settings: { ...SETTINGS_DEFAULTS, ...initial.settings },
        library: { ...LIBRARY_DEFAULTS, ...initial.library },
        downloads: DOWNLOAD_SEED.map((item) => ({ ...item })),
        playerInstalled: initial.playerInstalled,
        storagePath: initial.folder,
        version: initial.version,
      }
    }
    const saved = readPreviewStore()
    const downloads = DOWNLOAD_SEED.map((seed) => {
      const previous = Array.isArray(saved.downloads)
        ? saved.downloads.find((item) => item.id === seed.id)
        : undefined
      return previous ? { ...seed, ...previous, phase: previous.phase === 'working' ? 'ready' : previous.phase } : { ...seed }
    })
    return {
      account: saved.account || null,
      settings: { ...SETTINGS_DEFAULTS, ...(saved.settings || {}) },
      library: { ...LIBRARY_DEFAULTS, ...(saved.library || {}) },
      downloads,
      playerInstalled: false,
      storagePath: 'C:\\Users\\you\\AppData\\Roaming\\RuinForge (sample path)',
      version: '1.0.0-preview',
    }
  },

  async signIn(onStatus) {
    if (desktopApi) {
      const result = await desktopApi.signIn()
      if (!result?.account) throw new Error('Roblox did not return a usable account.')
      return result.account
    }
    onStatus?.('Connecting to the preview identity service…')
    await new Promise((resolve) => setTimeout(resolve, 380))
    onStatus?.('Loading your sample profile…')
    await new Promise((resolve) => setTimeout(resolve, 340))
    return state.pendingDemoProfile || DEMO_PROFILES[0]
  },

  async cancelSignIn() {
    if (desktopApi) await desktopApi.cancelSignIn()
  },

  async signOut() {
    if (desktopApi) await desktopApi.signOut()
  },

  async launch(experience) {
    if (desktopApi) return desktopApi.launchExperience(experience.id, experience.name)
    await new Promise((resolve) => setTimeout(resolve, 420))
    return { ok: true }
  },

  async leave() {
    if (desktopApi) await desktopApi.leaveExperience()
  },

  async saveSettings(patch) {
    if (desktopApi) return desktopApi.saveSettings(patch)
    writePreviewStore()
    return state.settings
  },

  async saveLibrary() {
    if (desktopApi) return desktopApi.saveLibrary(state.library)
    writePreviewStore()
    return state.library
  },

  async openFolder(which) {
    if (desktopApi) return desktopApi.openFolder(which)
    showToast('Folder shortcuts open in the Windows build. This browser preview cannot open local folders.')
    return { ok: false }
  },

  async openExternal(url) {
    if (desktopApi) return desktopApi.openExternal(url)
    showToast('External links open in the desktop build. Sample experiences have no live Roblox page.')
    return { ok: false }
  },

  async openTrustedLink(linkId) {
    if (desktopApi) return desktopApi.openTrustedLink(linkId)
    showToast('Support links open in the desktop build.')
    return { ok: false }
  },
}

/* --------------------------------------------------------------- rendering */

function setAccount(account) {
  state.account = account || null
  const signedIn = Boolean(state.account)
  $('rail-name').textContent = signedIn ? state.account.name : 'Not signed in'
  $('rail-status').textContent = signedIn
    ? (state.account.premium ? 'Roblox Premium member' : 'Roblox account connected')
    : 'Connect Roblox to play'
  const railAvatar = $('rail-avatar')
  railAvatar.replaceChildren()
  if (signedIn) {
    const image = document.createElement('img')
    image.src = avatarFor(state.account)
    image.alt = ''
    railAvatar.append(image)
  } else {
    railAvatar.textContent = '?'
  }
  $('rail-dot').classList.toggle('online', signedIn)

  const accountButton = $('account-button')
  accountButton.replaceChildren()
  if (signedIn) {
    const image = document.createElement('img')
    image.className = 'avatar avatar-small'
    image.src = avatarFor(state.account)
    image.alt = ''
    const label = el('span', '', state.account.name.toUpperCase())
    label.className = 'account-name'
    accountButton.append(image, label)
    accountButton.classList.add('signed-in')
    accountButton.setAttribute('aria-label', `Signed in as ${state.account.name}. Open account settings.`)
  } else {
    accountButton.append(document.createTextNode('SIGN IN WITH ROBLOX '), el('span', '', '↗'))
    accountButton.classList.remove('signed-in')
    accountButton.setAttribute('aria-label', 'Sign in with Roblox')
  }

  renderSettingsAccount()
  renderFriends()
  renderStreak()
}

function renderSettingsAccount() {
  const line = $('settings-account-line')
  line.replaceChildren()
  if (state.account) {
    const image = el('img', 'avatar avatar-small')
    image.src = avatarFor(state.account)
    image.alt = ''
    line.append(image, el('span', '', `${state.account.name} · Roblox ID ${state.account.userId}`))
    $('settings-account-copy').textContent = 'Your Roblox session is linked to this launcher. Sign out to unlink it.'
    $('settings-account-button').textContent = 'SIGN OUT'
  } else {
    $('settings-account-copy').textContent = 'Connect your Roblox account to sync favorites and launch as yourself.'
    $('settings-account-button').textContent = 'SIGN IN'
  }
}

function createCard(experience) {
  const card = el('div', 'exp-card')
  card.dataset.exp = experience.id
  card.tabIndex = 0
  card.setAttribute('role', 'button')
  card.setAttribute('aria-label', `Open ${experience.name} by ${experience.creator}`)

  const art = el('div', 'exp-card-art')
  const image = el('img')
  image.src = artFor(experience, 440, 248)
  image.alt = ''
  image.loading = 'lazy'
  art.append(image)

  const live = el('span', 'exp-card-live')
  live.append(el('i'), document.createTextNode(`${formatPlayers(experience.players)} playing`))
  art.append(live)

  const favorite = el('button', 'exp-card-fav', state.library.favorites.includes(experience.id) ? '★' : '☆')
  favorite.type = 'button'
  favorite.dataset.fav = experience.id
  favorite.setAttribute('aria-pressed', state.library.favorites.includes(experience.id) ? 'true' : 'false')
  favorite.setAttribute('aria-label', `Favorite ${experience.name}`)
  art.append(favorite)

  const body = el('div', 'exp-card-body')
  body.append(el('span', 'exp-card-title', experience.name))
  const meta = el('span', 'exp-card-meta')
  meta.append(el('span', 'exp-card-tag', experience.genre))
  meta.append(el('span', 'dot', '•'))
  meta.append(el('span', '', `${experience.rating}% liked`))
  body.append(meta)

  card.append(art, body)
  return card
}

function renderHero() {
  const featured = CATALOG.find((experience) => experience.featured) || CATALOG[0]
  const hero = $('hero')
  hero.replaceChildren()

  const art = el('div', 'hero-art')
  const image = el('img')
  image.src = artFor(featured, 1280, 560)
  image.alt = ''
  art.append(image)
  hero.append(art, el('div', 'hero-shade'))

  const content = el('div', 'hero-content')
  content.append(el('div', 'eyebrow', 'FEATURED EXPERIENCE'))

  const title = el('h1', '', featured.name)
  content.append(title)

  const description = el('p', '', featured.description)
  content.append(description)

  const tags = el('div', 'hero-tags')
  const live = el('span', 'tag-live')
  live.append(el('i'), document.createTextNode(`${formatPlayers(featured.players)} PLAYING`))
  tags.append(live)
  for (const value of [featured.genre.toUpperCase(), `${featured.rating}% LIKED`, `${featured.maxPlayers} PLAYERS MAX`]) {
    tags.append(el('span', '', value))
  }
  content.append(tags)

  const actions = el('div', 'hero-actions')
  const play = el('button', 'primary-button', 'PLAY NOW')
  play.type = 'button'
  play.dataset.heroPlay = featured.id
  const details = el('button', 'secondary-button', 'VIEW DETAILS')
  details.type = 'button'
  details.dataset.heroDetails = featured.id
  actions.append(play, details)
  content.append(actions)

  hero.append(content)
  hero.append(el('div', 'hero-index', `FEATURED / ${featured.id.slice(-3)}`))
}

function renderShelves() {
  const recentIds = state.library.recent.map((item) => item.placeId).filter((id) => catalogById.has(id))
  const continueShelf = $('continue-shelf')
  continueShelf.replaceChildren()
  if (recentIds.length === 0) {
    const empty = el('article', 'panel')
    empty.append(el('h3', '', 'Nothing in progress'), el('p', '', 'Launch an experience and it will show up here with your last session.'))
    const browse = el('button', 'secondary-button', 'BROWSE EXPERIENCES')
    browse.type = 'button'
    browse.dataset.goto = 'discover'
    empty.append(browse)
    continueShelf.append(empty)
  } else {
    for (const id of recentIds.slice(0, 8)) continueShelf.append(createCard(catalogById.get(id)))
  }

  const trending = [...CATALOG].sort((left, right) => right.players - left.players).slice(0, 10)
  const trendingShelf = $('trending-shelf')
  trendingShelf.replaceChildren()
  for (const experience of trending) trendingShelf.append(createCard(experience))
  $('trending-note').textContent = `${formatPlayers(trending.reduce((total, item) => total + item.players, 0))} players across these experiences`

  const fresh = [...CATALOG].sort((left, right) => left.updatedDays - right.updatedDays).slice(0, 10)
  const freshShelf = $('fresh-shelf')
  freshShelf.replaceChildren()
  for (const experience of fresh) freshShelf.append(createCard(experience))
}

function renderGenreChips() {
  const container = $('genre-chips')
  container.replaceChildren()
  for (const genre of GENRES) {
    const chip = el('button', `chip${state.genre === genre ? ' active' : ''}`, genre)
    chip.type = 'button'
    chip.dataset.genre = genre
    chip.setAttribute('aria-pressed', state.genre === genre ? 'true' : 'false')
    container.append(chip)
  }
}

function filteredCatalog() {
  const query = state.query.trim().toLowerCase()
  let results = CATALOG.filter((experience) => {
    if (state.genre !== 'All' && experience.genre !== state.genre) return false
    if (!query) return true
    return [experience.name, experience.creator, experience.genre, ...experience.tags]
      .some((value) => value.toLowerCase().includes(query))
  })
  if (state.sort === 'popular') results = results.sort((left, right) => right.players - left.players)
  if (state.sort === 'rated') results = results.sort((left, right) => right.rating - left.rating)
  if (state.sort === 'fresh') results = results.sort((left, right) => left.updatedDays - right.updatedDays)
  if (state.sort === 'az') results = results.sort((left, right) => left.name.localeCompare(right.name))
  return results
}

function renderDiscover() {
  const results = filteredCatalog()
  const grid = $('discover-grid')
  grid.replaceChildren()
  for (const experience of results) grid.append(createCard(experience))
  const filterParts = [state.genre === 'All' ? 'All genres' : state.genre]
  if (state.query.trim()) filterParts.push(`matching “${state.query.trim()}”`)
  $('results-meta').textContent = `${results.length} experience${results.length === 1 ? '' : 's'} · ${filterParts.join(' · ')}`
  $('discover-empty').classList.toggle('hidden', results.length > 0)
  grid.classList.toggle('hidden', results.length === 0)
}

function renderLibrary() {
  const favorites = state.library.favorites
  const recentIds = state.library.recent.map((item) => item.placeId)
  const installed = state.library.installed
  const totalPlays = state.library.recent.length

  const stats = $('library-stats')
  stats.replaceChildren()
  const statData = [
    [String(CATALOG.length), 'EXPERIENCES AVAILABLE'],
    [String(favorites.length), 'FAVORITES'],
    [String(totalPlays), 'RECENT SESSIONS'],
    [formatMb(1640 + installed.length * 46), 'LOCAL ASSET CACHE'],
  ]
  for (const [value, label] of statData) {
    const stat = el('div', 'stat')
    stat.append(el('b', '', value), el('small', '', label))
    stats.append(stat)
  }

  let items = CATALOG
  if (state.libraryTab === 'favorites') items = favorites.map((id) => catalogById.get(id)).filter(Boolean)
  if (state.libraryTab === 'recent') items = recentIds.map((id) => catalogById.get(id)).filter(Boolean)
  if (state.libraryTab === 'installed') items = installed.map((id) => catalogById.get(id)).filter(Boolean)

  const grid = $('library-grid')
  grid.replaceChildren()
  for (const experience of items) grid.append(createCard(experience))
  const empty = items.length === 0
  $('library-empty').classList.toggle('hidden', !empty)
  grid.classList.toggle('hidden', empty)
  if (empty && state.libraryTab === 'favorites') {
    $('library-empty').querySelector('h3').textContent = 'No favorites yet.'
    $('library-empty').querySelector('p').textContent = 'Tap the star on any experience to keep it close.'
  } else if (empty && state.libraryTab === 'recent') {
    $('library-empty').querySelector('h3').textContent = 'No recent sessions.'
    $('library-empty').querySelector('p').textContent = 'Launch something and it will appear here.'
  } else if (empty && state.libraryTab === 'installed') {
    $('library-empty').querySelector('h3').textContent = 'Nothing played here yet.'
    $('library-empty').querySelector('p').textContent = 'Experiences you launch through RuinForge land here.'
  } else {
    $('library-empty').querySelector('h3').textContent = 'Nothing here yet.'
    $('library-empty').querySelector('p').textContent = 'Favorite an experience or launch one and it will show up in your library.'
  }
}

function renderServerExperienceOptions() {
  const select = $('server-experience')
  select.replaceChildren()
  const ordered = [
    ...state.library.favorites.map((id) => catalogById.get(id)).filter(Boolean),
    ...CATALOG.filter((experience) => !state.library.favorites.includes(experience.id)),
  ]
  for (const experience of ordered) {
    const option = el('option', '', experience.name)
    option.value = experience.id
    option.selected = experience.id === state.serverExperienceId
    select.append(option)
  }
  if (!ordered.some((experience) => experience.id === state.serverExperienceId) && ordered.length) {
    state.serverExperienceId = ordered[0].id
    select.value = ordered[0].id
  }
}

function serverRow(experience, server) {
  const row = el('div', 'server-row')

  const nameCell = el('div', 'server-name')
  nameCell.append(el('b', '', server.name), el('small', '', experience.name))

  const regionCell = el('span', 'server-cell server-region-cell', REGION_LABELS[server.region])

  const pingCell = el('span', 'server-cell server-ping')
  pingCell.append(el('span', pingClass(server.ping)), document.createTextNode(`${server.ping} ms`))
  pingCell.classList.add('server-players-cell')

  const playersCell = el('div', 'server-cell')
  playersCell.append(el('span', '', `${server.players}/${server.capacity} players`))
  const capacity = el('div', 'capacity')
  const fill = el('div')
  fill.style.width = `${Math.round((server.players / server.capacity) * 100)}%`
  capacity.append(fill)
  playersCell.append(capacity)

  const join = el('button', 'secondary-button', 'JOIN')
  join.type = 'button'
  join.dataset.join = experience.id
  join.dataset.server = server.name

  row.append(nameCell, regionCell, pingCell, playersCell, join)
  return row
}

function renderServers() {
  const experience = catalogById.get(state.serverExperienceId) || CATALOG[0]
  const region = $('server-region').value
  const servers = serversFor(experience, region)
  const list = $('server-list')
  list.replaceChildren()
  for (const server of servers) list.append(serverRow(experience, server))
}

function renderDownloads() {
  const list = $('download-list')
  list.replaceChildren()
  let pending = 0
  for (const item of state.downloads) {
    if (item.phase !== 'done') pending += 1
    const row = el('div', 'download-row')
    row.append(el('div', 'download-icon', item.icon))

    const info = el('div', 'download-info')
    info.append(el('b', '', item.name), el('p', '', item.detail))
    const track = el('div', 'download-track')
    const fill = el('div')
    fill.style.width = `${item.progress}%`
    track.append(fill)
    info.append(track)
    row.append(info)

    if (item.phase === 'ready') {
      const get = el('button', 'secondary-button', 'GET')
      get.type = 'button'
      get.dataset.download = item.id
      row.append(get)
    } else {
      const status = el('div', `download-state${item.phase === 'working' ? ' working' : item.phase === 'done' ? ' done' : ''}`, item.status)
      row.append(status)
    }
    list.append(row)
  }

  const badge = $('download-badge')
  badge.textContent = String(pending)
  badge.classList.toggle('hidden', pending === 0)

  $('download-note').textContent = pending === 0
    ? 'Everything is up to date.'
    : `${pending} item${pending === 1 ? ' needs' : 's need'} attention.`
  $('update-all').disabled = state.updating
  $('update-all').textContent = state.updating ? 'CHECKING…' : 'CHECK FOR UPDATES'

  const used = 1640 + state.library.installed.length * 46
  $('storage-fill').style.width = `${Math.min(100, Math.round((used / 8192) * 100))}%`
  $('storage-usage').textContent = `${formatMb(used)} of 8 GB used`
  $('storage-path').textContent = state.storagePath || 'Data folder'
}

function renderSettings() {
  for (const toggle of document.querySelectorAll('.switch[data-setting]')) {
    toggle.setAttribute('aria-checked', state.settings[toggle.dataset.setting] ? 'true' : 'false')
  }
  $('graphics-select').value = state.settings.graphics
  $('region-select').value = state.settings.region
  $('settings-storage').textContent = state.storagePath
    ? `Settings, favorites, and cached assets live in ${state.storagePath}.`
    : 'Launcher settings, favorites, and cached assets stay on this PC.'
  $('about-version').textContent = `RuinForge ${state.version}`
}

function renderClientPanel() {
  const title = $('client-title')
  const copy = $('client-copy')
  const action = $('client-action')
  if (bridge.isDesktop) {
    if (state.playerInstalled) {
      title.textContent = 'Roblox Player detected'
      copy.textContent = 'RuinForge hands the experience to the official Roblox Player, which keeps its own signed-in session.'
      action.textContent = 'CHECK FOR UPDATES'
      action.dataset.action = 'updates'
    } else {
      title.textContent = 'Roblox Player not installed'
      copy.textContent = 'Install the Roblox Player once from roblox.com. RuinForge cannot launch experiences without it.'
      action.textContent = 'OPEN ROBLOX DOWNLOAD'
      action.dataset.action = 'download-player'
    }
  } else {
    title.textContent = 'Preview hand-off'
    copy.textContent = 'The browser preview cannot open the Roblox Player. Launching here runs the full hand-off sequence as a simulation; the Windows build opens the real Player.'
    action.textContent = 'VIEW DOWNLOADS'
    action.dataset.action = 'updates'
  }
  action.type = 'button'
}

function renderFriends() {
  const list = $('friend-list')
  list.replaceChildren()
  const title = $('friends-title')
  const copy = $('friends-copy')

  if (!state.account) {
    title.textContent = 'No friends online yet'
    copy.textContent = 'Sign in with Roblox to see who is online.'
    return
  }
  const friends = [
    { name: 'JunoByte', hue: 320, activity: 'Neon Rift' },
    { name: 'MossyKite', hue: 150, activity: 'Harbor Nights' },
    { name: 'VexRunner', hue: 40, activity: 'Drift Circuit' },
  ]
  title.textContent = `${friends.length} friends are playing`
  copy.textContent = 'Sample presence data in the preview build.'
  for (const friend of friends) {
    const row = el('div', 'friend-row')
    const avatar = el('span', 'avatar avatar-small')
    const image = el('img')
    image.src = avatarFor({ name: friend.name, hue: friend.hue }, 44)
    image.alt = ''
    avatar.append(image)
    row.append(avatar, el('span', '', friend.name), el('small', '', friend.activity))
    list.append(row)
  }
}

function renderStreak() {
  const sessions = state.library.recent.length
  const days = Math.min(7, Math.max(sessions > 0 ? 1 : 0, sessions))
  $('streak-title').textContent = days > 0 ? `${days}-day play streak` : 'Your first week'
  $('streak-copy').textContent = days > 0
    ? 'Days you launch through RuinForge fill the week on this PC.'
    : 'Launch an experience to start a play streak.'
  const track = $('streak-track')
  track.replaceChildren()
  for (let index = 0; index < 7; index += 1) {
    const day = el('div', 'streak-day', ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index])
    if (index < days) day.classList.add('done')
    if (index === days - 1) day.classList.add('today')
    track.append(day)
  }
}

function renderAll() {
  renderHero()
  renderShelves()
  renderGenreChips()
  renderDiscover()
  renderLibrary()
  renderServerExperienceOptions()
  renderServers()
  renderDownloads()
  renderSettings()
  renderClientPanel()
  renderFriends()
  renderStreak()
}

/* -------------------------------------------------------------- navigation */

const PAGE_NAMES = { home: 'HOME', discover: 'DISCOVER', library: 'LIBRARY', servers: 'SERVERS', downloads: 'DOWNLOADS', settings: 'SETTINGS' }

function switchView(view) {
  if (!PAGE_NAMES[view]) return
  state.view = view
  for (const nav of document.querySelectorAll('.nav-item[data-view]')) {
    nav.classList.toggle('active', nav.dataset.view === view)
  }
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('active-view', section.id === `${view}-view`)
  }
  $('page-name').textContent = PAGE_NAMES[view]
  $('viewport').scrollTop = 0
  window.scrollTo({ top: 0 })
}

function showOverlay(id) {
  $(id).classList.remove('hidden')
}

function hideOverlay(id) {
  $(id).classList.add('hidden')
}

/* ------------------------------------------------------------- experience */

function openExperience(placeId) {
  const experience = catalogById.get(String(placeId))
  if (!experience) return
  state.selectedId = experience.id

  $('exp-banner').replaceChildren()
  const banner = el('img')
  banner.src = artFor(experience, 1000, 400)
  banner.alt = ''
  $('exp-banner').append(banner)

  $('exp-icon').src = artFor(experience, 200, 200)
  $('exp-icon').alt = `${experience.name} icon`
  $('exp-title').textContent = experience.name
  $('exp-by').textContent = `By ${experience.creator} · ${experience.genre}`

  const stats = $('exp-stats')
  stats.replaceChildren()
  for (const value of [
    `${formatPlayers(experience.players)} playing`,
    `${experience.rating}% liked`,
    `Up to ${experience.maxPlayers} players`,
    experience.age,
    formatUpdated(experience.updatedDays),
  ]) {
    stats.append(el('span', '', value))
  }

  $('exp-description').textContent = experience.description

  const tags = $('exp-tags')
  tags.replaceChildren()
  for (const tag of experience.tags) tags.append(el('span', '', tag))

  const favorite = $('exp-favorite')
  const isFavorite = state.library.favorites.includes(experience.id)
  favorite.textContent = isFavorite ? '★ FAVORITED' : '☆ FAVORITE'
  favorite.setAttribute('aria-pressed', isFavorite ? 'true' : 'false')

  const servers = $('exp-servers')
  servers.replaceChildren()
  for (const server of serversFor(experience, state.settings.region).slice(0, 3)) {
    const row = el('div', 'mini-server')
    row.append(el('span', 'ping-dot' + (server.ping > 110 ? ' high' : server.ping > 60 ? ' medium' : '')), el('span', '', server.name))
    const join = el('button', '', 'JOIN')
    join.type = 'button'
    join.dataset.join = experience.id
    join.dataset.server = server.name
    row.append(el('small', '', `${server.ping} ms`), join)
    servers.append(row)
  }

  const details = $('exp-details')
  details.replaceChildren()
  const rows = [
    ['Genre', experience.genre],
    ['Creator', experience.creator],
    ['Place ID', experience.id],
    ['Max players', String(experience.maxPlayers)],
    ['Age rating', experience.age],
    ['Server size', `${formatPlayers(experience.players)} live`],
  ]
  for (const [label, value] of rows) {
    const wrapper = el('div')
    wrapper.append(el('dt', '', label), el('dd', '', value))
    details.append(wrapper)
  }

  $('exp-open-site').dataset.openSite = experience.id
  showOverlay('experience-overlay')
}

function toggleFavorite(placeId) {
  const id = String(placeId)
  const index = state.library.favorites.indexOf(id)
  const experience = catalogById.get(id)
  if (index === -1) {
    state.library.favorites.unshift(id)
    showToast(`${experience?.name || 'Experience'} added to favorites.`)
  } else {
    state.library.favorites.splice(index, 1)
    showToast(`${experience?.name || 'Experience'} removed from favorites.`)
  }
  bridge.saveLibrary()
  renderShelves()
  renderDiscover()
  renderLibrary()
  renderServerExperienceOptions()
  if (state.selectedId === id) {
    const favorite = $('exp-favorite')
    const isFavorite = state.library.favorites.includes(id)
    favorite.textContent = isFavorite ? '★ FAVORITED' : '☆ FAVORITE'
    favorite.setAttribute('aria-pressed', isFavorite ? 'true' : 'false')
  }
}

/* ------------------------------------------------------------------ sign-in */

function openSignIn() {
  $('signin-error').classList.add('hidden')
  $('signin-error').textContent = ''
  $('signin-waiting').classList.add('hidden')
  $('signin-waiting-text').textContent = 'Waiting for Roblox…'
  $('signin-demo').classList.toggle('hidden', bridge.isDesktop)
  $('signin-cancel').textContent = bridge.isDesktop ? 'CANCEL' : 'CANCEL'
  $('signin-copy').textContent = bridge.isDesktop
    ? 'RuinForge opens roblox.com in your browser. You approve access there and only your public profile comes back — your password never touches the launcher.'
    : 'The Windows build opens the real Roblox sign-in page. This browser preview uses a simulated profile so you can explore everything.'
  renderDemoProfiles()
  showOverlay('signin-overlay')
  if (bridge.isDesktop) startDesktopSignIn()
}

function renderDemoProfiles() {
  const container = $('demo-profiles')
  container.replaceChildren()
  for (const profile of DEMO_PROFILES) {
    const button = el('button', 'demo-profile')
    button.type = 'button'
    button.dataset.demoProfile = profile.userId
    const avatar = el('span', 'avatar avatar-small')
    const image = el('img')
    image.src = avatarFor(profile, 44)
    image.alt = ''
    avatar.append(image)
    const lines = el('span')
    lines.append(el('b', '', profile.name), el('small', '', profile.premium ? 'Roblox Premium · sample profile' : 'Sample profile'))
    button.append(avatar, lines)
    container.append(button)
  }
}

async function startDesktopSignIn() {
  $('signin-waiting').classList.remove('hidden')
  try {
    const account = await bridge.signIn((message) => {
      $('signin-waiting-text').textContent = message
    })
    if (account) completeSignIn(account)
  } catch (error) {
    $('signin-waiting').classList.add('hidden')
    $('signin-error').textContent = error?.message || 'Roblox sign-in failed. Try again.'
    $('signin-error').classList.remove('hidden')
  }
}

async function chooseDemoProfile(profileId) {
  const profile = DEMO_PROFILES.find((item) => item.userId === profileId)
  if (!profile) return
  state.pendingDemoProfile = profile
  $('signin-demo').classList.add('hidden')
  $('signin-waiting').classList.remove('hidden')
  $('signin-waiting-text').textContent = 'Connecting to the preview identity service…'
  try {
    const account = await bridge.signIn((message) => {
      $('signin-waiting-text').textContent = message
    })
    completeSignIn({ ...account, hue: profile.hue })
  } catch (error) {
    $('signin-waiting').classList.add('hidden')
    $('signin-error').textContent = error?.message || 'Preview sign-in failed.'
    $('signin-error').classList.remove('hidden')
  } finally {
    state.pendingDemoProfile = null
  }
}

function completeSignIn(account) {
  hideOverlay('signin-overlay')
  setAccount(account)
  bridge.saveLibrary()
  writePreviewStore()
  showToast(bridge.isDesktop
    ? `Roblox connected as ${account.name}.`
    : `Simulated sign-in: exploring as ${account.name}.`)
  const pending = state.pendingPlaceId
  state.pendingPlaceId = null
  if (pending) playExperience(pending)
}

async function signOut() {
  await bridge.signOut()
  setAccount(null)
  writePreviewStore()
  showToast('Signed out. Your favorites and library stay on this PC.')
}

/* ------------------------------------------------------------------ launch */

const LAUNCH_STEPS = [
  'Checking the Roblox Player',
  'Verifying your Roblox session',
  'Reserving a server',
  'Handing off to the Roblox Player',
]

function setLaunchStep(index, phase) {
  const steps = $('launch-steps').children
  const step = steps[index]
  if (!step) return
  step.className = phase
  step.querySelector('.step-mark').textContent = phase === 'done' ? '✓' : phase === 'active' ? '•' : ''
}

function openLaunch(experience) {
  state.playing = null
  $('launch-art').replaceChildren()
  const image = el('img')
  image.src = artFor(experience, 500, 620)
  image.alt = ''
  $('launch-art').append(image)

  $('launch-eyebrow').textContent = 'LAUNCHING'
  $('launch-title').textContent = experience.name
  $('launch-message').textContent = 'Preparing your session…'
  $('launch-progress').style.width = '4%'
  $('launch-playing').classList.add('hidden')
  $('launch-cancel').classList.remove('hidden')
  $('launch-leave').classList.add('hidden')
  $('launch-cancel').disabled = false
  $('launch-note').textContent = bridge.isDesktop
    ? 'The Roblox Player keeps its own session. RuinForge opens the experience and stays out of the way.'
    : 'Preview simulation: the Windows build opens the real Roblox Player at this step.'

  const steps = $('launch-steps')
  steps.replaceChildren()
  for (const label of LAUNCH_STEPS) {
    const item = el('li', '')
    item.append(el('span', 'step-mark', ''), document.createTextNode(label))
    steps.append(item)
  }
  showOverlay('launch-overlay')
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function playExperience(placeId, serverName) {
  const experience = catalogById.get(String(placeId))
  if (!experience) return

  if (!state.account) {
    state.pendingPlaceId = experience.id
    hideOverlay('experience-overlay')
    openSignIn()
    showToast('Sign in with Roblox to launch an experience.')
    return
  }

  hideOverlay('experience-overlay')
  openLaunch(experience)

  const serverLabel = serverName || serversFor(experience, state.settings.region)[0].name
  const messages = [
    bridge.isDesktop ? 'Looking for the installed Roblox Player…' : 'Simulating the Roblox Player hand-off…',
    `Verifying ${state.account.name}'s Roblox session…`,
    `Reserving ${serverLabel}…`,
    `Sending ${experience.name} to the Roblox Player…`,
  ]

  for (let index = 0; index < LAUNCH_STEPS.length; index += 1) {
    setLaunchStep(index, 'active')
    $('launch-message').textContent = messages[index]
    $('launch-progress').style.width = `${8 + index * 20}%`
    await delay(bridge.isDesktop ? 240 : 420)
    setLaunchStep(index, 'done')
  }

  $('launch-message').textContent = 'Almost there…'
  try {
    const result = await bridge.launch(experience)
    if (result?.library) {
      state.library = { ...state.library, ...result.library }
      renderShelves()
      renderLibrary()
      renderDownloads()
    } else {
      recordSession(experience)
    }
    $('launch-progress').style.width = '100%'
    startPlaying(experience, serverLabel)
  } catch (error) {
    $('launch-eyebrow').textContent = 'LAUNCH FAILED'
    $('launch-message').textContent = error?.message || 'The Roblox Player could not start.'
    $('launch-progress').style.width = '100%'
    $('launch-cancel').disabled = false
    $('launch-cancel').textContent = 'CLOSE'
    showToast(error?.message || 'The Roblox Player could not start.')
  }
}

function recordSession(experience) {
  const recent = [
    { placeId: experience.id, name: experience.name, at: Date.now() },
    ...state.library.recent.filter((item) => item.placeId !== experience.id),
  ].slice(0, 12)
  const installed = state.library.installed.includes(experience.id)
    ? state.library.installed
    : [...state.library.installed, experience.id]
  state.library = { ...state.library, recent, installed }
  bridge.saveLibrary()
  writePreviewStore()
  renderShelves()
  renderLibrary()
  renderDownloads()
  renderStreak()
}

function startPlaying(experience, serverLabel) {
  state.playing = { experience, server: serverLabel, startedAt: Date.now() }
  $('launch-eyebrow').textContent = 'IN GAME'
  $('launch-title').textContent = experience.name
  $('launch-message').textContent = bridge.isDesktop
    ? `${serverLabel} · the Roblox Player is starting your session.`
    : `${serverLabel} · simulated session running in this preview.`
  $('launch-playing').classList.remove('hidden')
  $('launch-cancel').classList.add('hidden')
  $('launch-leave').classList.remove('hidden')
  $('playing-timer').textContent = '00:00'
  clearInterval(playingTimer)
  playingTimer = setInterval(() => {
    const seconds = Math.floor((Date.now() - state.playing.startedAt) / 1000)
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
    $('playing-timer').textContent = `${minutes}:${String(seconds % 60).padStart(2, '0')}`
  }, 1000)
  showToast(`Launched ${experience.name} on ${serverLabel}.`)
}

async function leaveExperience() {
  clearInterval(playingTimer)
  state.playing = null
  await bridge.leave()
  hideOverlay('launch-overlay')
  showToast('Session closed. Your library and favorites are saved.')
}

function closeLaunch() {
  clearInterval(playingTimer)
  state.playing = null
  hideOverlay('launch-overlay')
  $('launch-cancel').textContent = 'CANCEL'
  $('launch-cancel').disabled = false
}

/* --------------------------------------------------------------- downloads */

function runDownload(item) {
  item.phase = 'working'
  item.progress = 0
  item.status = 'STARTING…'
  renderDownloads()
  clearInterval(updateTimer)
  updateTimer = setInterval(() => {
    item.progress = Math.min(100, item.progress + 6 + Math.round(Math.random() * 6))
    item.status = item.progress >= 100 ? 'UP TO DATE' : `DOWNLOADING ${item.progress}%`
    if (item.progress >= 100) {
      item.phase = 'done'
      item.status = 'UP TO DATE'
      clearInterval(updateTimer)
      state.updating = false
      showToast(`${item.name} is up to date.`)
    }
    renderDownloads()
  }, 180)
}

function checkForUpdates() {
  if (state.updating) return
  state.updating = true
  const player = state.downloads.find((item) => item.id === 'player')
  if (player) {
    player.detail = 'Client 0.679.0 · 191 MB'
    runDownload(player)
  } else {
    state.updating = false
  }
  renderDownloads()
}

function installDownload(id) {
  const item = state.downloads.find((entry) => entry.id === id)
  if (!item || item.phase === 'working') return
  if (state.updating) {
    showToast('Wait for the current download to finish first.')
    return
  }
  if (item.id === 'voice') {
    item.detail = 'Spatial voice module · 38 MB'
  }
  state.updating = true
  runDownload(item)
  showToast(`Downloading ${item.name}…`)
}

/* ------------------------------------------------------------------ events */

function wireEvents() {
  for (const button of document.querySelectorAll('.nav-item[data-view]')) {
    button.addEventListener('click', () => switchView(button.dataset.view))
  }

  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const goto = target.closest('[data-goto]')
    if (goto) {
      switchView(goto.dataset.goto)
      return
    }

    const favorite = target.closest('[data-fav]')
    if (favorite) {
      event.stopPropagation()
      toggleFavorite(favorite.dataset.fav)
      return
    }

    const card = target.closest('[data-exp]')
    if (card) {
      openExperience(card.dataset.exp)
      return
    }

    const heroPlay = target.closest('[data-hero-play]')
    if (heroPlay) {
      playExperience(heroPlay.dataset.heroPlay)
      return
    }
    const heroDetails = target.closest('[data-hero-details]')
    if (heroDetails) {
      openExperience(heroDetails.dataset.heroDetails)
      return
    }

    const genre = target.closest('[data-genre]')
    if (genre) {
      state.genre = genre.dataset.genre
      renderGenreChips()
      renderDiscover()
      return
    }

    const tab = target.closest('[data-tab]')
    if (tab) {
      state.libraryTab = tab.dataset.tab
      for (const button of document.querySelectorAll('.tab[data-tab]')) {
        button.classList.toggle('active', button === tab)
      }
      renderLibrary()
      return
    }

    const join = target.closest('[data-join]')
    if (join) {
      playExperience(join.dataset.join, join.dataset.server)
      return
    }

    const close = target.closest('[data-close]')
    if (close) {
      hideOverlay(close.dataset.close)
      return
    }

    const download = target.closest('[data-download]')
    if (download) {
      installDownload(download.dataset.download)
      return
    }

    const trustLink = target.closest('[data-link]')
    if (trustLink) {
      bridge.openTrustedLink(trustLink.dataset.link)
      return
    }

    const demoProfile = target.closest('[data-demo-profile]')
    if (demoProfile) {
      chooseDemoProfile(demoProfile.dataset.demoProfile)
      return
    }

    const openSite = target.closest('[data-open-site]')
    if (openSite) {
      const experience = catalogById.get(openSite.dataset.openSite)
      if (experience) bridge.openExternal(`https://www.roblox.com/games/${experience.id}`)
      return
    }

    const clientAction = target.closest('[data-action]')
    if (clientAction) {
      if (clientAction.dataset.action === 'download-player') {
        bridge.openExternal('https://www.roblox.com/download')
      } else {
        switchView('downloads')
      }
      return
    }

    if (target.id === 'experience-overlay' || target.id === 'signin-overlay') {
      hideOverlay(target.id)
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      for (const id of ['experience-overlay', 'signin-overlay']) {
        if (!$(id).classList.contains('hidden')) hideOverlay(id)
      }
      if (!$('signin-overlay').classList.contains('hidden')) bridge.cancelSignIn()
      return
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      $('global-search').focus()
      $('global-search').select()
      return
    }
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return
    if (/^[1-4]$/.test(event.key)) {
      switchView(['home', 'discover', 'library', 'servers'][Number(event.key) - 1])
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const card = event.target instanceof Element ? event.target.closest('[data-exp]') : null
    if (!card) return
    event.preventDefault()
    openExperience(card.dataset.exp)
  })

  $('global-search').addEventListener('input', () => {
    state.query = $('global-search').value
    if (state.view !== 'discover') switchView('discover')
    renderDiscover()
  })

  $('sort-select').addEventListener('change', () => {
    state.sort = $('sort-select').value
    renderDiscover()
  })

  $('clear-search').addEventListener('click', () => {
    state.query = ''
    state.genre = 'All'
    $('global-search').value = ''
    renderGenreChips()
    renderDiscover()
  })

  $('server-region').addEventListener('change', renderServers)
  $('server-experience').addEventListener('change', () => {
    state.serverExperienceId = $('server-experience').value
    renderServers()
  })

  $('quick-join').addEventListener('click', () => {
    const experience = catalogById.get(state.serverExperienceId) || CATALOG[0]
    const best = serversFor(experience, $('server-region').value)[0]
    playExperience(experience.id, best.name)
  })

  $('update-all').addEventListener('click', checkForUpdates)
  $('open-data-folder').addEventListener('click', () => bridge.openFolder('data'))
  $('settings-open-folder').addEventListener('click', () => bridge.openFolder('data'))
  $('settings-open-logs').addEventListener('click', () => bridge.openFolder('logs'))

  $('clear-cache').addEventListener('click', () => {
    const cache = state.downloads.find((item) => item.id === 'assets')
    if (!cache) return
    cache.progress = 100
    cache.status = 'CLEARED'
    showToast('Asset cache cleared. It repopulates as you play.')
    setTimeout(() => {
      cache.detail = '0 assets · 0 MB'
      renderDownloads()
    }, 400)
  })

  $('account-button').addEventListener('click', () => {
    if (state.account) switchView('settings')
    else openSignIn()
  })

  $('rail-account').addEventListener('click', () => {
    if (state.account) switchView('settings')
    else openSignIn()
  })

  $('settings-account-button').addEventListener('click', () => {
    if (state.account) signOut()
    else openSignIn()
  })

  $('signin-cancel').addEventListener('click', () => {
    bridge.cancelSignIn()
    hideOverlay('signin-overlay')
    $('signin-demo').classList.remove('hidden')
    $('signin-waiting').classList.add('hidden')
    if (state.pendingPlaceId) {
      state.pendingPlaceId = null
      showToast('Sign-in cancelled.')
    }
  })

  $('exp-play').addEventListener('click', () => {
    if (state.selectedId) playExperience(state.selectedId)
  })
  $('exp-favorite').addEventListener('click', () => {
    if (state.selectedId) toggleFavorite(state.selectedId)
  })

  $('launch-cancel').addEventListener('click', () => {
    if (state.playing) leaveExperience()
    else closeLaunch()
  })
  $('launch-leave').addEventListener('click', leaveExperience)

  for (const toggle of document.querySelectorAll('.switch[data-setting]')) {
    toggle.addEventListener('click', () => {
      const key = toggle.dataset.setting
      state.settings[key] = !state.settings[key]
      toggle.setAttribute('aria-checked', state.settings[key] ? 'true' : 'false')
      bridge.saveSettings({ [key]: state.settings[key] })
      showToast(`${key === 'closeOnLaunch' ? 'Close launcher on launch' : key === 'autoUpdate' ? 'Automatic updates' : 'Low latency mode'} ${state.settings[key] ? 'enabled' : 'disabled'}.`)
    })
  }

  $('graphics-select').addEventListener('change', () => {
    state.settings.graphics = $('graphics-select').value
    bridge.saveSettings({ graphics: state.settings.graphics })
    showToast(`Graphics preset set to ${$('graphics-select').selectedOptions[0].textContent}.`)
  })

  $('region-select').addEventListener('change', () => {
    state.settings.region = $('region-select').value
    bridge.saveSettings({ region: state.settings.region })
    renderServers()
    renderServerExperienceOptions()
    showToast(`Preferred region set to ${REGION_LABELS[state.settings.region]}.`)
  })
}

/* -------------------------------------------------------------------- boot */

function applyMode() {
  const preview = !bridge.isDesktop
  state.mode = preview ? 'preview' : 'desktop'
  $('build-chip').classList.toggle('hidden', !preview)
  $('rail-build').textContent = preview ? 'PREVIEW BUILD' : 'DESKTOP BUILD'
  $('about-build').textContent = preview ? 'Browser preview (simulated)' : 'Windows x64 desktop app'
  if (preview) {
    $('build-chip').title = 'The browser preview simulates Roblox hand-off and uses sample experience data.'
  }
}

async function boot() {
  try {
    const loaded = await bridge.load()
    state.account = loaded.account || null
    state.settings = { ...SETTINGS_DEFAULTS, ...loaded.settings }
    state.library = {
      favorites: Array.isArray(loaded.library?.favorites) ? loaded.library.favorites : [],
      recent: Array.isArray(loaded.library?.recent) ? loaded.library.recent : [],
      installed: Array.isArray(loaded.library?.installed) ? loaded.library.installed : [],
    }
    if (Array.isArray(loaded.downloads) && loaded.downloads.length) state.downloads = loaded.downloads
    state.playerInstalled = loaded.playerInstalled
    state.storagePath = loaded.storagePath || ''
    state.version = loaded.version || state.version
  } catch (error) {
    showToast(error?.message || 'Could not load launcher state.')
  }

  applyMode()
  wireEvents()
  setAccount(state.account)
  $('server-region').value = state.settings.region
  renderAll()

  if (bridge.isDesktop && desktopApi) {
    desktopApi.on('launcher:progress', (payload) => {
      if (!payload || typeof payload.message !== 'string') return
      if (payload.stage === 'signin' && !$('signin-overlay').classList.contains('hidden')) {
        $('signin-waiting-text').textContent = payload.message
      } else if (payload.stage === 'error') {
        showToast(payload.message)
      } else if (!$('launch-overlay').classList.contains('hidden') && payload.stage !== 'signin') {
        $('launch-message').textContent = payload.message
      }
    })
    desktopApi.on('launcher:account', (account) => {
      setAccount(account)
      writePreviewStore()
    })
    desktopApi.on('launcher:experience-exit', () => {
      if ($('launch-overlay').classList.contains('hidden')) return
      closeLaunch()
      showToast('The Roblox Player closed.')
    })
  }
}

boot()
