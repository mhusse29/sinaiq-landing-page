export default function SinaiqLogo({
  width = 160,
  height = 28,
  className = "",
}: { width?: number; height?: number; className?: string }) {
  // Check for reduced motion preference
  const reduce = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 320 56"
      role="img"
      aria-label="SINAIQ"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4DA3FF" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#4DA3FF" />
          {!reduce && (
            <>
              <animate attributeName="x1" values="-100%;0%;-100%" dur="4s" repeatCount="indefinite" />
              <animate attributeName="x2" values="0%;100%;0%" dur="4s" repeatCount="indefinite" />
            </>
          )}
        </linearGradient>
      </defs>

      <text
        x="0"
        y="34"
        fontFamily="Inter, ui-sans-serif, system-ui, -apple-system"
        fontSize="36"
        fontWeight={700}
        letterSpacing="3"
        fill="#FFFFFF"
        filter="url(#softGlow)"
      >
        SIN<tspan fill="url(#aiGradient)">AI</tspan>Q
      </text>
    </svg>
  );
}
