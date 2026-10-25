# MyLink

Manage personal links at `/` and share a public profile at `/{displayname}`.

## Local development

Run `npm install`, copy `.env.example` to `.env.local`, fill in the Firebase
web configuration, and run `npm run dev`. The existing local environment targets
`mylink-1e58b`. Environment values prefixed with `NEXT_PUBLIC_` are public web
configuration, bundled at build time. Restart/rebuild after changing them.

## Authentication and profiles

Enable Google under Firebase Authentication and authorize localhost and the
production domain. `onAuthStateChanged` owns login state; logout clears account
queries. The legacy `/mypage` URL redirects to `/`.

- `username`: the person's large displayed name; editable, duplicates allowed.
- `displayname`: the unique identifier shown as `@displayname` and used in the
  profile URL. Defaults to the email prefix, is lowercased, and accepts 1–40
  letters/numbers/dots/underscores/hyphens. Reserved application paths are rejected.
- `bio`: editable introduction, up to 500 characters.

Click any of those displayed fields to edit in place. Confirmation automatically
checks handle ownership in the save transaction; there is no separate check button.
Legacy `displayName` values are migrated to `username` on the next authenticated
profile load. Existing email, photo, and signup date are preserved. If the initial
email-prefix handle belongs to another user, initialization uses a UID-based suffix.

Private documents live at `users/{uid}` and links at `users/{uid}/links/{linkId}`.
`createdAt` is a server timestamp set on first signup. Profile edits preserve it.
The previous anonymous link collection is not copied automatically.

## Public pages and rules

A transaction reserves `handles/{displayname}` with the owner's UID, saves the
private profile, and publishes a projection at `publicProfiles/{uid}` containing
only UID, username, displayname, bio and avatarUrl. A handle change releases the
old reservation. Email is never included in the public projection or rendered UI.

The dynamic route looks up the handle, then reads the public profile and visible
links from `users/{uid}/links`. Links are shown newest first; unsafe URLs and
hidden links are omitted. Missing or invalid handles return 404. No profile-specific
metadata is generated. A direct public-page button sits immediately left of the account menu.
The dropdown contains only profile URL copying and sign-out. Copying reports
through top-center Sonner toasts.

**Publish the updated `firestore.rules` before using public pages or handle changes.**
The file allows public reads only of handle lookups, public projections, and visible
links, while private user documents and writes remain owner-only. `firebase.json`
points to these rules. With an authenticated Firebase CLI:

`firebase deploy --only firestore:rules --project mylink-1e58b`

The app does not automatically publish security rules. An account must load once
to initialize/migrate its handle and public projection before its page is available.

## Queries, mutations and optimistic updates

TanStack Query owns profile/link data, deduplicated reads, and per-account/session
caches. Zustand keeps authentication and theme only. Polling, focus refreshes and
reconnect refreshes are disabled; links are loaded on entry and refreshed after writes.
Link editing and deletion keep their existing UI until write and list refresh finish.

Profile confirmation updates the query cache synchronously, closes the inline editor
immediately after that cache change, and persists in the background. No network
response is required to display the new name/identifier/bio. A failed save restores
the previous cache and shows an error toast; a successful save revalidates the data.
Durable Firestore storage still requires a successful server write.

## Validation

`npm test` uses real Zod and TanStack Query with mocked Firebase transport. It
covers validation, handle conflicts, migrations, visible public links, optimistic
cache updates before network completion, rollback and account-cache isolation.
`npm run lint` and `npm run build` validate lint, types, and routes.

## Browser extension compatibility

`htmlLimitedBots: /.*/` disables streaming metadata to avoid the reported extension
injection into Next.js' hidden metadata wrapper. Future asynchronous metadata can
therefore delay the initial response. If an extension still injects
`data-wxt-integrated` / `__endic_crx__`, disable it on localhost and reload.

### Local server network access

Server-rendered public profiles require outbound HTTPS access to Firestore.
If a managed development server logs `connect EACCES` followed by a misleading
Firebase "client is offline" error, restart that server with network access
permitted. The browser can remain online while the server process is blocked.
Do not convert those network errors to missing-profile 404 responses.
