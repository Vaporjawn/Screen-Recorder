import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  getSources: () => Promise<Array<{
    id: string
    name: string
    thumbnail: string
  }>>
  startRecording: (sourceId: string) => Promise<boolean>
  stopRecording: () => Promise<string | null>
  pauseRecording: () => Promise<boolean>
  resumeRecording: () => Promise<boolean>
  getRecordingStatus: () => Promise<{
    isRecording: boolean
    isPaused: boolean
    duration: number
  }>
  showSaveDialog: () => Promise<string | null>
  saveRecording: (filePath: string, data: Uint8Array) => Promise<void>
  onMenuAction: (callback: (action: string) => void) => void
  removeMenuListeners: () => void
  getVersions: () => Promise<{
    electron: string
    node: string
    chrome: string
  }>
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  getSources: () => ipcRenderer.invoke('get-sources'),
  startRecording: (sourceId: string) => ipcRenderer.invoke('start-recording', sourceId),
  stopRecording: () => ipcRenderer.invoke('stop-recording'),
  pauseRecording: () => ipcRenderer.invoke('pause-recording'),
  resumeRecording: () => ipcRenderer.invoke('resume-recording'),
  getRecordingStatus: () => ipcRenderer.invoke('get-recording-status'),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  saveRecording: (filePath: string, data: Uint8Array) =>
    ipcRenderer.invoke('save-recording', filePath, data),

  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-recording', () => callback('new-recording'))
    ipcRenderer.on('menu-start-recording', () => callback('start-recording'))
    ipcRenderer.on('menu-stop-recording', () => callback('stop-recording'))
    ipcRenderer.on('menu-toggle-pause', () => callback('toggle-pause'))
  },

  removeMenuListeners: () => {
    ipcRenderer.removeAllListeners('menu-new-recording')
    ipcRenderer.removeAllListeners('menu-start-recording')
    ipcRenderer.removeAllListeners('menu-stop-recording')
    ipcRenderer.removeAllListeners('menu-toggle-pause')
  },

  getVersions: () => ipcRenderer.invoke('get-versions'),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)