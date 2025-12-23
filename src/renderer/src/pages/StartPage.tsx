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
    <div className="page-container" onClick={() => navigate('/pay')} style={{ fontSize: '400%' }}>
      <h1>คลิกเพื่อเริ่มต้น</h1>
    </div>
  )
}

export default StartPage
