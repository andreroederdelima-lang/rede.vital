import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const copysIniciais: schema.InsertCopy[] = [
  // Planos
  {
    titulo: "Plano Premium",
    categoria: "planos",
    ordem: 1,
    conteudo: `*PLANO PREMIUM* 

✅ Proteção 24h no Hospital Censit Tenha acesso garantido ao ambulatório 24 horas, do Hospital Censit, sempre que precisar. São 12 atendimentos médicos *GRATUITOS* por ano, e atendimentos adicionais com valor promocional de assinante (*os primeiros 4 atendimentos após o termino do benefício, saem por apenas R$ 99,00, os demais 149,00*). Idade de atendimento: apartir dos 10 anos.

 ✅️️ Atendimento de ambulância, serviço disponível 24 hrs, com Unidade de Suporte Básico - Unidade VITAL. Atendimento realizado com regulação médica, no conforto do seu lar, ou onde você estiver (válido para os municípios com abrangência do serviço - Ascurra, Apiúna*, Timbó, Pomerode, Rio dos Cedros, Indaial e Benedito Novo), administração de medicamentos em casa, conforme indicação médica, e envio de receitas, pedidos de exames e/ou atestados médicos por SMS, enviados posteriormente ao atendimento. * 

✅ Clube de Descontos Vital / Filoó Acesso a uma variedade de descontos em diversas categorias. Cuide da sua saúde e aproveite vantagens em beleza, academias, gastronomia, cuidados com pets e muito mais. Rede em constante crescimento. 

✅ Descontos em consultas com médicos especialistas. Rede de médicos credenciados, cobertura nacional. Rede em constante crescimento. 

✅ Descontos de até 80% em medicamentos em farmácias credenciadas. Cobertura nacional. Rede em constante crescimento.

 ✅ Consultas GRATUITAS ONLINE, com PEDIATRA E CLÍNICO GERAL, SEM AGENDAMENTO. Uso ilimitado, em qualquer lugar do Brasil. 

✅ Descontos em CONSULTAS ONLINE, com médicos especialistas (necessita agendamento). 

✅ Descontos exclusivos para assinantes, em vacinas diversas 

✅️️ Descontos exclusivo para assinantes, em exames de imagem em clínicas credenciadas. (Ressonância, Tomografia, raio-x, Ultra-som, entre outros) 

✅ Pacote de seguros completo *para o titular*, contemplando: - Assistência funerária - Seguro de vida - ⁠Invalidez por acidente - ⁠Assistência residencial: Conta com cobertura de serviços de encanador, eletricista, chaveiro, pintor, pedreiro, entre outros. - ⁠Sorteios mensais 

✅️️ Descontos exclusivos para assinantes, em transportes agendados de ambulância (UTI MÓVEL OU UNIDADE BÁSICA), como altas hospitalares, ou remoções. 

✅️️ Descontos exclusivos para assinantes, em transportes diversos, com VEÍCULO ADAPTADO PARA CADEIRANTES. 

✅️️ Descontos exclusivos para assinantes, no serviço de ACOMPANHAMENTO DE IDOSOS ou pacientes com necessidades especiais, para realização de exames entre outros procedimentos.

 ✅️️ Descontos exclusivo para assinantes, em procedimentos de enfermagem em domicílio, tais como: - trocas de sonda, curativos simples e especiais, acompanhamento de pacientes acamados, administração de medicamentos em domicílio entre outros cuidados em domicílio.

 ✅️️ Tabela diferenciada para procedimentos cirúrgicos em hospital parceiro 

✅ Atendimento 24h – Saúde Mental: Os pacientes podem ligar a qualquer momento, de forma ilimitada, para esse telefone e receber apoio emocional e psicológico sempre que precisarem — seja em momentos de crise, ansiedade, estresse, depressão ou apenas para ter um bate-papo acolhedor com um profissional. 

✅️️ Bolsas de ensino e benefícios exclusivos em cursos de graduação e pós-graduação – online`,
  },
  {
    titulo: "Assinatura Essencial",
    categoria: "planos",
    ordem: 2,
    conteudo: `Assinatura Essencial

• ✅ Hospital Censit 24h: 8 consultas médicas gratuitas por ano + atendimentos adicionais com valor reduzido. Idade mínima: 10 anos.
• ✅ Ambulância VITAL 24h: Atendimento com unidade de suporte Básico e regulação médica no conforto do seu lar ou onde estiver. Abrangência: Timbó, Pomerode, Indaial, Rio dos Cedros, Benedito Novo, Ascurra e Apiúna. Inclui administração de medicamentos, receitas, pedidos de exames e atestados por SMS. Sem limite de idade.
• ✅ Clube de Descontos Vital + Filoo: Economize em itens de beleza, mundo pet, lojas, academias e muito mais. São mais de 450 empresas em diversas áreas oferecendo descontos.
• ✅ Descontos em consultas com especialistas: Cobertura nacional, rede em expansão constante.
• ✅ Medicamentos com até 80% de desconto: Válido em farmácias credenciadas em todo o Brasil. Rede em expansão constante.
• ✅ Descontos exclusivos em vacinas.
• ✅ Descontos exclusivos em exames de imagem: Como Ressonância, tomografia, raio-x, ultrassom entre outros.
• ✅ Pacote de seguros completo (titular): Inclui assistência funerária, seguro de vida, invalidez por acidente, assistência residencial (encanador, eletricista, chaveiro, pedreiro, etc.).
• ✅ Sorteios mensais.
• ✅ Descontos em transportes de ambulância (UTI móvel ou básica): Para altas hospitalares, remoções e exames.
• ✅ Descontos em transportes adaptados: Veículos para cadeirantes e pacientes com mobilidade reduzida.
• ✅ Descontos exclusivos no Acompanhamento de idosos e pacientes especiais: Para exames e procedimentos com segurança.
• ✅ Descontos exclusivos em cuidados em saúde domiciliar / home-care:
Serviços de enfermagem domiciliar, troca de sonda, curativos, administração de medicamentos, pacotes de cuidados multidisciplinares (fisioterapia, fonoaudiologia, enfermagem, visitas médicas etc.) 
• ✅ Bolsas de estudo exclusivas: Benefícios em cursos de graduação e pós-graduação online.
• ❌ Tabela diferenciada para cirurgias: Condições especiais em hospital parceiro.
• ❌ Consultas online gratuitas ILIMITADAS: Com Clínico e pediatra 24h, sem agendamento.
• ❌ Descontos em consultas online com mais de 40 especialidades: Sob agendamento.`,
  },
  {
    titulo: "Assinatura Essencial Empresarial",
    categoria: "planos",
    ordem: 3,
    conteudo: `Assinatura Essencial Empresarial

• ✅ Hospital Censit 24h: 6 consultas médicas gratuitas por ano + atendimentos adicionais com valor reduzido. Idade mínima: 10 anos.
• ✅ Ambulância VITAL 24h: Atendimento com unidade de suporte Básico e regulação médica. Abrangência: Timbó, Pomerode, Indaial, Rio dos Cedros, Benedito Novo, Ascurra e Apiúna. Inclui administração de medicamentos, receitas, pedidos de exames e atestados por SMS. Sem limite de idade.
• ✅ Clube de Descontos Vital + Filoo: Economize em itens de beleza, mundo pet, lojas, academias e muito mais. São mais de 450 empresas em diversas áreas oferecendo descontos.
• ✅ Descontos em consultas com especialistas: Cobertura nacional, rede em expansão constante.
• ✅ Medicamentos com até 80% de desconto: Válido em farmácias credenciadas em todo o Brasil. Rede em expansão constante.
• ✅ Descontos exclusivos em vacinas.
• ✅ Descontos exclusivos em exames de imagem: Como Ressonância, tomografia, raio-x, ultrassom entre outros.
• ✅ Pacote de seguros completo (titular): Inclui assistência funerária, seguro de vida, invalidez por acidente, assistência residencial (encanador, eletricista, chaveiro, pedreiro, etc.).
• ✅ Sorteios mensais.
• ✅ Descontos em transportes de ambulância (UTI móvel ou básica): Para altas hospitalares, remoções e exames.
• ✅ Descontos em transportes adaptados: Veículos para cadeirantes e pacientes com mobilidade reduzida.
• ✅ Descontos exclusivos no Acompanhamento de idosos e pacientes especiais: Para exames e procedimentos com segurança.
• ✅ Descontos exclusivos em cuidados em saúde domiciliar / home-care:
Serviços de enfermagem domiciliar, troca de sonda, curativos, administração de medicamentos, pacotes de cuidados multidisciplinares (fisioterapia, fonoaudiologia, enfermagem, visitas médicas etc.). 
• ❌ Saúde Mental 24h: Apoio psicológico e emocional ilimitado, a qualquer hora por telefone.
• ❌ Tabela diferenciada para cirurgias: Condições especiais em hospital parceiro.
• ❌ Consultas online gratuitas ILIMITADAS: Com Clínico e pediatra 24h, sem agendamento.
• ❌ Descontos em consultas online com mais de 40 especialidades: Sob agendamento.`,
  },
  {
    titulo: "Assinatura Premium Empresarial",
    categoria: "planos",
    ordem: 4,
    conteudo: `Assinatura Premium Empresarial

• ✅ Hospital Censit 24h: 12 consultas médicas gratuitas por ano + atendimentos adicionais com valor reduzido. Idade mínima: 10 anos.
• ✅ Ambulância VITAL 24h: Atendimento com unidade de suporte Básico e regulação médica. Abrangência: Timbó, Pomerode, Indaial, Rio dos Cedros, Benedito Novo, Ascurra e Apiúna. Inclui administração de medicamentos, receitas, pedidos de exames e atestados por SMS. Sem limite de idade.
• ✅ Clube de Descontos Vital + Filoo: Economize em itens de beleza, mundo pet, lojas, academias e muito mais. São mais de 450 empresas em diversas áreas oferecendo descontos.
• ✅ Descontos em consultas com especialistas: Cobertura nacional, rede em expansão constante.
• ✅ Medicamentos com até 80% de desconto: Válido em farmácias credenciadas em todo o Brasil. Rede em expansão constante.
• ✅ Descontos exclusivos em vacinas.
• ✅ Saúde Mental 24h: Apoio psicológico e emocional ilimitado, a qualquer hora por telefone.
• ✅ Descontos exclusivos em exames de imagem: Como Ressonância, tomografia, raio-x, ultrassom entre outros.
• ✅ Pacote de seguros completo (titular): Inclui assistência funerária, seguro de vida, invalidez por acidente, assistência residencial (encanador, eletricista, chaveiro, pedreiro, etc.).
• ✅ Sorteios mensais.
• ✅ Descontos em transportes de ambulância (UTI móvel ou básica): Para altas hospitalares, remoções e exames.
• ✅ Descontos em transportes adaptados: Veículos para cadeirantes e pacientes com mobilidade reduzida.
• ✅ Descontos exclusivos no Acompanhamento de idosos e pacientes especiais: Para exames e procedimentos com segurança.
• ✅ Descontos exclusivos em cuidados em saúde domiciliar / home-care:
Serviços de enfermagem domiciliar, troca de sonda, curativos, administração de medicamentos, pacotes de cuidados multidisciplinares (fisioterapia, fonoaudiologia, enfermagem, visitas médicas etc.). 
• ✅ Tabela diferenciada para cirurgias: Condições especiais em hospital parceiro.
• ✅ Consultas online gratuitas ILIMITADAS: Com Clínico e pediatra 24h, sem agendamento.
• ✅ Descontos em consultas online com mais de 40 especialidades: Sob agendamento.
• ✅ Área Protegida para sua Empresa`,
  },
  
  // Promoções
  {
    titulo: "Promoção de Novembro - Versão 1",
    categoria: "promocoes",
    ordem: 1,
    conteudo: `💚 SUA SAÚDE VITAL – PROMOÇÃO DE NOVEMBRO

✅ Hospital Censit 24h — 8 ou 12 consultas/ano (essencial / premium)
✅ Ambulância Vital 24h com regulação médica
✅ Descontos em consultas, exames e farmácias
✅ 30 dias para cancelar sem custo, mesmo usando! Atendimento médico gratuito no Pronto Atendimento Censit (sem descontar dos atendimentos da assinatura) e Atendimento de ambuância básica no conforto do seu lar, gratuita, sem taxa de acionamento)  - até 31/12.
✅ Compra online – cartão ou PIX

💙 Essencial: R$ 129,90 individual | R$ 249,90 familiar
💎 Premium (com telemedicina): R$ 159,90 individual | R$ 289,90 familiar

📌 Plano familiar pode incluir amigos ou colegas, não precisa morar junto!

💬 Promo válida até o fim de novembro.
👉 Assine agora e teste com segurança total!`,
  },
  {
    titulo: "Promoção de Novembro - Versão 2",
    categoria: "promocoes",
    ordem: 2,
    conteudo: `🎁 PROMOÇÃO EXCLUSIVA – NOVEMBRO

Durante o mês de novembro, quem assinar tem benefícios únicos:
✨ 30 dias para usar consultas no Hospital Censit gratuitamente, sem descontar das consultas da sua assinatura.
✨ Sem custo de ambulância e sem cobrança de consultas até o final do ano.
✨ 30 dias para cancelar sem nenhum custo, mesmo após usar os serviços.

💡 Nosso objetivo é que o cliente teste o produto, sinta segurança e continue apenas se realmente gostar e tiver sucesso!`,
  },
];

async function seed() {
  console.log("Populando banco com copys iniciais...");
  
  for (const copy of copysIniciais) {
    await db.insert(schema.copys).values(copy);
    console.log(`✓ Copy criada: ${copy.titulo}`);
  }
  
  console.log("\n✅ Seed concluído com sucesso!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Erro ao popular banco:", error);
  process.exit(1);
});
