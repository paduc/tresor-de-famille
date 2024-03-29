import { postgres } from '../../dependencies/database.js'
import { getEventList } from '../../dependencies/getEventList.js'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage.js'
import { UserConfirmedHisFace } from '../../events/onboarding/UserConfirmedHisFace.js'
import { getPersonById } from '../_getPersonById.js'

import { PhotoFaceURL } from '../../actions/PhotoFaceURL.js'
import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { AppUserId } from '../../domain/AppUserId.js'
import { FaceId } from '../../domain/FaceId.js'
import { PersonId } from '../../domain/PersonId.js'
import { PhotoId } from '../../domain/PhotoId.js'
import { UserNamedPersonInPhoto } from '../../events/onboarding/UserNamedPersonInPhoto.js'
import { UserRecognizedPersonInPhoto } from '../../events/onboarding/UserRecognizedPersonInPhoto.js'
import { getProfilePicUrlForPerson } from '../_getProfilePicUrlForPerson.js'
import { isPhotoAccessibleToUser } from '../_isPhotoAccessibleToUser.js'
import { PhotoManuallyAnnotated } from '../photo/annotateManually/PhotoManuallyAnnotated.js'
import { UserDeletedPhoto } from '../photoApi/UserDeletedPhoto.js'
import { PersonPageProps } from './PersonPage.js'
import { getPersonForUser } from '../_getPersonForUser.js'
import { getThreadAuthor } from '../_getThreadAuthor.js'
import { isThreadSharedWithUser } from '../_isThreadSharedWithUser.js'
import { UserUpdatedThreadAsRichText } from '../thread/UserUpdatedThreadAsRichText.js'
import { ThreadId } from '../../domain/ThreadId.js'
import { UserSetChatTitle } from '../thread/UserSetChatTitle.js'
import { UserAddedCaptionToPhoto } from '../photo/UserAddedCaptionToPhoto.js'
import { ParagraphNode, PhotoNode } from '../thread/TipTapTypes.js'
import { ThreadSharedWithFamilies } from '../thread/ThreadPage/events/ThreadSharedWithFamilies.js'
import { ThumbnailURL } from '../photoApi/ThumbnailURL.js'
import { getThreadComments } from '../commentApi/getThreadComments.js'
import { getUsersForPersonId } from '../_getUsersForPersonId.js'

export const getPersonPageProps = async ({
  personId,
  userId,
}: {
  personId: PersonId
  userId: AppUserId
}): Promise<PersonPageProps> => {
  const { name } = (await getPersonById({ personId })) || { name: 'N/A' }
  const profilePicUrl = await getProfilePicUrlForPerson({ personId, userId })

  const { photos, alternateProfilePics } = await getPersonPhotos({ personId, userId })

  return {
    person: { personId, name, profilePicUrl, birthDate: undefined },
    photos,
    alternateProfilePics,
    threadsTheyAppearIn: await getThreadsPersonAppearsIn({ userId, photosOfPerson: photos.map((p) => p.photoId) }),
    threadsTheyWrote: await getThreadsThePersonWrote({ userId, personId }),
  }
}

async function getThreadsThePersonWrote({ userId, personId }: { userId: AppUserId; personId: PersonId }) {
  const usersForPerson = await getUsersForPersonId({ personId })

  const uniqueThreads = new Set<ThreadId>()
  for (const userId of usersForPerson) {
    const userThreads = await getEventList<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText', { userId })

    for (const userThread of userThreads) {
      uniqueThreads.add(userThread.payload.threadId)
    }
  }

  return getThreadsWithInfo({ threadIds: Array.from(uniqueThreads), userId })
}

async function getThreadsPersonAppearsIn({ userId, photosOfPerson }: { userId: AppUserId; photosOfPerson: PhotoId[] }) {
  // Get unique threads for each photo of person
  const uniqueThreads = new Set<ThreadId>()
  for (const photoId of photosOfPerson) {
    const { rows: threadEventsWithPhoto } = await postgres.query<UserUpdatedThreadAsRichText>(
      `SELECT * FROM history WHERE type='UserUpdatedThreadAsRichText' AND payload->>'contentAsJSON' LIKE $1 ORDER BY "occurredAt" DESC`,
      [`%${photoId}%`]
    )

    for (const event of threadEventsWithPhoto) {
      const { threadId } = event.payload

      // make sure it's the latest
      const latestEvent = await getSingleEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText', { threadId })

      if (latestEvent?.id !== event.id) {
        // ignore
        continue
      }

      if (uniqueThreads.has(threadId)) {
        continue
      }
      uniqueThreads.add(threadId)
    }
  }

  return getThreadsWithInfo({ threadIds: Array.from(uniqueThreads), userId })
}

async function getThreadsWithInfo({ threadIds, userId }: { threadIds: ThreadId[]; userId: AppUserId }) {
  // Filter the unique thread to keep only the ones accessible to user
  const userAccessibleThreads = new Set<ThreadId>()
  for (const threadId of threadIds) {
    if (await isThreadSharedWithUser({ threadId, userId })) {
      userAccessibleThreads.add(threadId)
    }
  }

  const threads = []
  for (const threadId of userAccessibleThreads) {
    threads.push({
      threadId,
      title: await getTitle({ threadId }),
      contents: await getContents({ threadId }),
      authors: await getAuthors({ threadId }),
      familyIds: await getThreadFamilies({ threadId }),
      thumbnails: await getThumbnails({ threadId }),
      commentCount: await getCommentCount({ threadId }),
      lastUpdatedOn: await getLastUpdatedOn({ threadId }),
    })
  }

  return threads
}

async function getLastUpdatedOn({ threadId }: { threadId: ThreadId }) {
  const latestUpdateEvent = await getSingleEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText', { threadId })

  let lastUpdatedOn = latestUpdateEvent!.occurredAt.getTime()

  const comments = await getThreadComments({ threadId })
  const latestComment = comments.at(-1)

  if (latestComment) {
    const latestCommentUpdatedOn = new Date(latestComment.dateTime).getTime()

    if (latestCommentUpdatedOn > lastUpdatedOn) {
      lastUpdatedOn = latestCommentUpdatedOn
    }
  }

  return lastUpdatedOn
}

async function getCommentCount({ threadId }: { threadId: ThreadId }) {
  const comments = await getThreadComments({ threadId })
  return comments.length
}

async function getThumbnails({ threadId }: { threadId: ThreadId }) {
  const latestUpdateEvent = await getSingleEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText', { threadId })

  if (!latestUpdateEvent) {
    return []
  }

  const nodes = latestUpdateEvent.payload.contentAsJSON.content

  const imageNodes = nodes.filter((node): node is PhotoNode => node.type === 'photoNode')

  return imageNodes.map((node) => node.attrs.photoId).map((photoId) => ThumbnailURL(photoId))
}

async function getThreadFamilies({ threadId }: { threadId: ThreadId }) {
  const shareWithFamiliesEvent = await getSingleEvent<ThreadSharedWithFamilies>('ThreadSharedWithFamilies', { threadId })

  if (shareWithFamiliesEvent) {
    return shareWithFamiliesEvent.payload.familyIds
  }

  return []
}

async function getAuthors({ threadId }: { threadId: ThreadId }) {
  const threadAuthorId = await getThreadAuthor(threadId)
  if (!threadAuthorId) {
    return []
  }

  const authorPerson = await getPersonForUser({ userId: threadAuthorId })
  if (authorPerson) {
    return [{ name: authorPerson.name }]
  }

  return []
}

async function getTitle({ threadId }: { threadId: ThreadId }) {
  const setTitleEvent = await getSingleEvent<UserSetChatTitle>('UserSetChatTitle', { threadId })

  if (setTitleEvent) {
    return setTitleEvent.payload.title
  }

  return ''
}

async function getContents({ threadId }: { threadId: ThreadId }) {
  const latestUpdateEvent = await getSingleEvent<UserUpdatedThreadAsRichText>('UserUpdatedThreadAsRichText', { threadId })

  if (!latestUpdateEvent) {
    return ''
  }

  const nodes = latestUpdateEvent.payload.contentAsJSON.content

  const textNodes = nodes.filter((node): node is ParagraphNode => node.type === 'paragraph' && !!node.content)

  if (textNodes.length) {
    const textNode = textNodes.find((node) => node.content?.length && node.content.some((c) => c.text.length))

    const text = textNode?.content?.length && textNode?.content.map((c) => c.text).join('')

    if (text) {
      return text
    }
  }

  const photoNodes = nodes.filter((node): node is PhotoNode => node.type === 'photoNode')

  if (photoNodes.length) {
    const { photoId } = photoNodes[0].attrs
    const latestCaption = await getSingleEvent<UserAddedCaptionToPhoto>('UserAddedCaptionToPhoto', { photoId })

    if (latestCaption) {
      return latestCaption.payload.caption.body
    }
  }

  return ''
}

async function getPersonPhotos({ personId, userId }: { personId: PersonId; userId: AppUserId }) {
  const photoIds = new Set<PhotoId>()
  const profilePhotoAndFace = new Map<PhotoId, Set<FaceId>>()

  function addProfilePhotoFace(photoId: PhotoId, faceId: FaceId) {
    if (!profilePhotoAndFace.has(photoId)) {
      profilePhotoAndFace.set(photoId, new Set())
    }
    profilePhotoAndFace.get(photoId)!.add(faceId)
  }

  // Get all the photos where the person has been tagged
  const personInPhotoEvents = await getEventList<
    PhotoManuallyAnnotated | UserRecognizedPersonInPhoto | UserNamedPersonInPhoto | UserConfirmedHisFace
  >(['PhotoManuallyAnnotated', 'UserRecognizedPersonInPhoto', 'UserNamedPersonInPhoto', 'UserConfirmedHisFace'], {
    personId,
  })

  for (const event of personInPhotoEvents) {
    // Check if it's the latest event for this faceId / personId
    const latest = await getSingleEvent<
      PhotoManuallyAnnotated | UserRecognizedPersonInPhoto | UserNamedPersonInPhoto | UserConfirmedHisFace
    >(['PhotoManuallyAnnotated', 'UserRecognizedPersonInPhoto', 'UserNamedPersonInPhoto', 'UserConfirmedHisFace'], {
      photoId: event.payload.photoId,
      faceId: event.payload.faceId,
    })

    if (latest!.id === event.id) {
      photoIds.add(event.payload.photoId)
      addProfilePhotoFace(event.payload.photoId, event.payload.faceId)
    }
  }

  // Get the photos where the link has been done automatically
  const personFaceIds = new Set(personInPhotoEvents.map((event) => event.payload.faceId))
  const { rows: photosWithFaces } = await postgres.query<{ photoId: PhotoId; faces: { faceId: FaceId }[] }>(
    "SELECT payload->>'photoId' AS \"photoId\", payload->'faces' AS faces from history where type='AWSDetectedFacesInPhoto' and EXISTS ( SELECT 1 FROM jsonb_array_elements(history.payload->'faces') AS face WHERE (face->>'faceId') = ANY ($1));",
    [Array.from(personFaceIds)]
  )
  for (const event of photosWithFaces) {
    photoIds.add(event.photoId)
    for (const { faceId } of event.faces) {
      if (personFaceIds.has(faceId)) {
        addProfilePhotoFace(event.photoId, faceId)
      }
    }
  }

  // Check if the photo has been deleted
  const undeletedPhotos = new Set<PhotoId>()
  for (const photoId of photoIds) {
    const isDeleted = await getSingleEvent<UserDeletedPhoto>('UserDeletedPhoto', { photoId })

    if (!isDeleted) {
      undeletedPhotos.add(photoId)
    } else {
      profilePhotoAndFace.delete(photoId)
    }
  }

  // Filter by user accessibility
  const photosAccessibleToUser = []
  for (const photoId of undeletedPhotos) {
    if (await isPhotoAccessibleToUser({ photoId, userId })) {
      photosAccessibleToUser.push({
        photoId,
        url: getPhotoUrlFromId(photoId),
      })
    } else {
      profilePhotoAndFace.delete(photoId)
    }
  }

  // Flatten alternative profile pics
  const alternateProfilePics = Array.from(profilePhotoAndFace).flatMap(([photoId, faceIdSet]) =>
    Array.from(faceIdSet).map((faceId) => ({ faceId, photoId, url: PhotoFaceURL({ photoId, faceId }) }))
  )

  return { photos: photosAccessibleToUser, alternateProfilePics }
}
