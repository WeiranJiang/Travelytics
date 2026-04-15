/**
 * Mock data powering the admin dashboard UI.
 * Everything here is static — no backend, no LLM. Placeholder only.
 */

export interface UncertainQuestion {
  id: string;
  text: string;
  property_id: string;
  property_name: string;
  gap_category: string;
  confidence: number; // 0–1
  reason: string;
  status: 'draft' | 'pending_review' | 'approved';
  created_at: string; // ISO
  qualified_user_count: number;
}

export interface QualifiedUser {
  id: string;
  username: string;
  full_name: string;
  initial: string;
  home_city: string;
  property_id: string;
  property_name: string;
  stayed_on: string;
  match_reason: string;
  match_score: number; // 0–1
}

export interface SentQuestion {
  id: string;
  question_text: string;
  sent_to: string;
  sent_to_initial: string;
  property_name: string;
  sent_at: string;
  responded: boolean;
  response_snippet?: string;
}

export interface PropertyUpdate {
  id: string;
  property_name: string;
  field: string;
  before: string;
  after: string;
  applied_at: string;
  source_user: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AnalyticsPoint {
  label: string;
  value: number;
}

/* ---------- Overview tiles ---------- */

export const OVERVIEW_STATS = {
  active_gaps: 24,
  questions_queued: 11,
  answers_today: 47,
  properties_refreshed_7d: 6,
  avg_response_rate_pct: 68,
  avg_time_to_answer_sec: 18,
};

/* ---------- Uncertain questions ---------- */

export const UNCERTAIN_QUESTIONS: UncertainQuestion[] = [
  {
    id: 'uq-001',
    text: 'The listing mentions a lobby renovation — can you confirm whether it affected your check-in experience?',
    property_id: 'prop-02',
    property_name: '4-star Resort in Broomfield, United States',
    gap_category: 'Renovation status',
    confidence: 0.91,
    reason:
      'Property mentions renovation active since Jan 2026. No review in the last 90 days has confirmed its current state.',
    status: 'pending_review',
    created_at: '2026-04-13T09:14:00Z',
    qualified_user_count: 14,
  },
  {
    id: 'uq-002',
    text: 'Were the 2 outdoor pools both open, and was the hot tub in service during your visit?',
    property_id: 'prop-02',
    property_name: '4-star Resort in Broomfield, United States',
    gap_category: 'Pool availability',
    confidence: 0.82,
    reason:
      'Seasonal amenity. 87% of recent reviews ignore pool status. Sentiment contradiction (4 negative, 9 positive) in last 6 months.',
    status: 'pending_review',
    created_at: '2026-04-13T10:02:00Z',
    qualified_user_count: 22,
  },
  {
    id: 'uq-003',
    text: 'How was noise at night — inside the room and from the street?',
    property_id: 'prop-09',
    property_name: 'Boutique Hotel in Rome, Italy',
    gap_category: 'Comfort · Noise',
    confidence: 0.88,
    reason:
      'Noise is a top decision factor in Rome central. Structured rating has 0-fill rate of 94% on this dimension.',
    status: 'approved',
    created_at: '2026-04-12T17:41:00Z',
    qualified_user_count: 31,
  },
  {
    id: 'uq-004',
    text: 'Property conditions have scored lower recently — was anything specific different from the photos?',
    property_id: 'prop-13',
    property_name: '2-star Hotel in Ocala, United States',
    gap_category: 'Listing accuracy',
    confidence: 0.76,
    reason:
      'Property conditions trending down 0.8 points over 12 months. Listing not updated since 2024.',
    status: 'draft',
    created_at: '2026-04-14T11:22:00Z',
    qualified_user_count: 18,
  },
  {
    id: 'uq-005',
    text: 'Did you experience event-day crowds or noise from the racetrack?',
    property_id: 'prop-11',
    property_name: '2-star Hotel in Bell Gardens, United States',
    gap_category: 'Location context',
    confidence: 0.69,
    reason:
      'Los Alamitos racetrack nearby — event impact not captured in any structured field.',
    status: 'draft',
    created_at: '2026-04-14T12:48:00Z',
    qualified_user_count: 9,
  },
  {
    id: 'uq-006',
    text: 'Was the Wi-Fi fast enough for video calls?',
    property_id: 'prop-04',
    property_name: '3-star Hotel in San Isidro de El General, Costa Rica',
    gap_category: 'Internet',
    confidence: 0.72,
    reason:
      'Remote-worker segment growing. Wi-Fi quality not in structured schema; last text mention 14 months old.',
    status: 'pending_review',
    created_at: '2026-04-14T08:11:00Z',
    qualified_user_count: 7,
  },
];

/* ---------- Qualified users (matched to gaps) ---------- */

export const QUALIFIED_USERS: QualifiedUser[] = [
  {
    id: 'qu-1',
    username: 'sarahc',
    full_name: 'Sarah Chen',
    initial: 'S',
    home_city: 'San Francisco, USA',
    property_id: 'prop-02',
    property_name: '4-star Resort in Broomfield, United States',
    stayed_on: '2026-04-03',
    match_reason: 'Stayed within 7 days; trip type matches Family cohort.',
    match_score: 0.94,
  },
  {
    id: 'qu-2',
    username: 'marcusj',
    full_name: 'Marcus Johnson',
    initial: 'M',
    home_city: 'Atlanta, USA',
    property_id: 'prop-09',
    property_name: 'Boutique Hotel in Rome, Italy',
    stayed_on: '2026-04-05',
    match_reason: 'Stayed during weekend; historically leaves detailed text reviews.',
    match_score: 0.89,
  },
  {
    id: 'qu-3',
    username: 'priyap',
    full_name: 'Priya Patel',
    initial: 'P',
    home_city: 'London, UK',
    property_id: 'prop-09',
    property_name: 'Boutique Hotel in Rome, Italy',
    stayed_on: '2026-04-04',
    match_reason: 'Room facing street — directly relevant to noise gap.',
    match_score: 0.92,
  },
  {
    id: 'qu-4',
    username: 'diegor',
    full_name: 'Diego Ramirez',
    initial: 'D',
    home_city: 'Mexico City, Mexico',
    property_id: 'prop-04',
    property_name: '3-star Hotel in San Isidro de El General, Costa Rica',
    stayed_on: '2026-04-01',
    match_reason: 'Extended stay (5+ nights); tagged as business traveler.',
    match_score: 0.87,
  },
  {
    id: 'qu-5',
    username: 'emmaw',
    full_name: 'Emma Williams',
    initial: 'E',
    home_city: 'Sydney, Australia',
    property_id: 'prop-02',
    property_name: '4-star Resort in Broomfield, United States',
    stayed_on: '2026-04-02',
    match_reason: 'Booked pool-facing room; Family trip type.',
    match_score: 0.91,
  },
  {
    id: 'qu-6',
    username: 'hiroshit',
    full_name: 'Hiroshi Tanaka',
    initial: 'H',
    home_city: 'Tokyo, Japan',
    property_id: 'prop-11',
    property_name: '2-star Hotel in Bell Gardens, United States',
    stayed_on: '2026-03-31',
    match_reason: 'Stayed during race weekend — event impact directly observable.',
    match_score: 0.95,
  },
];

/* ---------- Sent questions (history) ---------- */

export const SENT_QUESTIONS: SentQuestion[] = [
  {
    id: 'sent-1',
    question_text: 'Were the 2 outdoor pools both open during your visit?',
    sent_to: 'sarahc',
    sent_to_initial: 'S',
    property_name: '4-star Resort in Broomfield',
    sent_at: '2026-04-13T14:12:00Z',
    responded: true,
    response_snippet:
      'Only the main pool was open — the kids pool had a sign saying "closed for maintenance until May."',
  },
  {
    id: 'sent-2',
    question_text: 'How was noise at night in your room?',
    sent_to: 'priyap',
    sent_to_initial: 'P',
    property_name: 'Boutique Hotel in Rome',
    sent_at: '2026-04-13T16:45:00Z',
    responded: true,
    response_snippet:
      'Surprisingly quiet — we were on the courtyard side. Street-facing rooms may be different.',
  },
  {
    id: 'sent-3',
    question_text: 'Is the lobby renovation finished?',
    sent_to: 'emmaw',
    sent_to_initial: 'E',
    property_name: '4-star Resort in Broomfield',
    sent_at: '2026-04-14T09:02:00Z',
    responded: false,
  },
  {
    id: 'sent-4',
    question_text: 'Wi-Fi speed enough for video calls?',
    sent_to: 'diegor',
    sent_to_initial: 'D',
    property_name: '3-star Hotel in Costa Rica',
    sent_at: '2026-04-14T10:31:00Z',
    responded: true,
    response_snippet: 'Zoom calls worked fine. ~25 Mbps down. Occasionally dropped around 9pm.',
  },
  {
    id: 'sent-5',
    question_text: 'Event-day noise from racetrack?',
    sent_to: 'hiroshit',
    sent_to_initial: 'H',
    property_name: '2-star Hotel in Bell Gardens',
    sent_at: '2026-04-14T11:15:00Z',
    responded: false,
  },
];

/* ---------- Property updates (the output of the loop) ---------- */

export const PROPERTY_UPDATES: PropertyUpdate[] = [
  {
    id: 'pu-1',
    property_name: '4-star Resort in Broomfield',
    field: 'pool_status',
    before: '2 outdoor pools available.',
    after: 'Main pool open year-round; kids pool closed for maintenance through May 2026.',
    applied_at: '2026-04-13T15:00:00Z',
    source_user: 'sarahc',
    confidence: 'high',
  },
  {
    id: 'pu-2',
    property_name: 'Boutique Hotel in Rome',
    field: 'noise_profile',
    before: 'Noise level not documented.',
    after:
      'Courtyard-facing rooms reported as quiet; street-facing rooms may vary. Ask at check-in for room assignment.',
    applied_at: '2026-04-13T17:30:00Z',
    source_user: 'priyap',
    confidence: 'medium',
  },
  {
    id: 'pu-3',
    property_name: '3-star Hotel in Costa Rica',
    field: 'wifi_quality',
    before: 'Free WiFi available.',
    after: 'Free WiFi, ~25 Mbps verified by recent guest. Suitable for video calls; may slow after 9pm.',
    applied_at: '2026-04-14T11:15:00Z',
    source_user: 'diegor',
    confidence: 'medium',
  },
];

/* ---------- Analytics ---------- */

export const ANSWERS_PER_DAY: AnalyticsPoint[] = [
  { label: 'Apr 8', value: 12 },
  { label: 'Apr 9', value: 18 },
  { label: 'Apr 10', value: 22 },
  { label: 'Apr 11', value: 31 },
  { label: 'Apr 12', value: 28 },
  { label: 'Apr 13', value: 39 },
  { label: 'Apr 14', value: 47 },
];

export const GAP_CATEGORIES: AnalyticsPoint[] = [
  { label: 'Renovation status', value: 8 },
  { label: 'Pool / wellness', value: 6 },
  { label: 'Noise / comfort', value: 5 },
  { label: 'Wi-Fi / internet', value: 4 },
  { label: 'Parking', value: 3 },
  { label: 'Breakfast', value: 3 },
  { label: 'Accessibility', value: 2 },
];

export const RESPONSE_CHANNEL: AnalyticsPoint[] = [
  { label: 'Voice', value: 62 },
  { label: 'Text', value: 38 },
];

export const PROPERTY_FRESHNESS: AnalyticsPoint[] = [
  { label: 'Broomfield', value: 98 },
  { label: 'Rome', value: 94 },
  { label: 'Pompei', value: 81 },
  { label: 'Frisco', value: 88 },
  { label: 'Ocala', value: 46 },
  { label: 'Bell Gardens', value: 62 },
];
