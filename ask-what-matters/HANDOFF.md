# Backend Handoff Guide

**For:** the teammate wiring up the Node.js backend (and/or an AI coding assistant continuing this work).
**Project:** `ask-what-matters` — Wharton Hack-AI-thon prototype (Expedia).

This document is exhaustive on purpose. Paste it into an AI coding assistant along with `src/api/types.ts` and you should get a working backend implementation.

---

## 1. What this repo is

A **frontend-only React + TypeScript app** that simulates the full reviewer experience:

1. Traveler lands on a property page (Expedia-styled).
2. Clicks "Leave a review", rates overall + 5 categories (1–5 stars), writes title + text.
3. Is shown **1–2 AI-generated smart questions** targeting information gaps on this specific property.
4. Answers via text **or voice** (browser Web Speech API — already works, no backend needed).
5. Sees a "before / after" screen showing how their answer updates the listing.

All data is currently hardcoded in `src/api/mock.ts`. **Your job:** replace the mocks with real Node.js endpoints that return the same shapes. Zero UI changes should be required.

---

## 2. The single swap point

All backend I/O routes through **`src/api/client.ts`**. It already has:

```ts
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
```

Set `VITE_USE_MOCKS=false` in `.env.local` and the client starts calling your backend at `BASE_URL`. **Do not edit any React component.**

---

## 3. The hackathon dataset

Located at `/Hackathon1/ExtraData/`:

| File | Contents |
|---|---|
| `Description_PROC.csv` | 13 properties. Columns in §4 below. |
| `Reviews_PROC.csv` | ~6,000 reviews. JSON rating blob with 15 sub-category scores. |
| `DICTIONARY.md` | Official field descriptions. |

### Real-world quirks you must handle

1. **Property names are MASKED** — every description has `|MASK|` tokens where the brand name would be. You cannot show real names. Generate a synthetic `display_name` like `"Boutique Hotel in Pompei, Italy"` from `star_rating + city + country + first line of property_description`.
2. **`property_description` contains HTML** (`<br>`, `<p>`) and is all lowercased. Strip tags and title-case the first letter of sentences before returning.
3. **Dates are `M/D/YY`** (e.g. `2/10/23`). Parse and return ISO (`2023-02-10`).
4. **Some fields are blank** — `star_rating`, `province`, `country` can all be empty strings. Return `undefined` rather than empty string.
5. **Amenity columns are JSON arrays of snake_case strings** (e.g. `["ac", "bar", "breakfast_included"]`). Humanize them (`"Air conditioning"`, `"Bar"`, `"Buffet breakfast"`) before returning.
6. **All `lob` values are `"HOTEL"`** — no Vrbo in this dataset.

---

## 4. Column mapping

### `Description_PROC.csv` → `Property`

| CSV column | Property field | Notes |
|---|---|---|
| `eg_property_id` | `eg_property_id` | direct |
| _computed_ | `display_name` | synthesize, see §3.1 |
| `city` / `province` / `country` | same | empty → omit |
| `star_rating` | `star_rating` | parse as number; empty → undefined |
| `guestrating_avg_expedia` | same | number |
| _count reviews_ | `total_reviews` | `Reviews_PROC` rows per property |
| `area_description` | same | strip HTML, capitalize |
| `property_description` | same | strip HTML, capitalize |
| `popular_amenities_list` | `popular_amenities` | JSON parse + humanize snake_case |
| `property_amenity_*` (14 cols) | `amenities_by_category` | JSON-parse each, map to keyed object |
| `check_in_*`, `check_out_*`, `pet_policy`, etc. | same | direct |
| _not in CSV_ | `hero_image_url` / `gallery_image_urls` | use Unsplash or local `/public/img/` |
| _computed from reviews_ | `category_ratings` | see §5 |

### `Reviews_PROC.csv` → `Review`

| CSV column | Review field | Notes |
|---|---|---|
| `eg_property_id` | same | direct |
| `acquisition_date` | same | parse `M/D/YY` → ISO |
| `lob` | same | `"HOTEL"` |
| `rating` | `rating` / `rating_detail` | JSON.parse; extract `.overall` for `rating`, attach full blob as `rating_detail` |
| `review_title` | same | direct |
| `review_text` | same | direct |
| _not in CSV_ | `author_initial` | fabricate or omit (UI handles missing) |

---

## 4b. Auth flow

`POST /auth/sign-in` returns **both** the user and a bearer token:

```ts
interface SignInResponse {
  user: User;
  token: string;
}
```

The frontend stores the token in `localStorage` (key `awm:auth_token`) and sends it on every subsequent request:

```
Authorization: Bearer <token>
```

The `http()` helper in `src/api/client.ts` already attaches this header automatically. Your backend must:
- Return a signed token (JWT or similar) from `/auth/sign-in`.
- Validate the `Authorization` header on protected routes.
- Accept an invalidation call at `POST /auth/sign-out` (204 No Content is fine).
- Expose `GET /auth/me` that returns the current user (or 401) based on the token.

The mock uses a fake token like `mock.<b64-username>.<timestamp>` — just a placeholder so the wire format is set.

---

## 5. Rating aggregation (15 → 5)

See `fixtures/rating-aggregation.json` for a ready-to-use test fixture with input reviews and expected outputs. Drop it into your test suite as the source of truth.


Reviews in the CSV have a JSON blob with 15 sub-categories (0 = not rated). The UI shows the 5 Expedia categories. **Aggregate server-side** using this mapping:

```
cleanliness           ← roomcleanliness
staff_and_service     ← mean(service, communication, checkin)   (ignore 0s)
amenities             ← roomamenitiesscore
property_conditions   ← mean(hotelcondition, roomcomfort, roomquality)   (ignore 0s)
eco_friendliness      ← ecofriendliness
```

Then:
- Convert each review's 1–5 sub-category score into 0–10 by multiplying by 2.
- Average across all reviews for the property → the `category_ratings` returned from `GET /properties/:id`.

`overall`, `valueformoney`, `location`, `convenienceoflocation`, `neighborhoodsatisfaction`, `onlinelisting` are **not shown in the UI** but are useful for gap detection.

---

## 6. Endpoints to implement

All return JSON. Exact shapes in `src/api/types.ts` — treat it as the single source of truth.

### `GET /properties/:id` → `Property`

Full property detail. See column mapping above.

### `GET /properties/:id/reviews` → `Review[]`

Return the most recent ~10 reviews (sorted by `acquisition_date` desc). Older reviews are used for gap detection but not shown on the page.

### `GET /properties/:id/smart-questions` → `SmartQuestion[]`

**The core AI endpoint.** Run gap detection and return 1–2 high-value questions.

```ts
interface SmartQuestion {
  id: string;
  text: string;                      // the question shown to the reviewer
  reason: string;                    // WHY we're asking (judge-facing explainability)
  target_gap: string;                // machine-readable, e.g. "breakfast_post_renovation"
  category: string;                  // human label, e.g. "Food & drink"
  impact_preview_template?: string;  // optional template string for the after-preview
  confidence?: number;               // 0–1, backend's own score
  signals?: {
    freshness_days?: number;         // days since topic was last mentioned
    coverage_count?: number;         // reviews mentioning this topic in last 6 months
    contradiction_score?: number;    // 0=unanimous, 1=fully split
    staleness_ratio?: number;        // days_since / category_half_life; >1 = stale
    qualified_user_count?: number;   // travelers eligible to answer
  };
}
```

**Contract for valid smart questions:**

- `text` ends with a question mark and is a single sentence.
- `text` is conversational and ≤160 characters.
- `reason` is ≥20 characters and names at least one concrete evidence (a date, a number, a specific amenity).
- `category` is drawn from a fixed vocabulary (Food & drink, Accessibility, Pool, Spa, Parking, Internet, Location, Comfort, Property conditions, Seasonality, General).
- `confidence` is 0–1; return 1–2 questions per property, prefer highest confidence.
- `signals` is optional but strongly encouraged — surfacing it in the admin dashboard is part of the explainability pitch.

**How to generate these** (all three signals are worth implementing):

**a) Coverage analysis.** For each amenity in `popular_amenities` or `property_amenity_*`, count how many reviews mention it (keyword + embedding similarity). Amenities with zero or stale mentions are candidates.

**b) Category-aware freshness decay.** Apply different half-lives per topic:
- Renovation / construction: 90 days
- Breakfast / food: 365 days
- Policies (pet, check-in): 180 days
- Room size / layout: effectively permanent (no decay)
- Amenity presence (pool, gym): 540 days

Compute a staleness score per topic = `days_since_last_mention / half_life`. Topics above 1.0 are stale.

**c) Contradiction detection.** When reviews on the same topic disagree (aspect-based sentiment analysis), that's often more urgent than a topic with zero mentions.

**LLM generation.** Feed the top gap + property context into `gpt-4o-mini` (cost-sensitive — judges score on feasible ROI):

```
System: You generate a single friendly follow-up question for a hotel reviewer.
        One sentence. Conversational. Easy to answer in voice or text.
        Do NOT ask about things obvious from the listing.

User: Property: {display_name}
      Gap: {target_gap}
      Why it matters: {reason_seed}
      Reviews sampled: {3 excerpts that mention this topic}
```

**Always populate `reason`.** It's the explainability story judges want to see.

**MVP shortcut:** a rule-based gap table per property is totally acceptable. A hand-curated 10-row map of gaps + pre-written questions beats a half-working LLM pipeline. See `mock.ts` for the shape.

### `POST /voice/transcribe` (optional)

The **frontend transcribes in-browser** via Web Speech API (see `src/lib/voice.ts`). This endpoint is a nice-to-have for server-side Whisper:

```ts
// multipart/form-data with field "audio"
// returns: { text: string }

// Node.js sketch:
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/voice/transcribe', upload.single('audio'), async (req, res) => {
  const result = await openai.audio.transcriptions.create({
    file: fs.createReadStream(req.file.path),
    model: 'whisper-1',
  });
  res.json({ text: result.text });
});
```

### `POST /reviews` → `SubmitReviewResult`

Accepts the reviewer's submission, returns the before/after insight.

**Request:**
```ts
interface ReviewSubmission {
  property_id: string;
  overall_rating: number;                   // 1–5
  category_ratings: CategoryInputRatings;   // 1–5 per category
  review_title: string;
  review_text: string;
  smart_question_answers: Record<string, string>; // keyed by SmartQuestion.id
}
```

**Response:**
```ts
interface SubmitReviewResult {
  review_id: string;
  insight_preview: string;                  // the "after" text on the thank-you screen
  fields_updated: string[];                 // e.g. ["breakfast_quality_current"]
}
```

Generate `insight_preview` with one cheap LLM call:

```
System: Given the raw answer below, write ONE short sentence describing how
        the property listing should now describe {target_gap}, in the voice
        of a recent guest ("Guests in 2026 confirm...").

User: {answer}
```

---

## 7. Suggested Node.js stack

- **Express** + **TypeScript**
- **OpenAI SDK** (`openai`) — use `gpt-4o-mini` for all generation (cost-sensitive judging)
- **csv-parse** for CSV loading at startup
- **cors** middleware — frontend on :5173, backend on :3001
- **In-memory data** — no database needed for the hackathon

Skeleton:

```ts
import express from 'express';
import cors from 'cors';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const properties = parse(fs.readFileSync('./data/Description_PROC.csv'), { columns: true });
const reviews = parse(fs.readFileSync('./data/Reviews_PROC.csv'), { columns: true });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/properties/:id', ...);
app.get('/properties/:id/reviews', ...);
app.get('/properties/:id/smart-questions', ...);
app.post('/voice/transcribe', ...);
app.post('/reviews', ...);

app.listen(3001, () => console.log('API on :3001'));
```

---

## 8. Environment

Frontend `.env.local`:
```
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:3001
```

Backend `.env` (gitignored!):
```
OPENAI_API_KEY=sk-...   # from WAIAI. NEVER commit.
PORT=3001
```

**Hackathon rule:** OpenAI keys committed to a public repo are auto-disabled. The `.gitignore` already excludes `.env.local` — keep it that way.

---

## 9. Key files to read first

1. `src/api/types.ts` — **the contract**. Match these shapes exactly.
2. `src/api/mock.ts` — example responses for every endpoint.
3. `src/api/client.ts` — how the frontend calls your backend.
4. `src/pages/ReviewFlow.tsx` — the full reviewer flow.
5. `/Hackathon1/ExtraData/DICTIONARY.md` — official data dictionary.
6. `/Hackathon1/2026 Hack-AI-thon Workbook.pdf` — original brief.

---

## 10. What NOT to change

- React/Vite versions in `package.json` — tested combo.
- The `ApiResult<T>` wrapper in `client.ts` — UI relies on `{ ok: boolean }`.
- Design tokens in `tailwind.config.js` — extracted from Expedia's live CSS and part of the "looks authentic" pitch.

---

## 11. Handoff checklist

- [ ] Backend scaffolded with Express on :3001, CORS enabled for `http://localhost:5173`.
- [ ] CSVs loaded from `/Hackathon1/ExtraData/` at startup.
- [ ] `display_name` synthesized (no `|MASK|` tokens reach the UI).
- [ ] HTML stripped from descriptions, snake_case amenities humanized.
- [ ] `GET /properties/:id` returns a clean `Property`.
- [ ] `GET /properties/:id/reviews` returns 10 recent reviews with ISO dates.
- [ ] `GET /properties/:id/smart-questions` returns 1–2 questions, each with a non-empty `reason`.
- [ ] `POST /reviews` returns a natural `insight_preview` sentence.
- [ ] `.env.local` flipped to `VITE_USE_MOCKS=false`.
- [ ] End-to-end test: load page → leave review → answer smart question → see impact preview.

---

## 12. One-shot AI prompt for the backend

Paste this into your preferred AI coding assistant (Claude, GPT-5, etc.) alongside the frontend `types.ts` and the two CSV files:

> Build a Node.js + TypeScript Express backend for the `ask-what-matters` frontend (types file attached). Load `Description_PROC.csv` (13 rows) and `Reviews_PROC.csv` (~6k rows) at startup. Implement these endpoints: `GET /properties/:id`, `GET /properties/:id/reviews`, `GET /properties/:id/smart-questions`, `POST /reviews`, `POST /voice/transcribe`. Use `gpt-4o-mini` for generation.
>
> Real-world quirks to handle: property names are masked as `|MASK|` tokens — synthesize friendly display names from city + star + first line of description. Descriptions contain `<br>`/`<p>` HTML — strip it. Dates are `M/D/YY` — parse to ISO. Amenity arrays are snake_case — humanize (e.g. `breakfast_included` → "Buffet breakfast included"). The `rating` column is a 15-key JSON blob (0 = not rated) — extract `overall` as the 1–5 rating and aggregate to the 5 UI categories using the mapping in HANDOFF.md §5.
>
> For smart-question generation, implement three signals: coverage gaps (amenities mentioned in listing but not in reviews), category-aware freshness decay (renovation 90d half-life, breakfast 365d, etc.), and contradiction detection. Return 1–2 questions per property with explicit `reason` strings. Keep everything in-memory. CORS enabled for `http://localhost:5173`.

That prompt + the types file will get you 80%+ of the way in one shot.

Good luck. Ship it.
