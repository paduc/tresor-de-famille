export function CDN(url: string) {
  const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL

  if (!BUNNY_CDN_URL) {
    return url
  }

  return `${BUNNY_CDN_URL}${url}`
}
