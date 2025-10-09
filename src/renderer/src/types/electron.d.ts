export interface RecordingSource {
  id: string
  name: string
  thumbnail: string
}

export interface RecordingSettings {
  fps: number
  quality: 'low' | 'medium' | 'high'
}

export interface RecordingSession {
  id: string
  startTime: number
  endTime: number | null
  duration: number
  source: RecordingSource
  filePath: string | null
}

export interface ElectronAPI {
  getSources: () => Promise<RecordingSource[]>
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

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
