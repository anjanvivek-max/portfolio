import { useEffect, useState } from 'react'
import { detectWebGL, useEnvironment } from './hooks/useEnvironment'
import { useStore } from './store/useStore'
import { StandardPortfolio } from './components/Standard/StandardPortfolio'
import { ImmersiveShell } from './components/Immersive/ImmersiveShell'

const NO_WEBGL_NOTICE =
  'The 3D room needs WebGL, which is not available in this browser, so the standard version is shown instead.'

/** Fonts used on 3D labels must be ready before the label textures are drawn. */
const loadFonts = (): Promise<unknown> => {
  if (!document.fonts?.load) return Promise.resolve()
  const wanted = [
    '400 20px "VT323"',
    '600 20px "IBM Plex Mono"',
    '800 20px "Inter Variable"',
    '700 20px "Fraunces Variable"',
    '700 20px "Caveat"',
  ]
  const all = Promise.allSettled(wanted.map((font) => document.fonts.load(font)))
  const timeout = new Promise((resolve) => window.setTimeout(resolve, 4000))
  return Promise.race([all, timeout])
}

/**
 * Two ways to view the portfolio:
 * - standard: a normal page, always available and independent of WebGL;
 * - immersive: the 3D room, loaded on demand and kept mounted once opened so switching
 *   back and forth is instant.
 */
export const App = () => {
  useEnvironment()
  const mode = useStore((s) => s.mode)
  const webgl = useStore((s) => s.webgl)
  const [everImmersive, setEverImmersive] = useState(false)

  useEffect(() => {
    const ok = detectWebGL()
    const s = useStore.getState()
    s.setWebgl(ok)
    if (!ok && s.mode === 'immersive') s.setMode('standard', NO_WEBGL_NOTICE)
  }, [])

  useEffect(() => {
    if (mode !== 'immersive' || webgl !== true) return
    setEverImmersive(true)
    void loadFonts().then(() => useStore.getState().markLoaded('fonts'))
  }, [mode, webgl])

  // The page behind the 3D room must not scroll.
  useEffect(() => {
    document.body.style.overflow = mode === 'immersive' ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mode])

  return (
    <>
      {mode === 'standard' && <StandardPortfolio />}
      {everImmersive && webgl === true && <ImmersiveShell hidden={mode !== 'immersive'} />}
    </>
  )
}
