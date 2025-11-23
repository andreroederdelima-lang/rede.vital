import { drizzle } from "drizzle-orm/mysql2";
import { comissoesAssinaturas } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const comissoesIniciais = [
  {
    tipoAssinatura: "essencial_individual",
    nomeExibicao: "Essencial Individual",
    precoMensal: 12900, // R$ 129,00
    valorComissaoTotal: 5000, // R$ 50,00
    percentualIndicador: 70,
    percentualVendedor: 30,
    ativo: 1,
  },
  {
    tipoAssinatura: "essencial_familiar",
    nomeExibicao: "Essencial Familiar",
    precoMensal: 25900, // R$ 259,00
    valorComissaoTotal: 7000, // R$ 70,00
    percentualIndicador: 70,
    percentualVendedor: 30,
    ativo: 1,
  },
  {
    tipoAssinatura: "premium_individual",
    nomeExibicao: "Premium Individual",
    precoMensal: 15990, // R$ 159,90
    valorComissaoTotal: 6000, // R$ 60,00
    percentualIndicador: 70,
    percentualVendedor: 30,
    ativo: 1,
  },
  {
    tipoAssinatura: "premium_familiar",
    nomeExibicao: "Premium Familiar",
    precoMensal: 28990, // R$ 289,90
    valorComissaoTotal: 8000, // R$ 80,00
    percentualIndicador: 70,
    percentualVendedor: 30,
    ativo: 1,
  },
  {
    tipoAssinatura: "empresarial_individual",
    nomeExibicao: "Empresarial Individual",
    precoMensal: 9990, // R$ 99,90
    valorComissaoTotal: 4000, // R$ 40,00 (mesmo valor Essencial Individual)
    percentualIndicador: 70,
    percentualVendedor: 30,
    ativo: 1,
  },
  {
    tipoAssinatura: "empresarial_familiar",
    nomeExibicao: "Empresarial Familiar",
    precoMensal: 25900, // R$ 259,00 (mesmo valor Essencial Familiar)
    valorComissaoTotal: 7000, // R$ 70,00 (mesmo valor Essencial Familiar)
    percentualIndicador: 70,
    percentualVendedor: 30,
    ativo: 1,
  },
];

async function seed() {
  console.log("🌱 Iniciando seed de comissões de assinaturas...");

  for (const comissao of comissoesIniciais) {
    try {
      await db.insert(comissoesAssinaturas).values(comissao).onDuplicateKeyUpdate({
        set: {
          nomeExibicao: comissao.nomeExibicao,
          precoMensal: comissao.precoMensal,
          valorComissaoTotal: comissao.valorComissaoTotal,
          percentualIndicador: comissao.percentualIndicador,
          percentualVendedor: comissao.percentualVendedor,
        },
      });
      console.log(`✅ ${comissao.nomeExibicao} - R$ ${(comissao.valorComissaoTotal / 100).toFixed(2)} (${comissao.percentualIndicador}% indicador / ${comissao.percentualVendedor}% vendedor)`);
    } catch (error) {
      console.error(`❌ Erro ao inserir ${comissao.nomeExibicao}:`, error);
    }
  }

  console.log("✅ Seed concluído!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Erro fatal no seed:", error);
  process.exit(1);
});
