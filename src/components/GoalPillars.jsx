function ProgressBar({ pct }) {
  return (
    <div className="mt-3 mb-1">
      <div className="bg-[#1e2025] rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-cmd-blue h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  )
}

function PillarCard({ emoji, title, children, showProgress, progressPct, subtext }) {
  return (
    <div className="panel p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{emoji}</span>
        <span className="font-mono text-xs tracking-widest text-cmd-muted uppercase">{title}</span>
      </div>

      {showProgress && (
        <>
          <ProgressBar pct={progressPct} />
          <div className="font-mono text-xs text-cmd-muted mb-2">{Math.round(progressPct)}%</div>
        </>
      )}

      <p className="text-xs text-[#9ca3af] leading-relaxed mt-auto">{children}</p>

      {subtext && (
        <p className="text-xs text-cmd-dim font-mono mt-2">{subtext}</p>
      )}
    </div>
  )
}

export default function GoalPillars({ checklistDone, checklistTotal }) {
  const progressPct = checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0

  return (
    <div className="grid grid-cols-3 gap-4">
      <PillarCard emoji="💼" title="IBM Execution">
        Perth Bears close · Workshop done · Outbound active
      </PillarCard>

      <PillarCard
        emoji="🎯"
        title="Career Off-Ramp"
        showProgress
        progressPct={progressPct}
        subtext={`WK 2/6 · Palantir / Databricks · ${checklistDone}/${checklistTotal} done`}
      >
        Interview prep · AE target roles · Network activation
      </PillarCard>

      <PillarCard emoji="🏠" title="Property Portfolio">
        2nd IP search · Perth inspection Apr · Equity release in progress
      </PillarCard>
    </div>
  )
}
