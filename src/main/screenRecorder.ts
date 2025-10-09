import { join } from 'path'
import { app } from 'electron'

export interface RecordingStatus {
  isRecording: boolean
  isPaused: boolean
  duration: number
}

export class ScreenRecorder {
  private startTime: number = 0
  private pausedTime: number = 0
  private status: RecordingStatus = {
    isRecording: false,
    isPaused: false,
    duration: 0
  }

  async startRecording(_sourceId: string): Promise<boolean> {
    try {
      // This will be handled by the renderer process
      // We'll send the sourceId and let the renderer handle MediaRecorder
      this.status.isRecording = true
      this.status.isPaused = false
      this.startTime = Date.now()
      this.pausedTime = 0

      return true
    } catch (error) {
      console.error('Failed to start recording:', error)
      this.status.isRecording = false
      return false
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.status.isRecording) {
        return null
      }

      this.status.isRecording = false
      this.status.isPaused = false

      // Calculate final duration
      const endTime = Date.now()
      this.status.duration = endTime - this.startTime - this.pausedTime

      // Return a placeholder path - actual file saving will be handled in renderer
      const downloadsPath = app.getPath('downloads')
      const fileName = `screen-recording-${Date.now()}.mp4`
      return join(downloadsPath, fileName)
    } catch (error) {
      console.error('Failed to stop recording:', error)
      return null
    }
  }

  pauseRecording(): boolean {
    if (!this.status.isRecording || this.status.isPaused) {
      return false
    }

    this.status.isPaused = true
    return true
  }

  resumeRecording(): boolean {
    if (!this.status.isRecording || !this.status.isPaused) {
      return false
    }

    this.status.isPaused = false
    return true
  }

  getStatus(): RecordingStatus {
    if (this.status.isRecording && !this.status.isPaused) {
      const currentTime = Date.now()
      this.status.duration = currentTime - this.startTime - this.pausedTime
    }

    return { ...this.status }
  }

  // Note: File saving is handled in the renderer process
  // This method is kept for potential future use
}