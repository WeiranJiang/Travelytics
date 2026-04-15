import { Router } from 'express';
import type { SignInRequest } from '../types/api';
import { signToken, verifyToken } from '../lib/auth';
import { dataStore } from '../services/dataStore';

const router = Router();

router.post('/sign-in', (req, res) => {
  const { username, password } = (req.body ?? {}) as Partial<SignInRequest>;
  const userRecord = dataStore.demoUsers.find(
    (user) => user.username.toLowerCase() === username?.trim().toLowerCase(),
  );

  if (!userRecord || userRecord.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const { password: _password, ...user } = userRecord;
  const token = signToken({
    userId: user.username,
    username: user.username,
    email: `${user.username}@example.com`,
  });

  return res.json({
    user,
    token,
  });
});

router.post('/sign-out', (_req, res) => {
  res.json(null);
});

router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.json(null);
  }

  try {
    const payload = verifyToken(auth.slice(7));
    const user = dataStore.demoUsers.find((candidate) => candidate.username === payload.username);
    if (!user) return res.json(null);

    const { password: _password, ...publicUser } = user;
    return res.json(publicUser);
  } catch {
    return res.json(null);
  }
});

export default router;
