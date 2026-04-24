import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'bookmark-dashboard-data'

const INITIAL_CATEGORIES = ['전체', '개발', '디자인', '참고자료', '영상', '기타']

async function saveToStorage(data) {
  // localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  try {
    await fetch('/api/save-bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.error('Failed to save bookmarks:', error)
  }
}

async function uploadImageFile(file) {
  try {
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: file,
    })
    const result = await response.json()
    if (result.fileName) {
      return `/images/${result.fileName}`
    }
  } catch {
    console.error('이미지 업로드 실패')
  }
  return ''
}

async function deleteImageFile(thumbnailPath) {
  if (!thumbnailPath?.startsWith('/images/')) return
  try {
    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: thumbnailPath.replace('/images/', '') }),
    })
    const result = await response.json()
    if (!result.success) {
      console.error('Failed to delete old thumbnail')
    }
  } catch (error) {
    console.error('Failed to delete old thumbnail:', error)
  }
}

/**
 * 북마크 CRUD + 카테고리 관리 훅.
 */
export function useBookmarks() {
  // const [state, setState] = useState({
  //   bookmarks: [], categories: INITIAL_CATEGORIES
  // })
  const [bookmarks, setBookmarks] = useState([])
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)

  useEffect(() => {
    async function loadFromStorage() {
      try {
        const response = await fetch('/public/data/bookmarks.json')
        const data = await response.json()
        if (data && data.bookmarks && data.categories) {
          setBookmarks(data.bookmarks)
          setCategories(data.categories)
        }
      } catch {
        setBookmarks([])
        setCategories(INITIAL_CATEGORIES)
      }
    }

    loadFromStorage();
  }, [])

  const persist = useCallback((updater) => {
    const nextState = typeof updater === 'function' ? updater({ bookmarks, categories }) : updater
    setBookmarks(nextState.bookmarks)
    setCategories(nextState.categories)
    saveToStorage(nextState)
  }, [bookmarks, categories])

  const persistIndi = useCallback((stateName, updater) => {
    const nextState = {};
    if (stateName === 'bookmarks') {
      nextState.bookmarks = typeof updater === 'function' ? updater(bookmarks) : updater
      setBookmarks(nextState.bookmarks)
    } else if (stateName === 'categories') {
      nextState.categories = typeof updater === 'function' ? updater(categories) : updater
      setCategories(nextState.categories)
    }
    saveToStorage({ bookmarks: nextState.bookmarks || bookmarks, categories: nextState.categories || categories })
  }, [bookmarks, categories])



  // --------- 북마크 CRUD ---------
  const addBookmark = useCallback(async (bookmark, imageFormData) => {
    let thumbnail = bookmark.thumbnail ?? ''
    if (thumbnail && imageFormData) {
      thumbnail = await uploadImageFile(imageFormData)
    }

    const nextBookmark = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      rating: 0,
      category: '기타',
      ...bookmark,
      thumbnail,
    }

    persist((prev) => ({
      ...prev,
      bookmarks: [nextBookmark, ...prev.bookmarks],
    }))
  }, [persist])

  const updateBookmark = useCallback(async (id, patch, imageFormData) => {
    const matchData = bookmarks.find((b) => b.id === id)
    if (!matchData) return

    const nextPatch = { ...patch }
    const isThumbnailRemoved = matchData.thumbnail && matchData.thumbnail !== nextPatch.thumbnail
    if (isThumbnailRemoved) {
      await deleteImageFile(matchData.thumbnail)
    }

    if (nextPatch.thumbnail && imageFormData) {
      nextPatch.thumbnail = await uploadImageFile(imageFormData)
    }

    persist((prev) => ({
      ...prev,
      bookmarks: prev.bookmarks.map((b) => (b.id === id ? { ...b, ...nextPatch } : b)),
    }))
  }, [bookmarks, persist])

  const deleteBookmark = useCallback((id) => {
    persist((prev) => ({
      ...prev,
      bookmarks: prev.bookmarks.filter((b) => b.id !== id),
    }))
  }, [persist])


  // --------- 카테고리 CRUD ---------
  const addCategory = useCallback((name) => {
    const normalized = name.trim()
    if (!normalized) return

    persist((prev) => {
      if (prev.categories.includes(normalized)) return prev
      return { ...prev, categories: [...prev.categories, normalized] }
    })
  }, [persist])

  const moveCategory = useCallback((name, direction) => {
    if (name === '전체' || direction === 0) return

    persist((prev) => {
      const list = [...prev.categories]
      const index = list.indexOf(name)
      if (index === -1) return prev

      const targetIndex = index + direction
      if (targetIndex < 1 || targetIndex >= list.length) return prev

        ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
      return { ...prev, categories: list }
    })
  }, [persist])

  const deleteCategory = useCallback((name) => {
    persist((prev) => {
      if (name === '전체' || name === '기타') return prev
      if (!prev.categories.includes(name)) return prev

      const hasEtc = prev.categories.includes('기타')
      const nextCategories = prev.categories.filter((category) => category !== name)
      const categories = hasEtc ? nextCategories : [...nextCategories, '기타']

      const bookmarks = prev.bookmarks.map((bookmark) => (
        bookmark.category === name
          ? { ...bookmark, category: '기타' }
          : bookmark
      ))

      return { ...prev, categories, bookmarks }
    })
  }, [persist])

  const updateCategories = useCallback((newCategories) => {
    let normalizedCategories = [...newCategories]
    if (!normalizedCategories.includes('전체')) {
      normalizedCategories = ['전체', ...normalizedCategories]
    }
    if (!normalizedCategories.includes('기타')) {
      normalizedCategories = [...normalizedCategories, '기타']
    }

    persist((prev) => ({
      ...prev,
      categories: normalizedCategories,
      bookmarks: prev.bookmarks.map((bookmark) => {
        if (!normalizedCategories.includes(bookmark.category)) {
          return { ...bookmark, category: '기타' }
        }
        return bookmark
      }),
    }))
  }, [persist])

  return {
    bookmarks,
    categories,
    persist,
    persistIndi,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    addCategory,
    moveCategory,
    deleteCategory,
    updateCategories
  }
}
