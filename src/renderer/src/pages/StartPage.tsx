import { useNavigate } from 'react-router-dom'
import { useBooth } from '../context/BoothContext'
import { useEffect } from 'react'

const StartPage = (): React.JSX.Element => {
  const navigate = useNavigate()
  const { resetBooth } = useBooth()

  useEffect(() => {
    resetBooth()
  }, [])

  return (
    <div className="page-container" onClick={() => navigate('/pay')}>
      <h1>Touch/Click to Start</h1>
      <p>Welcome to the Photo Booth</p>
    </div>
  )
}

export default StartPage
