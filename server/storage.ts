import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ENV } from './_core/env';

type S3Config = {
  client: S3Client;
  bucket: string;
  publicBase: string | null;
};

let _s3: S3Config | null = null;

function getS3(): S3Config {
  if (_s3) return _s3;

  const {
    awsAccessKeyId,
    awsSecretAccessKey,
    awsRegion,
    s3Bucket,
    s3Endpoint,
    s3PublicUrlBase,
  } = ENV;

  if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion || !s3Bucket) {
    throw new Error(
      'Storage configuration missing: set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET.'
    );
  }

  const client = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    },
    ...(s3Endpoint ? { endpoint: s3Endpoint, forcePathStyle: true } : {}),
  });

  _s3 = {
    client,
    bucket: s3Bucket,
    publicBase: s3PublicUrlBase?.replace(/\/+$/, '') ?? null,
  };
  return _s3;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, '');
}

function buildPublicUrl(bucket: string, region: string, key: string, publicBase: string | null): string {
  if (publicBase) {
    return `${publicBase}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  const { client, bucket, publicBase } = getS3();
  const key = normalizeKey(relKey);

  const body =
    typeof data === 'string' ? Buffer.from(data) : Buffer.isBuffer(data) ? data : Buffer.from(data);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: buildPublicUrl(bucket, ENV.awsRegion!, key, publicBase),
  };
}

/**
 * Retorna uma URL assinada de GET válida por 1 hora.
 * Use para objetos privados — para objetos públicos, a URL do storagePut já serve.
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const { client, bucket } = getS3();
  const key = normalizeKey(relKey);

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 }
  );

  return { key, url };
}
