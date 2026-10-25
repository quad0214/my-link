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
  const { useProfileStore: store } = loadModule("src/stores/profile-store.ts", {
    "@/lib/firebase-links": service,
    "@/lib/firebase-auth": { loginWithGoogle: async () => {}, logout: async () => {}, authErrorMessage: () => "오류" },
    "@/lib/firebase-profile": {
      googleProfile: (user) => ({ id: user.uid, displayName: user.displayName || "사용자", username: "", bio: "", avatarUrl: null }),
      fetchUserProfile: async (user) => {
        if (state.profileGate) await state.profileGate;
        return { id: user.uid, displayName: user.displayName || "사용자", username: "", bio: "", avatarUrl: null };
      },
    },
  });
  store.setState({ user: auth.currentUser, profile: { id: "test-user", displayName: "테스트", username: "", bio: "", avatarUrl: null }, sessionId: 1, isAuthLoading: false });
  return { state, documents, service, store, auth };
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

test("edit updates the same document, preserves creation time and other fields, then reloads", async () => {
  const { state, documents, store } = fixture();
  await store.getState().loadLinks();
  await store.getState().editLink("existing", { ...values, title: "수정한 링크" });
  const saved = documents.get("existing");
  assert.equal(state.lastPath, "users/test-user/links/existing");
  assert.equal(documents.size, 1);
  assert.equal(saved.createdAt, 100); assert.equal(saved.updatedAt, 200);
  assert.equal(saved.icon, "github"); assert.equal(saved.sortOrder, 7);
  assert.equal(store.getState().blocks[0].title, "수정한 링크");
  assert.equal(state.reads, 2); assert.equal(store.getState().isMutatingLinks, false);
});

test("delete removes only its target and reloads without a realtime subscription", async () => {
  const { state, documents, store } = fixture();
  await store.getState().loadLinks();
  await store.getState().removeLink("existing");
  assert.equal(state.lastPath, "users/test-user/links/existing");
  assert.equal(documents.size, 0); assert.equal(store.getState().blocks.length, 0);
  assert.equal(state.reads, 2); assert.equal(state.writes, 1);
  assert.equal(store.getState().isMutatingLinks, false);
});

test("failed edit/delete preserve the list and clear the busy state", async () => {
  const { state, store } = fixture();
  await store.getState().loadLinks();
  state.failWrite = true;
  await assert.rejects(store.getState().editLink("existing", { ...values, title: "실패" }), /write-denied/);
  assert.equal(store.getState().blocks[0].title, values.title);
  assert.equal(store.getState().isMutatingLinks, false);
  await assert.rejects(store.getState().removeLink("existing"), /write-denied/);
  assert.equal(store.getState().blocks.length, 1);
  assert.equal(store.getState().isMutatingLinks, false); assert.equal(state.reads, 1);
});

test("invalid edit never writes, and editing a missing document does not recreate it", async () => {
  const { state, service } = fixture();
  await assert.rejects(service.updateLink("test-user", "existing", { ...values, title: "" }));
  assert.equal(state.writes, 0);
  await assert.rejects(service.updateLink("test-user", "missing", values), /not-found/);
});

test("successful deletion followed by read failure stays deleted and retry only reads", async () => {
  const { state, store } = fixture();
  await store.getState().loadLinks();
  state.failRead = true;
  await store.getState().removeLink("existing");
  assert.equal(store.getState().blocks.length, 0);
  assert.ok(store.getState().linksError);
  assert.equal(store.getState().isLoadingLinks, false);
  assert.equal(store.getState().isMutatingLinks, false);
  state.failRead = false;
  await store.getState().loadLinks();
  assert.equal(store.getState().linksError, null); assert.equal(state.writes, 1);
});

test("add still writes a server creation timestamp and refreshes newest first", async () => {
  const { state, store } = fixture();
  await store.getState().loadLinks();
  await store.getState().addLink({ ...values, title: "추가한 링크" });
  assert.equal(store.getState().blocks.map((block) => block.id).join(","), "added,existing");
  assert.equal(state.reads, 2); assert.equal(state.writes, 1);
  assert.equal(store.getState().isMutatingLinks, false);
});

for (const operation of ["add", "edit", "delete"]) {
  test(operation + " keeps the current list and busy state until reloading completes", async () => {
    const { state, store } = fixture();
    await store.getState().loadLinks();
    let releaseRead;
    state.readGate = new Promise((resolve) => { releaseRead = resolve; });
    const readStarted = new Promise((resolve) => { state.readStarted = resolve; });
    const operationPromise = operation === "add"
      ? store.getState().addLink({ ...values, title: "추가" })
      : operation === "edit"
        ? store.getState().editLink("existing", { ...values, title: "변경" })
        : store.getState().removeLink("existing");
    await readStarted;
    assert.equal(store.getState().isMutatingLinks, true);
    assert.equal(store.getState().isLoadingLinks, true);
    assert.equal(store.getState().blocks.length, 1);
    assert.equal(store.getState().blocks[0].title, values.title);
    let completed = false;
    operationPromise.then(() => { completed = true; });
    await Promise.resolve();
    assert.equal(completed, false);
    releaseRead();
    await operationPromise;
    assert.equal(store.getState().isMutatingLinks, false);
    assert.equal(store.getState().isLoadingLinks, false);
    if (operation === "delete") assert.equal(store.getState().blocks.length, 0);
    else assert.equal(store.getState().blocks[0].title, operation === "add" ? "추가" : "변경");
  });
}


test("signed-out users cannot fetch or mutate links", async () => {
  const { state, store, service, auth } = fixture();
  auth.currentUser = null;
  await store.getState().setUser(null);
  await store.getState().loadLinks();
  await assert.rejects(store.getState().addLink(values), /로그인/);
  await assert.rejects(store.getState().editLink("existing", values), /로그인/);
  await assert.rejects(store.getState().removeLink("existing"), /로그인/);
  await assert.rejects(service.fetchLinks("test-user"), /로그인/);
  assert.equal(state.reads, 0); assert.equal(state.writes, 0);
  assert.equal(store.getState().profile, null); assert.equal(store.getState().blocks.length, 0);
});

test("logging out discards an in-flight response and clears the profile", async () => {
  const { state, store, auth } = fixture();
  let release;
  state.readGate = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { state.readStarted = resolve; });
  const pending = store.getState().loadLinks();
  await started;
  auth.currentUser = null;
  await store.getState().setUser(null);
  release(); await pending;
  assert.equal(store.getState().blocks.length, 0);
  assert.equal(store.getState().profile, null);
  assert.equal(store.getState().isLoadingLinks, false);
});

test("account changes reject stale list responses, even across a logout/login", async () => {
  const { state, store, auth, documents } = fixture();
  let release;
  state.readGate = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { state.readStarted = resolve; });
  const oldRequest = store.getState().loadLinks();
  await started;
  state.readGate = null;
  documents.clear();
  documents.set("other-link", { ...values, type: "link", icon: "globe", visible: true, sortOrder: 0, createdAt: 300 });
  auth.currentUser = { ...auth.currentUser, uid: "other-user", displayName: "다른 사용자" };
  await store.getState().setUser(auth.currentUser);
  assert.equal(store.getState().blocks[0].id, "other-link");
  release(); await oldRequest;
  assert.equal(store.getState().user.uid, "other-user");
  assert.equal(store.getState().profile.displayName, "다른 사용자");
  assert.equal(store.getState().blocks.map((block) => block.id).join(","), "other-link");
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
  const state = { data: existing, writes: 0, fail: false };
  const profileModule = loadModule("src/lib/firebase-profile.ts", {
    "@/lib/firebase": { db: {}, auth },
    "firebase/firestore": {
      doc: (_db, collection, uid) => { assert.equal(collection, "users"); assert.equal(uid, user.uid); return uid; },
      serverTimestamp: () => "SERVER_SIGNUP_TIME",
      runTransaction: async (_db, callback) => {
        if (state.fail) throw new Error("permission-denied");
        return callback({
          get: async () => ({ exists: () => state.data !== null, data: () => state.data }),
          set: (_ref, data) => { state.writes++; state.data = data; },
        });
      },
    },
  });
  return { user, auth, state, profileModule };
}

test("first login creates name from email, email, photo, and server signup date", async () => {
  const { user, state, profileModule } = profileFixture();
  const profile = await profileModule.fetchUserProfile(user);
  assert.equal(profile.displayName, "owner");
  assert.equal(state.data.displayName, "owner");
  assert.equal(state.data.email, user.email); assert.equal(state.data.avatarUrl, user.photoURL);
  assert.equal(state.data.createdAt, "SERVER_SIGNUP_TIME"); assert.equal(state.writes, 1);
  await profileModule.fetchUserProfile({ ...user, email: "changed@example.com", photoURL: null });
  assert.equal(state.writes, 1); assert.equal(state.data.email, "owner@example.com");
  assert.equal(state.data.createdAt, "SERVER_SIGNUP_TIME");
});

test("existing profile and signup date are never overwritten", async () => {
  const existing = { displayName: "내 이름", email: "original@example.com", avatarUrl: null, createdAt: 123, bio: "소개", customField: "keep" };
  const { user, state, profileModule } = profileFixture(existing);
  const profile = await profileModule.fetchUserProfile(user);
  assert.equal(state.writes, 0); assert.equal(state.data, existing);
  assert.equal(profile.displayName, "내 이름"); assert.equal(profile.email, "original@example.com");
  assert.equal(profile.avatarUrl, null); assert.equal(state.data.createdAt, 123);
});

test("existing incomplete profiles are preserved without backfilling signup date", async () => {
  const { user, state, profileModule } = profileFixture({ bio: "소개" });
  const profile = await profileModule.fetchUserProfile(user);
  assert.equal(state.writes, 0); assert.equal(state.data.createdAt, undefined);
  assert.equal(profile.displayName, "owner"); assert.equal(profile.bio, "소개");
});

test("profile creation errors propagate and unauthenticated users cannot create", async () => {
  const { user, auth, state, profileModule } = profileFixture();
  state.fail = true;
  await assert.rejects(profileModule.fetchUserProfile(user), /permission-denied/);
  auth.currentUser = null;
  await assert.rejects(profileModule.fetchUserProfile(user), /로그인/);
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


test("a previous account's late profile cannot replace the current profile", async () => {
  const { state, store, auth } = fixture();
  let release;
  state.profileGate = new Promise((resolve) => { release = resolve; });
  const oldSession = store.getState().setUser(auth.currentUser);
  state.profileGate = null;
  auth.currentUser = { ...auth.currentUser, uid: "new-account", displayName: "새 계정" };
  await store.getState().setUser(auth.currentUser);
  release(); await oldSession;
  assert.equal(store.getState().profile.id, "new-account");
  assert.equal(store.getState().profile.displayName, "새 계정");
});

test("a previous account's pending mutation cannot refresh or reset the new session", async () => {
  const { state, store, auth } = fixture();
  await store.getState().loadLinks();
  let release;
  state.writeGate = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { state.writeStarted = resolve; });
  const pendingEdit = store.getState().editLink("existing", { ...values, title: "이전 계정 수정" });
  await started;
  auth.currentUser = { ...auth.currentUser, uid: "new-account", displayName: "새 계정" };
  await store.getState().setUser(auth.currentUser);
  const readsBeforeOldWriteCompletes = state.reads;
  store.setState({ isMutatingLinks: true });
  release(); await pendingEdit;
  assert.equal(state.reads, readsBeforeOldWriteCompletes);
  assert.equal(store.getState().isMutatingLinks, true);
  assert.equal(store.getState().profile.id, "new-account");
});
