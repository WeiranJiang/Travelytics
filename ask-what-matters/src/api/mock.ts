/**
 * Mock backend backed by real data from the hackathon CSVs.
 *
 * Data sources:
 *   - data-properties.json — all 13 properties from Description_PROC.csv
 *   - data-reviews.json    — 5 most recent reviews per property
 *   - data-smart-questions.ts — hand-crafted gap-targeted questions
 *
 * When the Node backend is wired up, it replaces these with live responses.
 * Shapes match `types.ts` exactly.
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
import propertiesRaw from './data-properties.json';
import reviewsRaw from './data-reviews.json';
import usersRaw from './data-users.json';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// --- Normalization: the JSON has a few fields as arrays (from CSV JSON columns).
// The UI expects strings — join them for display.

type PropertyRaw = Omit<
  Property,
  'pet_policy' | 'children_and_extra_bed_policy' | 'know_before_you_go'
> & {
  pet_policy: string | string[];
  children_and_extra_bed_policy: string | string[];
  know_before_you_go: string | string[];
};

const joinArr = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? v.filter(Boolean).join(' · ') : v ?? '';

function normalize(p: PropertyRaw): Property {
  return {
    ...p,
    pet_policy: joinArr(p.pet_policy) || 'Policy not specified',
    children_and_extra_bed_policy:
      joinArr(p.children_and_extra_bed_policy) || 'Policy not specified',
    know_before_you_go: joinArr(p.know_before_you_go) || '',
  };
}

const PROPERTIES: Record<string, Property> = Object.fromEntries(
  (propertiesRaw as PropertyRaw[]).map((p) => [p.eg_property_id, normalize(p)]),
);

const REVIEWS: Record<string, Review[]> = reviewsRaw as Record<string, Review[]>;

/* ---------- Users (demo credentials) ---------- */

interface UserRecord extends User {
  password: string;
}

const USERS: UserRecord[] = usersRaw as UserRecord[];

const AUTH_KEY = 'awm:auth_user';

function currentUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function signIn(req: SignInRequest): Promise<ApiResult<SignInResponse>> {
  await sleep(250);
  const u = USERS.find(
    (x) => x.username.toLowerCase() === req.username.trim().toLowerCase(),
  );
  if (!u || u.password !== req.password) {
    return { ok: false, error: 'Invalid username or password.' };
  }
  const { password: _pw, ...publicUser } = u;
  // Mock token. Real backend will issue a signed JWT.
  const token = `mock.${btoa(publicUser.username)}.${Date.now()}`;
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(publicUser));
  return { ok: true, data: { user: publicUser, token } };
}

export async function signOut(): Promise<ApiResult<null>> {
  window.localStorage.removeItem(AUTH_KEY);
  return { ok: true, data: null };
}

export async function getCurrentUser(): Promise<ApiResult<User | null>> {
  return { ok: true, data: currentUserFromStorage() };
}

/* ---------- Local store for submitted reviews ----------
 * Persists across page refreshes via localStorage so the demo feels real.
 * The Node backend will replace this with real persistence.
 */
const LS_KEY = 'awm:submitted_reviews';

function loadSubmitted(): Record<string, Review[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Review[]>) : {};
  } catch {
    return {};
  }
}

function saveSubmitted(store: Record<string, Review[]>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors
  }
}

/* ---------- Exports ---------- */

export async function listProperties(): Promise<ApiResult<Property[]>> {
  await sleep(120);
  return { ok: true, data: Object.values(PROPERTIES) };
}

export async function getProperty(id: string): Promise<ApiResult<Property>> {
  await sleep(150);
  const base = PROPERTIES[id];
  if (!base) return { ok: false, error: `Property ${id} not found` };
  const submittedCount = (loadSubmitted()[id] ?? []).length;
  return {
    ok: true,
    data: { ...base, total_reviews: base.total_reviews + submittedCount },
  };
}

export async function getReviews(id: string): Promise<ApiResult<Review[]>> {
  await sleep(120);
  const submitted = loadSubmitted()[id] ?? [];
  // Newest submitted reviews first, then the static dataset.
  return { ok: true, data: [...submitted, ...(REVIEWS[id] ?? [])] };
}

export async function getSmartQuestions(id: string): Promise<ApiResult<SmartQuestion[]>> {
  throw new Error("Smart questions mock has been removed. Use the real backend logic.");
}

export async function transcribeVoice(_audio: Blob): Promise<ApiResult<{ text: string }>> {
  await sleep(600);
  return {
    ok: true,
    data: {
      text: 'It was great — no construction noise, and the staff pointed me to the nearest elevator in the building across the courtyard.',
    },
  };
}

export async function submitReview(
  s: ReviewSubmission,
): Promise<ApiResult<SubmitReviewResult>> {
  await sleep(400);
  const firstAnswer = Object.values(s.smart_question_answers)[0] ?? '';
  const year = new Date().getFullYear();
  const reviewId = `rev_${Date.now()}`;

  // Persist the new review so it shows up on the property page immediately.
  const today = new Date().toISOString().slice(0, 10);
  const me = currentUserFromStorage();
  const newReview: Review = {
    id: reviewId,
    eg_property_id: s.property_id,
    acquisition_date: today,
    lob: 'HOTEL',
    rating: s.overall_rating,
    review_title: s.review_title,
    review_text:
      s.review_text + (firstAnswer ? `\n\nUpdate from this guest: ${firstAnswer}` : ''),
    author_initial: me?.initial ?? 'You',
  };
  const store = loadSubmitted();
  store[s.property_id] = [newReview, ...(store[s.property_id] ?? [])];
  saveSubmitted(store);

  return {
    ok: true,
    data: {
      review_id: reviewId,
      insight_preview: firstAnswer
        ? `Guests in ${year} report: "${firstAnswer.slice(0, 180)}${firstAnswer.length > 180 ? '…' : ''}"`
        : 'Your review has been submitted.',
      fields_updated: ['last_refreshed', 'recent_guest_insight'],
    },
  };
}
