# MyLink

## Start

Run `npm install`, copy `.env.example` to `.env.local`, fill in the Firebase
configuration, and run `npm run dev`. Both login and link management use `/`.
The legacy `/mypage` path redirects there. Enable Google sign-in in Firebase
Authentication and add localhost/deployed hosts to Authorized domains.

## Firestore structure

Only these two paths are used:

`users/{uid}` stores `email`, `username`, `displayname`, `bio`, `avatarUrl`,
and `createdAt`. Profile edits can also set `updatedAt`.

`users/{uid}/links/{linkId}` stores each link's title, description, URL, icon,
visibility, sort order, and server-generated creation timestamp.

- `username`: person's name, displayed prominently; duplicate names are allowed.
- `displayname`: identifier shown as `@displayname` and used in `/{displayname}`.
  It starts with the email prefix and cannot be edited after assignment.
- `bio`: introduction, up to 500 characters.

Login creates only the user's document if missing. Existing email, photo and
signup date are preserved. Legacy name fields are migrated in place when needed.
The previous `handles`, `publicProfiles`, and `profile` subcollections are no
longer read or written. Existing remote documents in those collections are left
untouched; they can be removed separately if desired.

## Public profiles and identifier checks

The public page queries `users` by `displayname`, then reads that UID's links.
Visible links are displayed newest first; unsafe URLs are filtered out. Missing,
invalid or ambiguous identifiers return 404. Profile titles and descriptions are
also used in Open Graph and Twitter metadata.
Header navigation and profile URL copying use the current identifier.

## SEO metadata

The home page and public profiles provide page-specific titles, descriptions,
canonical URLs, Open Graph and Twitter metadata. Profile metadata uses the
saved name, identifier and bio. The stats page and legacy preview route are
marked noindex; `/mypage` continues to redirect to `/`.

`/robots.txt` allows crawlers to read page indexing directives and points to
`/sitemap.xml`. The sitemap lists the home page only; public profiles can be
discovered through links to their shared URLs. Set `NEXT_PUBLIC_SITE_URL` to
the production origin so canonical and sitemap URLs use the correct domain.

## Social sharing images

File-based `opengraph-image.tsx` and `twitter-image.tsx` at the app root provide
the shared 1200 × 630 PNG for general pages. The files in `[displayname]` override
them with the user's name, handle, bio, avatar and up to three visible links.
Profile images are rendered per request, so profile edits appear on the next
image request; social platforms may keep their own cached previews. Invalid or
missing profiles return 404, and Firestore failures remain server errors.

Pretendard SemiBold and its OFL license are bundled in `src/assets/fonts` for
offline Korean text rendering. Google sign-in avatars are embedded when
available; unavailable or unsupported avatars fall back to the name's initial.

Set `NEXT_PUBLIC_SITE_URL` to the deployed public origin before building
(for example `https://your-domain.com`). Without it, Vercel uses
`VERCEL_PROJECT_PRODUCTION_URL`; local development falls back to
`http://localhost:3000`.

Identifier availability is queried only during initial assignment. Once assigned,
`displayname` is read-only in the UI, stripped from profile-update payloads, and
protected by a Security Rules update condition. Account-document deletion is
also denied to prevent changing the identifier through deletion/recreation.
Initial query-based assignment is not an atomic global uniqueness constraint.

## Security rules

Publish `firestore.rules` through the Firebase console. The rules have exactly
two matches: `users/{userId}` and `users/{userId}/links/{linkId}`.
Anyone can read them; only a signed-in user whose UID matches the path can write.
An assigned profile identifier cannot be changed, and the account document cannot
be deleted. Links remain editable and deletable by their owner.
This includes public access to stored emails and links marked `visible: false`;
the page visibility filter is a presentation setting, not a security boundary.
Unlisted collections are denied by default.

The application code is intentionally limited to those two paths. No extra
handle lookup or public-profile permissions are needed.

## Queries and optimistic updates

TanStack Query owns server data; Zustand keeps authentication and theme.
Profile confirmation updates the cache and closes the inline editor without
waiting for the network. Saving happens in the background; errors restore the
previous values and show a Sonner toast. Link writes keep their existing UI until
the server write and list refresh finish. There is no realtime subscription.

## Tests

- `npm test`: application tests with mocked Firebase transport.
- `npm run lint`: ESLint.
- `npm run build`: production build and type checking.
- `npm run test:rules`: rules tests when `FIRESTORE_EMULATOR_HOST` points to a
  local emulator (Java 21). The demo project is `demo-mylink-rules`; no production
  data is touched. Example with Firebase CLI installed:

`firebase emulators:exec --only firestore --project demo-mylink-rules "npm run test:rules"`

## Development server network access

Public pages require outbound Firestore access from the server process. If it
logs `connect EACCES` and Firebase reports "client is offline", restart the dev
server with network access permitted. Network errors are not converted to 404.

Streaming metadata is disabled via `htmlLimitedBots: /.*/` to avoid a known
browser-extension DOM injection conflict. Disable the responsible extension on
localhost if it still injects `data-wxt-integrated` / `__endic_crx__` elements.

## Site favicons

Management and public link cards load the destination origin's `/favicon.ico`.
If that fails, the component tries Google's favicon service using the origin
only, then shows a globe if neither image loads. Link paths, query strings and
credentials are not sent to the fallback service. Existing links pick up their
favicon without rewriting stored link documents.
