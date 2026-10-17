import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";
import { customers } from "../src/data/customers";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey)
  throw new Error("Load .env.local (see run command below)");

const db = getFirestore(
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }),
);

const matchmakers = [
  { id: "m1", name: "Asha", username: "asha", password: "Match@123" },
  { id: "m2", name: "Ravi", username: "ravi", password: "Match@456" },
];

const owner: Record<string, string> = {
  c1: "m1",
  c2: "m1",
  c3: "m1",
  c4: "m2",
  c5: "m2",
};

async function main() {
  if (process.argv.includes("--reset"))
    await db.recursiveDelete(db.collection("customers"));

  const batch = db.batch();

  for (const m of matchmakers) {
    batch.set(db.collection("matchmakers").doc(m.id), {
      name: m.name,
      username: m.username,
      passwordHash: bcrypt.hashSync(m.password, 10),
    });
  }

  for (const c of customers) {
    const { id, ...data } = c;
    batch.set(db.collection("customers").doc(id), {
      ...data,
      matchmakerId: owner[id] ?? "m1",
    });
  }

  await batch.commit();

  console.log(
    `Seeded ${matchmakers.length} matchmakers and ${customers.length} customers`,
  );
}

main();
