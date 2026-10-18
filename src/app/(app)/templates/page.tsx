import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { listTemplates } from "@/lib/repo";
import TemplateManager from "@/components/TemplateManager";

async function TemplatesData() {
  const session = await requireSession();
  return (
    <TemplateManager initial={await listTemplates(session.matchmakerId)} />
  );
}

export default function TemplatesPage() {
  return (
    <main className="wrap">
      <Suspense fallback={<p className="muted">Loading templates...</p>}>
        <TemplatesData />
      </Suspense>
    </main>
  );
}
