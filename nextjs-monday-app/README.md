# Monday.com Next.js App

A Next.js application with TypeScript integration for Monday.com, built with Pages Router and JWT authentication.

## Features

- ✅ Next.js 14 with Pages Router (App Router disabled)
- ✅ TypeScript configuration
- ✅ Monday.com API integration
- ✅ JWT authentication with jsonwebtoken
- ✅ Environment variable configuration
- ✅ API routes for Monday.com GraphQL queries

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Monday.com API token
- Monday.com board ID

### Installation

1. Clone or navigate to the project directory:
```bash
cd nextjs-monday-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create `.env.local` file with:
```
MONDAY_API_TOKEN=your_monday_api_token
MONDAY_BOARD_ID=your_board_id
JWT_SECRET=your_jwt_secret
BASE_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nextjs-monday-app/
├── pages/
│   ├── api/
│   │   └── monday.ts      # Monday.com API integration
│   ├── _app.tsx           # App component
│   └── index.tsx          # Home page
├── .env.local             # Environment variables
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

## API Routes

### POST /api/monday

Proxy endpoint for Monday.com GraphQL API.

**Request body:**
```json
{
  "query": "query { boards { id name } }",
  "variables": {}
}
```

**Response:**
```json
{
  "data": {
    "boards": [...]
  }
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONDAY_API_TOKEN` | Your Monday.com API token | Yes |
| `MONDAY_BOARD_ID` | Target Monday.com board ID | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `BASE_URL` | Application base URL | Yes |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deploy to Vercel

### Quick Deploy

1. Push your code to GitHub/GitLab/Bitbucket

2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. Configure environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`:
     - `MONDAY_API_TOKEN`
     - `MONDAY_BOARD_ID`
     - `JWT_SECRET`
     - `BASE_URL` (set to your Vercel domain)

4. Deploy:
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-app.vercel.app`

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONDAY_API_TOKEN
vercel env add MONDAY_BOARD_ID
vercel env add JWT_SECRET
vercel env add BASE_URL

# Redeploy with environment variables
vercel --prod
```

## Development

### Adding New API Routes

Create new files in `pages/api/` directory:

```typescript
// pages/api/example.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Hello World' })
}
```

### Monday.com Integration

Use the `/api/monday` endpoint to make GraphQL queries:

```typescript
const response = await fetch('/api/monday', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `query { boards(ids: [${process.env.MONDAY_BOARD_ID}]) { name columns { title type } } }`,
    variables: {}
  })
})
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env.local` is in the root directory
   - Restart the development server after adding variables

2. **Monday.com API errors**
   - Verify your API token has the correct permissions
   - Check that the board ID exists and is accessible

3. **TypeScript errors**
   - Run `npm run lint` to check for issues
   - Ensure all dependencies are installed

### Support

- [Next.js Documentation](https://nextjs.org/docs)
- [Monday.com API Documentation](https://developer.monday.com/api-reference/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
# ff-monday-app
