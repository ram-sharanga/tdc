import { STAGES, type Stage } from "@/types/profile";

export default function Stepper({ current }: { current: Stage }) {
  // Position of the current stage in the ordered list; everything before it is "done".
  const i = STAGES.indexOf(current);

  return (
    <div className="stepper" aria-label="Journey progress">
      {STAGES.map((s, k) => (
        // k < i => completed, k === i => current, otherwise upcoming (no extra class)
        <div key={s} className={`step ${k < i ? "done" : k === i ? "now" : ""}`}>
          {s}
        </div>
      ))}
    </div>
  );
}