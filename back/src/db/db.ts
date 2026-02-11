import {
  DuckDBConnection,
  DuckDBInstance,
  type DuckDBValue,
} from "@duckdb/node-api";

type QueryParams = DuckDBValue[] | Record<string, DuckDBValue>;

const databasePath = process.env.DUCKDB_PATH || "documents.duckdb";

let connectionPromise: Promise<DuckDBConnection> | null = null;

async function getConnection(): Promise<DuckDBConnection> {
  if (!connectionPromise) {
    connectionPromise = DuckDBInstance.create(databasePath).then((instance) =>
      instance.connect(),
    );
  }
  return connectionPromise;
}

export async function run(sql: string, params?: QueryParams): Promise<void> {
  const connection = await getConnection();
  await connection.run(sql, params);
}

export async function all<T>(sql: string, params?: QueryParams): Promise<T[]> {
  const connection = await getConnection();
  const reader = await connection.runAndReadAll(sql, params);
  return reader.getRowObjectsJS() as T[];
}

export async function get<T>(
  sql: string,
  params?: QueryParams,
): Promise<T | null> {
  const rows = await all<T>(sql, params);
  return rows[0] ?? null;
}

export async function initializeDatabase(): Promise<void> {
  await run(`
    CREATE TABLE IF NOT EXISTS documents (
      id BIGINT PRIMARY KEY,
      name VARCHAR NOT NULL,
      content TEXT NOT NULL
    )
  `);
}
