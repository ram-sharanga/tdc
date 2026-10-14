import { Fragment, type ReactNode } from "react";

export default function InfoGroup({
  title,
  pairs,
}: {
  title: string;
  pairs: [string, ReactNode][];
}) {
  return (
    <section className="group">
      <h3>{title}</h3>
      <dl>
        {pairs.map(([label, value]) => (
          <Fragment key={label}>
            <dt>{label}</dt>
            <dd>
              {value === undefined || value === null || value === "" ? (
                <span className="muted">Not provided</span>
              ) : (
                value
              )}
            </dd>{" "}
          </Fragment>
        ))}
      </dl>
    </section>
  );
}
