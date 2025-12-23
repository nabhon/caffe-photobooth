import { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { useNavigate } from 'react-router-dom'
import { useBooth } from '../context/BoothContext'

const CapturePage = (): React.JSX.Element => {
  const webcamRef = useRef<Webcam>(null)
  const navigate = useNavigate()
  const { setImages } = useBooth()
  const [captures, setCaptures] = useState<string[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)

  const capture = useCallback(() => {
    const video = webcamRef.current?.video
    if (!video) return

    // Create a canvas to crop the image
    const canvas = document.createElement('canvas')
    
    // Calculate crop dimensions for 5:4 aspect ratio
    const videoAspectRatio = video.videoWidth / video.videoHeight
    const targetAspectRatio = 5 / 4
    
    let renderWidth, renderHeight, startX, startY

    if (videoAspectRatio > targetAspectRatio) {
      // Video is wider than target (e.g., 16:9 vs 5:4) -> Fit Height, Crop Width
      renderHeight = video.videoHeight
      renderWidth = video.videoHeight * targetAspectRatio
      startX = (video.videoWidth - renderWidth) / 2
      startY = 0
    } else {
      // Video is taller or equal -> Fit Width, Crop Height (unlikely for webcam landscape, but good for safety)
      renderWidth = video.videoWidth
      renderHeight = video.videoWidth / targetAspectRatio
      startX = 0
      startY = (video.videoHeight - renderHeight) / 2
    }

    canvas.width = renderWidth
    canvas.height = renderHeight

    const ctx = canvas.getContext('2d')
    if (ctx) {
        ctx.drawImage(video, startX, startY, renderWidth, renderHeight, 0, 0, renderWidth, renderHeight)
        const imageSrc = canvas.toDataURL('image/jpeg')
        
        setFlash(true)
        setTimeout(() => setFlash(false), 200)
        setCaptures((prev) => [...prev, imageSrc])
    }
  }, [webcamRef])

  const [isDelaying, setIsDelaying] = useState(true)

  useEffect(() => {
     // Initial buffer on mount
     const timer = setTimeout(() => setIsDelaying(false), 2000)
     return () => clearTimeout(timer)
  }, [])

  // ... (capture function remains same)

  useEffect(() => {
    // 1. Check for completion
    if (captures.length >= 3) {
      setImages(captures)
      navigate('/frame-select')
    }
  }, [captures, navigate, setImages])

  useEffect(() => {
    // 2. Start Countdown if idle
    if (countdown === null && !isDelaying && captures.length < 3) {
        setCountdown(3)
    }
  }, [countdown, isDelaying, captures.length])

  useEffect(() => {
    // 3. Ticking Logic
    if (countdown === null) return

    let timer: NodeJS.Timeout

    if (countdown > 0) {
        timer = setTimeout(() => {
            setCountdown((prev) => (prev !== null ? prev - 1 : null))
        }, 1000)
    } else if (countdown === 0) {
        // Trigger capture
        capture()
        setCountdown(null)
        setIsDelaying(true)
        setTimeout(() => setIsDelaying(false), 2000)
    }

    return () => clearTimeout(timer)
  }, [countdown, capture])

  return (
    <div className="page-container capture-page">
      {flash && <div className="flash-overlay" />}
      <div className="webcam-container">
        <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={1280}
            height={720}
            videoConstraints={{ width: 1280, height: 720, facingMode: 'user' }}
            className="webcam-feed"
        />
      </div>
      {countdown !== null && countdown > 0 && (
        <div className="countdown-overlay">{countdown}</div>
      )}
    </div>
  )
}

export default CapturePage
