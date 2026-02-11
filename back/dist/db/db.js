"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
exports.all = all;
exports.get = get;
exports.initializeDatabase = initializeDatabase;
const node_api_1 = require("@duckdb/node-api");
const databasePath = process.env.DUCKDB_PATH || "documents.duckdb";
let connectionPromise = null;
async function getConnection() {
    if (!connectionPromise) {
        connectionPromise = node_api_1.DuckDBInstance.create(databasePath).then((instance) => instance.connect());
    }
    return connectionPromise;
}
async function run(sql, params) {
    const connection = await getConnection();
    await connection.run(sql, params);
}
async function all(sql, params) {
    const connection = await getConnection();
    const reader = await connection.runAndReadAll(sql, params);
    return reader.getRowObjectsJS();
}
async function get(sql, params) {
    var _a;
    const rows = await all(sql, params);
    return (_a = rows[0]) !== null && _a !== void 0 ? _a : null;
}
async function initializeDatabase() {
    await run(`
    CREATE TABLE IF NOT EXISTS documents (
      id BIGINT PRIMARY KEY,
      name VARCHAR NOT NULL,
      content TEXT NOT NULL
    )
  `);
}
