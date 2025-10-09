import { useState } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  Chip,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Divider,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Folder as FolderIcon,
  Schedule as ScheduleIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material'

import { useScreenRecorder } from '../contexts/ScreenRecorderContext'
import { useNotification } from '../contexts/NotificationContext'
import { RecordingSession } from '../types'

export default function HistoryPanel() {
  const { sessions, removeSession } = useScreenRecorder()
  const { addNotification } = useNotification()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<RecordingSession | null>(null)

  const handleDeleteClick = (session: RecordingSession) => {
    setSessionToDelete(session)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      removeSession(sessionToDelete.id)
      addNotification({
        type: 'success',
        title: 'Recording Deleted',
        message: `Deleted recording: ${sessionToDelete.name}`,
      })
      setSessionToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const handleDeleteCancel = () => {
    setSessionToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleOpenFile = (session: RecordingSession) => {
    if (session.filePath) {
      // In a real Electron app, you would use shell.showItemInFolder
      addNotification({
        type: 'info',
        title: 'File Location',
        message: `File saved at: ${session.filePath}`,
      })
    } else {
      addNotification({
        type: 'warning',
        title: 'File Not Found',
        message: 'The recording file could not be located.',
      })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
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

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high':
        return 'success'
      case 'medium':
        return 'warning'
      case 'low':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recording History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your recorded sessions and saved files
        </Typography>
      </Box>

      {/* Stats */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={4} alignItems="center">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {sessions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Recordings
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="secondary">
              {sessions.reduce((total, session) => total + session.duration, 0) / 1000 / 60 > 60
                ? `${Math.floor(sessions.reduce((total, session) => total + session.duration, 0) / 1000 / 60 / 60)}h`
                : `${Math.floor(sessions.reduce((total, session) => total + session.duration, 0) / 1000 / 60)}m`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Duration
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {sessions.filter(session => session.filePath).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Saved Files
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Recording List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {sessions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <VideocamIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Recordings Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your recorded sessions will appear here. Start recording to create your first session.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              Start Recording
            </Button>
          </Paper>
        ) : (
          <List>
            {sessions.map((session) => (
              <Paper key={session.id} sx={{ mb: 2 }}>
                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 2,
                  }}
                >
                  {/* Main Content */}
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={2}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {session.name}
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <ScheduleIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(session.startTime)}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            Duration: {formatDuration(session.duration)}
                          </Typography>
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {session.filePath && (
                          <IconButton
                            aria-label="open file"
                            onClick={() => handleOpenFile(session)}
                            color="primary"
                          >
                            <FolderIcon />
                          </IconButton>
                        )}
                        <IconButton
                          aria-label="delete recording"
                          onClick={() => handleDeleteClick(session)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Settings Info */}
                  <Box sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={`Quality: ${session.settings.quality}`}
                        size="small"
                        color={getQualityColor(session.settings.quality) as any}
                        variant="outlined"
                      />
                      <Chip
                        label={`${session.settings.fps} FPS`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={session.settings.includeAudio ? 'With Audio' : 'No Audio'}
                        size="small"
                        variant="outlined"
                        color={session.settings.includeAudio ? 'success' : 'default'}
                      />
                      {session.filePath ? (
                        <Chip
                          label="Saved"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip
                          label="Not Saved"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Recording</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the recording "{sessionToDelete?.name}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. The recording will be removed from your history.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}