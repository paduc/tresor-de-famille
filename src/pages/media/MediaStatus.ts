import { z } from 'zod'

const MediaStatusValues = [0, 1, 2, 3, 4, 5, 6, 404] as const
export type MediaStatus = typeof MediaStatusValues[number]

export const MediaStatus: Record<MediaStatus, string> = {
  0: 'Created',
  1: 'Uploaded',
  2: 'Processing',
  3: 'Transcoding',
  4: 'Finished',
  5: 'Error',
  6: 'UploadFailed',
  404: 'NotFound',
} as const

export const zMediaStatus = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(404),
])

export const ReadyOrErrorStatus: MediaStatus[] = [4, 5, 6, 404] as const
