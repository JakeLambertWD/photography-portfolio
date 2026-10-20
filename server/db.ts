import { neon, Pool } from "@neondatabase/serverless";
import { Kysely, PostgresDialect, type PostgresPool } from "kysely";
import type { DB } from "./db.types";

const databaseUrl = process.env.DATABASE_URL;

// Raw SQL client - still used by the routers until they're moved to `db`.
export const sql = databaseUrl ? neon(databaseUrl) : null;

// Type-safe query builder. Uses Neon's WebSocket Pool rather than the HTTP
// client above so it supports transactions. Regenerate the table types with
// `pnpm db:types` after running a migration.
export const db = databaseUrl
  ? new Kysely<DB>({
      dialect: new PostgresDialect({
        // Neon's Pool is pg-compatible at runtime; the cast only papers over
        // its Client.connect() being typed as Promise<void>, a return value
        // Kysely never reads.
        pool: new Pool({ connectionString: databaseUrl }) as unknown as PostgresPool,
      }),
    })
  : null;
