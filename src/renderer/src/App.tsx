import { useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { ScreenRecorderProvider } from './contexts/ScreenRecorderContext'
import { NotificationProvider } from './contexts/NotificationContext'
import MainLayout from './components/MainLayout'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
})

function App() {
  useEffect(() => {
    // Handle menu actions from Electron
    if (window.electronAPI) {
      window.electronAPI.onMenuAction((action: string) => {
        // Dispatch custom events that components can listen to
        window.dispatchEvent(new CustomEvent('menu-action', { detail: action }))
      })

      // Cleanup on unmount
      return () => {
        window.electronAPI.removeMenuListeners()
      }
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <ScreenRecorderProvider>
          <MainLayout />
        </ScreenRecorderProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App