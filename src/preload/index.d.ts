import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      printImage: (buffer: ArrayBuffer) => void
      uploadImage: (base64: string) => Promise<string>
    }
  }
}
