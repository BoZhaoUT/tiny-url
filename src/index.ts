import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { database } from './database.js';
import { generateShortCode, isValidUrl, normalizeUrl } from './utils.js';

const app = express();
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'URL Shortener API',
    version: '1.0.0',
    endpoints: {
      'POST /shorten': 'Create a short URL',
      'GET /:shortCode': 'Redirect to original URL',
      'GET /api/urls': 'Get all URLs',
      'GET /api/stats/:shortCode': 'Get URL statistics',
      'DELETE /api/urls/:shortCode': 'Delete a URL',
    },
  });
});

// Create short URL
app.post('/shorten', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const normalizedUrl = normalizeUrl(url);

    if (!isValidUrl(normalizedUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if URL already exists
    const existingUrls = await database.getAllUrls();
    const existingUrl = existingUrls.find(
      (u) => u.originalUrl === normalizedUrl
    );

    if (existingUrl) {
      return res.json({
        shortCode: existingUrl.shortCode,
        shortUrl: `${baseUrl}/${existingUrl.shortCode}`,
        originalUrl: existingUrl.originalUrl,
        clickCount: existingUrl.clickCount,
        createdAt: existingUrl.createdAt,
      });
    }

    const shortCode = generateShortCode();
    const urlRecord = await database.createUrl(shortCode, normalizedUrl);

    res.status(201).json({
      shortCode: urlRecord.shortCode,
      shortUrl: `${baseUrl}/${urlRecord.shortCode}`,
      originalUrl: urlRecord.originalUrl,
      clickCount: urlRecord.clickCount,
      createdAt: urlRecord.createdAt,
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect to original URL
app.get('/:shortCode', async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    const urlRecord = await database.getUrlByShortCode(shortCode);

    if (!urlRecord) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Increment click count
    await database.incrementClickCount(shortCode);

    res.redirect(urlRecord.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all URLs
app.get('/api/urls', async (req: Request, res: Response) => {
  try {
    const urls = await database.getAllUrls();
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get URL statistics
app.get('/api/stats/:shortCode', async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    const urlRecord = await database.getUrlByShortCode(shortCode);

    if (!urlRecord) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({
      shortCode: urlRecord.shortCode,
      originalUrl: urlRecord.originalUrl,
      clickCount: urlRecord.clickCount,
      createdAt: urlRecord.createdAt,
      lastClickedAt: urlRecord.lastClickedAt,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete URL
app.delete('/api/urls/:shortCode', async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    const deleted = await database.deleteUrl(shortCode);

    if (!deleted) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`🚀 URL Shortener running at ${baseUrl}`);
  console.log(`📊 Database initialized`);
});
