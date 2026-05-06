# Stage 6 — Priority Inbox (Top 10)

## What this is
A runnable Node.js script that:
1. Fetches unread notifications using the provided Notification API (REST).
2. Computes a priority score using:
   - weight: Placement > Result > Event
   - recency: newer `createdAt` ranks higher
3. Prints the top 10 notifications to stdout.

## Run
Set your Notification API base URL and access token:

### Option A: via env vars
```bash
set NOTIF_API_BASE_URL=http://localhost:3000
set NOTIF_ACCESS_TOKEN=Bearer <token>
node stage6_priority_inbox/priority_inbox.js
```

### Option B: edit defaults in code
Open `stage6_priority_inbox/priority_inbox.js` and set:
- `DEFAULT_BASE_URL`
- `TOKEN`

## Expected REST response shape
This script supports one of these common response formats:
- `{ items: [...] }`
- `{ notifications: [...] }`
- `[...]` (array)

Each notification object is expected to have at least:
- `id`
- `createdAt`
- `type` or `notificationType`
- optional: `title`, `message`, `vehicleId`, `depotId`

## Priority scoring
```text
priorityScore = weight * 1e12 + recencyMillis
```

So weight dominates, recency breaks ties.

