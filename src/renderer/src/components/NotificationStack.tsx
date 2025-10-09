import { Snackbar, Alert, IconButton, Stack, Box } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useNotification } from '../contexts/NotificationContext'

export default function NotificationStack() {
  const { notifications, removeNotification } = useNotification()

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 2000,
        pointerEvents: 'none',
      }}
    >
      <Stack spacing={1}>
        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={true}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ position: 'relative', pointerEvents: 'auto' }}
          >
            <Alert
              severity={notification.type}
              variant="filled"
              sx={{
                minWidth: 300,
                maxWidth: 400,
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
              action={
                <Stack direction="row" spacing={1} alignItems="center">
                  {notification.action && (
                    <IconButton
                      size="small"
                      color="inherit"
                      onClick={notification.action.onClick}
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {notification.action.label}
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
            >
              <Box>
                <div style={{ fontWeight: 600 }}>{notification.title}</div>
                {notification.message && (
                  <div style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                    {notification.message}
                  </div>
                )}
              </Box>
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </Box>
  )
}