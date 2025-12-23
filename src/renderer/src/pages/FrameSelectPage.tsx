import { useNavigate } from 'react-router-dom'
import { useBooth } from '../context/BoothContext'

// Placeholder frames. ideally these are import from assets
const FRAMES = [
  { id: '1', name: 'Classic', color: 'red' },
  { id: '2', name: 'Fun', color: 'blue' },
  { id: '3', name: 'Elegant', color: 'gold' }
]

const FrameSelectPage = (): React.JSX.Element => {
  const navigate = useNavigate()
  const { setSelectedFrame, images } = useBooth()

  const handleSelect = (frameId: string): void => {
    setSelectedFrame(frameId) // In real app, this might be a path to PNG
    navigate('/processing')
  }

  return (
    <div className="page-container">
      <h1>Select a Frame</h1>
      <div className="frames-grid">
        {FRAMES.map((frame) => (
          <div key={frame.id} className="frame-option" onClick={() => handleSelect(frame.id)}>
             <div style={{border: `10px solid ${frame.color}`, width: '100%', height: '200px', position: 'relative'}}>
                <span style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)'}}>{frame.name}</span>
             </div>
          </div>
        ))}
      </div>
       <div className="preview-thumbnails">
          {images.map((img, idx) => (
              <img key={idx} src={img} alt={`capture ${idx}`} style={{width: 100, height: 100, objectFit: 'cover'}}/>
          ))}
       </div>
    </div>
  )
}

export default FrameSelectPage
