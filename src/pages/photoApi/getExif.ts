import fs from 'node:fs'
import { findEXIFinJPEG, findEXIFinHEIC, EXIF } from '../../libs/exif'

export function getExif(file: Express.Multer.File): EXIF | undefined {
  const { path, originalname } = file

  if (originalname.endsWith('.jpg') || originalname.endsWith('.jpeg')) {
    const buffer = fs.readFileSync(path).buffer
    return findEXIFinJPEG(buffer)
  } else if (originalname.endsWith('.heic')) {
    const buffer = fs.readFileSync(path).buffer
    return findEXIFinHEIC(buffer)
  }
}
