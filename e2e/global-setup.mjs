import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env.test") });
dotenv.config({ path: path.join(rootDir, ".env.local"), override: false });

export default async function globalSetup() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.DATABASE_URL) {
    console.warn(
      "[e2e] Sin SUPABASE_SERVICE_ROLE_KEY ni DATABASE_URL. " +
        "Ejecuta manualmente: npm run db:setup:test",
    );
    return;
  }

  try {
    execSync("npm run db:setup:test", {
      stdio: "inherit",
      cwd: rootDir,
    });
  } catch {
    console.warn(
      "[e2e] No se pudieron crear usuarios de prueba. " +
        "Agrega SUPABASE_SERVICE_ROLE_KEY en .env.test y ejecuta: npm run db:setup:test",
    );
  }
}
