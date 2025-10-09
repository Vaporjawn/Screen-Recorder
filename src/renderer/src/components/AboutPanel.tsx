import {
  Box,
  Typography,
  Paper,
  Stack,
  Link,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import {
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Computer as ComputerIcon,
  Code as CodeIcon,
} from '@mui/icons-material'
import { useEffect, useState } from 'react'

const APP_VERSION = '1.0.0'

export default function AboutPanel() {
  const [versions, setVersions] = useState({
    electron: 'Unknown',
    node: 'Unknown',
    chrome: 'Unknown',
  })

  useEffect(() => {
    const getVersions = async () => {
      try {
        const fetchedVersions = await window.electronAPI.getVersions()
        setVersions(fetchedVersions)
      } catch (error) {
        console.error('Failed to get versions:', error)
      }
    }
    getVersions()
  }, [])

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          About Screen Recorder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A modern screen recording application built with Electron and React
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* App Information */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <ComputerIcon color="primary" />
              <Typography variant="h6">Application Information</Typography>
            </Stack>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  Screen Recorder
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Version {APP_VERSION}
                </Typography>
              </Box>

              <Typography variant="body1">
                A professional screen recording application that allows you to capture
                high-quality screen recordings with customizable settings. Built with
                modern web technologies for a seamless user experience.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label="Cross-Platform" size="small" color="primary" />
                <Chip label="High Quality" size="small" color="secondary" />
                <Chip label="Easy to Use" size="small" color="success" />
                <Chip label="Open Source" size="small" color="info" />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <CodeIcon color="primary" />
              <Typography variant="h6">Technical Details</Typography>
            </Stack>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Built with modern web technologies:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label="Electron" variant="outlined" size="small" />
                  <Chip label="React 18" variant="outlined" size="small" />
                  <Chip label="TypeScript" variant="outlined" size="small" />
                  <Chip label="Material-UI" variant="outlined" size="small" />
                  <Chip label="Vite" variant="outlined" size="small" />
                </Stack>
              </Box>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="subtitle2">Runtime Versions</Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2">
                    Electron: {versions.electron}
                  </Typography>
                  <Typography variant="body2">
                    Node.js: {versions.node}
                  </Typography>
                  <Typography variant="body2">
                    Chrome: {versions.chrome}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Developer Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Developer
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  Victor Williams
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Software Developer
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Link
                  href="https://github.com/Vaporjawn"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  <GitHubIcon fontSize="small" />
                  GitHub
                </Link>

                <Link
                  href="mailto:victor.williams.dev@gmail.com"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  <EmailIcon fontSize="small" />
                  Contact
                </Link>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>

            <Stack spacing={1}>
              <Typography variant="body2">• High-quality screen and window recording</Typography>
              <Typography variant="body2">• Customizable video quality and frame rate</Typography>
              <Typography variant="body2">• Audio recording with multiple input sources</Typography>
              <Typography variant="body2">• Pause and resume recording functionality</Typography>
              <Typography variant="body2">• Recording history and session management</Typography>
              <Typography variant="body2">• Cross-platform compatibility (macOS, Windows, Linux)</Typography>
              <Typography variant="body2">• Modern, intuitive user interface</Typography>
              <Typography variant="body2">• Keyboard shortcuts and menu integration</Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* License */}
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Released under the MIT License
          </Typography>
          <Typography variant="caption" color="text.secondary">
            © 2025 Victor Williams. All rights reserved.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  )
}