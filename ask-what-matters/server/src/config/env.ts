import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
};
