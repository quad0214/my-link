This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Firebase

Install dependencies with `npm install`, copy `.env.example` to `.env.local`, and
fill in the Firebase web app configuration. `.env.local` is ignored by Git.
The local setup already contains the configuration for `mylink-1e58b`.

`src/lib/firebase.ts` exports the shared Firebase `app` and
`getFirebaseAnalytics()`. The root layout initializes Analytics after mounting in
a supported browser; it is skipped during server rendering and when
`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is empty.

```ts
import { app, getFirebaseAnalytics } from "@/lib/firebase";
```

Set the same environment variables in your deployment environment **before
building**, and restart the development server after changing `.env.local`.
`NEXT_PUBLIC_*` values are included in the browser bundle: Firebase web
configuration is public client configuration, not a server secret. Access to
Firebase data must be controlled using Firebase Security Rules.

References: [Firebase web setup](https://firebase.google.com/docs/web/setup),
[Analytics browser support](https://firebase.google.com/docs/reference/js/analytics#issupported).

### Google login and personal profiles

Both the signed-out screen and signed-in link manager are served at `/`.
The legacy `/mypage` route redirects to `/`; logging in does not change the URL.
The header uses Firebase Google sign-in and an account dropdown for preview,
link copying, and sign-out. Preview opens `/u/{uid}` in a new tab, currently
returning 404. Link copying currently writes the fixed URL `http://localhost:3000`
to the clipboard and shows a Sonner success/error toast at the top center. An `onAuthStateChanged`
observer is the source of authentication state. Signed-out visitors see a login
prompt, and do not query or modify Firestore links. Account changes clear the
previous account's data and discard stale asynchronous responses. Editing UI is
remounted for each authenticated session.

Before testing Google login in the Firebase console for `mylink-1e58b`:

1. Enable **Authentication > Sign-in method > Google** and select a support email.
2. Add `localhost` and your deployed hostname under **Authentication > Settings >
   Authorized domains**.
3. Publish the owner-only rules from `firestore.rules` in **Firestore > Rules**.
   With an authenticated Firebase CLI, the equivalent command is:
   `firebase deploy --only firestore:rules --project mylink-1e58b`.

`firebase.json` points to the prepared rules. They allow access to a user's own
profile and links only; this code change does not deploy them automatically.
Client-side UID checks alone do not enforce server-side data privacy.

On login (including restored sessions), a Firestore transaction creates a missing
`users/{uid}` document with `displayName` (the email prefix before `@`), `email`,
`avatarUrl`, and a server-generated `createdAt`. Existing documents are never
rewritten, so their information and signup date survive repeated logins and
concurrent tabs. The screen initially uses the email prefix, Google photo and email. Optional profile fields
`displayName`, `username`, `bio`, and `avatarUrl` in `users/{uid}` override the
Google display defaults. A stored email is displayed when present, otherwise Firebase Auth supplies it.
A failed profile creation/read shows a notice and keeps the account defaults.

### Firestore links

Every read, add, edit, and delete uses `users/{user.uid}/links/{linkId}`.
Existing `users/anonymous/links` data is left untouched and is not automatically
copied into a signed-in account. This page manages private account data; it is
not a public profile sharing route.

Each link stores `type`, `title`, `description`, `url`, `icon`, `visible`,
`sortOrder`, and a server-generated `createdAt`. The document ID is used as the
link ID. On page load, a one-time query reads `users/{user.uid}/links` ordered by
`createdAt` descending (newest first). After a successful link add, edit, or deletion, the list is
fetched again. There is no realtime subscription. Documents must have a
`createdAt` field to appear in this query. Failed writes keep the form open for
retry; read failures show a retry button. If the save succeeds but reloading
fails, only the read error is shown so retrying does not create duplicate links.

Each card always shows edit and delete controls. Editing happens inline and uses
the same form and validation as adding a link (required title up to 50 characters,
HTTP(S) URL, optional description up to 100 characters). Updates retain the
document ID and `createdAt`, and set a server-generated `updatedAt`. Deleting
requires confirmation displaying the link name and an irreversible-action warning.
Failed operations keep the editor or dialog open for retry.

References: [Add Firestore data](https://firebase.google.com/docs/firestore/manage-data/add-data),
[Order Firestore data](https://firebase.google.com/docs/firestore/query-data/order-limit-data).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Link management tests

Run `npm test` to verify shared validation, document updates/deletes,
refresh behavior, auth observation, signed-out guards, account switching, stale
response rejection, and failure recovery with mocked Firebase transports.
These automated tests do not modify the live Firebase project.

### Browser extension hydration conflicts

`next.config.ts` disables metadata streaming with `htmlLimitedBots: /.*/`.
This removes the hidden metadata wrapper targeted by the reported extension
injection (`data-wxt-integrated` / `__endic_crx__`). Metadata resolves before
rendering, so future asynchronous metadata can delay the initial response.
If a hydration error still mentions these injected elements, disable the
responsible extension for localhost and reload. This setting cannot prevent
extensions from modifying other parts of the document.
