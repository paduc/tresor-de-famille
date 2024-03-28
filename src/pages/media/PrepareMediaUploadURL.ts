export const PrepareMediaUploadURL = (filename?: string) =>
  `/prepareMediaUpload${filename ? `?${new URLSearchParams({ filename }).toString()}` : ''}`
