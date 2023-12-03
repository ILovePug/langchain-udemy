import sqlite3 from 'sqlite3';
import { z } from 'zod';

import { DynamicStructuredTool } from 'langchain/tools';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_FILE_PATH = resolve(__dirname, '../db.sqlite');
const db = new sqlite3.Database(DB_FILE_PATH, (err) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log('connected to db');
});

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    db.all(query, (err, data) => {
      // console.log({ err, data });
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });
}

export async function listTables() {
  const res = await executeQuery(
    `SELECT name FROM sqlite_master WHERE type='table';`
  );
  // list table names one per line
  /**
   * 
   *  users
      addresses
      products
      carts
      orders
      order_products
   */
  return res.map(({ name }) => name);
}

export async function describeTables({ tableNames }) {
  try {
    const names = tableNames.map((name) => `'${name}'`).join(',');

    const QUERY = `SELECT sql FROM sqlite_master WHERE type='table' and name in (${names});`;
    /**
     * sql: 
     * CREATE TABLE users (
          id INTEGER PRIMARY KEY
          name TEXT
          email TEXT UNIQUE
          password TEXT
        )
     */
    const res = await executeQuery(QUERY);

    return res.map(({ sql }) => sql).join('\n');
  } catch (error) {
    console.log({ tableNames }, { error });
    return `describeTables is not available.`;
  }
}

// console.log(await describeTables(['users', 'addresses']));

async function runSqliteQuery({ query }) {
  try {
    const res = await executeQuery(query);
    return JSON.stringify(res);
    // return Object.values(res[0])[0].toString();
  } catch (error) {
    console.log({ error });
    return error.message;
  }
}

export const runQueryTool = new DynamicStructuredTool({
  name: 'runSqliteQuery',
  description: 'Run a sqlite query',
  func: runSqliteQuery,
  schema: z.object({
    query: z.string().describe('The query to be executed'),
  }),
});

export const describeTablesTool = new DynamicStructuredTool({
  name: 'describeTables',
  description:
    'Given a list of table names, returns the schema of those tables',
  func: describeTables,
  schema: z.object({
    tableNames: z.string().array(),
  }),
});
