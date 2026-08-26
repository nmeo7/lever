# Lever

A lightweight, AI-enabled ERP with a built-in CRM and customer-facing sales portal. Designed for small-to-medium organizations that want a single system for managing customers, orders, inventory, people, assets, and workflows — with an AI layer for customer intelligence.

## Modules

| Module           | What it covers                                                        |
| ---------------- | --------------------------------------------------------------------- |
| **CRM**          | Customers, conversation history, AI-generated memories                |
| **Commerce**     | Orders, products, inventory, payments, suppliers                      |
| **ERP**          | People, assets, operations, jobs, financial timeline                  |
| **Sales Portal** | Public-facing frontdesk; browse without login, checkout requires auth |

## Architecture

- **Frontend** — React + Tailwind, organized by feature. Reads Firestore directly for public data (products, org config). Uses TanStack Query for server state.
- **Firebase Functions** — handles everything that must be atomic or server-side: order placement, payment recording, inventory movements, JWT auth, and AI calls.
- **Firestore** — flat top-level collections (`customers`, `orders`, `products`, etc.). Customer memories use a subcollection; order items are embedded in the order document.
- **Auth** — custom JWT (no Firebase Auth). Login calls the `auth-login` function, which returns a signed token stored in `localStorage`.
- **Theming** — the org document's `brandIdentity.template` field controls the active theme (`empathy` or `winter`). Themes swap CSS variables at runtime; no page reload needed.

## Prerequisites

- Node 20+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project with Firestore and Cloud Functions enabled

## Setup

### 1. Clone and install

```bash
# frontend
npm install

# functions
cd functions && npm install && cd ..
```

### 2. Configure Firebase

Edit `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your actual project ID.

Fill in `.env.local` with your Firebase web app config (find it in Firebase Console → Project Settings → Your apps):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Optionally set `VITE_ORG_ID` if your organization document uses a specific ID (defaults to `"default"`).

### 3. Set the JWT secret

Functions use a secret for signing auth tokens. Set it via Firebase Secret Manager:

```bash
firebase functions:secrets:set JWT_SECRET
```

Enter a strong random string when prompted (e.g. output of `openssl rand -base64 32`).

Functions also use `FIELD_ENCRYPTION_KEY` to encrypt sensitive fields (e.g. document content) at rest with AES-256-GCM. Set it the same way, with a 32-byte hex string:

```bash
firebase functions:secrets:set FIELD_ENCRYPTION_KEY
```

Enter the output of `openssl rand -hex 32` when prompted.

### 4. Seed the settings document

Create a document at `erp-settings/config` in Firestore with at minimum:

```json
{ "openai_api_key": "sk-...", "openai_model": "gpt-4o-mini" }
```

This is the default config used when a company doesn't have its own override. A company can override any of these keys by setting a `config` map on its `erp-companies/{slug}` document. The key is only read server-side by Functions — it never leaves Firebase.

### 5. Create the first user

Create a document in the `users` collection:

```json
{ "email": "admin@example.com", "passwordHash": "<sha256 of your password>", "role": "admin", "isActive": true, "personId": "" }
```

You can generate a SHA-256 hash with:

```bash
echo -n "yourpassword" | shasum -a 256
```

## Running locally

### Frontend only

```bash
npm run dev
```

Runs at `http://localhost:5173`. Connects to your live Firebase project.

### Full stack with emulators

```bash
firebase emulators:start
```

Starts Firestore (8080), Functions (5001), Storage (9199), Hosting (5000), and the Emulator UI.

Point the frontend at the emulators by adding to `.env.local`:

```env
VITE_USE_EMULATORS=true
```

Then update [src/firebase.js](src/firebase.js) to call `connectFirestoreEmulator`, `connectFunctionsEmulator`, etc. when that flag is set.

## Deploying

```bash
# deploy everything
firebase deploy

# frontend only
npm run build && firebase deploy --only hosting

# functions only
firebase deploy --only functions
```

## Pricing

Usage is billed per task completed, not per seat. Organizations pay only for what gets done — there are no per-user license fees. A "task" is a discrete unit of work completed through the system (an order fulfilled, a job closed, an operation run to completion). Admins can track task volume in the financial timeline module.

## Themes

Two templates ship out of the box:

| Template  | Palette                                                            |
| --------- | ------------------------------------------------------------------ |
| `empathy` | Soft purple, warm backgrounds — good for service/care businesses   |
| `winter`  | Sky blue, cool backgrounds — good for tech/professional businesses |

Set `brandIdentity.template` in the org document to switch. New themes can be added in [src/themes/](src/themes/).
