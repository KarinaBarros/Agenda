import * as SQLite from 'expo-sqlite';

export async function openDatabase() {
  const db = await SQLite.openDatabaseAsync('agenda.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
     PRAGMA foreign_keys = ON;
     `);
  return db;
}