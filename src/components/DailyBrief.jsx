import { useNews } from '../hooks/useNews'

const CATEGORY_STYLES = {
  PROPERTY: 'text-cmd-blue border-[#00c2ff33] bg-[#00c2ff0d]',
  MACRO: 'text-cmd-orange border-[#ff6b2b33] bg-[#ff6b2b0d]',
  MARKET: 'text-cmd-green border-[#7fff6e33] bg-[#7fff6e0d]',
}

const SENTIMENT_CONFIG = {
  POS: { icon: '▲', label: 'POS', color: 'text-cmd-green' },
  NEG: { icon: '▼', label: 'NEG', color: 'text-[#ef4444]' },
  NEU: { icon: '●', label: 'NEU', color: 'text-cmd-muted' },
}

function SkeletonRow() {
  return (
    <div className="px-4 py-3 border-b border-cmd-border">
      <div className="flex items-center gap-2 mb-2">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>
      <div className="skeleton h-3 w-full rounded mb-1" />
      <div className="skeleton h-3 w-3/4 rounded" />
    </div>
  )
}

function ArticleRow({ article }) {
  const catStyle = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.MARKET
  const sentiment = SENTIMENT_CONFIG[article.sentiment] || SENTIMENT_CONFIG.NEU

  return (
    <div className="px-4 py-3 border-b border-cmd-border hover:bg-[#1a1d21] transition-colors">
      <div className="flex items-start gap-2 mb-1.5">
        <span
          className={`font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${catStyle}`}
        >
          {article.category}
        </span>
        <p className="text-sm text-gray-200 leading-snug line-clamp-2">
          {article.title}
        </p>
      </div>
      <div className="flex items-center gap-3 pl-0">
        <span className="font-mono text-[10px] text-cmd-dim">{article.timeAgo}</span>
        <span className={`font-mono text-[10px] font-bold ${sentiment.color}`}>
          {sentiment.icon} {sentiment.label}
        </span>
      </div>
    </div>
  )
}

export default function DailyBrief() {
  const { articles, loading, error, fromCache, clearCache } = useNews()

  return (
    <div className="panel flex flex-col flex-1 overflow-hidden min-h-0">
      {/* Header */}
      <div className="panel-header flex items-center justify-between shrink-0">
        <span>Daily Brief</span>
        <div className="flex items-center gap-2">
          {fromCache && (
            <span className="font-mono text-[10px] text-cmd-dim border border-cmd-border px-1.5 py-0.5 rounded">
              CACHED
            </span>
          )}
          {fromCache && (
            <button
              onClick={clearCache}
              className="font-mono text-[10px] text-cmd-muted hover:text-cmd-blue transition-colors"
              title="Refresh news"
            >
              ↻
            </button>
          )}
          {articles.length > 0 && (
            <span className="font-mono text-[10px] text-cmd-dim">
              {articles.length} stories
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && (
          <>
            {[...Array(6)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        )}

        {error && !loading && (
          <div className="p-4 text-xs font-mono text-[#ef4444] bg-[#ef444411] mx-3 my-2 rounded border border-[#ef444433]">
            ⚠ {error}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="p-6 text-center text-cmd-dim font-mono text-xs">
            No articles loaded.
          </div>
        )}

        {!loading && articles.map((article) => (
          <ArticleRow key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
