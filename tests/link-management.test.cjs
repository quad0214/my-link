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
  const state = { reads: 0, writes: 0, failRead: false, failWrite: false, lastPath: null };
  const firestore = {
    collection: (_db, ...segments) => {
      assert.equal(segments.join("/"), "users/anonymous/links");
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
      state.reads++;
      state.readStarted?.();
      if (state.readGate) await state.readGate;
      if (state.failRead) throw new Error("read-denied");
      return { docs: [...documents.entries()].sort((a, b) => b[1].createdAt - a[1].createdAt)
        .map(([id, data]) => ({ id, data: () => data })) };
    },
    serverTimestamp: () => 200,
    addDoc: async (_collection, data) => {
      state.writes++;
      if (state.failWrite) throw new Error("write-denied");
      documents.set("added", data);
    },
    updateDoc: async (id, data) => {
      state.writes++;
      if (state.failWrite) throw new Error("write-denied");
      if (!documents.has(id)) throw new Error("not-found");
      documents.set(id, { ...documents.get(id), ...data });
    },
    deleteDoc: async (id) => {
      state.writes++;
      if (state.failWrite) throw new Error("write-denied");
      documents.delete(id);
    },
  };
  const service = loadModule("src/lib/firebase-links.ts", {
    "firebase/firestore": firestore,
    "@/lib/firebase": { db: {} },
    "@/lib/link-validation": validation,
  });
  const { useProfileStore: store } = loadModule("src/stores/profile-store.ts", {
    "@/lib/firebase-links": service,
    "@/mocks/profile-links.json": require("../src/mocks/profile-links.json"),
  });
  return { state, documents, service, store };
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
  assert.equal(state.lastPath, "users/anonymous/links/existing");
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
  assert.equal(state.lastPath, "users/anonymous/links/existing");
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
  await assert.rejects(service.updateLink("existing", { ...values, title: "" }));
  assert.equal(state.writes, 0);
  await assert.rejects(service.updateLink("missing", values), /not-found/);
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
