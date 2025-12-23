import { createContext, useContext, useState, ReactNode } from 'react'

interface BoothContextType {
  images: string[]
  setImages: (images: string[]) => void
  selectedFrame: string | null
  setSelectedFrame: (frame: string | null) => void
  uploadUrl: string | null
  setUploadUrl: (url: string | null) => void
  resetBooth: () => void
}

const BoothContext = createContext<BoothContextType | undefined>(undefined)

export const BoothProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [images, setImages] = useState<string[]>([])
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)

  const resetBooth = (): void => {
    setImages([])
    setSelectedFrame(null)
    setUploadUrl(null)
  }

  return (
    <BoothContext.Provider
      value={{
        images,
        setImages,
        selectedFrame,
        setSelectedFrame,
        uploadUrl,
        setUploadUrl,
        resetBooth
      }}
    >
      {children}
    </BoothContext.Provider>
  )
}

export const useBooth = (): BoothContextType => {
  const context = useContext(BoothContext)
  if (!context) throw new Error('useBooth must be used within a BoothProvider')
  return context
}
