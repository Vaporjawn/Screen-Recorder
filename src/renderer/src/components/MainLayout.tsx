import { useState } from 'react'
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Badge,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Videocam as VideocamIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Info as InfoIcon,
} from '@mui/icons-material'

import RecorderPanel from './RecorderPanel'
import SettingsPanel from './SettingsPanel'
import HistoryPanel from './HistoryPanel'
import AboutPanel from './AboutPanel'
import NotificationStack from './NotificationStack'
import { useScreenRecorder } from '../contexts/ScreenRecorderContext'

type ActivePanel = 'recorder' | 'settings' | 'history' | 'about'

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<ActivePanel>('recorder')
  const { isRecording, sessions } = useScreenRecorder()

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handlePanelChange = (panel: ActivePanel) => {
    setActivePanel(panel)
    setDrawerOpen(false)
  }

  const menuItems = [
    {
      id: 'recorder' as ActivePanel,
      label: 'Screen Recorder',
      icon: <VideocamIcon />,
      badge: isRecording ? 'REC' : undefined,
    },
    {
      id: 'history' as ActivePanel,
      label: 'Recording History',
      icon: <HistoryIcon />,
      badge: sessions.length > 0 ? sessions.length.toString() : undefined,
    },
    {
      id: 'settings' as ActivePanel,
      label: 'Settings',
      icon: <SettingsIcon />,
    },
    {
      id: 'about' as ActivePanel,
      label: 'About',
      icon: <InfoIcon />,
    },
  ]

  const renderPanel = () => {
    switch (activePanel) {
      case 'recorder':
        return <RecorderPanel />
      case 'settings':
        return <SettingsPanel />
      case 'history':
        return <HistoryPanel />
      case 'about':
        return <AboutPanel />
      default:
        return <RecorderPanel />
    }
  }

  const drawerWidth = 280

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1976d2',
        }}
        className="app-drag"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            className="app-no-drag"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Screen Recorder
          </Typography>
          {isRecording && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: '#d32f2f',
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.875rem',
                fontWeight: 'medium',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  animation: 'pulse 1s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 },
                  },
                }}
              />
              RECORDING
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activePanel === item.id}
                  onClick={() => handlePanelChange(item.id)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    {item.badge ? (
                      <Badge
                        badgeContent={item.badge}
                        color={item.id === 'recorder' && isRecording ? 'error' : 'secondary'}
                        variant={item.id === 'recorder' && isRecording ? 'dot' : 'standard'}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <Toolbar />
        <Container
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            py: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {renderPanel()}
        </Container>
      </Box>

      {/* Notification Stack */}
      <NotificationStack />
    </Box>
  )
}