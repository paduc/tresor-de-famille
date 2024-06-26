import { AppUserId } from '../../domain/AppUserId.js'
import { getPersonForUser } from '../_getPersonForUser.js'
import { getThreadListPageProps } from '../threadList/getThreadListPageProps.js'
import { GetUserName, HomePageProps } from './HomePage.js'

const displayCount = 3
export const getHomePageProps = async (userId: AppUserId): Promise<HomePageProps> => {
  const step1 = await getGetUserName(userId)

  const isOnboarding = step1['get-user-name'] !== 'done'

  if (isOnboarding) {
    return { isOnboarding, steps: { ...step1 } }
  }

  const { threads } = await getThreadListPageProps(userId)
  const latestThreads = threads.sort((a, b) => b.lastUpdatedOn - a.lastUpdatedOn).slice(0, displayCount)

  return {
    isOnboarding,
    latestThreads,
    hasMoreThreads: threads.length > displayCount,
  }
}

async function getGetUserName(userId: AppUserId): Promise<GetUserName> {
  const personForUser = await getPersonForUser({ userId })
  if (personForUser) {
    const { name, personId } = personForUser
    return {
      'get-user-name': 'done',
      name,
      personId,
    }
  }

  return { 'get-user-name': 'pending' }
}
