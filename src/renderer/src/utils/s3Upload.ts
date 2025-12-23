import { v4 as uuidv4 } from 'uuid'

// S3 Upload logic moved to Main process to avoid CSP issues

// @ts-ignore - types are in preload/index.d.ts
export const uploadToS3 = async (base64Image: string): Promise<string> => {
   return window.api.uploadImage(base64Image)
}

export const createScanSession = async (photoKeys: string[]): Promise<string> => {
  // MOCK: In the future, this calls the backend to create a session record
  console.log('Creating session for keys:', photoKeys)
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const sessionId = uuidv4()
  console.log('Session Created:', sessionId)
  return sessionId
}
