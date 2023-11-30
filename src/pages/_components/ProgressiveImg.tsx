import React, { useState, useEffect, DetailedHTMLProps, ImgHTMLAttributes, useRef } from 'react'
import { PhotoIcon } from '@heroicons/react/20/solid'

// Credits: https://www.jacobparis.com/content/image-placeholders
export const ProgressiveImg = ({
  src,
  placeholderSrc,
  onLoad,
  ...props
}: {
  onLoad?: () => void
  placeholderSrc?: string
  src: string
} & DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  // const [imgSrc, setImgSrc] = useState(placeholderSrc || src)

  // Store the onLoad prop in a ref to stop new Image() from re-running
  const onLoadRef = useRef(onLoad)
  useEffect(() => {
    onLoadRef.current = onLoad
  }, [onLoad])

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImgSrc(src)
      if (onLoadRef.current) {
        onLoadRef.current()
      }
    }
    img.src = src
  }, [src])

  if (imgSrc) {
    return <img src={imgSrc} {...props} />
  }

  return (
    <div
      className={`bg-gray-100 animate-pulse text-white px-10 py-8 h-64 w-64 flex items-center justify-center border border-gray-200 shadow-sm`}>
      <PhotoIcon className='h-32 w-32' />
    </div>
  )
}
