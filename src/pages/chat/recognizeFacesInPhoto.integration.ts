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
    it('should return the AWS FaceId and details for the face', async () => {
      await resetCollection()
      const result = await recognizeFacesInPhoto({
        photoContents: fs.readFileSync(testPhotos.targetAlone),
        collectionId: testCollectionId,
      })
      expect(result).toHaveLength(1)

      expect(result[0].AWSFaceId).toHaveLength(36)
      expect(result[0].position).toBeDefined()
      expect(result[0].confidence).toBeDefined()

      await deleteCollection()
    })
  })
})
