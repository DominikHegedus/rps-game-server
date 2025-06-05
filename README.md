# Rock Paper Scissors Game Server

A WebSocket server built with Fastify to handle real-time Rock Paper Scissors game sessions and matchmaking.

## Tech Stack

- Fastify (WebSocket server)
- TypeScript
- PostgreSQL (Game state and user data)
- Redis (Real-time matchmaking and session management)

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- npm or yarn

## Local Development Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd rps-game-server
```

2. Install dependencies:

```bash
npm install
```

3. Start the local databases using Docker Compose:

```bash
docker-compose up -d
```

4. Create a `.env` file in the root directory with the following content:

```
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=rps_game

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

5. Start the development server:

```bash
npm run dev
```

The server will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start the production server
- `npm test` - Run tests

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /ws` - WebSocket endpoint for game connections

## Deployment

This server is designed to be deployed on Railway. The deployment process is automated through Railway's GitHub integration.

## License

MIT
