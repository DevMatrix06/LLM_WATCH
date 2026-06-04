import express from 'express';
import cors from 'cors';
import { ingestRouter } from './routes/ingest';
import { logsRouter }   from './routes/logs';
import { statsRouter }  from './routes/stats';

if (!process.env.API_KEY) {
  console.error('[llmwatch] ERROR: API_KEY environment variable must be set');
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '5mb' }));

app.use('/ingest',    ingestRouter);
app.use('/api/logs',  logsRouter);
app.use('/api/stats', statsRouter);

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`[llmwatch] server listening on :${PORT}`);
});
