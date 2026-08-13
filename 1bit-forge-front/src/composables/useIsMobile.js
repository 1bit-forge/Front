import { onMounted, onUnmounted, ref } from 'vue'

const MOBILE_QUERY = '(max-width: 600px)'

/**
 * 與 main.css 的 @media (max-width: 600px) 斷點一致，
 * 僅視手機為窄屏，iPad（768px 以上）不受影響。
 */
export function useIsMobile() {
  const mediaQuery = typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY) : null
  const isMobile = ref(mediaQuery?.matches ?? false)

  function handleChange(event) {
    isMobile.value = event.matches
  }

  onMounted(() => {
    mediaQuery?.addEventListener('change', handleChange)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', handleChange)
  })

  return { isMobile }
}
