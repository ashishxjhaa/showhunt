import 'dotenv/config'
import {
  GetPublicAccessBlockCommand,
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
  PutPublicAccessBlockCommand,
  S3Client,
} from '@aws-sdk/client-s3'

const bucket = process.env.S3_BUCKET_NAME
const region = process.env.AWS_REGION ?? 'ap-south-1'

if (!bucket) {
  console.error('S3_BUCKET_NAME is not set')
  process.exit(1)
}

const s3 = new S3Client({ region })

const frontendOrigins = [
  'http://localhost:3000',
  'https://showhunt.ashishjha.xyz',
]

await s3.send(
  new PutPublicAccessBlockCommand({
    Bucket: bucket,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: false,
      IgnorePublicAcls: false,
      BlockPublicPolicy: false,
      RestrictPublicBuckets: false,
    },
  }),
)
console.log('public access block disabled')

await s3.send(
  new PutBucketPolicyCommand({
    Bucket: bucket,
    Policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucket}/*`,
        },
      ],
    }),
  }),
)
console.log('bucket policy applied (public read)')

await s3.send(
  new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: frontendOrigins,
          AllowedMethods: ['PUT', 'GET', 'HEAD'],
          AllowedHeaders: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  }),
)
console.log('CORS rules applied')

const block = await s3.send(
  new GetPublicAccessBlockCommand({ Bucket: bucket }),
)
console.log('verify:', JSON.stringify(block.PublicAccessBlockConfiguration))
