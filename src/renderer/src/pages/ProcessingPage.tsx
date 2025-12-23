import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooth } from '../context/BoothContext'
import { uploadToS3 } from '../utils/s3Upload'

const ProcessingPage = (): React.JSX.Element => {
  const navigate = useNavigate()
  const { images, selectedFrame, setUploadUrl } = useBooth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    const processImage = async (): Promise<void> => {
      if (!canvasRef.current || images.length === 0) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Setup canvas size (example 4x6 inch at 300dpi -> 1200x1800)
      canvas.width = 1200
      canvas.height = 1800

      // Fill background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw images (simplified vertical layout)
      // In real implementation, load Frame Image first, then draw photos in specific coords
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = (): void => resolve(img)
          img.onerror = reject
          img.src = src
        })
      }

      try {
        const loadedImages = await Promise.all(images.map(loadImage))
        
        // Draw photos
        // Example: 3 photos vertically
        const photoHeight = 400
        const startY = 100
        loadedImages.forEach((img, idx) => {
            // Draw scaled image
            ctx.drawImage(img, 100, startY + (idx * (photoHeight + 50)), 1000, photoHeight)
        })

        // Draw Frame Overlay (mock)
        // const frameImg = await loadImage(selectedFramePath)
        // ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)
        
        ctx.strokeStyle = status // hack to use variable
        ctx.lineWidth = 20
        ctx.strokeRect(0, 0, canvas.width, canvas.height)
        ctx.font = '50px Arial'
        ctx.fillStyle = 'black'
        ctx.fillText(`Frame: ${selectedFrame}`, 50, 50)


        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (!blob) return

          // 1. Print
          setStatus('Printing...')
          const buffer = await blob.arrayBuffer()
          window.api.printImage(buffer)

          // 2. Upload
          setStatus('Uploading...')
          try {
            const url = await uploadToS3(blob)
            setUploadUrl(url)
            navigate('/result')
          } catch (e) {
            console.error(e)
            // allow proceed even if upload fails? or show error
            // setUploadUrl('mock-url') // fallback for dev
             setUploadUrl('https://via.placeholder.com/600x900?text=Upload+Failed')
             navigate('/result')
          }
        }, 'image/jpeg', 0.9)

      } catch (err) {
        console.error(err)
      }
    }

    processImage()
  }, [images, selectedFrame, navigate, setUploadUrl])

  return (
    <div className="page-container">
      <h1>{status}</h1>
      <div className="loader"></div>
      <canvas ref={canvasRef} style={{ display: 'none' }} /> 
      {/* Hidden canvas for processing */}
    </div>
  )
}

export default ProcessingPage
