import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

// NOTE: Ideally these should be in environment variables
const S3_BUCKET = import.meta.env.VITE_AWS_BUCKET_NAME || 'your-bucket-name'
const REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1'

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ''
  }
})

export const uploadToS3 = async (blob: Blob): Promise<string> => {
  const fileName = `${uuidv4()}.jpg`
  const file = new File([blob], fileName, { type: 'image/jpeg' })

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileName,
    Body: file,
    ContentType: 'image/jpeg'
  })

  try {
    await s3Client.send(command)
    return fileName
  } catch (error) {
    console.error('S3 Upload Error:', error)
    throw error
  }
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
