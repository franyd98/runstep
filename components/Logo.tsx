export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size * 2.8} height={size} viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shoe sole */}
      <ellipse cx="28" cy="43" rx="22" ry="5" fill="#CAFF00" opacity="0.3"/>
      {/* Shoe body */}
      <path d="M8 38 C8 38 6 30 10 24 C13 19 18 17 22 17 L36 17 C38 17 40 18 40 20 L40 28 C40 30 42 32 46 33 L50 34 C52 34 50 38 48 38 Z" fill="#CAFF00"/>
      {/* Shoe details - laces area */}
      <path d="M18 17 L20 28" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 17 L25 28" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 17 L30 28" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M36 17 L34 28" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Lace horizontal */}
      <path d="M18 22 L36 22" stroke="#0d0d0d" strokeWidth="1" strokeLinecap="round"/>
      <path d="M19 26 L35 26" stroke="#0d0d0d" strokeWidth="1" strokeLinecap="round"/>
      {/* Heel tab */}
      <path d="M8 24 C6 22 6 18 8 18 C10 18 10 20 10 22" fill="#CAFF00" opacity="0.7"/>
      {/* Speed lines */}
      <path d="M2 26 L10 26" stroke="#CAFF00" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <path d="M1 30 L9 30" stroke="#CAFF00" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M3 34 L9 34" stroke="#CAFF00" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>

      {/* RUN text */}
      <text x="58" y="36" fontFamily="Space Grotesk, sans-serif" fontWeight="800" fontSize="22" fill="#CAFF00" letterSpacing="-0.5">RUN</text>
      {/* STEP text */}
      <text x="104" y="36" fontFamily="Space Grotesk, sans-serif" fontWeight="800" fontSize="22" fill="#f0f0f0" letterSpacing="-0.5">STEP</text>
      {/* Dot accent */}
      <circle cx="101" cy="30" r="3" fill="#CAFF00"/>
    </svg>
  );
}
