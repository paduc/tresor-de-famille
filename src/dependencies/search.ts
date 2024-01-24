import algoliasearch from 'algoliasearch'
import { AppUserId } from '../domain/AppUserId'
import { ALGOLIA_SEARCHKEY } from './env'
import { FamilyId } from '../domain/FamilyId'
import { PersonId } from '../domain/PersonId'

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

export const makeSearchKey = (userId: AppUserId, familyIds: FamilyId[]) => {
  const filters = [`visible_by:family/${userId}`, ...familyIds.map((familyId) => `visible_by:family/${familyId}`)].join(' OR ')

  return searchClient.generateSecuredApiKey(ALGOLIA_SEARCHKEY, {
    filters,
  })
}

export async function addFamilyVisibilityToIndex({ personId, familyId }: { personId: PersonId; familyId: FamilyId }) {
  try {
    const obj = await personsIndex.getObject<{ visible_by: string[] }>(personId)
    if (obj && Array.isArray(obj.visible_by) && !obj.visible_by.includes(`family/${familyId}`)) {
      await personsIndex.partialUpdateObject({
        objectID: personId,
        visible_by: [...obj.visible_by, `family/${familyId}`],
      })
      return
    }

    await personsIndex.partialUpdateObject({
      objectID: personId,
      visible_by: [`family/${familyId}`],
    })
  } catch (error) {
    console.error('addFamilyVisibilityToIndex: Could not add family to visibly_by')
  }
}

export async function changePersonNameInIndex({ personId, name }: { personId: PersonId; name: string }) {
  try {
    await personsIndex.partialUpdateObject({
      objectID: personId,
      name,
    })
  } catch (error) {
    console.error('Could not change persons name in algolia index', error)
  }
}
