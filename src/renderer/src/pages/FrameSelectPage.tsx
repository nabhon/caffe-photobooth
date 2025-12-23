import { useRef, useState, useEffect } from 'react'
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollToId = (id: string, behavior: ScrollBehavior = 'smooth'): void => {
    const container = scrollContainerRef.current
    if (!container) return
    
    // Find the element with that key (we might need a data attribute or refs map, but finding by child index is easier if we track index)
    // Let's rely on index since FRAMES is constant order.
    const index = FRAMES.findIndex(f => f.id === id)
    if (index === -1) return

    const child = container.children[index] as HTMLElement
    if (!child) return

    // Center logic: scrollLeft = childCenter - containerWidth/2
    const childCenter = child.offsetLeft + child.offsetWidth / 2
    const containerCenter = container.clientWidth / 2
    
    container.scrollTo({
      left: childCenter - containerCenter,
      behavior
    })
  }

  // Sync Active Index with Scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = (): void => {
      const containerCenter = container.scrollLeft + container.clientWidth / 2
      let closestIndex = 0
      let minDistance = Number.MAX_VALUE

      Array.from(container.children).forEach((child, index) => {
        const item = child as HTMLElement
        const itemCenter = item.offsetLeft + item.clientWidth / 2
        const distance = Math.abs(containerCenter - itemCenter)
        if (distance < minDistance) {
          minDistance = distance
          closestIndex = index
        }
      })
      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex)
      }
    }

    container.addEventListener('scroll', handleScroll)
    // Initial centering if needed? Maybe start at index 0
    // We can run once to set initial active index
    handleScroll()
    
    return (): void => container.removeEventListener('scroll', handleScroll)
  }, [activeIndex]) // Check dep

  const handleClickFrame = (frameId: string): void => {
      scrollToId(frameId)
  }

  const confirmSelection = (): void => {
      if (FRAMES[activeIndex]) {
          setSelectedFrame(FRAMES[activeIndex].id)
          navigate('/processing')
      }
  }



  // Calculate scaling factor from 600px real width to 300px display width
  const scale = 300 / 600
  
  // Layout Constants (Original 600x1800)
  // Photos: 5:4 ratio -> 500x400
  const PHOTO_WIDTH = 500 * scale
  const PHOTO_HEIGHT = 400 * scale
  const MARGIN_TOP = 50 * scale
  const GAP = 50 * scale
  const LEFT_OFFSET = 50 * scale

  return (
    <div className="page-container" style={{ background: '#f8fafc' }}>
      <h1 className="selection-title">Select Your Frame</h1>
      
      <div className="carousel-wrapper">
        <div className="carousel-container" ref={scrollContainerRef}>
          {FRAMES.map((frame, index) => (
            <div 
                key={frame.id} 
                className={`carousel-slide ${index === activeIndex ? 'active' : ''}`}
                onClick={() => handleClickFrame(frame.id)}
            >
               <div className="frame-preview">
                  {/* Background Layers (Photos) */}
                  {images.map((imgSrc, idx) => {
                      // Calculate position for each photo in the strip
                      const top = MARGIN_TOP + (idx * (PHOTO_HEIGHT + GAP))
                      
                      return (
                          <img 
                            key={idx}
                            src={imgSrc} 
                            className="preview-photo"
                            style={{
                                width: `${PHOTO_WIDTH}px`,
                                height: `${PHOTO_HEIGHT}px`,
                                top: `${top}px`,
                                left: `${LEFT_OFFSET}px`
                            }}
                            alt={`preview-${idx}`}
                          />
                      )
                  })}

                  {/* Frame Overlay */}
                  <div className="preview-overlay">
                      <img 
                        src={frame.src} 
                        alt={frame.name} 
                        style={{ width: '100%', height: '100%' }} 
                      />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <button className="select-btn" onClick={confirmSelection}>
        SELECT THIS FRAME
      </button>
    </div>
  )
}

export default FrameSelectPage
