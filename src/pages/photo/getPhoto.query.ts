import { postgres } from '../../dependencies/database'
import { normalizeBBOX } from '../../dependencies/face-recognition'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { getPhotoUrlFromId } from '../../dependencies/photo-storage'
import { UUID } from '../../domain'
import { getPersonById, getPersonByIdOrThrow } from '../_getPersonById'
import { getPersonIdsForFaceId } from '../_getPersonsIdsForFaceId'
import { OnboardingUserUploadedPhotoOfThemself } from '../bienvenue/step1-userTellsAboutThemselves/OnboardingUserUploadedPhotoOfThemself'
import { OnboardingUserConfirmedHisFace } from '../bienvenue/step2-userUploadsPhoto/OnboardingUserConfirmedHisFace'
import { OnboardingUserUploadedPhotoOfFamily } from '../bienvenue/step2-userUploadsPhoto/OnboardingUserUploadedPhotoOfFamily'
import { OnboardingUserNamedPersonInFamilyPhoto } from '../bienvenue/step3-learnAboutUsersFamily/OnboardingUserNamedPersonInFamilyPhoto'
import { UserUploadedPhotoToChat } from '../chat/uploadPhotoToChat/UserUploadedPhotoToChat'
import { PhotoFace, PhotoPageProps } from './PhotoPage/PhotoPage'
import { UserAddedCaptionToPhoto } from './UserAddedCaptionToPhoto'
import { PhotoManuallyAnnotated } from './annotateManually/PhotoManuallyAnnotated'
import { PhotoAnnotatedUsingOpenAI } from './annotatePhotoUsingOpenAI/PhotoAnnotatedUsingOpenAI'
import { PhotoAnnotationConfirmed } from './confirmPhotoAnnotation/PhotoAnnotationConfirmed'
import { AWSDetectedFacesInPhoto } from './recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto'

export const getPhoto = async (photoId: UUID): Promise<PhotoPageProps> => {
  const photo = await getSingleEvent<
    UserUploadedPhotoToChat | OnboardingUserUploadedPhotoOfFamily | OnboardingUserUploadedPhotoOfThemself
  >(['OnboardingUserUploadedPhotoOfFamily', 'OnboardingUserUploadedPhotoOfThemself', 'UserUploadedPhotoToChat'], { photoId })

  if (!photo) throw new Error('Unkown photo')

  const caption = await getCaptionForPhoto(photoId)

  const annotationEvents = await getAnnotationEvents(photoId)

  const personsByFaceId = await makePersonsByFacedId(annotationEvents)
  const personById = await makePersonById(annotationEvents)

  const { persons: confirmedPersons, deductions: confirmedDeductions } = await getConfirmedPersons(photoId)

  return {
    photoId,
    url: getPhotoUrlFromId(photoId),
    caption,
    personsByFaceId,
    personById,
    annotationEvents,
    confirmedPersons,
    confirmedDeductions,
  }
}

async function makePersonById(
  annotationEvents: (UserAddedCaptionToPhoto | AWSDetectedFacesInPhoto | PhotoAnnotatedUsingOpenAI)[]
) {
  const personById: PhotoPageProps['personById'] = {}
  const personIds = annotationEvents
    .filter((event): event is PhotoAnnotatedUsingOpenAI => event.type === 'PhotoAnnotatedUsingOpenAI')
    .flatMap((event) => event.payload.deductions.map((d) => d.personId))

  for (const personId of personIds) {
    const person = await getPersonByIdOrThrow(personId)
    personById[personId] = {
      name: person.name,
    }
  }

  return personById
}

async function makePersonsByFacedId(
  annotationEvents: (UserAddedCaptionToPhoto | PhotoAnnotatedUsingOpenAI | AWSDetectedFacesInPhoto)[]
) {
  const personsByFaceId: PhotoPageProps['personsByFaceId'] = {}
  const recognizedFaces = annotationEvents
    .filter((event): event is AWSDetectedFacesInPhoto => event.type === 'AWSDetectedFacesInPhoto')
    .flatMap((event) => event.payload.faces)

  for (const face of recognizedFaces) {
    const personIds = await getPersonIdsForFaceId(face.faceId)

    for (const personId of personIds) {
      const person = await getPersonByIdOrThrow(personId)
      personsByFaceId[face.faceId] = [
        ...(personsByFaceId[face.faceId] || []),
        {
          personId,
          name: person.name,
        },
      ]
    }
  }
  return personsByFaceId
}

async function getFaceDetections(photoId: UUID) {
  const { rows: faceDetectedRowsRes } = await postgres.query<AWSDetectedFacesInPhoto>(
    "SELECT * FROM history WHERE type='AWSDetectedFacesInPhoto' AND payload->>'photoId'=$1",
    [photoId]
  )

  return faceDetectedRowsRes.map(({ payload, occurredAt }) => ({
    occurredAt: occurredAt.getTime(),
    faces: payload.faces.map((awsFace) => ({
      faceId: awsFace.faceId,
      position: normalizeBBOX(awsFace.position),
      person: null as null | { name: string },
    })),
  }))
}

async function getCaptionForPhoto(photoId: UUID) {
  const { rows } = await postgres.query<UserAddedCaptionToPhoto>(
    `SELECT * FROM history WHERE type='UserAddedCaptionToPhoto' AND payload->>'photoId'=$1 ORDER BY "occurredAt" DESC LIMIT 1`,
    [photoId]
  )

  return rows[0]?.payload.caption.body
}

const getAnnotationEvents = async (photoId: UUID) => {
  const { rows } = await postgres.query<AWSDetectedFacesInPhoto | UserAddedCaptionToPhoto | PhotoAnnotatedUsingOpenAI>(
    "SELECT * FROM history WHERE type IN ('AWSDetectedFacesInPhoto', 'UserAddedCaptionToPhoto','PhotoAnnotatedUsingOpenAI') AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" ASC",
    [photoId]
  )
  return rows
}

const getConfirmedPersons = async (photoId: UUID): Promise<{ persons: PhotoFace[]; deductions: UUID[] }> => {
  const { rows } = await postgres.query<PhotoAnnotationConfirmed | PhotoManuallyAnnotated>(
    "SELECT * FROM history WHERE type IN ('PhotoAnnotationConfirmed','PhotoManuallyAnnotated') AND payload->>'photoId'=$1 ORDER BY \"occurredAt\" ASC",
    [photoId]
  )

  const persons: PhotoFace[] = []
  const deductions: UUID[] = []

  for (const row of rows) {
    const { personId, faceId, position } = row.payload

    const person = await getPersonById(personId)
    persons.push({
      person: { id: personId, name: person?.name || 'N/A' },
      faceId,
      position,
    })

    if (row.type === 'PhotoAnnotationConfirmed' && row.payload.deductionId) {
      deductions.push(row.payload.deductionId)
    }
  }
  return { persons, deductions }
}
