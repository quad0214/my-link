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

### Firestore links

Links are stored as documents at `users/anonymous/links/{linkId}`. All visitors
currently share the fixed `anonymous` document; this is not a Firebase Auth UID.
Profile details still come from the mock profile, while the link list comes only
from Firestore (mock links are not seeded).

Enable the default Cloud Firestore database in the Firebase console and configure
Security Rules to permit the intended reads, creates, updates, and deletes at that path. This
repository does not deploy rules or change the project's access permissions.

Each link stores `type`, `title`, `description`, `url`, `icon`, `visible`,
`sortOrder`, and a server-generated `createdAt`. The document ID is used as the
link ID. On page load, a one-time query reads `users/anonymous/links` ordered by
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
refresh behavior, and failure recovery with a mocked Firestore transport.
These automated tests do not modify the live Firebase project.

### Browser extension hydration conflicts

`next.config.ts` disables metadata streaming with `htmlLimitedBots: /.*/`.
This removes the hidden metadata wrapper targeted by the reported extension
injection (`data-wxt-integrated` / `__endic_crx__`). Metadata resolves before
rendering, so future asynchronous metadata can delay the initial response.
If a hydration error still mentions these injected elements, disable the
responsible extension for localhost and reload. This setting cannot prevent
extensions from modifying other parts of the document.
