import algoliasearch from 'algoliasearch'

const ALGOLIA_APPID = process.env.ALGOLIA_APPID
const ALGOLIA_APPKEY = process.env.ALGOLIA_APPKEY
if (!ALGOLIA_APPID || !ALGOLIA_APPKEY) {
  console.error('Missing algola appId and/or appKey')
  process.exit(1)
}

export const searchClient = algoliasearch(ALGOLIA_APPID, ALGOLIA_APPKEY)

export const personsIndex = searchClient.initIndex('persons')

personsIndex.setSettings({
  attributesForFaceting: ['filterOnly(visible_by)'],
  unretrievableAttributes: ['visible_by'],
})
