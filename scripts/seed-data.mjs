import { drizzle } from "drizzle-orm/mysql2";
import { medicos, instituicoes } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const medicosData = [
  {
    nome: "Dr. Roberto Schulz",
    especialidade: "Radiologia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Clínica Matrix Medicina Diagnóstica",
    telefone: "(47) 3382-2900",
    tipoAtendimento: "presencial",
    descontoPercentual: 20,
  },
  {
    nome: "Dr. Júlio Fran",
    especialidade: "Ortopedia/Traumatologia",
    municipio: "Indaial",
    endereco: "Rua Duque de Caxias, 582 - Clínica VittaPro",
    telefone: "(47) 3399-1989",
    whatsapp: "(47) 3304-6823",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Guilherme Quintanilha",
    especialidade: "Ortopedia/Traumatologia",
    municipio: "Londrina",
    telefone: "(43) 99691-5158",
    endereco: "A confirmar",
    tipoAtendimento: "presencial",
    descontoPercentual: 20,
  },
  {
    nome: "Dr. Murillo Boldrini",
    especialidade: "Ortopedia/Traumatologia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Clínica Censit",
    telefone: "(47) 9689-4661",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Alberto Kazuo Miyamoto",
    especialidade: "Ortopedia/Traumatologia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – 2º andar – Clínica Serpa Ortopedia",
    telefone: "(47) 99200-9988",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dra. Denise Uliani",
    especialidade: "Cirurgia Geral",
    subespecialidade: "Cirurgia do Aparelho Digestivo",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 - Centro - Timbó/SC (Censit)",
    telefone: "(41) 99981-9417",
    tipoAtendimento: "presencial",
    descontoPercentual: 30,
    observacoes: "Atende também em Indaial e Ibirama",
  },
  {
    nome: "Dr. Fábio Arantes",
    especialidade: "Cirurgia Geral",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(47) 99194-0065",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dra. Amandia Mônica Marchetti",
    especialidade: "Cirurgia Plástica",
    municipio: "Blumenau",
    endereco: "Rua Ingo Hering, 20 – Sala 206 – Centro – Blumenau",
    telefone: "(47) 99912-7576",
    tipoAtendimento: "presencial",
    descontoPercentual: 20,
    observacoes: "Atende também em Balneário Camboriú",
  },
  {
    nome: "Dr. Felix Dong-Ik Lee",
    especialidade: "Cirurgia Plástica",
    municipio: "Timbó",
    endereco: "Rua Emilie Gussmann, 53 - Bairro Pomeranos - Timbó/SC",
    telefone: "(47) 3394-1704",
    whatsapp: "(47) 99617-5799",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
    observacoes: "Atende também em São Paulo",
  },
  {
    nome: "Dr. André Laurindo Cabral",
    especialidade: "Cirurgia Vascular",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(47) 99998-6599",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Lizandro Frainer Furlani",
    especialidade: "Proctologia",
    subespecialidade: "Coloproctologia / Endoscopia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Sala 110 – Centro – Censit",
    telefone: "(47) 3306-9090",
    whatsapp: "(47) 99961-0029",
    tipoAtendimento: "presencial",
    descontoPercentual: 30,
  },
  {
    nome: "Dra. Débora Santos Bueno",
    especialidade: "Proctologia",
    municipio: "Indaial",
    endereco: "Rua Desembargador Alves Pedrosa, 185 – Centro – Indaial",
    telefone: "(47) 99100-2707",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Maximilhano Maurell Arenz",
    especialidade: "Gastroenterologia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(47) 99613-0301",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Alessandro Mondadori Hoffmann",
    especialidade: "Urologia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(47) 99190-1980",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dra. Liz Caroline",
    especialidade: "Ginecologia/Obstetrícia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(47) 9975-1776",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dra. Lívia Ferraz",
    especialidade: "Ginecologia/Obstetrícia",
    municipio: "Pomerode",
    endereco: "Rua dos Atiradores, 116 – Clínica Integra Saúde",
    telefone: "(41) 99184-0790",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dra. Jéssica Chaves",
    especialidade: "Pediatria",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Sala 302 – Clínica Zatro",
    telefone: "(47) 99506-6111",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Aldo Gesser",
    especialidade: "Pediatria/Neonatologia",
    municipio: "Blumenau",
    endereco: "Atua em rede hospitalar neonatal",
    tipoAtendimento: "presencial",
    descontoPercentual: 20,
  },
  {
    nome: "Dra. Nathany Raup Porfírio",
    especialidade: "Geriatria",
    municipio: "Pomerode",
    endereco: "Hospital e Maternidade Rio do Testo – Rua Hermann Weege, 2727 – Centro",
    telefone: "(47) 3304-8425",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Janderick de Sousa Alves",
    especialidade: "Endocrinologia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(47) 99161-0910",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dra. Priscila Prada",
    especialidade: "Nefrologia/Nutrologia",
    municipio: "Timbó",
    endereco: "Rua Germano Brandes Sênior, 690 – Centro",
    telefone: "(47) 99184-8787",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Ian Robert Rehfeldt",
    especialidade: "Nefrologia/Nutrologia",
    municipio: "Timbó",
    endereco: "Rua Germano Brandes Sênior, 690 – Centro",
    telefone: "(47) 3333-1679",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dra. Taimara Zimath",
    especialidade: "Neurologia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(47) 99959-3828",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Maurício Munareto",
    especialidade: "Oftalmologia",
    municipio: "Pomerode",
    endereco: "Rua Luiz Abry, 829 – Centro – Pomerode",
    telefone: "(49) 98826-5634",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Guilherme da Cunha Galvani",
    especialidade: "Otorrinolaringologia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(47) 99292-5060",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dra. Patrícia da Silva",
    especialidade: "Psiquiatria",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(47) 98404-8719",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Jorge Schlichting Neto",
    especialidade: "Psiquiatria",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(47) 99118-1434",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Adriano Reinaldo Timm",
    especialidade: "Reumatologia",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Censit",
    telefone: "(48) 99935-9464",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
  {
    nome: "Dr. Fellipe Coderniz",
    especialidade: "Anestesia/Dor Crônica",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Sala 302 – Clínica Zatro",
    telefone: "(47) 99201-2208",
    tipoAtendimento: "presencial",
    descontoPercentual: 25,
  },
];

const instituicoesData = [
  {
    nome: "Única Medicina Avançada",
    categoria: "clinica",
    municipio: "Timbó",
    endereco: "Rua Professor Alwin Laemmel, 277 – Sala 02 – Timbó / SC",
    descontoPercentual: 20,
  },
  {
    nome: "Hospital Censit / Centro Clínico Censit",
    categoria: "hospital",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Timbó / SC",
    descontoPercentual: 25,
  },
  {
    nome: "ITHAKA – Centro Médico de Reabilitação",
    categoria: "clinica",
    municipio: "Timbó",
    endereco: "Rua Pomeranos, 3000 – Pomeranos – Timbó / SC",
    descontoPercentual: 25,
  },
  {
    nome: "Matrix Medicina Diagnóstica – Unidade Timbó",
    categoria: "laboratorio",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Centro – Timbó / SC",
    telefone: "(47) 3382-2900",
    descontoPercentual: 20,
  },
  {
    nome: "Oxygene Medicina Hiperbárica",
    categoria: "clinica",
    municipio: "Timbó",
    endereco: "Rua Pomeranos, 3000 – Sala 05 – Pomeranos – Timbó / SC",
    descontoPercentual: 25,
  },
  {
    nome: "Clínica Zatro (Coderniz Saúde e Vida LTDA)",
    categoria: "clinica",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Sala 302 – Timbó / SC",
    descontoPercentual: 25,
  },
  {
    nome: "Clínica Ortopédica Serpa (Unidade Timbó)",
    categoria: "clinica",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – 2º andar – Sala 206 – Timbó / SC",
    descontoPercentual: 25,
  },
  {
    nome: "Vaccine Care – Timbó",
    categoria: "clinica",
    municipio: "Timbó",
    endereco: "Rua Bolívia, 148 – Térreo – Centro Clínico Censit – Timbó / SC",
    telefone: "(47) 3304-0418",
    descontoPercentual: 20,
  },
  {
    nome: "Dehon Farmácia de Manipulação – Matriz Timbó",
    categoria: "farmacia",
    municipio: "Timbó",
    endereco: "Rua Germano Brandes Sênior, 690 – Centro – Timbó / SC",
    telefone: "(47) 3382-4142",
    email: "timbo@farmaciadehon.com.br",
    descontoPercentual: 15,
  },
];

async function seed() {
  console.log("Iniciando população de dados...");

  try {
    // Inserir médicos
    console.log("Inserindo médicos...");
    for (const medico of medicosData) {
      await db.insert(medicos).values(medico);
    }
    console.log(`${medicosData.length} médicos inseridos com sucesso!`);

    // Inserir instituições
    console.log("Inserindo instituições...");
    for (const instituicao of instituicoesData) {
      await db.insert(instituicoes).values(instituicao);
    }
    console.log(`${instituicoesData.length} instituições inseridas com sucesso!`);

    console.log("População de dados concluída!");
  } catch (error) {
    console.error("Erro ao popular dados:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
