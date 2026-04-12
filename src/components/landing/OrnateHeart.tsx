import { useId } from 'react'

interface OrnateHeartProps {
  size?: number | string
  color?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Sacred-heart inspired mark: a solid filled heart with a radiating
 * sunburst of rays behind it and a flame/leaves on top. No cross.
 *
 * Vibrancy comes from an internal vertical gradient (hot pink → coral → orange)
 * plus a brighter-than-source highlight stop. The `color` prop controls the
 * midtone; highlights and shadows are derived from it.
 */
export default function OrnateHeart({
  size = '1em',
  color = '#ff2e50',
  className,
  style,
}: OrnateHeartProps) {
  const uid = useId().replace(/:/g, '')
  const gradId = `heart-grad-${uid}`
  const rayGradId = `heart-ray-grad-${uid}`

  // Rays radiating out from roughly the heart center.
  // Alternating long/short for a hand-drawn feel.
  const rays = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * Math.PI * 2 - Math.PI / 2
    const inner = 38
    const outer = i % 2 === 0 ? 50 : 45
    const cx = 50
    const cy = 58
    const x1 = cx + Math.cos(angle) * inner
    const y1 = cy + Math.sin(angle) * inner
    const x2 = cx + Math.cos(angle) * outer
    const y2 = cy + Math.sin(angle) * outer
    return { x1, y1, x2, y2, key: i }
  })

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        {/* Main heart gradient — hot pink at top → coral mid → orange bottom */}
        <linearGradient id={gradId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ff4d8a" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor="#ff6a1a" />
        </linearGradient>

        {/* Ray gradient — fades outward for soft radial burst */}
        <radialGradient id={rayGradId} cx="50%" cy="58%" r="50%">
          <stop offset="0%" stopColor="#ffb347" stopOpacity="1" />
          <stop offset="60%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ff6a1a" stopOpacity="0.7" />
        </radialGradient>
      </defs>

      {/* Radiating sunburst rays (drawn first so heart sits on top) */}
      <g stroke={`url(#${rayGradId})`} strokeWidth="1.8" strokeLinecap="round">
        {rays.map(r => (
          <line key={r.key} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
        ))}
      </g>

      {/* Flame / leaves on top of the heart */}
      <g fill={`url(#${gradId})`} stroke={color} strokeWidth="1.2" strokeLinejoin="round">
        <path d="M50 16 C 48 22, 47 28, 50 34 C 53 28, 52 22, 50 16 Z" />
        <path d="M44 22 C 40 26, 39 31, 42 34 C 46 32, 47 27, 44 22 Z" />
        <path d="M56 22 C 60 26, 61 31, 58 34 C 54 32, 53 27, 56 22 Z" />
      </g>

      {/* Solid heart body with vibrant gradient */}
      <path
        d="M50 86
           C 28 72, 14 58, 14 44
           C 14 34, 22 28, 30 28
           C 38 28, 46 33, 50 40
           C 54 33, 62 28, 70 28
           C 78 28, 86 34, 86 44
           C 86 58, 72 72, 50 86 Z"
        fill={`url(#${gradId})`}
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Specular highlight on the heart — tiny white glint for extra pop */}
      <ellipse
        cx="38"
        cy="44"
        rx="7"
        ry="4"
        fill="rgba(255,255,255,0.35)"
        transform="rotate(-25 38 44)"
      />
    </svg>
  )
}
