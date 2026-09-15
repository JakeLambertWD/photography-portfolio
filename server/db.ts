import { neon } from "@neondatabase/serverless";
import { Kysely } from "kysely";
import { NeonDialect } from "kysely-neon";
import type { DB } from "./types";

const databaseUrl = process.env.DATABASE_URL;

// Build a type-safe Kysely client using the generated Neon database schema.
export function createDatabase(connectionString: string) {
	return new Kysely<DB>({
		dialect: new NeonDialect({ neon: neon(connectionString) }),
	});
}

// Keep database access disabled when the connection string is not configured.
export const db = databaseUrl ? createDatabase(databaseUrl) : null;