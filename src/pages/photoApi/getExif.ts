import fs from 'node:fs'
import { findEXIFinJPEG, findEXIFinHEIC, EXIF } from '../../libs/exif'

export function getExif(file: Express.Multer.File): EXIF | undefined {
  const { path, originalname } = file

  let exif: EXIF | undefined = undefined
  if (originalname.endsWith('.jpg') || originalname.endsWith('.jpeg')) {
    const buffer = fs.readFileSync(path).buffer

    exif = findEXIFinJPEG(buffer)
  } else if (originalname.endsWith('.heic')) {
    const buffer = fs.readFileSync(path).buffer
    exif = findEXIFinHEIC(buffer)
  }

  if (exif) {
    try {
      return JSON.parse(JSON.stringify(exif).replace(/\0/g, ''))
    } catch (error) {
      console.error('Something failed getting EXIF from file', error)
    }
  }
}
