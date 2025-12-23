import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooth } from '../context/BoothContext'
import { uploadToS3 } from '../utils/s3Upload'

// Import frame assets dynamically
const frameModules = import.meta.glob('../assets/frames/frame_*.png', { eager: true })

const FRAME_ASSETS: Record<string, string> = {}

// Parse the modules to build the map
Object.entries(frameModules).forEach(([path, module]) => {
  // Extract ID from filename: ../assets/frames/frame_1.png -> 1
  const match = path.match(/frame_(\w+)\.png$/)
  if (match) {
    const id = match[1]
    // Vite eager import of assets usually returns module with default export as the string URL
    // @ts-ignore - casting module to any to access default
    FRAME_ASSETS[id] = (module as any).default
  }
})

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

      // Setup canvas size (2x6 inch at 300dpi -> 600x1800)
      canvas.width = 600
      canvas.height = 1800

      // Fill background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

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
        
        // 5:4 Aspect Ratio Layout
        // Photos: 5:4 ratio -> Width 500, Height 400
        // Canvas Width: 600
        // X Offset (centered): (600 - 500) / 2 = 50
        // Top Margin: 50 (to match x-offset)
        // Gap: 50 (to match x-offset)
        
        const photoWidth = 500
        const photoHeight = 400
        const xOffset = 50
        const marginTop = 50
        const gap = 50

        // Draw Photos First (underneath the frame overlay)
        loadedImages.forEach((img, idx) => {
            const y = marginTop + (idx * (photoHeight + gap))
            
            // Draw image cropped/fitted to 500x400
            // source image is likely webcam 4:3 (e.g. 640x480) or similar.
            // We want to cover 500x400.
            
            const srcRatio = img.width / img.height
            const targetRatio = photoWidth / photoHeight // 1.25
            
            let sx, sy, sWidth, sHeight
            
            if (srcRatio > targetRatio) {
                // Source is wider, crop width
                sHeight = img.height
                sWidth = img.height * targetRatio
                sx = (img.width - sWidth) / 2
                sy = 0
            } else {
                // Source is taller, crop height
                sWidth = img.width
                sHeight = img.width / targetRatio
                sx = 0
                sy = (img.height - sHeight) / 2
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, xOffset, y, photoWidth, photoHeight)
        })

        // Draw Frame Overlay
        if (selectedFrame && FRAME_ASSETS[selectedFrame]) {
            try {
                const frameImg = await loadImage(FRAME_ASSETS[selectedFrame])
                ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)
            } catch (e) {
                console.warn('Failed to load frame asset', e)
                // If frame fails, maybe draw a fallback border?
                ctx.strokeStyle = '#000'
                ctx.lineWidth = 20
                ctx.strokeRect(0,0, canvas.width, canvas.height)
            }
        } else {
             // Fallback if no frame selected or found
             // Just keeping the photos visible
        }    

        // Footer Text (Optional, if not part of the PNG frame)
        // If the frame PNG includes the footer design, we might simply overlay text like date 
        // IF the designs requires it. For now, we'll assume the frame handles semantics or we add minimal date at bottom if space permits.
        // The last photo ends at: 50 + 3*(400+50) - 50 = 50 + 1350 = 1400.
        // Canvas height is 1800. We have 400px of footer space.
        
        ctx.fillStyle = 'black'
        ctx.font = '24px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(new Date().toLocaleDateString(), 300, 1750)


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
             setUploadUrl('https://via.placeholder.com/600x900?text=Upload+Failed')
             navigate('/result')
          }
        }, 'image/jpeg', 0.9)

      } catch (err) {
        console.error(err)
        setStatus('Error processing')
      }
    }

    processImage()
  }, [images, selectedFrame, navigate, setUploadUrl])

  return (
    <div className="page-container">
      <h1>{status}</h1>
      <div className="loader"></div>
      <canvas ref={canvasRef} style={{ display: 'none' }} /> 
    </div>
  )
}

export default ProcessingPage

