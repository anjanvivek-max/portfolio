import { useStore } from '../../store/useStore'

/**
 * Two-way switch between the standard page and the 3D room. It is rendered in both modes
 * so visitors can change their mind at any time.
 */
export const ModeSwitcher = ({ tone = 'dark' }: { tone?: 'dark' | 'light' }) => {
  const mode = useStore((s) => s.mode)
  const webgl = useStore((s) => s.webgl)
  const setMode = useStore((s) => s.setMode)
  const unavailable = webgl === false

  return (
    <div className={`mode-switch mode-switch-${tone}`} role="group" aria-label="Portfolio view">
      <button
        type="button"
        className="mode-option"
        aria-pressed={mode === 'standard'}
        onClick={() => setMode('standard')}
      >
        <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
          <path d="M4 5h12M4 10h12M4 15h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Standard
      </button>
      <button
        type="button"
        className="mode-option"
        aria-pressed={mode === 'immersive'}
        disabled={unavailable}
        title={unavailable ? '3D is not available on this device or browser' : undefined}
        onClick={() => setMode('immersive')}
      >
        <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
          <path
            d="M10 2.5 16.5 6v8L10 17.5 3.5 14V6L10 2.5Zm0 0v15M3.5 6 10 9.6 16.5 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        3D room
      </button>
    </div>
  )
}
