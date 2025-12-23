import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { BoothProvider } from './context/BoothContext'
import StartPage from './pages/StartPage'
import PaymentPage from './pages/PaymentPage'
import CapturePage from './pages/CapturePage'
import FrameSelectPage from './pages/FrameSelectPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultPage from './pages/ResultPage'
import './assets/main.css' // Ensure styles

const App = (): React.JSX.Element => {
  return (
    <BoothProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/pay" element={<PaymentPage />} />
          <Route path="/capture" element={<CapturePage />} />
          <Route path="/frame-select" element={<FrameSelectPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </Router>
    </BoothProvider>
  )
}

export default App
