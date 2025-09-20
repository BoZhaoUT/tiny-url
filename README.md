# URL Shortener Backend

A simple and efficient URL shortener API built with Express.js, TypeScript, and SQLite.

## Features

- 🔗 **URL Shortening**: Convert long URLs into short, shareable links
- 📊 **Analytics**: Track click counts and usage statistics
- 🔄 **Smart Redirects**: Automatic redirection with click tracking
- 🛡️ **Input Validation**: Validates URL format before shortening
- 📱 **RESTful API**: Clean, standard HTTP endpoints
- ⚡ **Fast Lookups**: SQLite database for quick URL resolution
- 🔧 **Environment Config**: Configurable port and base URL

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **SQLite3** - Lightweight database
- **nanoid** - Short code generation
- **ESLint + Prettier** - Code quality

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd be
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

The server will start at `http://localhost:3000`

## API Endpoints

### Create Short URL
```bash
POST /shorten
Content-Type: application/json
{"url": "https://www.google.com"}

# Response:
{
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://www.google.com",
  "clickCount": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Redirect to Original URL
```bash
GET /abc123
# → Redirects to https://www.google.com
# → Increments click count
```

### Get All URLs
```bash
GET /api/urls
# Returns list of all shortened URLs with stats
```

### Get URL Statistics
```bash
GET /api/stats/abc123
# Returns detailed stats for specific short code
```

### Delete URL
```bash
DELETE /api/urls/abc123
# Removes the short URL from database
```

## Environment Variables

Create a `.env` file based on `env.example`:

```env
PORT=3000
BASE_URL=http://localhost:3000
DATABASE_PATH=./urls.db
SHORT_CODE_LENGTH=4
```

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm lint` - Check for linting errors
- `pnpm lint:fix` - Auto-fix linting errors
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check if code is formatted

### Database Schema

```sql
urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shortCode TEXT UNIQUE,      -- 4-character short code
  originalUrl TEXT,           -- Full original URL
  createdAt DATETIME,         -- Creation timestamp
  clickCount INTEGER,         -- Number of redirects
  lastClickedAt DATETIME      -- Last redirect time
)
```

## License

ISC
