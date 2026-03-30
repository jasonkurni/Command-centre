import { useState } from 'react'

const PRIORITY_COLORS = {
  4: '#ef4444', // p1 - urgent
  3: '#eab308', // p2 - high
  2: '#6b7280', // p3 - medium
  1: '#4a5060', // p4 - low
}

const PRIORITY_LABELS = {
  4: 'P1',
  3: 'P2',
  2: 'P3',
  1: 'P4',
}

const TAG_OPTIONS = ['ibm', 'palantir', 'databricks', 'property', 'personal']

const TAG_COLORS = {
  ibm: 'text-[#00c2ff] border-[#00c2ff22]',
  palantir: 'text-[#7fff6e] border-[#7fff6e22]',
  databricks: 'text-[#ff6b2b] border-[#ff6b2b22]',
  property: 'text-[#a78bfa] border-[#a78bfa22]',
  personal: 'text-[#f59e0b] border-[#f59e0b22]',
}

function PriorityDot({ priority }) {
  const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS[1]
  const label = PRIORITY_LABELS[priority] || 'P4'
  return (
    <span
      className="font-mono text-[10px] font-bold leading-none px-1 py-0.5 rounded border"
      style={{
        color,
        borderColor: color + '44',
        backgroundColor: color + '11',
      }}
    >
      {label}
    </span>
  )
}

function TagBadge({ tag }) {
  if (!tag) return null
  const colorClass = TAG_COLORS[tag.toLowerCase()] || 'text-cmd-muted border-cmd-border'
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${colorClass} bg-transparent`}
    >
      {tag}
    </span>
  )
}

function TaskRow({ task, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const tag = task.labels?.[0] || null
  const isCompleted = task.is_completed

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 hover:bg-[#1a1d21] transition-colors cursor-default ${
        isCompleted ? 'opacity-50' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={() => onToggle(task.id, isCompleted)}
        className="shrink-0 w-3.5 h-3.5 accent-cmd-blue cursor-pointer"
        style={{ accentColor: '#00c2ff' }}
      />

      {/* Priority */}
      <PriorityDot priority={task.priority} />

      {/* Tag */}
      {tag && <TagBadge tag={tag} />}

      {/* Task text */}
      <span
        className={`flex-1 text-sm min-w-0 truncate ${
          isCompleted ? 'line-through text-cmd-dim' : 'text-gray-200'
        }`}
      >
        {task.content}
      </span>

      {/* Delete button */}
      <button
        onClick={() => onDelete(task.id)}
        className={`shrink-0 text-cmd-muted hover:text-[#ef4444] transition-colors font-mono text-base leading-none ml-1 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
        title="Delete task"
      >
        ×
      </button>
    </div>
  )
}

export default function TodoistPanel({ pendingTasks, completedTasks, loading, error, addTask, deleteTask, toggleTask }) {
  const [inputValue, setInputValue] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!inputValue.trim()) return
    addTask(inputValue.trim(), selectedTag || undefined)
    setInputValue('')
  }

  return (
    <div className="panel flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="panel-header flex items-center justify-between">
        <span>Tasks</span>
        <span className="text-cmd-blue font-mono text-xs">
          {pendingTasks.length + completedTasks.length} total
        </span>
      </div>

      {/* Add task form */}
      <form onSubmit={handleAdd} className="flex gap-2 p-3 border-b border-cmd-border">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="New task..."
          className="flex-1 bg-[#0a0b0d] border border-cmd-border rounded px-2.5 py-1.5 text-sm text-gray-200 placeholder-cmd-dim focus:outline-none focus:border-cmd-blue font-sans min-w-0"
        />
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="bg-[#0a0b0d] border border-cmd-border rounded px-2 py-1.5 text-xs font-mono text-cmd-muted focus:outline-none focus:border-cmd-blue cursor-pointer"
        >
          <option value="">tag</option>
          {TAG_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-cmd-blue text-black font-mono text-xs font-bold px-3 py-1.5 rounded hover:bg-[#00aadd] transition-colors shrink-0"
        >
          ADD
        </button>
      </form>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-8 rounded" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="p-4 text-xs font-mono text-[#ef4444] bg-[#ef444411] mx-3 my-2 rounded border border-[#ef444433]">
            ⚠ {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Pending */}
            {pendingTasks.length > 0 && (
              <>
                <div className="px-3 pt-3 pb-1">
                  <span className="font-mono text-[10px] tracking-widest text-cmd-muted uppercase">
                    Pending · {pendingTasks.length}
                  </span>
                </div>
                {pendingTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}
              </>
            )}

            {/* Completed */}
            {completedTasks.length > 0 && (
              <>
                <div className="px-3 pt-4 pb-1 border-t border-cmd-border mt-2">
                  <span className="font-mono text-[10px] tracking-widest text-cmd-dim uppercase">
                    Completed · {completedTasks.length}
                  </span>
                </div>
                {completedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}
              </>
            )}

            {pendingTasks.length === 0 && completedTasks.length === 0 && (
              <div className="p-6 text-center text-cmd-dim font-mono text-xs">
                No tasks. Add one above.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
