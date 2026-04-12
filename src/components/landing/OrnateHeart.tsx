interface OrnateHeartProps {
  size?: number | string
  color?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Decorative ornate heart inspired by Latin American folk art.
 * Drawn as an inline SVG so it inherits color and scales crisply.
 */
export default function OrnateHeart({
  size = '1em',
  color = '#f94e4f',
  className,
  style,
}: OrnateHeartProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="none"
      stroke={color}
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Outer heart outline */}
      <path
        d="M50 88 C 28 72, 10 56, 10 36 C 10 22, 22 12, 34 12 C 42 12, 48 17, 50 24 C 52 17, 58 12, 66 12 C 78 12, 90 22, 90 36 C 90 56, 72 72, 50 88 Z"
        fill="none"
      />

      {/* Central vertical divider / stem */}
      <path d="M50 24 L50 82" strokeWidth="2.4" />

      {/* Central teardrop / flame */}
      <path
        d="M50 40 C 46 46, 44 52, 44 58 C 44 64, 47 68, 50 70 C 53 68, 56 64, 56 58 C 56 52, 54 46, 50 40 Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Inner teardrop highlight */}
      <circle cx="50" cy="50" r="1.4" fill="#fff" stroke="none" />

      {/* Left tulip/leaf cluster */}
      <path
        d="M22 34 C 26 30, 32 30, 36 34 M22 40 C 26 36, 32 36, 36 40 M24 46 C 28 42, 32 42, 36 46"
        strokeWidth="2.6"
      />

      {/* Right tulip/leaf cluster (mirror) */}
      <path
        d="M64 34 C 68 30, 74 30, 78 34 M64 40 C 68 36, 74 36, 78 40 M64 46 C 68 42, 72 42, 76 46"
        strokeWidth="2.6"
      />

      {/* Lower petal fronds — left */}
      <path d="M32 58 C 30 64, 32 70, 36 74 M28 62 C 28 68, 30 72, 34 76" strokeWidth="2.4" />

      {/* Lower petal fronds — right */}
      <path d="M68 58 C 70 64, 68 70, 64 74 M72 62 C 72 68, 70 72, 66 76" strokeWidth="2.4" />

      {/* Decorative dots */}
      <circle cx="30" cy="52" r="1.4" fill={color} stroke="none" />
      <circle cx="70" cy="52" r="1.4" fill={color} stroke="none" />
      <circle cx="38" cy="66" r="1.2" fill={color} stroke="none" />
      <circle cx="62" cy="66" r="1.2" fill={color} stroke="none" />

      {/* Small dot below heart */}
      <circle cx="50" cy="94" r="1.8" fill={color} stroke="none" />
    </svg>
  )
}
