import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const PaymentPage = (): React.JSX.Element => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.key === 'p' || e.key === 'P') {
        navigate('/capture')
      }
    }
    window.addEventListener('keypress', handleKeyPress)
    return (): void => window.removeEventListener('keypress', handleKeyPress)
  }, [navigate])

  return (
    <div className="page-container">
      <h1>Please Pay $5.00</h1>
      <p>Insert coins or press 'P' to simulate payment</p>
      <button onClick={() => navigate('/capture')}>Simulate Payment</button>
    </div>
  )
}

export default PaymentPage
