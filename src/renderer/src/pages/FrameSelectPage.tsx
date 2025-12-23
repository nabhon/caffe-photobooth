import { useNavigate } from 'react-router-dom'
import { useBooth } from '../context/BoothContext'
// Dynamically load frames
const frameModules = import.meta.glob('../assets/frames/frame_*.png', { eager: true })

const FRAMES = Object.entries(frameModules).map(([path, module]) => {
  const match = path.match(/frame_(\w+)\.png$/)
  const id = match ? match[1] : 'unknown'
  // @ts-ignore - casting module to any
  const src = (module as any).default
  
  return {
    id,
    name: `Frame ${id}`, // Generates "Frame 1", "Frame 2", etc.
    src
  }
}).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))

const FrameSelectPage = (): React.JSX.Element => {
  const navigate = useNavigate()
  const { setSelectedFrame, images } = useBooth()

  const handleSelect = (frameId: string): void => {
    setSelectedFrame(frameId)
    navigate('/processing')
  }

  return (
    <div className="page-container">
      <h1>Select a Frame</h1>
      <div className="frames-grid">
        {FRAMES.map((frame) => (
          <div key={frame.id} className="frame-option" onClick={() => handleSelect(frame.id)}>
             {/* Show a preview of the frame. 
                 Ideally this would be a thumbnail, but resizing the big PNG works for now. */}
             <div style={{width: '200px', height: '600px', position: 'relative', border: '1px solid #ddd'}}>
                <img src={frame.src} alt={frame.name} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                <span style={{
                    position:'absolute', 
                    bottom:'10px', 
                    left:'50%', 
                    transform:'translate(-50%)',
                    background: 'rgba(255,255,255,0.7)',
                    padding: '2px 5px',
                    borderRadius: '4px'
                }}>{frame.name}</span>
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
