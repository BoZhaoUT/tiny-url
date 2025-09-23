export interface UrlRecord {
  id: number;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
  lastClickedAt: string | null;
}

class InMemoryDatabase {
  private urls: Map<string, UrlRecord> = new Map();
  private nextId = 1;

  constructor() {
    console.log('📊 In-memory database initialized');
  }

  createUrl(shortCode: string, originalUrl: string): UrlRecord {
    const now = new Date().toISOString();
    const urlRecord: UrlRecord = {
      id: this.nextId++,
      shortCode,
      originalUrl,
      createdAt: now,
      clickCount: 0,
      lastClickedAt: null,
    };

    this.urls.set(shortCode, urlRecord);
    return urlRecord;
  }

  getUrlByShortCode(shortCode: string): UrlRecord | null {
    return this.urls.get(shortCode) || null;
  }

  incrementClickCount(shortCode: string): void {
    const urlRecord = this.urls.get(shortCode);
    if (urlRecord) {
      urlRecord.clickCount++;
      urlRecord.lastClickedAt = new Date().toISOString();
    }
  }

  getAllUrls(): UrlRecord[] {
    return Array.from(this.urls.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  close(): void {
    this.urls.clear();
  }
}

export const database = new InMemoryDatabase();
