import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import uploadRouter from "../upload";
import publicApiRouter from "../publicApi";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // CORS_ORIGINS: comma-separated list, supports wildcards with *
  // e.g. "https://app.vercel.app,https://app-*.vercel.app"
  const corsPatterns = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean)
    .map(o => o.includes("*") ? new RegExp("^" + o.replace(/\./g, "\\.").replace(/\*/g, "[^.]+") + "$") : o);

  app.use(
    cors({
      origin: corsPatterns.length === 0
        ? false
        : (origin, cb) => {
            if (!origin) return cb(null, true); // server-to-server
            const allowed = corsPatterns.some(p =>
              p instanceof RegExp ? p.test(origin) : p === origin
            );
            cb(allowed ? null : new Error("Not allowed by CORS"), allowed);
          },
      credentials: true,
    })
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Upload endpoint
  app.use("/api", uploadRouter);
  // Public API REST endpoints
  app.use("/api/public", publicApiRouter);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  // Em produção, respeitar exatamente PORT — Railway/etc roteia pra essa porta.
  // Em dev, scannear portas livres para permitir múltiplas instâncias locais.
  const port = process.env.NODE_ENV === "production"
    ? preferredPort
    : await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
