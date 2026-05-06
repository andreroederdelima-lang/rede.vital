import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Verificar médicos com fotos
const medicos = await connection.query("SELECT id, nome, fotoUrl, logoUrl FROM medicos LIMIT 10");
console.log("\n=== MÉDICOS (primeiros 10) ===");
console.log(JSON.stringify(medicos[0], null, 2));

// Verificar instituições com fotos
const instituicoes = await connection.query("SELECT id, nome, fotoUrl, logoUrl FROM instituicoes LIMIT 10");
console.log("\n=== INSTITUIÇÕES (primeiras 10) ===");
console.log(JSON.stringify(instituicoes[0], null, 2));

// Contar quantos têm fotos
const medicosFotos = await connection.query("SELECT COUNT(*) as total, COUNT(fotoUrl) as comFoto, COUNT(logoUrl) as comLogo FROM medicos");
console.log("\n=== ESTATÍSTICAS MÉDICOS ===");
console.log(medicosFotos[0][0]);

const instFotos = await connection.query("SELECT COUNT(*) as total, COUNT(fotoUrl) as comFoto, COUNT(logoUrl) as comLogo FROM instituicoes");
console.log("\n=== ESTATÍSTICAS INSTITUIÇÕES ===");
console.log(instFotos[0][0]);

await connection.end();
