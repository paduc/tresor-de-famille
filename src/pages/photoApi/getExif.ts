import fs from 'node:fs'
import path from 'node:path'

import { findEXIFinJPEG, findEXIFinHEIC, EXIF } from '../../libs/exif.js'

export function getExif(file: Express.Multer.File): EXIF | undefined {
  const exifRaw = getExifRaw(file)

  if (!exifRaw) return

  // Remove the "undefined" key value
  // @ts-ignore
  const { undefined, ...exif } = exifRaw

  return exif
}

function getExifRaw(file: Express.Multer.File): EXIF | undefined {
  try {
    const { path: originalPath, originalname } = file
    const extension = path.extname(originalname).trim().toLowerCase()

    if (extension === '.jpg' || extension === '.jpeg') {
      const buffer = fs.readFileSync(originalPath).buffer

      return findEXIFinJPEG(buffer)
    } else if (extension === '.heic') {
      const buffer = fs.readFileSync(originalPath).buffer
      return findEXIFinHEIC(buffer)
    }
  } catch (error) {
    console.error('getExif error', error)
    throw new Error('getExif failed')
  }
}
