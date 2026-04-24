import { useEffect } from 'react'
import imageCompression from 'browser-image-compression';

/**
 * 전역 Ctrl+V 이벤트를 감지하여 클립보드 URL을 파싱하고
 * onUrlDetected 콜백을 호출하는 커스텀 훅.
 * 입력 필드(input, textarea)에 포커스가 있을 때는 동작하지 않음.
 */
export function useClipboard(onUrlDetected) {
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (!((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v')) return

      const tag = document.activeElement?.tagName?.toLowerCase()
      const isEditable = document.activeElement?.isContentEditable
      if (tag === 'input' || tag === 'textarea' || isEditable) return

      try {
        const text = await navigator.clipboard.readText()
        const trimmed = text.trim()
        if (isValidUrl(trimmed)) {
          e.preventDefault()
          onUrlDetected({
            type: 'text',
            url: trimmed,
          })
        }
      } catch {
        // clipboard 권한 없을 때 paste 이벤트로 fallback
      }
    }

    const handlePaste = async (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase()
      const isEditable = document.activeElement?.isContentEditable
      if (tag === 'input' || tag === 'textarea' || isEditable) return

      if (!e.clipboardData) return;

      const items = e.clipboardData.items;
      if (!items?.length) return;
      const nowItem = items[0];
      if (nowItem.type.indexOf('text') !== -1) {
        // 텍스트
        const text = e.clipboardData?.getData('text') ?? ''
        const trimmed = text.trim()
        if (isValidUrl(trimmed)) {
          e.preventDefault()
          onUrlDetected({
            type: 'text',
            url: trimmed
          })
        }
      } else if (nowItem.type.indexOf('image') !== -1) {
        // 이미지
        const file = nowItem.getAsFile();

        const compressedImage = await imageCompression(file, { maxWidthOrHeight: 260, useWebWorker: true, fileType: 'image/webp' });
        onUrlDetected({
          type: 'image',
          url: URL.createObjectURL(compressedImage),
          formData: compressedImage,
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('paste', handlePaste)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('paste', handlePaste)
    }
  }, [onUrlDetected])
}

function isValidUrl(str) {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
