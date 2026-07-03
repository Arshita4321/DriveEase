

/**
 * Signature motif: an animated "route" — a dashed path with a travelling
 * marker, echoing a map route. Used as a section divider / hero flourish
 * to tie the whole product back to the idea of a journey.
 */
export default function RouteLine({ className = '', flip = false }) {
  return (
    <svg
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      className={`w-full ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0 40 C 200 0, 300 80, 500 40 S 800 0, 1000 40 S 1150 60, 1200 40"
        fill="none"
        stroke="url(#route-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="dash-line"
      />
      <defs>
        <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5B54F0" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      <circle
        r="6"
        fill="#06B6D4"
        className="route-marker"
      />
    </svg>
  );
}
