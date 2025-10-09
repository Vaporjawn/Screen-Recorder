import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  LinearProgress,
  Stack,
  Alert,
  CircularProgress,
  Fab,
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Monitor as MonitorIcon,
  Window as WindowIcon,
} from '@mui/icons-material'

import { useScreenRecorder } from '../contexts/ScreenRecorderContext'
import { useNotification } from '../contexts/NotificationContext'
// import { RecordingSource } from '../types' // Unused import

export default function RecorderPanel() {
  const {
    sources,
    selectedSource,
    loadSources,
    selectSource,
    isRecording,
    isPaused,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useScreenRecorder()

  const { addNotification } = useNotification()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load sources on component mount
    handleLoadSources()
  }, [])

  const handleLoadSources = async () => {
    setLoading(true)
    try {
      await loadSources()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Load Sources',
        message: 'Could not retrieve available screens and windows.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartRecording = async () => {
    if (!selectedSource) {
      addNotification({
        type: 'warning',
        title: 'No Source Selected',
        message: 'Please select a screen or window to record.',
      })
      return
    }

    try {
      const success = await startRecording()
      if (success) {
        addNotification({
          type: 'success',
          title: 'Recording Started',
          message: `Recording ${selectedSource.name}`,
        })
      } else {
        addNotification({
          type: 'error',
          title: 'Failed to Start Recording',
          message: 'Could not access the selected source.',
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Recording Error',
        message: 'An error occurred while starting the recording.',
      })
    }
  }

  const handleStopRecording = async () => {
    try {
      const filePath = await stopRecording()
      if (filePath) {
        addNotification({
          type: 'success',
          title: 'Recording Saved',
          message: 'Your recording has been saved successfully.',
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Save Recording',
        message: 'An error occurred while saving the recording.',
      })
    }
  }

  const handlePauseResume = async () => {
    try {
      if (isPaused) {
        await resumeRecording()
        addNotification({
          type: 'info',
          title: 'Recording Resumed',
        })
      } else {
        await pauseRecording()
        addNotification({
          type: 'info',
          title: 'Recording Paused',
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to pause/resume recording.',
      })
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    const pad = (num: number) => num.toString().padStart(2, '0')

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`
    }
    return `${pad(minutes)}:${pad(seconds % 60)}`
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Screen Recorder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a screen or window to start recording
        </Typography>
      </Box>

      {/* Recording Status */}
      {isRecording && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: isPaused ? 'warning.light' : 'error.light',
            color: isPaused ? 'warning.contrastText' : 'error.contrastText',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h6">
                {isPaused ? 'Recording Paused' : 'Recording in Progress'}
              </Typography>
              <Typography variant="body2">
                Duration: {formatDuration(duration)}
              </Typography>
              {selectedSource && (
                <Typography variant="body2">
                  Source: {selectedSource.name}
                </Typography>
              )}
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="inherit"
                startIcon={isPaused ? <PlayIcon /> : <PauseIcon />}
                onClick={handlePauseResume}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<StopIcon />}
                onClick={handleStopRecording}
              >
                Stop
              </Button>
            </Stack>
          </Stack>
          {!isPaused && (
            <LinearProgress
              sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}
            />
          )}
        </Paper>
      )}

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleLoadSources}
            disabled={loading || isRecording}
          >
            Refresh Sources
          </Button>

          {loading && <CircularProgress size={24} />}

          <Box sx={{ flexGrow: 1 }} />

          {!isRecording && (
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayIcon />}
              onClick={handleStartRecording}
              disabled={!selectedSource || loading}
            >
              Start Recording
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Source Selection */}
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <Typography variant="h6" gutterBottom>
          Available Sources
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : sources.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No sources available. Click "Refresh Sources" to scan for screens and windows.
          </Alert>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {sources.map((source) => (
              <Box key={source.id}>
                <Card
                  sx={{
                    border: selectedSource?.id === source.id ? 2 : 1,
                    borderColor:
                      selectedSource?.id === source.id
                        ? 'primary.main'
                        : 'divider',
                    cursor: isRecording ? 'default' : 'pointer',
                    opacity: isRecording ? 0.7 : 1,
                  }}
                >
                  <CardActionArea
                    onClick={() => !isRecording && selectSource(source)}
                    disabled={isRecording}
                  >
                    <CardMedia
                      component="img"
                      height="120"
                      image={source.thumbnail}
                      alt={source.name}
                      sx={{
                        objectFit: 'contain',
                        backgroundColor: 'grey.100',
                      }}
                    />
                    <CardContent sx={{ pb: 1 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 1 }}
                      >
                        {source.type === 'screen' ? (
                          <MonitorIcon fontSize="small" color="primary" />
                        ) : (
                          <WindowIcon fontSize="small" color="secondary" />
                        )}
                        <Chip
                          label={source.type}
                          size="small"
                          variant="outlined"
                          color={source.type === 'screen' ? 'primary' : 'secondary'}
                        />
                      </Stack>
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          fontWeight:
                            selectedSource?.id === source.id ? 600 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {source.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Floating Action Button for Quick Recording */}
      {!isRecording && selectedSource && (
        <Fab
          color="primary"
          aria-label="start recording"
          onClick={handleStartRecording}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
          }}
        >
          <PlayIcon />
        </Fab>
      )}
    </Box>
  )
}