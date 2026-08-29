import 'dotenv/config'
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3'

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'ap-south-1' })
const b = process.env.S3_BUCKET_NAME!

const list = await s3.send(new ListObjectsV2Command({ Bucket: b }))
const objects = (list.Contents ?? [])
  .map((o) => o.Key!)
  .filter(Boolean)
  .map((Key) => ({ Key }))

console.log('objects:', objects)
if (objects.length) {
  await s3.send(new DeleteObjectsCommand({ Bucket: b, Delete: { Objects: objects } }))
  console.log('deleted', objects.length, 'test objects')
} else {
  console.log('bucket already empty')
}

