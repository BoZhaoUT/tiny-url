import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export interface UrlRecord {
  id: number;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
  lastClickedAt: string | null;
}

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('./urls.db');
    this.init();
  }

  private async init(): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));

    await run(`
      CREATE TABLE IF NOT EXISTS urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shortCode TEXT UNIQUE NOT NULL,
        originalUrl TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        clickCount INTEGER DEFAULT 0,
        lastClickedAt DATETIME
      )
    `);
  }

  async createUrl(shortCode: string, originalUrl: string): Promise<UrlRecord> {
    const run = promisify(this.db.run.bind(this.db));
    const get = promisify(this.db.get.bind(this.db));

    await run('INSERT INTO urls (shortCode, originalUrl) VALUES (?, ?)', [
      shortCode,
      originalUrl,
    ]);

    const result = (await get('SELECT * FROM urls WHERE shortCode = ?', [
      shortCode,
    ])) as UrlRecord;

    return result;
  }

  async getUrlByShortCode(shortCode: string): Promise<UrlRecord | null> {
    const get = promisify(this.db.get.bind(this.db));

    const result = (await get('SELECT * FROM urls WHERE shortCode = ?', [
      shortCode,
    ])) as UrlRecord | undefined;

    return result || null;
  }

  async incrementClickCount(shortCode: string): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));

    await run(
      'UPDATE urls SET clickCount = clickCount + 1, lastClickedAt = CURRENT_TIMESTAMP WHERE shortCode = ?',
      [shortCode]
    );
  }

  async getAllUrls(): Promise<UrlRecord[]> {
    const all = promisify(this.db.all.bind(this.db));

    const results = (await all(
      'SELECT * FROM urls ORDER BY createdAt DESC'
    )) as UrlRecord[];
    return results;
  }

  async deleteUrl(shortCode: string): Promise<boolean> {
    const run = promisify(this.db.run.bind(this.db));

    const result = await run('DELETE FROM urls WHERE shortCode = ?', [
      shortCode,
    ]);
    return result.changes > 0;
  }

  close(): void {
    this.db.close();
  }
}

export const database = new Database();
