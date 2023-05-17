import React, { useRef } from 'react'

type InlinePhotoUploadProps = {
  children: React.ReactNode
  chatId?: string
}

export const InlinePhotoUpload = ({ children, chatId }: InlinePhotoUploadProps) => {
  const photoUploadForm = useRef<HTMLFormElement>(null)

  const photoUploadFileSelected = (e: any) => {
    if (photoUploadForm.current !== null) photoUploadForm.current.submit()
  }

  return (
    <form ref={photoUploadForm} method='post' action='/add-photo.html' encType='multipart/form-data'>
      {chatId ? <input type='hidden' id='chatId' name='chatId' value={chatId} /> : null}
      <input
        type='file'
        id={`file-input${chatId || ''}`}
        name='photo'
        className='hidden'
        accept='image/png, image/jpeg, image/jpg'
        onChange={photoUploadFileSelected}
      />
      <label htmlFor={`file-input${chatId || ''}`}>{children}</label>
    </form>
  )
}
