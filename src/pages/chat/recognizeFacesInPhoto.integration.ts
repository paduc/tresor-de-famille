import aws from 'aws-sdk'
import fs from 'node:fs'
import path from 'node:path'
import { getUuid } from '../../libs/getUuid'
import { recognizeFacesInPhoto } from './recognizeFacesInPhoto'

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-1',
})

const testCollectionId = `test-${getUuid()}`
const testPhotosPath = path.join(__dirname, '__test__/photos')
const testPhotos = {
  targetAlone: path.join(testPhotosPath, 'Only_one_present.jpeg'),
  targetAlone2: path.join(testPhotosPath, 'Only_one_present_2.jpeg'),
  targetWithOthers: path.join(testPhotosPath, 'With_others.jpeg'),
  targetNotPresent: path.join(testPhotosPath, 'Not_present.jpeg'),
}

const rekognition = new aws.Rekognition()

const resetCollection = async () => {
  try {
    await rekognition.deleteCollection({ CollectionId: testCollectionId }).promise()
  } catch (error: any) {
    if ('ResourceNotFoundException' === error.code) {
      console.log('Ok to not delete collection, it doesnt exist yet.')
    } else {
      console.log('deleteCollection failed', error)
      throw error
    }
  }
  try {
    await rekognition
      .createCollection({
        CollectionId: testCollectionId,
      })
      .promise()
  } catch (error) {
    console.log('createCollection failed', error)
  }
}

const deleteCollection = async () => {
  try {
    await rekognition.deleteCollection({ CollectionId: testCollectionId }).promise()
  } catch (error) {
    console.log('deleteCollection failed', error)
    throw error
  }
}

describe('recognizedFacesInPhoto', () => {
  describe('when the face is not known', () => {
    let result: Awaited<ReturnType<typeof recognizeFacesInPhoto>>

    beforeAll(async () => {
      await resetCollection()

      const facesBefore = await rekognition.listFaces({ CollectionId: testCollectionId }).promise()
      expect(facesBefore.Faces).toHaveLength(0)

      result = await recognizeFacesInPhoto({
        photoContents: fs.readFileSync(testPhotos.targetAlone),
        collectionId: testCollectionId,
      })
    })

    it('return the AWS FaceId and details for the face', async () => {
      expect(result).toHaveLength(1)

      expect(result[0].AWSFaceId).toHaveLength(36)
      expect(result[0].position).toBeDefined()
      expect(result[0].confidence).toBeDefined()
    })

    it('should index the new face', async () => {
      const facesAfter = await rekognition.listFaces({ CollectionId: testCollectionId }).promise()
      expect(facesAfter.Faces).toHaveLength(1)
      expect(facesAfter.Faces![0].FaceId).toEqual(result[0].AWSFaceId)
    })
  })

  describe('when the only face is known', () => {
    let knownFaceId: string
    let result: Awaited<ReturnType<typeof recognizeFacesInPhoto>>

    beforeAll(async () => {
      await resetCollection()

      const firstIndexation = await rekognition
        .indexFaces({
          CollectionId: testCollectionId,
          DetectionAttributes: [],
          Image: {
            Bytes: fs.readFileSync(testPhotos.targetAlone2),
          },
        })
        .promise()

      expect(firstIndexation.FaceRecords).toHaveLength(1)
      knownFaceId = firstIndexation.FaceRecords![0].Face!.FaceId!

      const facesBefore = await rekognition.listFaces({ CollectionId: testCollectionId }).promise()
      expect(facesBefore.Faces).toHaveLength(1)

      result = await recognizeFacesInPhoto({
        photoContents: fs.readFileSync(testPhotos.targetAlone),
        collectionId: testCollectionId,
      })
    })

    it('return the known AWS FaceId and details for the face', async () => {
      expect(result).toHaveLength(1)

      expect(result[0].AWSFaceId).toHaveLength(36)
      expect(result[0].position).toBeDefined()
      expect(result[0].confidence).toBeDefined()
    })

    it('should not change the face index', async () => {
      const facesAfter = await rekognition.listFaces({ CollectionId: testCollectionId }).promise()
      expect(facesAfter.Faces).toHaveLength(1)
      expect(facesAfter.Faces![0].FaceId).toEqual(knownFaceId)
    })
  })

  describe('when one of the faces is known and not the others', () => {
    let knownFaceId: string
    let result: Awaited<ReturnType<typeof recognizeFacesInPhoto>>

    beforeAll(async () => {
      await resetCollection()

      const firstIndexation = await rekognition
        .indexFaces({
          CollectionId: testCollectionId,
          DetectionAttributes: [],
          Image: {
            Bytes: fs.readFileSync(testPhotos.targetAlone),
          },
        })
        .promise()

      expect(firstIndexation.FaceRecords).toHaveLength(1)
      knownFaceId = firstIndexation.FaceRecords![0].Face!.FaceId!

      const facesBefore = await rekognition.listFaces({ CollectionId: testCollectionId }).promise()
      expect(facesBefore.Faces).toHaveLength(1)

      result = await recognizeFacesInPhoto({
        photoContents: fs.readFileSync(testPhotos.targetWithOthers),
        collectionId: testCollectionId,
      })
    })

    it('return the known FaceId for the known face and new FaceIds for the others', async () => {
      expect(result).toHaveLength(6)

      const faceIds = result.map((record) => record.AWSFaceId)
      expect(faceIds).toContain(knownFaceId)
    })

    it('should only add the new faces to the index', async () => {
      const facesAfter = await rekognition.listFaces({ CollectionId: testCollectionId }).promise()
      const faceIdsAfter = facesAfter.Faces!.map((face) => face.FaceId!)
      expect(faceIdsAfter).toContain(knownFaceId)
      expect(faceIdsAfter).toHaveLength(6)
    })
  })

  afterAll(async () => {
    await deleteCollection()
  })
})
