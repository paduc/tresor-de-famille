export type MediaStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 404

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

export const ReadyOrErrorStatus: MediaStatus[] = [4, 5, 6, 404] as const
