import { useState, useCallback } from 'react'

const STORAGE_KEY = 'bookmark-dashboard-data'

const INITIAL_CATEGORIES = ['전체', '개발', '디자인', '참고자료', '영상', '기타']

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { bookmarks: [], categories: INITIAL_CATEGORIES }
    return JSON.parse(raw)
  } catch {
    return { bookmarks: [], categories: INITIAL_CATEGORIES }
  }
}

function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * 북마크 CRUD + 카테고리 관리 훅.
 * 나중에 Node.js API로 교체할 때는 saveToStorage → fetch POST/PUT/DELETE 로만 바꾸면 됨.
 */
export function useBookmarks() {
  const [state, setState] = useState(() => loadFromStorage())

  const { bookmarks, categories } = state

  const persist = useCallback((nextState) => {
    setState(nextState)
    saveToStorage(nextState)
  }, [])

  const addBookmark = useCallback((bookmark) => {
    const next = {
      ...state,
      bookmarks: [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          rating: 0,
          category: '기타',
          ...bookmark,
        },
        ...state.bookmarks,
      ],
    }
    persist(next)
  }, [state, persist])

  const updateBookmark = useCallback((id, patch) => {
    const next = {
      ...state,
      bookmarks: state.bookmarks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }
    persist(next)
  }, [state, persist])

  const deleteBookmark = useCallback((id) => {
    const next = {
      ...state,
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    }
    persist(next)
  }, [state, persist])

  const addCategory = useCallback((name) => {
    if (state.categories.includes(name)) return
    const next = { ...state, categories: [...state.categories, name] }
    persist(next)
  }, [state, persist])

  return { bookmarks, categories, addBookmark, updateBookmark, deleteBookmark, addCategory }
}
