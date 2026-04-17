import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { randomBytes } from "crypto";

const DATABASE_URL = process.env.DATABASE_URL;

async function generateToken() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
  
  await connection.execute(
    `INSERT INTO tokens (token, tipo, tipoCredenciado, expiresAt, usado) VALUES (?, ?, ?, ?, ?)`,
    [token, "cadastro", "medico", expiresAt, 0]
  );
  
  console.log(`Token gerado: ${token}`);
  console.log(`URL: https://3000-inmon7vwx54vq89x0j2qe-20ad4cec.manusvm.computer/cadastro-medico/${token}`);
  
  await connection.end();
}

generateToken().catch(console.error);
