/**
 * SINGLE SWAP POINT for the backend.
 *
 * While `VITE_USE_MOCKS=true` (see .env.example), these functions return
 * hardcoded data from `./mock.ts`. When your Node backend is ready, flip
 * the env flag to `false` and the real HTTP calls below will take over.
 *
 * Your teammate: this is the ONLY file that needs to change to connect
 * the UI. Do NOT call fetch() from components directly.
 */

import type {
  ApiResult,
  Property,
  Review,
  ReviewSubmission,
  SignInRequest,
  SignInResponse,
  SmartQuestion,
  SubmitReviewResult,
  User,
} from './types';
import * as mock from './mock';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const TOKEN_KEY = 'awm:auth_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function http<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((init?.headers as Record<string, string>) ?? {}),
    };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** GET /properties — list all properties (for the search results page). */
export async function listProperties(): Promise<ApiResult<Property[]>> {
  if (USE_MOCKS) return mock.listProperties();
  return http<Property[]>('/properties');
}

/** GET /properties/:id — full property detail. */
export async function getProperty(id: string): Promise<ApiResult<Property>> {
  if (USE_MOCKS) return mock.getProperty(id);
  return http<Property>(`/properties/${encodeURIComponent(id)}`);
}

/** GET /properties/:id/reviews — recent reviews for the property page. */
export async function getReviews(id: string): Promise<ApiResult<Review[]>> {
  if (USE_MOCKS) return mock.getReviews(id);
  return http<Review[]>(`/properties/${encodeURIComponent(id)}/reviews`);
}

/**
 * GET /properties/:id/smart-questions
 *
 * The backend runs the gap-detection + freshness-decay pipeline here and
 * returns the top 1–2 questions to ask this reviewer. The response must
 * include a `reason` per question so the UI can show WHY we're asking.
 */
export async function getSmartQuestions(id: string): Promise<ApiResult<SmartQuestion[]>> {
  if (USE_MOCKS) return mock.getSmartQuestions(id);
  return http<SmartQuestion[]>(`/properties/${encodeURIComponent(id)}/smart-questions`);
}

/** POST /voice/transcribe — audio blob → text via Whisper or similar. */
export async function transcribeVoice(audio: Blob): Promise<ApiResult<{ text: string }>> {
  if (USE_MOCKS) return mock.transcribeVoice(audio);
  const form = new FormData();
  form.append('audio', audio);
  try {
    const res = await fetch(`${BASE_URL}/voice/transcribe`, { method: 'POST', body: form });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, data: await res.json() };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** POST /reviews — submit the full review + smart-question answers. */
export async function submitReview(
  submission: ReviewSubmission,
): Promise<ApiResult<SubmitReviewResult>> {
  if (USE_MOCKS) return mock.submitReview(submission);
  return http<SubmitReviewResult>('/reviews', {
    method: 'POST',
    body: JSON.stringify(submission),
  });
}

/* ---------- Auth ---------- */

/** POST /auth/sign-in — returns both the user and a bearer token. */
export async function signIn(req: SignInRequest): Promise<ApiResult<SignInResponse>> {
  const res = USE_MOCKS
    ? await mock.signIn(req)
    : await http<SignInResponse>('/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify(req),
      });
  if (res.ok) setToken(res.data.token);
  return res;
}

/** POST /auth/sign-out — clears the token locally and on the server. */
export async function signOut(): Promise<ApiResult<null>> {
  const res = USE_MOCKS ? await mock.signOut() : await http<null>('/auth/sign-out', { method: 'POST' });
  setToken(null);
  return res;
}

/** GET /auth/me — used on app boot to resolve the current session. */
export async function getCurrentUser(): Promise<ApiResult<User | null>> {
  if (USE_MOCKS) return mock.getCurrentUser();
  return http<User | null>('/auth/me');
}

/** Cheap convenience helper for components that just want the data. */
export async function unwrap<T>(p: Promise<ApiResult<T>>): Promise<T> {
  const r = await p;
  if (!r.ok) throw new Error(r.error);
  return r.data;
}
