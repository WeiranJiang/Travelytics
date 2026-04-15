# Demo Accounts — Ask What Matters

Share this file with anyone who wants to try the prototype.

## Admin account (sees the admin dashboard)

| Username | Password | Name |
|---|---|---|
| `admin` | `admin2026` | Alex Kim (Admin) |

Signing in as admin takes you to a different view: a full operations dashboard with uncertain questions, qualified users, sent questions, user responses, property update log, analytics, and a floating AI assistant in the corner.

## Guest accounts (traveler flow)

**Password (all guest accounts):** `travel2026`

| # | Username | Full name | Home city |
|---|---|---|---|
| 1 | `sarahc` | Sarah Chen | San Francisco, USA |
| 2 | `marcusj` | Marcus Johnson | Atlanta, USA |
| 3 | `priyap` | Priya Patel | London, UK |
| 4 | `diegor` | Diego Ramirez | Mexico City, Mexico |
| 5 | `emmaw` | Emma Williams | Sydney, Australia |
| 6 | `hiroshit` | Hiroshi Tanaka | Tokyo, Japan |
| 7 | `ameliab` | Amelia Brown | Toronto, Canada |
| 8 | `khalidh` | Khalid Hassan | Dubai, UAE |
| 9 | `sofiar` | Sofia Rossi | Milan, Italy |
| 10 | `liamo` | Liam O'Connor | Dublin, Ireland |

## How to sign in

1. Open the prototype in your browser.
2. Click **Sign in** in the top-right of the header.
3. Enter a username (e.g. `sarahc`) and the password `travel2026`.
4. You stay signed in across page refreshes until you click the logout icon.

## What signing in unlocks

- Your name and initial appear on any review you submit.
- The review you leave is persisted (locally in your browser) and shown at the top of that property's review list — so other demo viewers on your same browser will see it.
- Clicking "Leave a review" without signing in prompts you to sign in first.

## Security note

These are demo credentials for a hackathon prototype. Passwords are stored in plaintext inside `src/api/data-users.json`. **Do not reuse these passwords anywhere real.** When the Node.js backend is wired up, the teammate will replace this with real hashed credentials.

## Resetting local state

If your browser has submitted reviews or a stored session you want to clear, open DevTools console and run:

```js
localStorage.removeItem('awm:submitted_reviews')
localStorage.removeItem('awm:auth_user')
```

Then refresh the page.
