// Vercel Serverless Function: GET /api/health
// Mirrors the /api/health route from the local server.js so the deployed
// app has the same health check endpoint as local development.

export default function handler(request, response) {
  response.status(200).json({
    status: 'healthy',
    os: 'FINORA OS 2.0 Web',
    database: 'Supabase PostgreSQL + Local Storage',
    backend: 'Java 21 Architecture + Web API',
    timestamp: new Date().toISOString(),
  });
}
