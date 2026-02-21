import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = join(dataDir, 'database.json');

// Default database schema
const defaultData = {
  analyses: [],
  prompts: [],
  youtube_tracks: [],
  settings: {
    default_prompt_style: 'phonk'
  }
};

// Initialize database
const adapter = new JSONFile(dbPath);
export const db = new Low(adapter, defaultData);

// Initialize database if it doesn't exist
export async function initializeDatabase() {
  await db.read();
  
  // If database is empty, write default data
  if (!db.data || Object.keys(db.data).length === 0) {
    db.data = defaultData;
    await db.write();
  }
  
  return db;
}

// Database helper functions for IPC handlers
export async function dbGet(key) {
  await db.read();
  const keys = key.split('.');
  let value = db.data;
  for (const k of keys) {
    value = value?.[k];
  }
  return value;
}

export async function dbSet(key, value) {
  await db.read();
  const keys = key.split('.');
  let target = db.data;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!target[k]) {
      target[k] = {};
    }
    target = target[k];
  }
  target[keys[keys.length - 1]] = value;
  await db.write();
  return true;
}

export async function dbPush(key, value) {
  await db.read();
  const keys = key.split('.');
  let target = db.data;
  for (const k of keys) {
    if (!target[k]) {
      target[k] = [];
    }
    target = target[k];
  }
  if (Array.isArray(target)) {
    target.push(value);
    await db.write();
    return true;
  }
  throw new Error(`Key "${key}" is not an array`);
}

export async function dbFind(key, predicate) {
  await db.read();
  const keys = key.split('.');
  let target = db.data;
  for (const k of keys) {
    target = target?.[k];
  }
  if (Array.isArray(target)) {
    return target.find(predicate) || null;
  }
  return null;
}

// Initialize on import
initializeDatabase().catch(console.error);
