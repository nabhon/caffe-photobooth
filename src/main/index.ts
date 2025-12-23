import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
import os from 'os'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'


function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    fullscreen: true, // Kiosk mode
    frame: false,     // Remove window chrome/bars
    kiosk: true,      // Lock down OS gestures
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.caffe.photobooth')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('print-image', (_event, imageBuffer) => {
    const tempPath = join(os.tmpdir(), `print-${Date.now()}.png`)
    fs.writeFileSync(tempPath, Buffer.from(imageBuffer))

    const printWindow = new BrowserWindow({ show: false })
    printWindow.loadFile(tempPath)
    printWindow.webContents.on('did-finish-load', () => {
        printWindow.webContents.print({ 
            silent: true,
            deviceName: undefined, // uses default printer
            pageSize: { width: 101600, height: 152400 }, // 4x6 inches in microns
            margins: { marginType: 'none' }
        }, (success, errorType) => {
            if (!success) console.log(errorType)
            printWindow.close()
            try {
              fs.unlinkSync(tempPath)
            } catch (e) {
              console.error('Failed to cleanup temp print file:', e)
            }
        })
    })
  })

  // S3 Client Setup
  const s3Client = new S3Client({
    region: import.meta.env.VITE_AWS_REGION || 'auto',
    endpoint: import.meta.env.VITE_AWS_ENDPOINT || undefined,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ''
    }
  })

  ipcMain.handle('upload-image', async (_event, base64Image: string) => {
    try {
      // Remove header if present (e.g. "data:image/jpeg;base64,")
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const fileName = `${uuidv4()}.jpg`

      const command = new PutObjectCommand({
        Bucket: import.meta.env.VITE_AWS_BUCKET_NAME || 'your-bucket-name',
        Key: fileName,
        Body: buffer,
        ContentType: 'image/jpeg'
      })

      await s3Client.send(command)
      return fileName
    } catch (error) {
      console.error('S3 Upload Error:', error)
      throw error
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
