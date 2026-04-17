import { drizzle } from "drizzle-orm/mysql2";
import { solicitacoesParceria } from "./drizzle/schema.ts";
import { desc } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

const solicitacoes = await db
  .select()
  .from(solicitacoesParceria)
  .orderBy(desc(solicitacoesParceria.createdAt))
  .limit(5);

console.log("Últimas 5 solicitações:");
solicitacoes.forEach((s, i) => {
  console.log(`\n${i + 1}. ${s.nomeEstabelecimento} (${s.tipoCredenciado})`);
  console.log(`   Status: ${s.status}`);
  console.log(`   Foto URL: ${s.fotoUrl || 'VAZIO'}`);
  console.log(`   Logo URL: ${s.logoUrl || 'VAZIO'}`);
  console.log(`   Criado em: ${s.createdAt}`);
});
