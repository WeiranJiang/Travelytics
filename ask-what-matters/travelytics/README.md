# Travelytics: Adaptive Review Intelligence Engine

Travelytics is a closed-loop adaptive review intelligence engine designed to systematically find the most valuable missing information (gaps) about a property, and intelligently extract that information from guests. 

## 🏗️ Architecture: The Four Stages

### Stage 1: Gap Detection Engine (Core Implemented)
A mathematically weighted composite score per property × topic that operates largely offline to preserve speed and reduce API costs. It utilizes six powerful signals:
* **Temporal decay:** Exponential half-life per dimension (25%)
* **Free-text gaps:** Keyword taxonomy + tokenization (20%)
* **Controversy:** Lexicon sentiment variance (20%)
* **Cluster benchmark:** KMeans + z-score vs. peers (15%)
* **Listing vs. reality:** Amenity mention rate vs. description (10%)
* **Sentiment drift:** Sliding window sentiment delta (10%)

### Stage 2: Question Generation (Partially Implemented)
Pulls the top unanswered gaps for a given property and queries an LLM to generate targeted, contextual questions. 
* *Current state*: We have the baseline `smart-questions` endpoint and gap compatibility pairings (`gapCompatibility.ts`).

### Stage 3: Gap Score Update (Missing)
The ingestion of new answers. Incoming responses must be scored on quality (specificity, relevance, marginal value, sentiment clarity). High-quality answers automatically lower the gap severity.

### Stage 4: Full-Stack Web App (Core Implemented)
* **User View:** Hotel browsing, dynamic routing `/hotels/[id]`, review submission. 
* **Admin View:** Gap heatmap per hotel, urgency queues, and pipeline tracking.
* **Multilingual Translation:** Pipeline captures non-English reviews natively via `franc-min` and batches them to OpenAI's GPT-4o-mini endpoint to ensure accurate NLP keyword weighting natively in English.

---

## 🚀 Missing Functionalities & Roadmap

Based on the current codebase, here are the highest-ROI functionalities remaining. They have been broken out into **highly independent tasks** so multiple engineers can work on them in parallel without causing Git merge conflicts.

### 👤 Allocation 1: Smart Answer Extraction (Backend / AI)
**Goal:** Replace fragile keyword/regex answer parsing with intelligent LLM structuring.
* **Description:** When a user dictates a voice response or types a free-text review, use GPT-4o-mini to extract a strict JSON payload (`topic`, `sentiment`, `structured_score`, `key_insight`). Only trigger if length > 15 words.
* **Why it's independent:** Will purely involve creating an isolated `/api/extract-answer` route and an isolated `src/lib/intelligence/extraction.ts` helper. Does not touch UI.
* **Priority:** High.

### 👤 Allocation 2: Admin Dashboard Gap Summarization (Frontend / AI)
**Goal:** Translate raw matrix tables into executive natural language summaries on the Admin Dashboard.
* **Description:** Fetch the top 5 gap scores and drift parameters and pass them through a prompt (e.g., *"Broomfield Resort has strong coverage on cleanliness but critical gaps in post-renovation spa experience..."*). Cache for 24h.
* **Why it's independent:** Isolated purely to `src/app/admin/page.tsx` and an independent fetching hook/API route. Does not touch the core database schema or ingestion pipelines.
* **Priority:** Medium-High (Massive demo/presentation impact).

### 👤 Allocation 3: Stage 3 Continuous Gap Feedback Loop (Database / Backend)
**Goal:** Make the gap scores react natively to new reviews.
* **Description:** Create a webhook or Cron job that takes newly submitted structured responses and recalculates/updates the Database gap matrix. 
* **Why it's independent:** It modifies entirely different Prisma models (e.g., `PropertyFinalGap` write logic vs read logic) and hooks into `sync.ts` isolated mutations.
* **Priority:** Medium.

### 👤 Allocation 4: Smart Question Caching & User Context (Frontend)
**Goal:** Optimize Question Generation API efficiency.
* **Description:** Implement indefinite caching for generated questions, and modify the request object to include user traits (e.g., detecting if a user is a pet owner and filtering questions accordingly).
* **Why it's independent:** Confined strictly to caching layers on the frontend API proxy or `smart-questions` route.
* **Priority:** Medium.

---

## 🛠 Setup & Installation

**Prerequisites:** Node.js, Prisma, SQLite, and an active OpenAI API Key.

1. **Install dependencies:**
   \`\`\`bash
   npm install --legacy-peer-deps
   \`\`\`

2. **Environment Variables:**
   Create a \`.env\` file in the workspace root:
   \`\`\`env
   DATABASE_URL="file:./dev.db"
   OPENAI_API_KEY="sk-proj-..."
   \`\`\`

3. **Database Push:**
   Synchronize the SQLite file with the Prisma Schema.
   \`\`\`bash
   npx prisma db push
   \`\`\`

4. **Data Ingestion & Translation:**
   Import standard rows and subsequently run the translation backfill.
   \`\`\`bash
   npx tsx scripts/import-data.ts
   npx tsx scripts/backfill-translations.ts
   \`\`\`

5. **Start Dev Server:**
   \`\`\`bash
   npm run dev
   \`\`\`
