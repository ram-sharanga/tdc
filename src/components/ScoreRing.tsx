import type { CSSProperties } from "react";

export default function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="ring"
      style={{ "--p": score } as CSSProperties}
      aria-label={`Score ${score} out of 100`}
    >
      <b>{score}</b>
    </div>
  );
}
