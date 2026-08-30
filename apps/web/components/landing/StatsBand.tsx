const stats = [
  {
    stat: "$0",
    color: "#E93545",
    label: "Free forever",
    description: ["No launch slots, no featured pricing,", "and no credit card required."],
  },
  {
    stat: "5 min",
    color: "#3559E9",
    label: "AI-assisted listing",
    description: ["AI drafts your name, description,", "tags, and logo from your link."],
  },
  {
    stat: "100%",
    color: "#1CB061",
    label: "Ranked by builders",
    description: ["The trending feed is decided by real", "upvotes, never sponsorship."],
  },
]

export default function StatsBand() {
  return (
    <section className="border-y border-[var(--paper-border)] bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:grid-cols-3 sm:px-10 sm:py-16">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-5xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-6xl">
              {stat.stat}
            </p>
            <p className="mt-4 text-sm font-semibold text-white">
              <span
                className="box-decoration-clone px-2 py-1"
                style={{ backgroundColor: stat.color }}
              >
                {stat.label}
              </span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--paper-muted)]">
              <span className="block">{stat.description[0]}</span>
              <span className="block">{stat.description[1]}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
