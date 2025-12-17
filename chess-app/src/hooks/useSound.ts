import { useCallback, useRef, useEffect } from 'react'

type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'game-over'

export function useSound() {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    'move': null,
    'capture': null,
    'check': null,
    'castle': null,
    'game-over': null
  })

  useEffect(() => {
    // Initialize audio objects
    const sounds: Record<SoundType, string> = {
      'move': '/sounds/move.mp3',
      'capture': '/sounds/capture.mp3',
      'check': '/sounds/check.mp3',
      'castle': '/sounds/castle.mp3',
      'game-over': '/sounds/game-over.mp3'
    }

    Object.entries(sounds).forEach(([key, path]) => {
      const audio = new Audio(path)
      audio.preload = 'auto'
      audioRefs.current[key as SoundType] = audio
    })
  }, [])

  const playSound = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type]
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(err => {
        // Ignore auto-play errors (user interaction required usually)
        console.warn('Audio play failed', err)
      })
    }
  }, [])

  return { playSound }
}
