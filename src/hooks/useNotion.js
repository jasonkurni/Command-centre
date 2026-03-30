import { useState, useEffect, useCallback } from 'react'

const NOTION_TOKEN = import.meta.env.VITE_NOTION_TOKEN
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID
const BASE = '/api/notion'

function notionHeaders() {
  return {
    Authorization: `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  }
}

function parseItem(page) {
  const props = page.properties || {}

  const name =
    props.Name?.title?.[0]?.plain_text ||
    props.name?.title?.[0]?.plain_text ||
    'Untitled'

  const done =
    props.Done?.checkbox ??
    props.done?.checkbox ??
    false

  const week =
    props.Week?.select?.name ||
    props.week?.select?.name ||
    ''

  const notionPageUrl =
    props.NotionPageURL?.url ||
    props.notionPageUrl?.url ||
    props.URL?.url ||
    null

  return {
    id: page.id,
    name,
    done,
    week,
    notionPageUrl,
  }
}

export function useNotion() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchItems = useCallback(async () => {
    if (!NOTION_TOKEN || !DATABASE_ID) {
      setLoading(false)
      setError('Notion credentials not set')
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`${BASE}/v1/databases/${DATABASE_ID}/query`, {
        method: 'POST',
        headers: notionHeaders(),
        body: JSON.stringify({
          sorts: [{ property: 'Week', direction: 'ascending' }],
        }),
      })
      if (!res.ok) throw new Error(`Notion API error: ${res.status}`)
      const data = await res.json()
      const parsed = (data.results || []).map(parseItem)
      setItems(parsed)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const toggleItem = useCallback(async (pageId, currentDone) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === pageId ? { ...item, done: !currentDone } : item
      )
    )
    try {
      const res = await fetch(`${BASE}/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: notionHeaders(),
        body: JSON.stringify({
          properties: {
            Done: { checkbox: !currentDone },
          },
        }),
      })
      if (!res.ok) {
        // Revert on failure
        setItems((prev) =>
          prev.map((item) =>
            item.id === pageId ? { ...item, done: currentDone } : item
          )
        )
        throw new Error(`Toggle Notion item failed: ${res.status}`)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  // Group items by week
  const grouped = items.reduce((acc, item) => {
    const key = item.week || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const doneCount = items.filter((i) => i.done).length

  return {
    items,
    grouped,
    doneCount,
    totalCount: items.length,
    loading,
    error,
    toggleItem,
    refetch: fetchItems,
  }
}
