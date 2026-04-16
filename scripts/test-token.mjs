import { drizzle } from "drizzle-orm/mysql2";
import { tokens } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Criar token de teste
const token = "teste-validacao-" + Date.now();
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

await db.insert(tokens).values({
  token: token,
  tipoCredenciado: "medico",
  credenciadoId: null,
  email: "teste@validacao.com",
  telefone: "47999999999",
  usado: false,
  expiresAt: expiresAt,
});

console.log("Token gerado:", token);
console.log("URL:", `https://3000-inmon7vwx54vq89x0j2qe-20ad4cec.manusvm.computer/cadastro-medico/${token}`);
