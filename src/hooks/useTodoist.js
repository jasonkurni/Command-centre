import { useState, useEffect, useCallback } from 'react'

const TOKEN = import.meta.env.VITE_TODOIST_TOKEN
const BASE = '/api/todoist'

function authHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export function useTodoist() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    if (!TOKEN) {
      setLoading(false)
      setError('VITE_TODOIST_TOKEN not set')
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`${BASE}/rest/v2/tasks?filter=today%7Coverdue`, {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`Todoist API error: ${res.status}`)
      const data = await res.json()
      // Mark all fetched tasks as not completed (API only returns incomplete)
      setTasks(data.map((t) => ({ ...t, is_completed: false })))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = useCallback(async (content, label) => {
    if (!content.trim()) return
    try {
      const body = {
        content: content.trim(),
        ...(label ? { labels: [label] } : {}),
      }
      const res = await fetch(`${BASE}/rest/v2/tasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Add task failed: ${res.status}`)
      const newTask = await res.json()
      setTasks((prev) => [{ ...newTask, is_completed: false }, ...prev])
    } catch (err) {
      console.error(err)
    }
  }, [])

  const deleteTask = useCallback(async (id) => {
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      const res = await fetch(`${BASE}/rest/v2/tasks/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) {
        // Revert on failure
        fetchTasks()
        throw new Error(`Delete failed: ${res.status}`)
      }
    } catch (err) {
      console.error(err)
    }
  }, [fetchTasks])

  const toggleTask = useCallback(async (id, isCompleted) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: !isCompleted } : t))
    )
    try {
      const endpoint = isCompleted
        ? `${BASE}/rest/v2/tasks/${id}/reopen`
        : `${BASE}/rest/v2/tasks/${id}/close`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders(),
      })
      if (!res.ok) {
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, is_completed: isCompleted } : t))
        )
        throw new Error(`Toggle failed: ${res.status}`)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const pendingTasks = tasks.filter((t) => !t.is_completed)
  const completedTasks = tasks.filter((t) => t.is_completed)

  return {
    tasks,
    pendingTasks,
    completedTasks,
    loading,
    error,
    addTask,
    deleteTask,
    toggleTask,
    refetch: fetchTasks,
  }
}
