'use strict'

const { contextBridge, ipcRenderer } = require('electron')

const allowedEvents = new Set([
  'launcher:progress',
  'launcher:account',
  'launcher:experience-exit',
])

contextBridge.exposeInMainWorld('ruinforge', Object.freeze({
  desktop: true,
  initialState: () => ipcRenderer.invoke('launcher:initial-state'),
  signIn: () => ipcRenderer.invoke('launcher:sign-in'),
  cancelSignIn: () => ipcRenderer.invoke('launcher:cancel-sign-in'),
  signOut: () => ipcRenderer.invoke('launcher:sign-out'),
  launchExperience: (placeId, name) => ipcRenderer.invoke('launcher:launch-experience', placeId, name),
  leaveExperience: () => ipcRenderer.invoke('launcher:leave-experience'),
  saveSettings: (patch) => ipcRenderer.invoke('launcher:save-settings', patch),
  saveLibrary: (library) => ipcRenderer.invoke('launcher:save-library', library),
  openFolder: (which) => ipcRenderer.invoke('launcher:open-folder', which),
  openExternal: (url) => ipcRenderer.invoke('launcher:open-external', url),
  openTrustedLink: (linkId) => ipcRenderer.invoke('launcher:open-trusted-link', linkId),
  on(eventName, listener) {
    if (!allowedEvents.has(eventName) || typeof listener !== 'function') return () => {}
    const subscription = (_event, payload) => listener(payload)
    ipcRenderer.on(eventName, subscription)
    return () => ipcRenderer.removeListener(eventName, subscription)
  },
}))
