import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react'
import { RecordingSource, RecordingSettings, RecordingSession } from '../types'

interface ScreenRecorderContextType {
  // Sources
  sources: RecordingSource[]
  selectedSource: RecordingSource | null
  loadSources: () => Promise<void>
  selectSource: (source: RecordingSource) => void

  // Recording state
  isRecording: boolean
  isPaused: boolean
  duration: number
  currentSession: RecordingSession | null

  // Recording controls
  startRecording: () => Promise<boolean>
  stopRecording: () => Promise<string | null>
  pauseRecording: () => Promise<boolean>
  resumeRecording: () => Promise<boolean>

  // Settings
  settings: RecordingSettings
  updateSettings: (newSettings: Partial<RecordingSettings>) => void

  // Sessions history
  sessions: RecordingSession[]
  addSession: (session: RecordingSession) => void
  removeSession: (sessionId: string) => void

  // MediaRecorder
  mediaRecorder: MediaRecorder | null
  setMediaRecorder: (recorder: MediaRecorder | null) => void
}

const ScreenRecorderContext = createContext<ScreenRecorderContextType | undefined>(undefined)

interface ScreenRecorderProviderProps {
  children: ReactNode
}

export function ScreenRecorderProvider({ children }: ScreenRecorderProviderProps) {
  const [sources, setSources] = useState<RecordingSource[]>([])
  const [selectedSource, setSelectedSource] = useState<RecordingSource | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [sessions, setSessions] = useState<RecordingSession[]>([])
  const chunksRef = useRef<Blob[]>([])

  const [settings, setSettings] = useState<RecordingSettings>({
    quality: 'high',
    fps: 60,
    includeAudio: true,
    audioInputDevice: undefined,
  })

  // Load available sources
  const loadSources = useCallback(async () => {
    try {
      if (window.electronAPI) {
        const electronSources = await window.electronAPI.getSources()
        const formattedSources: RecordingSource[] = electronSources.map(source => ({
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail,
          type: source.name.toLowerCase().includes('screen') ? 'screen' : 'window'
        }))
        setSources(formattedSources)
      }
    } catch (error) {
      console.error('Failed to load sources:', error)
    }
  }, [])

  // Select source for recording
  const selectSource = useCallback((source: RecordingSource) => {
    setSelectedSource(source)
  }, [])

  // Add session to history
  const addSession = useCallback((session: RecordingSession) => {
    setSessions(prev => [session, ...prev])
  }, [])

  // Start recording
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!selectedSource || !window.electronAPI) {
      return false
    }

    try {
      // Get the media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: settings.includeAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id,
            minWidth: 1280,
            maxWidth: 1920,
            minHeight: 720,
            maxHeight: 1080,
            minFrameRate: settings.fps,
            maxFrameRate: settings.fps,
          }
        } as any
      })

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      })

      chunksRef.current = [] // Reset chunks

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        // This is now primarily for cleanup, saving is handled in stopRecording
        stream.getTracks().forEach(track => track.stop())
      }

      // Create session
      const session: RecordingSession = {
        id: `session-${Date.now()}`,
        name: `Recording ${selectedSource.name}`,
        startTime: Date.now(),
        duration: 0,
        settings: { ...settings }
      }

      setCurrentSession(session)
      setMediaRecorder(recorder)
      recorder.start(1000) // Collect data every second

      setIsRecording(true)
      setIsPaused(false)
      setDuration(0)

      return true
    } catch (error) {
      console.error('Failed to start recording:', error)
      return false
    }
  }, [selectedSource, settings])

  // Stop recording
  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!mediaRecorder || !isRecording) {
      return null
    }

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        chunksRef.current = [] // Clear chunks

        try {
          const filePath = await window.electronAPI.showSaveDialog()
          if (filePath) {
            const buffer = await blob.arrayBuffer()
            await window.electronAPI.saveRecording(filePath, new Uint8Array(buffer))

            if (currentSession) {
              const updatedSession: RecordingSession = {
                ...currentSession,
                endTime: Date.now(),
                duration: Date.now() - currentSession.startTime,
                filePath,
              }
              addSession(updatedSession)
            }
            resolve(filePath)
          } else {
            resolve(null) // User cancelled save dialog
          }
        } catch (error) {
          console.error('Failed to save recording:', error)
          reject(error)
        } finally {
          // Stop all tracks
          if (mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach((track) => track.stop())
          }
          setIsRecording(false)
          setIsPaused(false)
          setDuration(0)
          setCurrentSession(null)
          setMediaRecorder(null)
        }
      }

      mediaRecorder.stop()
    })
  }, [mediaRecorder, isRecording, currentSession, addSession])

  // Pause recording
  const pauseRecording = useCallback(async (): Promise<boolean> => {
    if (!mediaRecorder || !isRecording || isPaused) {
      return false
    }

    try {
      mediaRecorder.pause()
      setIsPaused(true)
      return true
    } catch (error) {
      console.error('Failed to pause recording:', error)
      return false
    }
  }, [mediaRecorder, isRecording, isPaused])

  // Resume recording
  const resumeRecording = useCallback(async (): Promise<boolean> => {
    if (!mediaRecorder || !isRecording || !isPaused) {
      return false
    }

    try {
      mediaRecorder.resume()
      setIsPaused(false)
      return true
    } catch (error) {
      console.error('Failed to resume recording:', error)
      return false
    }
  }, [mediaRecorder, isRecording, isPaused])

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<RecordingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  // Remove session from history
  const removeSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId))
  }, [])

  // Update duration while recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRecording && !isPaused && currentSession) {
      interval = setInterval(() => {
        const elapsed = Date.now() - currentSession.startTime
        setDuration(elapsed)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRecording, isPaused, currentSession])

  // Handle menu actions
  useEffect(() => {
    const handleMenuAction = (event: CustomEvent) => {
      const action = event.detail

      switch (action) {
        case 'new-recording':
          loadSources()
          break
        case 'start-recording':
          if (selectedSource && !isRecording) {
            startRecording()
          }
          break
        case 'stop-recording':
          if (isRecording) {
            stopRecording()
          }
          break
        case 'toggle-pause':
          if (isRecording) {
            if (isPaused) {
              resumeRecording()
            } else {
              pauseRecording()
            }
          }
          break
      }
    }

    window.addEventListener('menu-action', handleMenuAction as EventListener)

    return () => {
      window.removeEventListener('menu-action', handleMenuAction as EventListener)
    }
  }, [selectedSource, isRecording, isPaused, loadSources, startRecording, stopRecording, pauseRecording, resumeRecording, addSession])

  const value = {
    sources,
    selectedSource,
    loadSources,
    selectSource,
    isRecording,
    isPaused,
    duration,
    currentSession,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    settings,
    updateSettings,
    sessions,
    addSession,
    removeSession,
    mediaRecorder,
    setMediaRecorder,
  }

  return (
    <ScreenRecorderContext.Provider value={value}>
      {children}
    </ScreenRecorderContext.Provider>
  )
}

export function useScreenRecorder() {
  const context = useContext(ScreenRecorderContext)
  if (context === undefined) {
    throw new Error('useScreenRecorder must be used within a ScreenRecorderProvider')
  }
  return context
}