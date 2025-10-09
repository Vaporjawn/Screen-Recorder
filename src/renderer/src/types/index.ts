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
  onMenuAction: (callback: (action: string) => void) => void
  removeMenuListeners: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export interface RecordingSource {
  id: string
  name: string
  thumbnail: string
  type: 'screen' | 'window'
}

export interface RecordingStatus {
  isRecording: boolean
  isPaused: boolean
  duration: number
}

export interface RecordingSettings {
  quality: 'low' | 'medium' | 'high'
  fps: number
  includeAudio: boolean
  audioInputDevice?: string
}

export interface RecordingSession {
  id: string
  name: string
  startTime: number
  endTime?: number
  duration: number
  filePath?: string
  settings: RecordingSettings
}