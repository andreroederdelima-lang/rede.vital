import { drizzle } from "drizzle-orm/mysql2";
import { medicos } from "./drizzle/schema.ts";
import { isNotNull } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);
const result = await db.select().from(medicos).where(isNotNull(medicos.tokenAtualizacao)).limit(1);

if (result.length > 0) {
  console.log(`Token: ${result[0].tokenAtualizacao}`);
  console.log(`URL: https://3000-inmon7vwx54vq89x0j2qe-20ad4cec.manusvm.computer/atualizar-dados/${result[0].tokenAtualizacao}`);
} else {
  console.log("Nenhum token encontrado");
}
