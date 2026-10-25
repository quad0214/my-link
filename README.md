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
