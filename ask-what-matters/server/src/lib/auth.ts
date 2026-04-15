export interface AuthTokenPayload {
  userId: string;
  username: string;
  email: string;
  exp: number;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function signToken(payload: Omit<AuthTokenPayload, 'exp'>) {
  const tokenPayload: AuthTokenPayload = {
    ...payload,
    exp: Date.now() + ONE_WEEK_MS,
  };

  return Buffer.from(JSON.stringify(tokenPayload), 'utf8').toString('base64url');
}

export function verifyToken(token: string) {
  const decoded = Buffer.from(token, 'base64url').toString('utf8');
  const payload = JSON.parse(decoded) as Partial<AuthTokenPayload>;

  if (
    !payload.userId ||
    !payload.username ||
    !payload.email ||
    !payload.exp ||
    payload.exp < Date.now()
  ) {
    throw new Error('Invalid token');
  }

  return payload as AuthTokenPayload;
}
