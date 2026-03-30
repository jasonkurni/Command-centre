const FOCUS_ITEMS = [
  { emoji: '🤝', label: 'IBM Pipeline', time: '2h' },
  { emoji: '📚', label: 'Palantir Study', time: '1.5h' },
  { emoji: '🏠', label: 'Property Research', time: '1h' },
  { emoji: '🏃', label: 'Training', time: '45m' },
]

function tanzaniaCountdown() {
  const target = new Date('2026-07-01T00:00:00+10:00')
  return Math.max(0, Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24)))
}

function MetricCard({ label, value, sub, valueColor = 'text-cmd-blue' }) {
  return (
    <div className="panel p-3 flex flex-col gap-0.5">
      <span className="font-mono text-[10px] tracking-widest text-cmd-muted uppercase">{label}</span>
      <span className={`font-mono text-2xl font-bold leading-tight ${valueColor}`}>{value}</span>
      {sub && <span className="font-mono text-[10px] text-cmd-dim">{sub}</span>}
    </div>
  )
}

function ChecklistGroup({ week, items, onToggle }) {
  return (
    <div className="mb-3">
      <div className="font-mono text-[10px] tracking-widest text-cmd-muted uppercase mb-1 px-1">
        {week}
      </div>
      {items.map((item) => (
        <ChecklistItem key={item.id} item={item} onToggle={onToggle} />
      ))}
    </div>
  )
}

function ChecklistItem({ item, onToggle }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-1 hover:bg-[#1a1d21] rounded transition-colors group">
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => onToggle(item.id, item.done)}
        className="shrink-0 w-3.5 h-3.5 cursor-pointer"
        style={{ accentColor: '#00c2ff' }}
      />
      {item.notionPageUrl ? (
        <a
          href={item.notionPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 text-xs min-w-0 truncate hover:text-cmd-blue transition-colors cursor-pointer ${
            item.done ? 'line-through text-cmd-dim' : 'text-gray-300'
          }`}
          title={item.name}
        >
          {item.name}
        </a>
      ) : (
        <span
          className={`flex-1 text-xs min-w-0 truncate ${
            item.done ? 'line-through text-cmd-dim' : 'text-gray-300'
          }`}
          title={item.name}
        >
          {item.name}
        </span>
      )}
      <span className="font-mono text-[10px] text-cmd-dim shrink-0 ml-auto">{item.week}</span>
    </div>
  )
}

export default function RightPanel({ tasks, checklistGrouped, checklistDone, checklistTotal, notionLoading, notionError, toggleNotionItem }) {
  const completedCount = tasks.filter((t) => t.is_completed).length
  const days = tanzaniaCountdown()

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Today's Focus */}
      <div className="panel p-4 shrink-0">
        <div className="font-mono text-xs tracking-widest text-cmd-muted uppercase mb-3">
          Today's Focus
        </div>
        <div className="space-y-2">
          {FOCUS_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-sm">{item.emoji}</span>
              <span className="text-sm text-gray-200 flex-1">{item.label}</span>
              <span className="font-mono text-xs text-cmd-muted">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics 2×2 grid */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <MetricCard
          label="Tasks Done"
          value={completedCount}
          valueColor="text-cmd-blue"
        />
        <MetricCard
          label="Palantir Prep"
          value={`${checklistDone}/${checklistTotal}`}
          valueColor="text-cmd-green"
        />
        <MetricCard
          label="Last Run"
          value="1:18:18"
          sub="5:26/km"
          valueColor="text-cmd-muted"
        />
        <MetricCard
          label="Tanzania"
          value={`${days}d`}
          sub="until 2026-07-01"
          valueColor="text-cmd-orange"
        />
      </div>

      {/* Palantir Prep Checklist */}
      <div className="panel flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="panel-header shrink-0 flex items-center justify-between">
          <span>Palantir Prep</span>
          {checklistTotal > 0 && (
            <span className="font-mono text-xs text-cmd-green">
              {checklistDone}/{checklistTotal}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {notionLoading && (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-6 rounded" />
              ))}
            </div>
          )}

          {notionError && !notionLoading && (
            <div className="text-xs font-mono text-[#ef4444] bg-[#ef444411] p-2 rounded border border-[#ef444433]">
              ⚠ {notionError}
            </div>
          )}

          {!notionLoading && !notionError && Object.keys(checklistGrouped).length === 0 && (
            <div className="text-center text-cmd-dim font-mono text-xs py-4">
              No checklist items.
            </div>
          )}

          {!notionLoading &&
            Object.entries(checklistGrouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([week, items]) => (
                <ChecklistGroup
                  key={week}
                  week={week}
                  items={items}
                  onToggle={toggleNotionItem}
                />
              ))}
        </div>
      </div>
    </div>
  )
}
