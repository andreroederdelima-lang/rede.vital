export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Manus Forge (legacy) — ainda usado por notification, voiceTranscription, imageGeneration.
  // Storage e email principais migraram pra S3 / SMTP diretos abaixo.
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // S3 direct (substitui Forge storage)
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsRegion: process.env.AWS_REGION ?? "",
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3Endpoint: process.env.S3_ENDPOINT ?? "", // opcional: Cloudflare R2, MinIO, etc.
  s3PublicUrlBase: process.env.S3_PUBLIC_URL_BASE ?? "", // opcional: CDN custom

  // SMTP direct (substitui Forge email)
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "587", 10),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "",
  smtpSecure: process.env.SMTP_SECURE === "true", // default false (STARTTLS em 587)
};

// Validação de variáveis obrigatórias na inicialização
if (!ENV.cookieSecret) {
  throw new Error(
    "FATAL: JWT_SECRET não definido. " +
    "Defina a variável de ambiente JWT_SECRET com uma string aleatória segura."
  );
}
if (!ENV.databaseUrl) {
  console.warn("[ENV] DATABASE_URL não definido — banco de dados indisponível.");
}
