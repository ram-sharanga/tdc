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
import candidates from "@/data/candidates.json";
import type { Person } from "@/types/profile";
import { rankMatches } from "./matching";
import { toMatchResult } from "./match-view";

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
  // Both ids end up inside a Firestore path, so both must be simple ids.
  if (!isIdValidFormat(customerId) || !isIdValidFormat(input.matchId))
    return { ok: false, reason: "not_found" };

  const cRef = customers().doc(customerId);
  const sRef = cRef.collection("sentMatches").doc(input.matchId);

  return db.runTransaction(async (tx) => {
    // All reads first, then all writes (a Firestore transaction rule).
    const [cSnap, sSnap] = await Promise.all([tx.get(cRef), tx.get(sRef)]);

    // Ownership BEFORE anything else, so someone else's customer is indistinguishable from a missing one.
    if (!cSnap.exists || cSnap.data()?.matchmakerId !== matchmakerId)
      return { ok: false, reason: "not_found" } as const;
    if (sSnap.exists) return { ok: false, reason: "duplicate" } as const;

    const current = cSnap.data()!.stage as Stage;
    const next: Stage =
      current === "Onboarded" || current === "Verified"
        ? "Profile Shared"
        : current;

    if (next !== current) tx.update(cRef, { stage: next });
    tx.set(sRef, {
      matchId: input.matchId,
      subject: input.subject,
      body: input.body,
      sentAt: new Date(),
      sentBy: matchmakerId,
    });

    return { ok: true, stage: next } as const;
  });
}

const POOL = candidates as unknown as Person[];

export function getMatches(customer: Customer): MatchResult[] {
  const today = new Date();
  return rankMatches(customer, POOL, today).map((s) => toMatchResult(s, today));
}

import type { EmailTemplate } from "@/types/profile";

const templates = () => db.collection("templates");
const MAX_TEMPLATES = 20;

type TemplateFields = { name: string; subject: string; body: string };

export async function listTemplates(
  matchmakerId: string,
): Promise<EmailTemplate[]> {
  const snap = await templates()
    .where("matchmakerId", "==", matchmakerId)
    .get();
  // Sort in code (oldest first). Sorting in the query would need a composite index.
  return snap.docs
    .sort(
      (a, b) =>
        (a.data().createdAt as Timestamp).toMillis() -
        (b.data().createdAt as Timestamp).toMillis(),
    )
    .map((d) => ({
      id: d.id,
      name: d.data().name,
      subject: d.data().subject,
      body: d.data().body,
    }));
}

export async function createTemplate(
  matchmakerId: string,
  input: TemplateFields,
): Promise<EmailTemplate | "limit"> {
  const existing = await templates()
    .where("matchmakerId", "==", matchmakerId)
    .count()
    .get();
  if (existing.data().count >= MAX_TEMPLATES) return "limit";
  const now = new Date();
  const ref = await templates().add({
    ...input,
    matchmakerId,
    createdAt: now,
    updatedAt: now,
  });
  return { id: ref.id, ...input };
}

// Returns undefined when the template doesn't exist OR belongs to someone else (same ownership rule as customers).
async function ownedTemplate(id: string, matchmakerId: string) {
  if (!isIdValidFormat(id)) return undefined;
  const ref = templates().doc(id);
  const snap = await ref.get();
  return snap.exists && snap.data()?.matchmakerId === matchmakerId
    ? ref
    : undefined;
}

export async function updateTemplate(
  id: string,
  matchmakerId: string,
  input: TemplateFields,
): Promise<EmailTemplate | undefined> {
  const ref = await ownedTemplate(id, matchmakerId);
  if (!ref) return undefined;
  await ref.update({ ...input, updatedAt: new Date() });
  return { id, ...input };
}

export async function deleteTemplate(
  id: string,
  matchmakerId: string,
): Promise<boolean> {
  const ref = await ownedTemplate(id, matchmakerId);
  if (!ref) return false;
  await ref.delete();
  return true;
}

export async function getCachedExplanations(
  customerId: string,
): Promise<Record<string, { sig: string; text: string }>> {
  const snap = await customers()
    .doc(customerId)
    .collection("explanations")
    .get();
  return Object.fromEntries(
    snap.docs.map((d) => [
      d.id,
      { sig: d.data().sig as string, text: d.data().text as string },
    ]),
  );
}

export async function saveExplanations(
  customerId: string,
  items: Record<string, { sig: string; text: string }>,
) {
  const col = customers().doc(customerId).collection("explanations");
  const batch = db.batch();
  for (const [id, v] of Object.entries(items))
    batch.set(col.doc(id), { ...v, createdAt: new Date() }); // doc id = candidate id
  await batch.commit();
}

export async function getTemplate(
  id: string,
  matchmakerId: string,
): Promise<EmailTemplate | undefined> {
  const ref = await ownedTemplate(id, matchmakerId); // ownership check, same helper as update/delete
  if (!ref) return undefined;
  const d = (await ref.get()).data()!;
  return { id, name: d.name, subject: d.subject, body: d.body };
}
