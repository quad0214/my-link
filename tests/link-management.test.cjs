/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

// Compile the application modules with their real Zod/Zustand dependencies and
// substitute only Firestore transport. These tests never touch the live project.
function loadModule(relativePath, imports = {}) {
  const filename = path.join(__dirname, "..", relativePath);
  const compiledModule = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const execute = new Function("module", "exports", "require", outputText);
  execute(compiledModule, compiledModule.exports, (name) => imports[name] ?? require(name));
  return compiledModule.exports;
}

const validation = loadModule("src/lib/link-validation.ts");
const profileValidation = loadModule("src/lib/profile-validation.ts");
const values = { title: "기존 링크", url: "https://example.com", description: "설명" };

function fixture() {
  const documents = new Map([["existing", {
    ...values, type: "link", icon: "github", visible: true, sortOrder: 7, createdAt: 100,
  }]]);
  const auth = { currentUser: { uid: "test-user", displayName: "테스트", email: "test@example.com", photoURL: null } };
  const state = { reads: 0, writes: 0, failRead: false, failWrite: false, lastPath: null };
  const firestore = {
    collection: (_db, ...segments) => {
      assert.equal(segments.join("/"), "users/" + auth.currentUser.uid + "/links");
      return segments.join("/");
    },
    doc: (collection, id) => {
      state.lastPath = collection + "/" + id;
      return id;
    },
    orderBy: (field, direction) => {
      assert.equal(field, "createdAt"); assert.equal(direction, "desc");
      return "newest";
    },
    query: (collection, order) => {
      assert.equal(order, "newest"); return collection;
    },
    getDocs: async () => {
      const capturedDocuments = [...documents.entries()].map(([id, data]) => [id, { ...data }]);
      state.reads++;
      state.readStarted?.();
      if (state.readGate) await state.readGate;
      if (state.failRead) throw new Error("read-denied");
      return { docs: capturedDocuments.sort((a, b) => b[1].createdAt - a[1].createdAt)
        .map(([id, data]) => ({ id, data: () => data })) };
    },
    serverTimestamp: () => 200,
    addDoc: async (_collection, data) => {
      state.writes++;
      state.writeStarted?.();
      if (state.writeGate) await state.writeGate;
      if (state.failWrite) throw new Error("write-denied");
      documents.set("added", data);
    },
    updateDoc: async (id, data) => {
      state.writes++;
      state.writeStarted?.();
      if (state.writeGate) await state.writeGate;
      if (state.failWrite) throw new Error("write-denied");
      if (!documents.has(id)) throw new Error("not-found");
      documents.set(id, { ...documents.get(id), ...data });
    },
    deleteDoc: async (id) => {
      state.writes++;
      state.writeStarted?.();
      if (state.writeGate) await state.writeGate;
      if (state.failWrite) throw new Error("write-denied");
      documents.delete(id);
    },
  };
  const service = loadModule("src/lib/firebase-links.ts", {
    "firebase/firestore": firestore,
    "@/lib/firebase": { db: {}, auth },
    "@/lib/link-validation": validation,
  });
  return { state, documents, service, auth };
}

test("shared add/edit validation rejects invalid input and trims accepted values", () => {
  for (const invalid of [
    { title: "   " }, { title: "a".repeat(51) }, { url: "" },
    { url: "javascript:alert(1)" }, { url: "ftp://example.com" },
    { description: "a".repeat(101) },
  ]) assert.equal(validation.linkFormSchema.safeParse({ ...values, ...invalid }).success, false);
  const parsed = validation.linkFormSchema.parse({ title: " a ", url: " https://example.com ", description: " " });
  assert.equal(parsed.title, "a"); assert.equal(parsed.description, "");
  assert.equal(validation.linkFormSchema.safeParse({ ...values, title: "a".repeat(50), description: "a".repeat(100) }).success, true);
});

test("invalid edit never writes, and editing a missing document does not recreate it", async () => {
  const { state, service } = fixture();
  await assert.rejects(service.updateLink("test-user", "existing", { ...values, title: "" }));
  assert.equal(state.writes, 0);
  await assert.rejects(service.updateLink("test-user", "missing", values), /not-found/);
});

test("the service refuses to target a different UID", async () => {
  const { service, state } = fixture();
  await assert.rejects(service.fetchLinks("other-user"), /로그인/);
  await assert.rejects(service.updateLink("other-user", "existing", values), /로그인/);
  await assert.rejects(service.deleteLink("other-user", "existing"), /로그인/);
  assert.equal(state.reads, 0); assert.equal(state.writes, 0);
});

function profileFixture(existing = null) {
  const user = { uid: "profile-user", displayName: "Google 이름", email: "owner@example.com", photoURL: "https://example.com/photo.png" };
  const auth = { currentUser: user };
  const state = { data: existing, writes: 0, others: new Map(), paths: [] };
  const apply = (data) => { if (!state.data) throw new Error("not-found"); state.writes++; state.data = { ...state.data, ...data }; };
  const profileModule = loadModule("src/lib/firebase-profile.ts", {
    "@/lib/firebase": { db: {}, auth }, "@/lib/profile-validation": profileValidation,
    "firebase/firestore": {
      doc: (_db, collection, id) => { state.paths.push(collection + "/" + id); assert.equal(collection, "users"); return id; },
      collection: (_db, collection) => { assert.equal(collection, "users"); return collection; },
      where: (field, operator, value) => { assert.equal(field, "displayname"); assert.equal(operator, "=="); return value; },
      limit: (count) => count,
      query: (_collection, handle, count) => ({ handle, count }),
      getDocs: async ({ handle, count }) => {
        const records = [...state.others.entries(), ...(state.data ? [[user.uid, state.data]] : [])];
        return { docs: records.filter(([, data]) => data.displayname === handle).slice(0, count).map(([id, data]) => ({ id, data: () => data })) };
      },
      updateDoc: async (_ref, data) => apply(data),
      serverTimestamp: () => "SERVER_SIGNUP_TIME",
      runTransaction: async (_db, callback) => {
        const writes = [];
        const result = await callback({
          get: async () => ({ exists: () => state.data != null, data: () => state.data }),
          set: (_ref, data) => writes.push(() => { state.writes++; state.data = data; }),
          update: (_ref, data) => writes.push(() => apply(data)),
        });
        writes.forEach((write) => write()); return result;
      },
    },
  });
  return { user, auth, state, profileModule };
}

test("login stores profile and email only in users/{uid}, preserving signup date", async () => {
  const { user, state, profileModule } = profileFixture();
  const profile = await profileModule.fetchUserProfile(user);
  assert.equal(profile.username, "owner"); assert.equal(profile.displayname, "owner");
  assert.equal(state.data.email, "owner@example.com"); assert.equal(state.data.createdAt, "SERVER_SIGNUP_TIME");
  const writes = state.writes;
  await profileModule.fetchUserProfile(user);
  assert.equal(state.writes, writes);
  assert.ok(state.paths.every((path) => path === "users/" + user.uid));
});

test("legacy migration preserves name, email, avatar and signup date", async () => {
  const { user, state, profileModule } = profileFixture({ displayName: "기존 이름", email: "original@example.com", avatarUrl: null, createdAt: 123, bio: "소개" });
  const profile = await profileModule.fetchUserProfile(user);
  assert.equal(profile.username, "기존 이름"); assert.equal(profile.displayname, "owner");
  assert.equal(state.data.createdAt, 123); assert.equal(state.data.email, "original@example.com"); assert.equal(state.data.avatarUrl, null);
});

test("profile edits change only name and bio, ignoring forged displayname changes", async () => {
  const { user, state, profileModule } = profileFixture();
  await profileModule.fetchUserProfile(user);
  const before = { ...state.data };
  await profileModule.updateUserProfile(user.uid, { username: "수정 이름", displayname: "forged-id", bio: "새 소개" });
  assert.equal(state.data.username, "수정 이름"); assert.equal(state.data.bio, "새 소개");
  assert.equal(state.data.displayname, before.displayname);
  assert.equal(state.data.createdAt, before.createdAt); assert.equal(state.data.email, before.email);
});

test("profile validation rejects reserved/unsafe identifiers", () => {
  for (const displayname of ["mypage", "api", "u", "bad/route", "bad space", "@owner", ""]) {
    assert.equal(profileValidation.profileFormSchema.safeParse({ username: "이름", displayname, bio: "" }).success, false);
  }
});

test("profile writes require the matching signed-in account", async () => {
  const { user, auth, state, profileModule } = profileFixture(); auth.currentUser = null;
  await assert.rejects(profileModule.fetchUserProfile(user), /로그인/);
  await assert.rejects(profileModule.updateUserProfile(user.uid, { username: "name", displayname: "owner", bio: "" }), /로그인/);
  assert.equal(state.writes, 0);
});

test("Google auth uses onAuthStateChanged and returns observer cleanup", async () => {
  let listener, unsubscribed = false, signedIn = false, signedOut = false;
  const firebaseAuth = {
    GoogleAuthProvider: class { setCustomParameters(params) { assert.equal(params.prompt, "select_account"); } },
    onAuthStateChanged: (_auth, callback) => { listener = callback; return () => { unsubscribed = true; }; },
    signInWithPopup: async () => { signedIn = true; },
    signOut: async () => { signedOut = true; },
  };
  const authModule = loadModule("src/lib/firebase-auth.ts", { "firebase/auth": firebaseAuth, "@/lib/firebase": { auth: {} } });
  let observed;
  const unsubscribe = authModule.observeAuth((user) => { observed = user; }, () => {});
  listener({ uid: "google-user" }); assert.equal(observed.uid, "google-user");
  listener(null); assert.equal(observed, null);
  await authModule.loginWithGoogle(); await authModule.logout(); unsubscribe();
  assert.equal(signedIn, true); assert.equal(signedOut, true); assert.equal(unsubscribed, true);
  assert.equal(authModule.authErrorMessage({ code: "auth/popup-closed-by-user" }), null);
  assert.ok(authModule.authErrorMessage({ code: "auth/popup-blocked" }).includes("팝업"));
});


const { QueryClient, QueryObserver, MutationObserver } = require("@tanstack/react-query");
function queryFixture() {
  const f = fixture();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  let current = true;
  let remoteProfile = { id: f.auth.currentUser.uid, username: "기존 이름", displayname: "owner", bio: "기존 소개", avatarUrl: null };
  const queries = loadModule("src/lib/account-queries.ts", {
    "@/lib/firebase-links": f.service,
    "@/lib/firebase-profile": {
      fetchUserProfile: async () => ({ ...remoteProfile }),
      updateUserProfile: async (_uid, data) => {
        f.state.profileWriteStarted?.();
        if (f.state.profileWriteGate) await f.state.profileWriteGate;
        if (f.state.failWrite) throw new Error("profile-write-denied");
        remoteProfile = { ...remoteProfile, ...data };
      },
    },
    "@/lib/profile-validation": profileValidation,
  });
  const session = { user: f.auth.currentUser, sessionId: 1 };
  const isCurrent = () => current;
  return { ...f, client, queries, session, isCurrent, expire: () => { current = false; } };
}

test("Query caches and deduplicates Firestore reads by account session", async () => {
  const f = queryFixture();
  const options = { ...f.queries.linksOptions(f.session), staleTime: Infinity };
  const [first, second] = await Promise.all([f.client.fetchQuery(options), f.client.fetchQuery(options)]);
  assert.equal(first, second); assert.equal(f.state.reads, 1);
  await f.client.fetchQuery(options); assert.equal(f.state.reads, 1);
  assert.notDeepEqual(f.queries.linksKey(f.session), f.queries.linksKey({ ...f.session, sessionId: 2 }));
  f.client.clear();
});

for (const operation of ["add", "edit", "delete"]) {
  test("Query " + operation + " waits for list refetch before completing", async () => {
    const f = queryFixture();
    const options = f.queries.linksOptions(f.session);
    await f.client.fetchQuery(options);
    const observer = new QueryObserver(f.client, { ...options, staleTime: Infinity });
    const unsubscribe = observer.subscribe(() => {});
    let release;
    f.state.readGate = new Promise((resolve) => { release = resolve; });
    const started = new Promise((resolve) => { f.state.readStarted = resolve; });
    const mutation = new MutationObserver(f.client, f.queries.linkWriteOptions(f.client, f.session, f.isCurrent, () => {}));
    const input = operation === "add" ? { type: "add", values: { ...values, title: "새 링크" } }
      : operation === "edit" ? { type: "edit", id: "existing", values: { ...values, title: "수정 링크" } }
      : { type: "delete", id: "existing" };
    const pending = mutation.mutate(input);
    await started;
    assert.equal(mutation.getCurrentResult().isPending, true);
    assert.equal(f.client.getQueryData(options.queryKey)[0].title, values.title);
    release(); await pending;
    const data = f.client.getQueryData(options.queryKey);
    assert.equal(f.state.reads, 2);
    if (operation === "delete") assert.equal(data.length, 0);
    else assert.equal(data[0].title, operation === "add" ? "새 링크" : "수정 링크");
    unsubscribe(); f.client.clear();
  });
}

test("profile mutation immediately updates cache and rolls back on failure", async () => {
  const f = queryFixture();
  const options = f.queries.profileOptions(f.session);
  const previous = await f.client.fetchQuery(options);
  let release;
  f.state.profileWriteGate = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { f.state.profileWriteStarted = resolve; });
  f.state.failWrite = true;
  const mutation = new MutationObserver(f.client, f.queries.profileWriteOptions(f.client, f.session, f.isCurrent));
  const pending = mutation.mutate({ username: "낙관적 이름", displayname: "owner", bio: "낙관적 소개" });
  const rejected = assert.rejects(pending, /profile-write-denied/);
  await started;
  assert.equal(f.client.getQueryData(options.queryKey).username, "낙관적 이름");
  assert.equal(f.client.getQueryData(options.queryKey).bio, "낙관적 소개");
  assert.equal(mutation.getCurrentResult().isPending, true);
  release(); await rejected;
  assert.deepEqual(f.client.getQueryData(options.queryKey), previous);
  f.client.clear();
});

test("successful optimistic profile updates are invalidated and retained", async () => {
  const f = queryFixture();
  const options = f.queries.profileOptions(f.session);
  await f.client.fetchQuery(options);
  const observer = new QueryObserver(f.client, { ...options, staleTime: Infinity });
  const unsubscribe = observer.subscribe(() => {});
  const mutation = new MutationObserver(f.client, f.queries.profileWriteOptions(f.client, f.session, f.isCurrent));
  await mutation.mutate({ username: "저장된 이름", displayname: "owner", bio: "저장된 소개" });
  assert.equal(f.client.getQueryData(options.queryKey).username, "저장된 이름");
  assert.equal(f.client.getQueryState(options.queryKey).isInvalidated, false);
  unsubscribe(); f.client.clear();
});

test("late optimistic mutation failures cannot restore a signed-out account cache", async () => {
  const f = queryFixture();
  const options = f.queries.profileOptions(f.session);
  await f.client.fetchQuery(options);
  let release;
  f.state.profileWriteGate = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { f.state.profileWriteStarted = resolve; });
  f.state.failWrite = true;
  const mutation = new MutationObserver(f.client, f.queries.profileWriteOptions(f.client, f.session, f.isCurrent));
  const rejected = assert.rejects(mutation.mutate({ username: "old", displayname: "owner", bio: "old" }));
  await started;
  f.expire(); f.client.removeQueries({ queryKey: ["account"] });
  release(); await rejected;
  assert.equal(f.client.getQueryData(options.queryKey), undefined);
  f.client.clear();
});

test("failed link writes do not alter cached list or trigger reload", async () => {
  const f = queryFixture();
  const options = f.queries.linksOptions(f.session);
  const previous = await f.client.fetchQuery(options);
  f.state.failWrite = true;
  const mutation = new MutationObserver(f.client, f.queries.linkWriteOptions(f.client, f.session, f.isCurrent, () => {}));
  await assert.rejects(mutation.mutate({ type: "delete", id: "existing" }), /write-denied/);
  assert.equal(f.client.getQueryData(options.queryKey), previous); assert.equal(f.state.reads, 1);
  f.client.clear();
});


test("logout cancels in-flight account reads and removes their cache", async () => {
  const f = queryFixture();
  const { useProfileStore: authStore } = loadModule("src/stores/profile-store.ts", {
    "@/lib/query-client": { getQueryClient: () => f.client },
    "@/lib/firebase-auth": { authErrorMessage: () => "error", loginWithGoogle: async () => {}, logout: async () => {} },
  });
  authStore.getState().setUser(f.session.user);
  let release;
  f.state.readGate = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { f.state.readStarted = resolve; });
  const pending = f.client.fetchQuery(f.queries.linksOptions(f.session));
  const rejected = assert.rejects(pending);
  await started;
  authStore.getState().setUser(null);
  await rejected;
  release(); await Promise.resolve();
  assert.equal(authStore.getState().user, null);
  assert.equal(f.client.getQueryData(f.queries.linksKey(f.session)), undefined);
  assert.equal(f.client.getQueryCache().findAll({ queryKey: ["account"] }).length, 0);
  f.client.clear();
});

test("confirmed delete with failed refetch is not retried and removes the cached card", async () => {
  const f = queryFixture();
  const options = f.queries.linksOptions(f.session);
  await f.client.fetchQuery(options);
  const observer = new QueryObserver(f.client, { ...options, staleTime: Infinity });
  const unsubscribe = observer.subscribe(() => {});
  let warned = false;
  f.state.failRead = true;
  const mutation = new MutationObserver(f.client, f.queries.linkWriteOptions(f.client, f.session, f.isCurrent, () => { warned = true; }));
  await mutation.mutate({ type: "delete", id: "existing" });
  assert.equal(warned, true); assert.equal(f.state.writes, 1);
  assert.equal(f.client.getQueryData(options.queryKey).length, 0);
  unsubscribe(); f.client.clear();
});

test("expired sessions cannot start link or optimistic profile mutations", async () => {
  const f = queryFixture();
  f.expire();
  const linkMutation = new MutationObserver(f.client, f.queries.linkWriteOptions(f.client, f.session, f.isCurrent, () => {}));
  await assert.rejects(linkMutation.mutate({ type: "delete", id: "existing" }), /로그인/);
  const profileMutation = new MutationObserver(f.client, f.queries.profileWriteOptions(f.client, f.session, f.isCurrent));
  await assert.rejects(profileMutation.mutate({ username: "name", displayname: "owner", bio: "" }), /로그인/);
  assert.equal(f.state.writes, 0); assert.equal(f.client.getQueryData(f.queries.profileKey(f.session)), undefined);
  f.client.clear();
});


test("optimistic profile onMutate is synchronous and does not wait for network", async () => {
  const f = queryFixture();
  const key = f.queries.profileKey(f.session);
  await f.client.fetchQuery(f.queries.profileOptions(f.session));
  let networkStarted = false;
  f.state.profileWriteStarted = () => { networkStarted = true; };
  let editorClosed = false;
  const options = f.queries.profileWriteOptions(f.client, f.session, f.isCurrent, () => {
    assert.equal(f.client.getQueryData(key).bio, "즉시 상태 메시지");
    assert.equal(networkStarted, false);
    editorClosed = true;
  });
  const context = options.onMutate({ username: "즉시 이름", displayname: "owner", bio: "즉시 상태 메시지" });
  assert.equal(editorClosed, true);
  assert.equal(typeof context.then, "undefined");
  assert.equal(networkStarted, false);
  assert.equal(f.client.getQueryData(key).bio, "즉시 상태 메시지");
  assert.equal(f.client.getQueryData(key).username, "즉시 이름");
  options.onError(new Error("failed"), {}, context);
  assert.equal(f.client.getQueryData(key).bio, "기존 소개");
  f.client.clear();
});

function publicFixture() {
  class Timestamp { constructor(value) { this.value = value; } toMillis() { return this.value; } }
  const state = { profiles: [{ id: "owner-id", data: { username: "홍길동", displayname: "owner", bio: "소개", avatarUrl: null, email: "owner@example.com" } }], reads: [], links: [] };
  const { service } = fixture();
  const api = loadModule("src/lib/firebase-public-profile.ts", {
    "@/lib/firebase": { db: {} }, "@/lib/firebase-links": service, "@/lib/profile-validation": profileValidation,
    "firebase/firestore": {
      Timestamp,
      collection: (_db, ...segments) => { const collection = segments.join("/"); assert.ok(collection === "users" || collection === "users/owner-id/links"); return collection; },
      where: (field, operator, value) => { assert.equal(operator, "=="); return { field, value }; },
      limit: (count) => count,
      query: (collection, filter, count) => ({ collection, filter, count }),
      getDocs: async ({ collection, filter, count }) => {
        state.reads.push(collection);
        if (collection === "users") {
          assert.equal(filter.field, "displayname");
          return { docs: state.profiles.filter(({ data }) => data.displayname === filter.value).slice(0, count).map(({ id, data }) => ({ id, data: () => data })) };
        }
        assert.equal(filter.field, "visible"); assert.equal(filter.value, true);
        return { docs: state.links.map(({ id, ...data }) => ({ id, data: () => data })) };
      },
    },
  });
  return { state, api, Timestamp };
}

test("public page finds user by displayname and reads their visible links", async () => {
  const { state, api, Timestamp } = publicFixture();
  const link = { ...values, type: "link", icon: "globe", visible: true, sortOrder: 0 };
  state.links = [{ ...link, id: "old", createdAt: new Timestamp(1) }, { ...link, id: "new", createdAt: new Timestamp(2) }, { ...link, id: "hidden", visible: false }, { ...link, id: "unsafe", url: "javascript:alert(1)" }];
  const result = await api.fetchPublicProfile("owner");
  assert.equal(result.profile.username, "홍길동"); assert.equal(result.profile.displayname, "owner");
  assert.equal(result.links.map((link) => link.id).join(","), "new,old");
  assert.equal(state.reads.join(","), "users,users/owner-id/links");
});

test("invalid, missing or ambiguous public identifiers return not-found", async () => {
  const { state, api } = publicFixture();
  assert.equal(await api.fetchPublicProfile("bad handle"), null); assert.equal(state.reads.length, 0);
  assert.equal(await api.fetchPublicProfile("missing"), null);
  state.profiles.push({ id: "another", data: { ...state.profiles[0].data } });
  assert.equal(await api.fetchPublicProfile("owner"), null);
});


test("optimistic profile updates cannot change the cached identifier", async () => {
  const f = queryFixture();
  const key = f.queries.profileKey(f.session);
  await f.client.fetchQuery(f.queries.profileOptions(f.session));
  const options = f.queries.profileWriteOptions(f.client, f.session, f.isCurrent);
  options.onMutate({ username: "사람 이름", displayname: "forged-id", bio: "소개" });
  assert.equal(f.client.getQueryData(key).displayname, "owner");
  assert.equal(f.client.getQueryData(key).username, "사람 이름");
  f.client.clear();
});

test("favicon URLs use the website origin without leaking link paths or credentials", () => {
  const { faviconSources } = loadModule("src/lib/favicon.ts");
  const github = faviconSources("https://github.com/owner/project?token=private");
  assert.equal(github[0], "https://github.com/favicon.ico");
  assert.ok(github[1].includes(encodeURIComponent("https://github.com")));
  assert.ok(!github.join("").includes("private"));
  assert.equal(faviconSources("https://user:pass@google.com/search?q=test")[0], "https://google.com/favicon.ico");
  assert.equal(faviconSources("javascript:alert(1)").length, 0);
  assert.equal(faviconSources("not-a-url").length, 0);
});
