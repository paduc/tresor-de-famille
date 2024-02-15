import { z } from 'zod'
import { EXIF } from './exif'

const refToFactor = { N: 1, W: -1, E: 1, S: -1 } as const
export function getGPSDecCoordsFromExif(exif: EXIF): { lat: number; long: number } | undefined {
  try {
    const {
      GPSLongitude, // [number, number, number]
      GPSLongitudeRef, // N W E S
      GPSLatitude,
      GPSLatitudeRef,
    } = z
      .object({
        GPSLongitude: z.tuple([z.number(), z.number(), z.number()]),
        GPSLongitudeRef: z.union([z.literal('N'), z.literal('W'), z.literal('E'), z.literal('S')]),
        GPSLatitude: z.tuple([z.number(), z.number(), z.number()]),
        GPSLatitudeRef: z.union([z.literal('N'), z.literal('W'), z.literal('E'), z.literal('S')]),
      })
      .parse(exif)

    const lat = (GPSLatitude[0] + GPSLatitude[1] / 60 + GPSLatitude[2] / 3600) * refToFactor[GPSLatitudeRef]
    const long = (GPSLongitude[0] + GPSLongitude[1] / 60 + GPSLongitude[2] / 3600) * refToFactor[GPSLongitudeRef]

    return { lat, long }
  } catch (error) {
    if (Object.keys(exif).some((key) => key.startsWith('GPS'))) {
      console.error(
        'getGPSDecCoordsFromExif received malformed GPS coords',
        JSON.stringify(
          Object.entries(exif)
            .filter(([key, value]) => key.startsWith('GPS'))
            .reduce((gpsValues, [key, value]) => ({ ...gpsValues, [key]: value }), {})
        )
      )
    }
    return undefined
  }
}
