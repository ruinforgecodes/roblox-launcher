'use strict'

const { contextBridge, ipcRenderer } = require('electron')

const allowedEvents = new Set([
  'launcher:progress',
  'launcher:device-code',
  'launcher:account',
  'launcher:game-exit',
])

contextBridge.exposeInMainWorld('ruinforge', Object.freeze({
  initialState: () => ipcRenderer.invoke('launcher:initial-state'),
  signIn: () => ipcRenderer.invoke('launcher:sign-in'),
  cancelSignIn: () => ipcRenderer.invoke('launcher:cancel-sign-in'),
  signOut: () => ipcRenderer.invoke('launcher:sign-out'),
  choosePack: () => ipcRenderer.invoke('launcher:choose-pack'),
  openMicrosoftSignIn: (url) => ipcRenderer.invoke('launcher:open-microsoft', url),
  saveMemory: (memoryGb) => ipcRenderer.invoke('launcher:save-memory', memoryGb),
  installAndPlay: (packPath) => ipcRenderer.invoke('launcher:install-play', packPath),
  cancelInstall: () => ipcRenderer.invoke('launcher:cancel-install'),
  openFolder: (instanceDirectory) => ipcRenderer.invoke('launcher:open-folder', instanceDirectory),
  openToolFolder: (folderId) => ipcRenderer.invoke('launcher:open-tool-folder', folderId),
  openResource: (resourceId) => ipcRenderer.invoke('launcher:open-resource', resourceId),
  on(eventName, listener) {
    if (!allowedEvents.has(eventName) || typeof listener !== 'function') return () => {}
    const subscription = (_event, payload) => listener(payload)
    ipcRenderer.on(eventName, subscription)
    return () => ipcRenderer.removeListener(eventName, subscription)
  },
}))
