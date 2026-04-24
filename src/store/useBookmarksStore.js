import { create } from 'zustand';

const INITIAL_CATEGORIES = ['전체', '개발', '디자인', '참고자료', '영상', '기타']

const useBookmarksStore = create((set, get) => ({
  bookmarks: [],
  categories: INITIAL_CATEGORIES,
  isInitialized: false,
  actions : {
    setBookmarks: (bookmarks) => set({ bookmarks }),
    setCategories: (categories) => set({ categories }),
    initData: async () => {
      try {
        const response = await fetch('/public/data/bookmarks.json')
        const data = await response.json()
        if (data && data.bookmarks && data.categories) {
          set({ bookmarks: data.bookmarks ? data.bookmarks : [], categories: data.categories ? data.categories : INITIAL_CATEGORIES, isInitialized: true })
        }
      } catch {
        console.error('Failed to load initial data')
      }
    },
    addBookmark: async (bookmark, imageFormData) => {
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

      set((state) => ({
        bookmarks: [nextBookmark, ...state.bookmarks],
      }))

      // 저장
      try {
        await saveToStorage({ bookmarks: get().bookmarks, categories: get().categories })
      } catch (error) {
        console.error('Failed to save bookmarks:', error)
      }
    },
    editBookmark: async (id, patch, imageFormData) => {
      const matchData = get().bookmarks.find((b) => b.id === id)
      if (!matchData) return;

      const nextPatch = { ...patch }
      const isThumbnailRemoved = matchData.thumbnail && matchData.thumbnail !== nextPatch.thumbnail
      if (isThumbnailRemoved) {
        deleteImageFile(matchData.thumbnail)
      }
      if (nextPatch.thumbnail && imageFormData) {
        nextPatch.thumbnail = await uploadImageFile(imageFormData);
      }

      set((state) => ({
        bookmarks: state.bookmarks.map((b) => (b.id === id ? { ...b, ...nextPatch } : b)),
      }))

      saveToStorage({ bookmarks: get().bookmarks, categories: get().categories })
    },
    updateBookmark: async (newBookmarks) => {
      set((state) => ({
        bookmarks: newBookmarks,
      }))

      saveToStorage({ bookmarks: get().bookmarks, categories: get().categories })
    },
    deleteBookmark: async (id) => {
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
      }))

      saveToStorage({ bookmarks: get().bookmarks, categories: get().categories })
    },
    updateCategories: (newCategories) => {
      let normalizedCategories = [...newCategories]
      if (!normalizedCategories.includes('전체')) {
        normalizedCategories = ['전체', ...normalizedCategories]
      }
      if (!normalizedCategories.includes('기타')) {
        normalizedCategories = [...normalizedCategories, '기타']
      }

      set((state) => ({
        categories: normalizedCategories,
        bookmarks: state.bookmarks.map((bookmark) => {
          if (!normalizedCategories.includes(bookmark.category)) {
            return { ...bookmark, category: '기타' }
          }
          return bookmark
        })
      }))

      saveToStorage({ bookmarks: get().bookmarks, categories: get().categories })
    },
    addCategory: (name) => {
      const normalized = name.trim()
      if (!normalized) return

      set((state) => {
        if (state.categories.includes(normalized)) return state
        return { categories: [...state.categories, normalized] }
      })

      saveToStorage({ bookmarks: get().bookmarks, categories: get().categories })
    },
    moveCategory: (name, direction) => {
      if (name === '전체' || direction === 0) return

      set((state) => {
        const list = [...state.categories]
        const index = list.indexOf(name)
        if (index === -1) return state

        const targetIndex = index + direction
        if (targetIndex < 1 || targetIndex >= list.length) return state

          ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
        return { categories: list }
      })
      
      saveToStorage({ bookmarks: get().bookmarks, categories: get().categories })
    },
    deleteCategory: (name) => {
      set((state) => {
        if (name === '전체' || name === '기타') return state
        if (!state.categories.includes(name)) return state

        const hasEtc = state.categories.includes('기타')
        const nextCategories = state.categories.filter((category) => category !== name)
        const categories = hasEtc ? nextCategories : [...nextCategories, '기타']

        const bookmarks = state.bookmarks.map((bookmark) => (
          bookmark.category === name
            ? { ...bookmark, category: '기타' }
            : bookmark
        ))

        return { categories, bookmarks }
      })

      saveToStorage({ bookmarks: get().bookmarks, categories: get().categories })
    },
  }
}))
export default useBookmarksStore;


async function saveToStorage(data) {
  try {
    const response = await fetch('/api/save-bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!result.success) console.error('Failed to save bookmarks');
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
    } else {
      return '';
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