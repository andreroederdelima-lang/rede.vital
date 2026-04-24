// Boot orchestrator: roda migrations, depois inicia o server.
// Usado como startCommand no Railway — evita dependência de shell (&&).
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: "inherit", ...opts });
    proc.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`));
    });
    proc.on("error", reject);
  });
}

async function main() {
  console.log("[start] running migrations");
  await run("node", [path.join(__dirname, "run-migrations.mjs")]);

  console.log("[start] launching server");
  await run("node", [path.join(__dirname, "..", "dist", "index.js")]);
}

main().catch((err) => {
  console.error("[start] fatal:", err.message);
  process.exit(1);
});
