import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Stack,
  Divider,
  Alert,
  Card,
  CardContent,
} from '@mui/material'
import {
  Save as SaveIcon,
  Restore as RestoreIcon,
  VolumeUp as VolumeIcon,
} from '@mui/icons-material'

import { useScreenRecorder } from '../contexts/ScreenRecorderContext'
import { useNotification } from '../contexts/NotificationContext'
import { RecordingSettings } from '../types'

const QUALITY_OPTIONS = [
  { value: 'low', label: 'Low (720p)', description: 'Smaller file size, lower quality' },
  { value: 'medium', label: 'Medium (1080p)', description: 'Balanced file size and quality' },
  { value: 'high', label: 'High (1440p)', description: 'Larger file size, higher quality' },
]

const FPS_OPTIONS = [15, 24, 30, 60]

const DEFAULT_SETTINGS: RecordingSettings = {
  quality: 'high',
  fps: 60,
  includeAudio: true,
  audioInputDevice: undefined,
}

export default function SettingsPanel() {
  const { settings, updateSettings } = useScreenRecorder()
  const { addNotification } = useNotification()
  const [localSettings, setLocalSettings] = useState<RecordingSettings>(settings)
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  useEffect(() => {
    // Load available audio devices
    loadAudioDevices()
  }, [])

  useEffect(() => {
    // Check for unsaved changes
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings)
    setHasUnsavedChanges(hasChanges)
  }, [localSettings, settings])

  const loadAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter(device => device.kind === 'audioinput')
      setAudioDevices(audioInputs)
    } catch (error) {
      console.error('Failed to load audio devices:', error)
      addNotification({
        type: 'error',
        title: 'Audio Device Error',
        message: 'Failed to load available audio input devices.',
      })
    }
  }

  const handleSettingChange = <K extends keyof RecordingSettings>(
    key: K,
    value: RecordingSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateSettings(localSettings)
    setHasUnsavedChanges(false)
    addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your recording settings have been updated.',
    })
  }

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS)
  }

  const handleRestore = () => {
    setLocalSettings(settings)
    setHasUnsavedChanges(false)
  }

  const getQualityDescription = (quality: string) => {
    const option = QUALITY_OPTIONS.find(opt => opt.value === quality)
    return option ? option.description : ''
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recording Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your recording preferences and quality settings
        </Typography>
      </Box>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have unsaved changes. Don't forget to save your settings.
        </Alert>
      )}

      {/* Settings Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3
        }}>
          {/* Video Settings */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Video Settings
                </Typography>

                <Stack spacing={3}>
                  {/* Quality */}
                  <FormControl fullWidth>
                    <InputLabel>Quality</InputLabel>
                    <Select
                      value={localSettings.quality}
                      label="Quality"
                      onChange={(e) =>
                        handleSettingChange('quality', e.target.value as any)
                      }
                    >
                      {QUALITY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box>
                            <Typography variant="body1">
                              {option.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Frame Rate */}
                  <Box>
                    <Typography gutterBottom>
                      Frame Rate: {localSettings.fps} FPS
                    </Typography>
                    <Slider
                      value={localSettings.fps}
                      onChange={(_, value) =>
                        handleSettingChange('fps', value as number)
                      }
                      min={15}
                      max={60}
                      step={null}
                      marks={FPS_OPTIONS.map(fps => ({ value: fps, label: `${fps}` }))}
                      valueLabelDisplay="auto"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Higher frame rates result in smoother video but larger file sizes
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Audio Settings */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Audio Settings
                </Typography>

                <Stack spacing={3}>
                  {/* Include Audio */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.includeAudio}
                        onChange={(e) =>
                          handleSettingChange('includeAudio', e.target.checked)
                        }
                      />
                    }
                    label="Include Audio"
                  />

                  {/* Audio Input Device */}
                  {localSettings.includeAudio && (
                    <FormControl fullWidth>
                      <InputLabel>Audio Input Device</InputLabel>
                      <Select
                        value={localSettings.audioInputDevice || ''}
                        label="Audio Input Device"
                        onChange={(e) =>
                          handleSettingChange(
                            'audioInputDevice',
                            e.target.value || undefined
                          )
                        }
                        startAdornment={<VolumeIcon sx={{ mr: 1 }} />}
                      >
                        <MenuItem value="">
                          <em>Default Device</em>
                        </MenuItem>
                        {audioDevices.map((device) => (
                          <MenuItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Audio Input ${device.deviceId.slice(-4)}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {audioDevices.length === 0 && localSettings.includeAudio && (
                    <Alert severity="warning">
                      No audio input devices found. Please check your microphone connections.
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Advanced Settings */}
          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Advanced Settings
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  These settings will be applied to new recordings. Changes won't affect ongoing recordings.
                </Alert>

                <Typography variant="body2" color="text.secondary">
                  Current quality setting: {getQualityDescription(localSettings.quality)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={handleReset}
          disabled={JSON.stringify(localSettings) === JSON.stringify(DEFAULT_SETTINGS)}
        >
          Reset to Defaults
        </Button>

        {hasUnsavedChanges && (
          <Button
            variant="outlined"
            onClick={handleRestore}
          >
            Discard Changes
          </Button>
        )}

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
        >
          Save Settings
        </Button>
      </Stack>
    </Box>
  )
}