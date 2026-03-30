import { useState, useEffect } from 'react'

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const NEWS_BASE = '/api/news'
const CLAUDE_BASE = '/api/claude'
const CACHE_KEY = 'news_cache'
const CACHE_TTL = 2 * 60 * 60 * 1000 // 2 hours

const QUERIES = [
  { q: 'Melbourne property market', category: 'PROPERTY', size: 4 },
  { q: 'RBA interest rates Australia', category: 'MACRO', size: 3 },
  { q: 'ASX markets global macro', category: 'MARKET', size: 3 },
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

async function fetchNewsArticles() {
  const results = await Promise.all(
    QUERIES.map(async ({ q, category, size }) => {
      const url = `${NEWS_BASE}/v2/everything?q=${encodeURIComponent(q)}&pageSize=${size}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`)
      const data = await res.json()
      return (data.articles || []).map((a, i) => ({
        id: `${category}-${i}`,
        category,
        title: a.title,
        publishedAt: a.publishedAt,
        url: a.url,
        timeAgo: timeAgo(a.publishedAt),
        sentiment: 'NEU',
      }))
    })
  )
  return results.flat().slice(0, 10)
}

async function classifyHeadlines(articles) {
  if (!ANTHROPIC_API_KEY) return articles

  const headlineList = articles
    .map((a, i) => `${i}. ${a.title}`)
    .join('\n')

  const prompt = `You are classifying news headlines for an Australian property investor and tech sales professional considering a career move to Palantir or Databricks.

Classify each headline as:
- POS: positive impact on their interests (rising property values, falling rates, strong tech job market, good ASX performance)
- NEG: negative impact (falling property, rising rates, tech layoffs, poor market conditions)
- NEU: neutral or unclear impact

Headlines:
${headlineList}

Return ONLY a JSON array in this exact format, no other text:
[{"id": 0, "sentiment": "POS"}, {"id": 1, "sentiment": "NEG"}, ...]`

  try {
    const res = await fetch(`${CLAUDE_BASE}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) throw new Error(`Claude API error: ${res.status}`)
    const data = await res.json()
    const text = data.content?.[0]?.text || '[]'

    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return articles

    const classifications = JSON.parse(match[0])
    return articles.map((a, i) => {
      const found = classifications.find((c) => c.id === i)
      return found ? { ...a, sentiment: found.sentiment } : a
    })
  } catch (err) {
    console.error('Claude classification failed:', err)
    return articles
  }
}

export function useNews() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    async function load() {
      // Check cache
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            setArticles(parsed.data)
            setFromCache(true)
            setLoading(false)
            return
          }
        }
      } catch {
        // ignore cache errors
      }

      if (!NEWS_API_KEY) {
        setError('VITE_NEWS_API_KEY not set')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const rawArticles = await fetchNewsArticles()
        const classified = await classifyHeadlines(rawArticles)

        // Save to cache
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: classified, timestamp: Date.now() })
          )
        } catch {
          // ignore storage errors
        }

        setArticles(classified)
        setFromCache(false)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [refreshToken])

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    setRefreshToken((n) => n + 1)
  }

  return { articles, loading, error, fromCache, clearCache }
}
