import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ENV } from './_core/env';

type Mode = 's3' | 'forge';

type S3Config = {
  client: S3Client;
  bucket: string;
  publicBase: string | null;
};

type ForgeConfig = {
  baseUrl: string;
  apiKey: string;
};

let _mode: Mode | null = null;
let _s3: S3Config | null = null;
let _forge: ForgeConfig | null = null;

function detectMode(): Mode {
  if (_mode) return _mode;

  const hasS3 =
    !!ENV.awsAccessKeyId &&
    !!ENV.awsSecretAccessKey &&
    !!ENV.awsRegion &&
    !!ENV.s3Bucket;

  const hasForge = !!ENV.forgeApiUrl && !!ENV.forgeApiKey;

  if (hasS3) {
    _mode = 's3';
  } else if (hasForge) {
    _mode = 'forge';
    console.log('[Storage] Modo: Forge (Manus). S3 não configurado, usando proxy Forge.');
  } else {
    throw new Error(
      'Storage não configurado: defina AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION + S3_BUCKET, ' +
      'OU BUILT_IN_FORGE_API_URL + BUILT_IN_FORGE_API_KEY (Manus).'
    );
  }
  return _mode;
}

function getS3(): S3Config {
  if (_s3) return _s3;
  const client = new S3Client({
    region: ENV.awsRegion,
    credentials: {
      accessKeyId: ENV.awsAccessKeyId,
      secretAccessKey: ENV.awsSecretAccessKey,
    },
    ...(ENV.s3Endpoint ? { endpoint: ENV.s3Endpoint, forcePathStyle: true } : {}),
  });
  _s3 = {
    client,
    bucket: ENV.s3Bucket,
    publicBase: ENV.s3PublicUrlBase?.replace(/\/+$/, '') || null,
  };
  return _s3;
}

function getForge(): ForgeConfig {
  if (_forge) return _forge;
  _forge = {
    baseUrl: ENV.forgeApiUrl.replace(/\/+$/, ''),
    apiKey: ENV.forgeApiKey,
  };
  return _forge;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, '');
}

function buildS3PublicUrl(bucket: string, region: string, key: string, publicBase: string | null): string {
  if (publicBase) return `${publicBase}/${key}`;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === 'string'
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append('file', blob, fileName || 'file');
  return form;
}

async function s3Put(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const { client, bucket, publicBase } = getS3();
  const key = normalizeKey(relKey);
  const body =
    typeof data === 'string' ? Buffer.from(data) : Buffer.isBuffer(data) ? data : Buffer.from(data);

  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
  );

  return {
    key,
    url: buildS3PublicUrl(bucket, ENV.awsRegion, key, publicBase),
  };
}

async function s3GetSigned(relKey: string): Promise<{ key: string; url: string }> {
  const { client, bucket } = getS3();
  const key = normalizeKey(relKey);
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 }
  );
  return { key, url };
}

async function forgePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getForge();
  const key = normalizeKey(relKey);
  const uploadUrl = new URL('v1/storage/upload', ensureTrailingSlash(baseUrl));
  uploadUrl.searchParams.set('path', key);

  const formData = toFormData(data, contentType, key.split('/').pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: buildAuthHeaders(apiKey),
    body: formData as any,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Forge upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const json = (await response.json()) as { url: string };
  return { key, url: json.url };
}

async function forgeGetSigned(relKey: string): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getForge();
  const key = normalizeKey(relKey);
  const downloadApiUrl = new URL('v1/storage/downloadUrl', ensureTrailingSlash(baseUrl));
  downloadApiUrl.searchParams.set('path', key);
  const response = await fetch(downloadApiUrl, {
    method: 'GET',
    headers: buildAuthHeaders(apiKey),
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Forge download URL failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const json = (await response.json()) as { url: string };
  return { key, url: json.url };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  const mode = detectMode();
  return mode === 's3' ? s3Put(relKey, data, contentType) : forgePut(relKey, data, contentType);
}

/**
 * Retorna URL de GET válida por 1h.
 * Em modo S3: signed URL.
 * Em modo Forge: URL retornada pela própria API.
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const mode = detectMode();
  return mode === 's3' ? s3GetSigned(relKey) : forgeGetSigned(relKey);
}
