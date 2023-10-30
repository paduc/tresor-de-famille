import React, { useRef } from 'react'
import { useLoader } from './layout/LoaderContext'

type InlinePhotoUploadBtnProps = {
  children: React.ReactNode
  hiddenFields?: Record<string, string>
  formAction?: string
  formKey?: string
}

export const InlinePhotoUploadBtn = ({ children, hiddenFields, formAction, formKey }: InlinePhotoUploadBtnProps) => {
  const photoUploadForm = useRef<HTMLFormElement>(null)
  const setLoader = useLoader()

  const photoUploadFileSelected = (e: any) => {
    if (photoUploadForm.current !== null) {
      setLoader(true)
      setTimeout(() => {
        if (photoUploadForm.current !== null) {
          photoUploadForm.current.submit()
        }
      }, 200)
    }
  }
  return (
    <form ref={photoUploadForm} method='post' action={formAction} encType='multipart/form-data'>
      {hiddenFields
        ? Object.entries(hiddenFields).map(([key, value]) => (
            <input type='hidden' key={`hidden_${key}`} name={key} value={value} />
          ))
        : null}
      <input
        type='file'
        id={`file-input${formKey || ''}`}
        name='photo'
        className='hidden'
        accept='image/png, image/jpeg, image/jpg'
        onChange={photoUploadFileSelected}
      />
      <label htmlFor={`file-input${formKey || ''}`}>{children}</label>
    </form>
  )
}
