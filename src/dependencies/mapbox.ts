// @ts-ignore
import createNodeClient from '@mapbox/mapbox-sdk/lib/node/node-client'
// @ts-ignore
import Geocoding from '@mapbox/mapbox-sdk/services/geocoding'

const { MAPBOX_TOKEN } = process.env
if (!MAPBOX_TOKEN) {
  console.error('Missing mapbox token')
  process.exit(1)
}

const mapboxClient = createNodeClient({ accessToken: MAPBOX_TOKEN })

export const geocodeService = Geocoding(mapboxClient)
