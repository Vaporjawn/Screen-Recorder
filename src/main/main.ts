import { app, BrowserWindow, ipcMain, desktopCapturer, Menu } from 'electron'
import { join } from 'path'
import { ScreenRecorder } from './screenRecorder'

const isDevelopment = process.env.NODE_ENV !== 'production'

class Main {
  private mainWindow: BrowserWindow | null = null
  private screenRecorder: ScreenRecorder

  constructor() {
    this.screenRecorder = new ScreenRecorder()
    this.init()
  }

  private async init() {
    // Handle app ready
    await app.whenReady()
    this.createWindow()
    this.setupIpcHandlers()
    this.createMenu()

    // Handle window closed on macOS
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // Handle app activation on macOS
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow()
      }
    })
  }

  private createWindow(): void {
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
      },
      titleBarStyle: 'hiddenInset',
      show: false, // Don't show until ready-to-show
    })

    // Load the app
    if (isDevelopment) {
      this.mainWindow.loadURL('http://localhost:3009')
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()

      if (isDevelopment) {
        this.mainWindow?.webContents.openDevTools()
      }
    })

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  private setupIpcHandlers(): void {
    // Get available screens for recording
    ipcMain.handle('get-sources', async () => {
      try {
        const sources = await desktopCapturer.getSources({
          types: ['window', 'screen'],
          thumbnailSize: { width: 150, height: 150 }
        })

        return sources.map(source => ({
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail.toDataURL()
        }))
      } catch (error) {
        console.error('Error getting sources:', error)
        throw error
      }
    })

    // Start recording
    ipcMain.handle('start-recording', async (_, sourceId: string) => {
      try {
        const success = await this.screenRecorder.startRecording(sourceId)
        return success
      } catch (error) {
        console.error('Error starting recording:', error)
        throw error
      }
    })

    // Stop recording
    ipcMain.handle('stop-recording', async () => {
      try {
        const filePath = await this.screenRecorder.stopRecording()
        return filePath
      } catch (error) {
        console.error('Error stopping recording:', error)
        throw error
      }
    })

    // Pause/Resume recording
    ipcMain.handle('pause-recording', async () => {
      return this.screenRecorder.pauseRecording()
    })

    ipcMain.handle('resume-recording', async () => {
      return this.screenRecorder.resumeRecording()
    })

    // Get recording status
    ipcMain.handle('get-recording-status', () => {
      return this.screenRecorder.getStatus()
    })

    // Show save dialog
    ipcMain.handle('show-save-dialog', async () => {
      if (!this.mainWindow) return null

      const { dialog } = require('electron')
      const result = await dialog.showSaveDialog(this.mainWindow, {
        defaultPath: 'screen-recording.mp4',
        filters: [
          { name: 'MP4 Files', extensions: ['mp4'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      return result.canceled ? null : result.filePath
    })

    ipcMain.handle('save-recording', async (_, filePath: string, data: Uint8Array) => {
      try {
        const fs = require('fs').promises
        await fs.writeFile(filePath, data)
      } catch (error) {
        console.error('Failed to save recording:', error)
        throw error
      }
    })

    ipcMain.handle('get-versions', () => {
      return {
        electron: process.versions.electron,
        node: process.versions.node,
        chrome: process.versions.chrome,
      }
    })
  }

  private createMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Recording',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu-new-recording')
            }
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit()
            }
          }
        ]
      },
      {
        label: 'Recording',
        submenu: [
          {
            label: 'Start Recording',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              this.mainWindow?.webContents.send('menu-start-recording')
            }
          },
          {
            label: 'Stop Recording',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.mainWindow?.webContents.send('menu-stop-recording')
            }
          },
          {
            label: 'Pause/Resume',
            accelerator: 'CmdOrCtrl+P',
            click: () => {
              this.mainWindow?.webContents.send('menu-toggle-pause')
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ]

    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      })

      // Window menu
      ;(template[4].submenu as Electron.MenuItemConstructorOptions[]).push(
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      )
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
}

// Initialize the app
new Main()