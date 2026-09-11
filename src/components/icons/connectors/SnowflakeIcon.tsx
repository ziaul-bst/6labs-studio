/**
 * Snowflake connector brand icon.
 *
 * The official Snowflake mark — six chevrons pointing in toward a center
 * diamond — in white on the brand-cyan (#29B5E8) tile.
 * No Apparatus / Figma source exists for Snowflake yet; this is a code-first
 * prototype. Swap to the library asset once it lands in Apparatus.
 */
export function SnowflakeIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Snowflake"
    >
      <rect width="48" height="48" rx="12" fill="#29B5E8" />
      <g transform="translate(24 24)">
        {/* Six chevrons at 60° intervals, each pointing in toward the center. */}
        <g
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M15.6 -5.8 L6.6 0 L15.6 5.8" />
          <path d="M15.6 -5.8 L6.6 0 L15.6 5.8" transform="rotate(60)" />
          <path d="M15.6 -5.8 L6.6 0 L15.6 5.8" transform="rotate(120)" />
          <path d="M15.6 -5.8 L6.6 0 L15.6 5.8" transform="rotate(180)" />
          <path d="M15.6 -5.8 L6.6 0 L15.6 5.8" transform="rotate(240)" />
          <path d="M15.6 -5.8 L6.6 0 L15.6 5.8" transform="rotate(300)" />
        </g>
        {/* Center diamond — a ring, so the tile shows through the middle. */}
        <path
          d="M0 -3 L3 0 L0 3 L-3 0 Z"
          stroke="#FFFFFF"
          strokeWidth="1.9"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  )
}
