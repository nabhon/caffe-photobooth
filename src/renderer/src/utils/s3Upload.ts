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
    ContentType: 'image/jpeg',
    ACL: 'public-read' // Ensure bucket policy allows this or use presigned URLs
  })

  try {
    await s3Client.send(command)
    // Construct public URL (this assumes public access)
    return `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${fileName}`
  } catch (error) {
    console.error('S3 Upload Error:', error)
    throw error
  }
}
