import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { AppUserId } from '../../domain/AppUserId'
import { UserNamedThemself } from '../../events/onboarding/UserNamedThemself'
import { getThreadListPageProps } from '../threadList/getThreadListPageProps'
import { GetUserName, HomePageProps } from './HomePage'

export const getHomePageProps = async (userId: AppUserId): Promise<HomePageProps> => {
  const step1 = await getGetUserName(userId)

  const isOnboarding = step1['get-user-name'] !== 'done'

  if (isOnboarding) {
    return { isOnboarding, steps: { ...step1 } }
  }

  const { threads } = await getThreadListPageProps(userId)
  const latestThreads = threads.sort((a, b) => b.lastUpdatedOn - a.lastUpdatedOn).slice(0, 3)

  return {
    isOnboarding,
    latestThreads,
  }
}

async function getGetUserName(userId: AppUserId): Promise<GetUserName> {
  const userNamedThemself = await getSingleEvent<UserNamedThemself>('UserNamedThemself', { userId })

  if (userNamedThemself) {
    const { name, personId } = userNamedThemself.payload
    return {
      'get-user-name': 'done',
      name,
      personId,
    }
  }
  return { 'get-user-name': 'pending' }
}
