function tanzaniaCountdown() {
  const target = new Date('2026-07-01T00:00:00+10:00')
  const now = new Date()
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)))
}

function formatDate() {
  return new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function TopBar({ tasks, checklistDone, checklistTotal }) {
  const completedCount = tasks.filter((t) => t.is_completed).length
  const totalCount = tasks.length
  const days = tanzaniaCountdown()

  return (
    <div className="sticky top-0 z-50 bg-cmd-surface border-b border-cmd-border px-6 py-3 flex items-center gap-0">
      {/* Logo */}
      <span className="font-mono text-cmd-blue font-bold text-base tracking-tight whitespace-nowrap mr-6">
        Jason's Command Centre
      </span>

      {/* Stats */}
      <div className="flex items-center gap-5 flex-1 overflow-x-auto">
        <Stat label="Tasks Done" value={`${completedCount}/${totalCount}`} color="text-cmd-blue" />
        <Divider />
        <Stat label="Palantir Prep" value="WK 2/6" color="text-cmd-green" />
        <Divider />
        <Stat label="Last Run" value="1:18:18" color="text-cmd-muted" />
        <Divider />
        <Stat label="Tanzania" value={`${days}d`} color="text-cmd-orange" />
      </div>

      {/* Right side: date + status dot */}
      <div className="flex items-center gap-3 ml-6 shrink-0">
        <span className="font-mono text-xs text-cmd-muted whitespace-nowrap">{formatDate()}</span>
        <span className="pulsing-dot" />
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="font-mono text-xs text-cmd-muted uppercase tracking-wider">{label}:</span>
      <span className={`font-mono text-sm font-bold ${color}`}>{value}</span>
    </div>
  )
}

function Divider() {
  return <span className="text-cmd-border font-mono select-none">|</span>
}
