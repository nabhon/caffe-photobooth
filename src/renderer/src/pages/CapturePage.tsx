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
    const size = Math.min(video.videoWidth, video.videoHeight)
    canvas.width = size
    canvas.height = size
    
    // Calculate crop coordinates (center crop)
    const x = (video.videoWidth - size) / 2
    const y = (video.videoHeight - size) / 2

    const ctx = canvas.getContext('2d')
    if (ctx) {
        ctx.drawImage(video, x, y, size, size, 0, 0, size, size)
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
        <div className="mask-overlay"></div>
      </div>
      {countdown !== null && countdown > 0 && (
        <div className="countdown-overlay">{countdown}</div>
      )}
      <div className="capture-status">
        {captures.length} / 3 Photos
      </div>
    </div>
  )
}

export default CapturePage
