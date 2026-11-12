import { useEffect } from 'react'
import { useStore } from '../store/useStore'

/** Returns true when the browser can create a WebGL context. */
export const detectWebGL = (): boolean => {
  // `?webgl=off` simulates a browser without WebGL, to preview the fallback behaviour.
  if (new URLSearchParams(window.location.search).get('webgl') === 'off') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ?? canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

/**
 * Keeps the store in sync with the device: reduced-motion preference, and whether the
 * layout is "compact" (phones and small or touch-first screens), which switches the
 * immersive mode to its simplified version.
 */
export const useEnvironment = () => {
  useEffect(() => {
    const { setReducedMotion, setCompact } = useStore.getState()

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => setReducedMotion(motion.matches)
    onMotion()
    motion.addEventListener('change', onMotion)

    const coarse = window.matchMedia('(pointer: coarse)')
    const onSize = () => {
      const small = window.innerWidth < 820 || window.innerHeight < 520
      const portrait = window.innerWidth < window.innerHeight * 0.85
      setCompact(small || (coarse.matches && portrait))
    }
    onSize()
    window.addEventListener('resize', onSize)
    coarse.addEventListener('change', onSize)

    return () => {
      motion.removeEventListener('change', onMotion)
      window.removeEventListener('resize', onSize)
      coarse.removeEventListener('change', onSize)
    }
  }, [])
}
