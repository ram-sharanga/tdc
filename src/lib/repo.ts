import "server-only";
import { db } from "@/lib/firebase";
import type { Timestamp, DocumentSnapshot } from "firebase-admin/firestore";
import type {
  Customer,
  Note,
  MatchResult,
  Matchmaker,
  Stage,
} from "@/types/profile";
import {
  matchesForMaleCustomers,
  matchesForFemaleCustomers,
} from "@/data/matches";

const customers = () => db.collection("customers");

const isIdValidFormat = (id: string) => /^[A-Za-z0-9_-]{1,64}$/.test(id);

function toCustomer(snap: DocumentSnapshot): Customer {
  return { ...(snap.data() as Omit<Customer, "id">), id: snap.id };
}

export async function getMatchmakerByUsername(
  username: string,
): Promise<Matchmaker | undefined> {
  const queryMatchMaker = await db
    .collection("matchmakers")
    .where("username", "==", username)
    .limit(1)
    .get();
  if (queryMatchMaker.empty) return undefined;
  const snap: DocumentSnapshot = queryMatchMaker.docs[0];
  return { ...(snap.data() as Omit<Matchmaker, "id">), id: snap.id };
}

export async function listCustomers(matchmakerId: string): Promise<Customer[]> {
  const queryCustomers = await customers()
    .where("matchmakerId", "==", matchmakerId)
    .get();
  return queryCustomers.docs
    .map(toCustomer)
    .sort((a, b) => a.first.localeCompare(b.first));
}

export async function getCustomer(
  id: string,
  matchmakerId: string,
): Promise<Customer | undefined> {
  if (!isIdValidFormat(id)) return undefined;
  const snap: DocumentSnapshot = await customers().doc(id).get();
  if (!snap.exists) return undefined;
  const c = toCustomer(snap);
  return c.matchmakerId === matchmakerId ? c : undefined;
}

export async function updateStage(
  id: string,
  matchmakerId: string,
  stage: Stage,
): Promise<boolean> {
  const c = await getCustomer(id, matchmakerId);
  if (!c) return false;
  await customers().doc(id).update({ stage });
  return true;
}

export async function listNotes(customerId: string): Promise<Note[]> {
  const snap = await customers()
    .doc(customerId)
    .collection("notes")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      text: x.text as string,
      createdAt: (x.createdAt as Timestamp).toDate().toISOString(),
    };
  });
}

export async function addNote(
  customerId: string,
  matchmakerId: string,
  text: string,
): Promise<Note> {
  const createdAt = new Date();
  const ref = await customers()
    .doc(customerId)
    .collection("notes")
    .add({ text, createdAt, authorId: matchmakerId });
  return { id: ref.id, text, createdAt: createdAt.toISOString() }; // the ref.id uniquely identifies a note
}

export async function listSentMatchIds(customerId: string): Promise<string[]> {
  const snap = await customers()
    .doc(customerId)
    .collection("sentMatches")
    .get();
  return snap.docs.map((d) => d.id); // doc id IS the unique match id
}

export type SentResult =
  | { ok: true; stage: Stage }
  | { ok: false; reason: "not_found" | "duplicate" };

export async function recordSentMatch(
  customerId: string,
  matchmakerId: string,
  input: { matchId: string; subject: string; body: string },
): Promise<SentResult> {
  if (!isIdValidFormat(input.matchId) || !isIdValidFormat(input.matchId))
    return { ok: false, reason: "not_found" };

  const cRef = customers().doc(customerId);
  const sRef = cRef.collection("sentMatches").doc(input.matchId);

  return db.runTransaction(async (tx) => {
    const [cSnap, sSnap] = await Promise.all([tx.get(cRef), tx.get(sRef)]);

    if (!cSnap.exists) return { ok: false, reason: "not_found" };
    if (sSnap.exists) return { ok: false, reason: "duplicate" };

    if (!cSnap.exists || cSnap.data()?.matchmakerId !== matchmakerId) {
      return { ok: false, reason: "not_found" };
    }

    if (sSnap.exists) return { ok: false, reason: "duplicate" };

    const current = cSnap.data()!.stage as Stage;
    const next: Stage =
      current === "Onboarded" || current === "Verified"
        ? "Profile Shared"
        : current;

    if (next !== current) {
      tx.update(cRef, { stage: next });
    }

    tx.set(sRef, {
      matchId: input.matchId,
      subject: input.subject,
      body: input.body,
      sentAt: new Date(),
      sentBy: matchmakerId,
    });

    return { ok: true, stage: next };
  });
}

export function getMatches(customer: Customer): MatchResult[] {
  return customer.gender === "Female"
    ? matchesForFemaleCustomers
    : matchesForMaleCustomers;
}
