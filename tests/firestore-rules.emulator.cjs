/* eslint-disable @typescript-eslint/no-require-imports -- Node emulator test harness. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("public reads and owner-only writes on the two application paths", { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async (t) => {
  const { initializeTestEnvironment, assertSucceeds, assertFails } = require("@firebase/rules-unit-testing");
  const { doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, increment, deleteField } = require("firebase/firestore");
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
        if (documentPath === "users/alice") await assertFails(deleteDoc(doc(own, documentPath)));
        else await assertSucceeds(deleteDoc(doc(own, documentPath)));
        await assertFails(setDoc(doc(guest, documentPath), { value: "guest" }));
        await assertFails(setDoc(doc(other, documentPath), { value: "other" }));
      });
    }
    await t.test("displayname can be assigned once but cannot be changed or removed", async () => {
      const ref = doc(own, "users/alice");
      await assertSucceeds(updateDoc(ref, { displayname: "alice" }));
      await assertSucceeds(updateDoc(ref, { username: "사람 이름", bio: "소개" }));
      await assertFails(updateDoc(ref, { displayname: "different" }));
      await assertFails(setDoc(ref, { username: "remove the identifier" }));
      await assertFails(deleteDoc(ref));
    });
    await t.test("user and link queries are publicly readable", async () => {
      await assertSucceeds(getDocs(collection(guest, "users")));
      await assertSucceeds(getDocs(collection(guest, "users/alice/links")));
    });
    await t.test("guest clicks atomically increment visible links, including legacy documents", async () => {
      const target = "users/alice/links/clicks";
      await assertSucceeds(setDoc(doc(own, target), { title: "Link", visible: true }));
      await assertSucceeds(updateDoc(doc(guest, target), { clickCount: increment(1) }));
      await Promise.all(Array.from({ length: 20 }, (_, index) =>
        assertSucceeds(updateDoc(doc(index % 2 ? guest : other, target), { clickCount: increment(1) }))));
      assert.equal((await getDoc(doc(own, target))).data().clickCount, 21);
      for (const changes of [
        { clickCount: 0 }, { clickCount: increment(2) }, { clickCount: increment(-1) },
        { clickCount: "22" }, { clickCount: deleteField() },
        { clickCount: increment(1), title: "tampered" },
        { clickCount: increment(1), url: "https://evil.example" },
      ]) await assertFails(updateDoc(doc(guest, target), changes));
      await assertSucceeds(updateDoc(doc(own, target), { visible: false }));
      await assertFails(updateDoc(doc(guest, target), { clickCount: increment(1) }));
      await assertFails(updateDoc(doc(other, target), { clickCount: increment(1) }));
      await assertFails(setDoc(doc(guest, "users/alice/links/fake"), { visible: true, clickCount: 1 }));
      await assertFails(updateDoc(doc(guest, "users/alice/links/missing"), { clickCount: increment(1) }));
    });
    await t.test("unused collections and subcollections are denied", async () => {
      for (const target of ["handles/alice", "publicProfiles/alice", "users/alice/profile/main", "admins/alice"]) {
        await assertFails(getDoc(doc(guest, target)));
        await assertFails(setDoc(doc(own, target), { value: true }));
      }
    });
  } finally { await env.cleanup(); }
});
