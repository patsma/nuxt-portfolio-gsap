/**
 * useVideoPoster - Extract first frame from video as poster
 *
 * Captures the video's first frame using canvas and returns it as a data URL.
 * Falls back to provided posterSrc if extraction fails.
 */
export function useVideoPoster(
  videoRef: Ref<HTMLVideoElement | null>,
  fallbackPoster?: string
) {
  const posterUrl = ref(fallbackPoster || '')
  const isLoading = ref(true)

  const extractFirstFrame = () => {
    const video = videoRef.value
    if (!video) return

    // Create offscreen canvas matching video dimensions
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw current frame (should be first frame after seek to 0)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to data URL (JPEG for smaller size)
    posterUrl.value = canvas.toDataURL('image/jpeg', 0.85)
    isLoading.value = false
  }

  onMounted(() => {
    const video = videoRef.value
    if (!video) return

    const handleSeeked = () => {
      extractFirstFrame()
      video.removeEventListener('seeked', handleSeeked)
    }

    const handleLoadedData = () => {
      // Seek to frame 0 to ensure we capture the first frame
      video.currentTime = 0
    }

    if (video.readyState >= 2) {
      // Already loaded
      video.currentTime = 0
      video.addEventListener('seeked', handleSeeked, { once: true })
    }
    else {
      video.addEventListener('loadeddata', handleLoadedData, { once: true })
      video.addEventListener('seeked', handleSeeked, { once: true })
    }
  })

  return { posterUrl, isLoading }
}
