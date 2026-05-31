export default function Logo({ size = 40 }: { size?: number }) {
  const w = size * 6.2;
  const h = size;
  return (
    <svg width={w} height={h} viewBox="0 0 310 50" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* ── TEXT: RUN·STEP ── */}
      <text x="0" y="36"
        fontFamily="Space Grotesk, Arial Black, sans-serif"
        fontWeight="800" fontSize="25" fill="#CAFF00" letterSpacing="-1">RUN</text>
      <circle cx="56" cy="30" r="3.5" fill="#CAFF00"/>
      <text x="63" y="36"
        fontFamily="Space Grotesk, Arial Black, sans-serif"
        fontWeight="800" fontSize="25" fill="#ffffff" letterSpacing="-1">STEP</text>

      {/* ── SHOE SILHOUETTE (faithful to reference image) ── */}
      {/* Shoe is facing right, toe on right, speed lines extending right */}

      {/* Main shoe body — solid fill */}
      <path d="
        M 140 42
        C 138 36 138 28 141 21
        C 143 15 149 10 156 9
        L 172 8
        C 175 8 177 9 178 11
        C 179 13 178 16 176 18
        C 174 20 172 20 170 20
        L 168 20
        C 170 22 173 25 178 26
        L 186 28
        C 190 29 192 32 191 36
        C 190 39 188 41 185 42
        Z
      " fill="#CAFF00"/>

      {/* Heel counter bump */}
      <path d="M 140 42 C 137 40 136 35 137 29 C 138 24 140 21 141 21 C 139 28 139 36 140 42 Z"
        fill="#CAFF00" opacity="0.6"/>

      {/* Sole */}
      <path d="M 138 42 L 187 42 C 190 42 191 44 191 46 C 191 48 189 49 187 49 L 140 49 C 137 49 136 47 136 45 C 136 43 137 42 138 42 Z"
        fill="#CAFF00"/>
      {/* Sole white edge */}
      <path d="M 139 42 L 187 42 L 187 44 C 168 45 148 44 139 43 Z" fill="white" opacity="0.2"/>

      {/* Toe box */}
      <path d="M 141 21 C 141 17 144 11 150 9 L 156 9 C 149 10 143 15 141 21 Z"
        fill="white" opacity="0.2"/>

      {/* Tongue */}
      <path d="M 168 8 L 172 8 L 172 20 L 166 20 Z" fill="white" opacity="0.2"/>

      {/* Laces — white curves */}
      <path d="M 155 12 Q 162 10 169 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M 154 15 Q 162 13 170 13" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M 154 18 Q 162 16 170 16" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7"/>

      {/* Ankle collar curve */}
      <path d="M 172 8 C 176 4 180 6 178 11" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>

      {/* ── SPEED LINES extending right from shoe ── */}
      {/* These mirror the reference image: fan of ~9 lines, longest in middle */}
      <path d="M 194 18 L 220 17" stroke="#CAFF00" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
      <path d="M 193 22 L 232 21" stroke="#CAFF00" strokeWidth="2.2" strokeLinecap="round" opacity="0.65"/>
      <path d="M 193 26 L 244 25" stroke="#CAFF00" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
      <path d="M 193 30 L 253 30" stroke="#CAFF00" strokeWidth="3"   strokeLinecap="round"/>
      <path d="M 193 34 L 256 34" stroke="#CAFF00" strokeWidth="3"   strokeLinecap="round"/>
      <path d="M 193 38 L 250 38" stroke="#CAFF00" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
      <path d="M 193 42 L 240 42" stroke="#CAFF00" strokeWidth="2.2" strokeLinecap="round" opacity="0.65"/>
      <path d="M 193 46 L 228 46" stroke="#CAFF00" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
      <path d="M 194 50 L 214 50" stroke="#CAFF00" strokeWidth="1.4" strokeLinecap="round" opacity="0.35"/>
    </svg>
  );
}
