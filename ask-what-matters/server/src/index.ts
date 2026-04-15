import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import reviewRoutes from './routes/reviews';
import voiceRoutes from './routes/voice';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/auth', authRoutes);
  app.use('/properties', propertyRoutes);
  app.use('/reviews', reviewRoutes);
  app.use('/voice', voiceRoutes);

  return app;
}

export const app = createApp();

const isMain =
  process.argv[1] != null &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}
