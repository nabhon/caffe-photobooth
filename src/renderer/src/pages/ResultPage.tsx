import { useNavigate } from 'react-router-dom'
import { useBooth } from '../context/BoothContext'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'

const ResultPage = (): React.JSX.Element => {
  const navigate = useNavigate()
  const { uploadUrl, resetBooth } = useBooth()
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
            clearInterval(timer)
            navigate('/')
            return 0
        }
        return c - 1
      })
    }, 1000)
    return (): void => clearInterval(timer)
  }, [navigate])

  const handleDone = (): void => {
      resetBooth()
      navigate('/')
  }

  return (
    <div className="page-container">
      <h1>Your Photo is Ready!</h1>
      <div className="result-content">
        <div className="qr-section">
            <p>Scan to Download</p>
            {uploadUrl ? (
                <QRCodeSVG value={uploadUrl} size={256} />
            ) : (
                <p>Upload Failed / Offline</p>
            )}
        </div>
      </div>
      <p>Redirecting in {countdown}s</p>
      <button onClick={handleDone}>Done</button>
    </div>
  )
}

export default ResultPage
