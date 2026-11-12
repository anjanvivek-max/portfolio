/**
 * Decorative illustration for the standard page: the retro room's window, television and
 * tapes in silhouette, with the modern skyline and metro outside. Pure SVG, no WebGL.
 */
export const HeroArt = () => {
  const towers = [
    { x: 30, w: 34, h: 96 },
    { x: 70, w: 26, h: 132 },
    { x: 102, w: 40, h: 84 },
    { x: 150, w: 30, h: 150 },
    { x: 186, w: 44, h: 110 },
    { x: 238, w: 28, h: 138 },
    { x: 272, w: 38, h: 90 },
    { x: 316, w: 30, h: 122 },
  ]
  return (
    <div className="std-hero-art" aria-hidden="true">
      <svg viewBox="0 0 400 320" role="presentation">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1430" />
            <stop offset="0.7" stopColor="#24386b" />
            <stop offset="1" stopColor="#6c5a78" />
          </linearGradient>
          <clipPath id="pane">
            <rect x="22" y="22" width="356" height="196" rx="6" />
          </clipPath>
        </defs>

        {/* window */}
        <rect x="12" y="12" width="376" height="216" rx="10" fill="#4a2f1c" />
        <rect x="22" y="22" width="356" height="196" rx="6" fill="url(#sky)" />
        <g clipPath="url(#pane)">
          {towers.map((t, i) => (
            <g key={t.x}>
              <rect x={t.x} y={218 - t.h} width={t.w} height={t.h} fill={i % 2 ? '#101c3c' : '#16264d'} />
              {Array.from({ length: Math.floor(t.h / 12) }).map((_, row) =>
                Array.from({ length: Math.floor(t.w / 9) }).map((__, col) =>
                  (row * 7 + col * 3 + i) % 3 === 0 ? null : (
                    <rect
                      key={`${row}-${col}`}
                      x={t.x + 4 + col * 9}
                      y={218 - t.h + 6 + row * 12}
                      width="4"
                      height="5"
                      fill={(row + col + i) % 4 === 0 ? '#9fd6e8' : '#f3c77b'}
                      opacity={0.85}
                    />
                  ),
                ),
              )}
            </g>
          ))}
          {/* metro viaduct and train */}
          <rect x="22" y="188" width="356" height="5" fill="#8d8f9b" />
          {[60, 130, 200, 270, 340].map((x) => (
            <rect key={x} x={x} y="193" width="6" height="26" fill="#6f7180" />
          ))}
          <g className="std-art-train">
            <rect x="80" y="176" width="112" height="12" rx="3" fill="#e9edf2" />
            <rect x="80" y="184" width="112" height="2.5" fill="#2b79b8" />
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={86 + i * 8.6} y="178.5" width="5.5" height="4" fill="#ffe6ae" />
            ))}
          </g>
        </g>
        {/* mullions */}
        <rect x="140" y="22" width="5" height="196" fill="#4a2f1c" />
        <rect x="255" y="22" width="5" height="196" fill="#4a2f1c" />

        {/* desk */}
        <rect x="0" y="264" width="400" height="12" rx="3" fill="#6b4529" />
        <rect x="0" y="276" width="400" height="44" fill="#3a2516" />

        {/* television on the VCR */}
        <rect x="52" y="250" width="112" height="14" rx="3" fill="#23201d" />
        <rect x="88" y="254" width="42" height="5" rx="1.5" fill="#0c0b0a" />
        <rect x="58" y="170" width="100" height="80" rx="9" fill="#7a5433" />
        <rect x="66" y="178" width="68" height="62" rx="8" fill="#101823" />
        <rect x="72" y="184" width="56" height="50" rx="6" fill="#182a3a" />
        <path d="M78 224h44M78 214h30M78 204h38" stroke="#f3c77b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="146" cy="192" r="4" fill="#d9b678" />
        <circle cx="146" cy="207" r="4" fill="#d9b678" />

        {/* tapes */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${208 + i * 44} 232)`}>
            <rect width="38" height="32" rx="3" fill="#1d1b19" />
            <rect x="4" y="6" width="30" height="13" rx="1.5" fill={['#b5532a', '#2f5d62', '#c08a2e', '#3f5a85'][i]} />
            <rect x="4" y="12" width="30" height="3" fill="#f3e7cd" />
          </g>
        ))}
      </svg>
    </div>
  )
}
