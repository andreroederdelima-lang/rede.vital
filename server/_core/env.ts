export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
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
