const domains = [
  { label: "Page / Screen Builders", status: "active" },
  { label: "Form Builders", status: "planned" },
  { label: "App Builders (low-code / vibe coding)", status: "planned" },
];

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3">
          M0 — Foundations
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
          Signal
        </h1>
        <p className="text-neutral-500 mb-10">
          A product-intelligence agent that watches builder tools and turns
          the noise into digests worth reading.
        </p>

        <ul className="space-y-3">
          {domains.map((d) => (
            <li
              key={d.label}
              className="flex items-center justify-between border-b border-neutral-100 pb-3"
            >
              <span className="text-sm text-neutral-700">{d.label}</span>
              <span
                className={
                  "text-xs px-2 py-0.5 rounded-full font-medium " +
                  (d.status === "active"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-400")
                }
              >
                {d.status}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-neutral-400 mt-10">
          The dashboard and chat land in later milestones. This page just
          proves the app is deployed and talking to the repo.
        </p>
      </div>
    </main>
  );
}
