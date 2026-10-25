/* eslint-disable @typescript-eslint/no-require-imports -- Node emulator test harness. */
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

test("public reads and owner-only writes on the two application paths", { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async (t) => {
  const { initializeTestEnvironment, assertSucceeds, assertFails } = require("@firebase/rules-unit-testing");
  const { doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc } = require("firebase/firestore");
  const env = await initializeTestEnvironment({ projectId: "demo-mylink-rules", firestore: { rules: fs.readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8") } });
  const own = env.authenticatedContext("alice").firestore();
  const other = env.authenticatedContext("bob").firestore();
  const guest = env.unauthenticatedContext().firestore();
  try {
    for (const documentPath of ["users/alice", "users/alice/links/one"]) {
      await t.test(documentPath + " allows public reads and only its owner's writes", async () => {
        await assertSucceeds(setDoc(doc(own, documentPath), { value: "initial" }));
        await assertSucceeds(getDoc(doc(guest, documentPath)));
        await assertSucceeds(getDoc(doc(other, documentPath)));
        await assertFails(updateDoc(doc(guest, documentPath), { value: "guest" }));
        await assertFails(updateDoc(doc(other, documentPath), { value: "other" }));
        await assertFails(deleteDoc(doc(other, documentPath)));
        await assertSucceeds(updateDoc(doc(own, documentPath), { value: "owner" }));
        await assertSucceeds(deleteDoc(doc(own, documentPath)));
        await assertFails(setDoc(doc(guest, documentPath), { value: "guest" }));
        await assertFails(setDoc(doc(other, documentPath), { value: "other" }));
      });
    }
    await t.test("user and link queries are publicly readable", async () => {
      await assertSucceeds(getDocs(collection(guest, "users")));
      await assertSucceeds(getDocs(collection(guest, "users/alice/links")));
    });
    await t.test("unused collections and subcollections are denied", async () => {
      for (const target of ["handles/alice", "publicProfiles/alice", "users/alice/profile/main", "admins/alice"]) {
        await assertFails(getDoc(doc(guest, target)));
        await assertFails(setDoc(doc(own, target), { value: true }));
      }
    });
  } finally { await env.cleanup(); }
});
