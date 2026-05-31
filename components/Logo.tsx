export default function Logo({ size = 40 }: { size?: number }) {
  const w = size * 4.2;
  const h = size;
  return (
    <svg width={w} height={h} viewBox="0 0 210 50" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* ── SHOE ── */}
      {/* Sole */}
      <rect x="4" y="40" width="44" height="7" rx="3.5" fill="#CAFF00" opacity="0.25"/>
      {/* Midsole bump */}
      <path d="M6 40 Q14 36 28 38 Q38 39 48 40 L48 40 L4 40 Z" fill="#CAFF00" opacity="0.15"/>

      {/* Main upper body */}
      <path d="M10 40 C10 40 6 34 7 26 C8 20 12 15 18 14 L34 14 C37 14 39 16 39 19 L39 28 C39 30 41 32 45 33.5 L50 35 C52 35.5 52 38 50 39 L48 40 Z"
        fill="#CAFF00"/>

      {/* Heel counter */}
      <path d="M7 26 C6 22 7 16 10 14 C12 13 13 15 12 18 C11 21 10 24 10 28 Z"
        fill="#CAFF00" opacity="0.5"/>

      {/* Toe box highlight */}
      <ellipse cx="12" cy="19" rx="4" ry="3" fill="white" opacity="0.15" transform="rotate(-10 12 19)"/>

      {/* Nike-style swoosh stripe */}
      <path d="M16 38 Q24 28 42 31" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4"/>

      {/* Laces */}
      <rect x="19" y="14" width="15" height="12" rx="2" fill="#0d0d0d" opacity="0.2"/>
      <path d="M20 17 L33 17" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <path d="M20 20 L33 20" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <path d="M20 23 L33 23" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>

      {/* Ankle collar */}
      <path d="M34 14 Q38 10 38 14" stroke="#CAFF00" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>

      {/* Speed lines left */}
      <path d="M1 30 L7 30" stroke="#CAFF00" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M0 34 L6 34" stroke="#CAFF00" strokeWidth="1.8" strokeLinecap="round" opacity="0.45"/>
      <path d="M2 38 L7 38" stroke="#CAFF00" strokeWidth="1.2" strokeLinecap="round" opacity="0.25"/>

      {/* ── TEXT ── */}
      {/* RUN in neon yellow */}
      <text x="60" y="37"
        fontFamily="Space Grotesk, Arial Black, sans-serif"
        fontWeight="800"
        fontSize="24"
        fill="#CAFF00"
        letterSpacing="-1">RUN</text>

      {/* STEP in white */}
      <text x="111" y="37"
        fontFamily="Space Grotesk, Arial Black, sans-serif"
        fontWeight="800"
        fontSize="24"
        fill="#ffffff"
        letterSpacing="-1">STEP</text>

      {/* Dot separator */}
      <circle cx="108" cy="31" r="3" fill="#CAFF00"/>

      {/* Underline accent */}
      <rect x="60" y="41" width="148" height="2.5" rx="1.25" fill="#CAFF00" opacity="0.15"/>
    </svg>
  );
}
