export function CDN(url: string) {
  // @ts-ignore
  const BUNNY_CDN_URL = typeof window === 'undefined' ? process.env.BUNNY_CDN_URL : window.__BUNNY_CDN_URL__

  if (!BUNNY_CDN_URL) {
    return url
  }

  return `${BUNNY_CDN_URL}${url}`
}
