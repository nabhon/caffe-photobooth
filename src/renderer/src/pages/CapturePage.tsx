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
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setFlash(true)
      setTimeout(() => setFlash(false), 200)
      setCaptures((prev) => [...prev, imageSrc])
    }
  }, [webcamRef])

  useEffect(() => {
    if (captures.length >= 3) {
      setImages(captures)
      navigate('/frame-select')
      return
    }

    let timer: NodeJS.Timeout
    const startCountdown = (): void => {
      setCountdown(3) // Start 3s countdown
      let count = 3
      timer = setInterval(() => {
        count -= 1
        setCountdown(count)
        if (count === 0) {
          clearInterval(timer)
          capture()
          setCountdown(null)
          // Wait a bit before next countdown
          setTimeout(startCountdown, 2000) 
        }
      }, 1000)
    }

    // specific delay for first run?
    // For now simple recursion
    if (countdown === null && captures.length < 3) {
        startCountdown()
    }

    return (): void => clearInterval(timer)
  }, [captures, capture, navigate, setImages])

  return (
    <div className="page-container capture-page">
      {flash && <div className="flash-overlay" />}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={1280}
        height={720}
        videoConstraints={{ width: 1280, height: 720, facingMode: 'user' }}
        className="webcam-feed"
      />
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
