export default function Logo({ size = 40 }: { size?: number }) {
  const w = size * 5.8;
  const h = size;
  return (
    <svg width={w} height={h} viewBox="0 0 290 50" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* ── TEXT FIRST: RUN·STEP ── */}
      <text x="0" y="37"
        fontFamily="Space Grotesk, Arial Black, sans-serif"
        fontWeight="800" fontSize="26" fill="#CAFF00" letterSpacing="-1">RUN</text>
      <circle cx="57" cy="31" r="3.5" fill="#CAFF00"/>
      <text x="64" y="37"
        fontFamily="Space Grotesk, Arial Black, sans-serif"
        fontWeight="800" fontSize="26" fill="#ffffff" letterSpacing="-1">STEP</text>

      {/* ── SHOE (based on reference image) ── */}
      {/* Sole — flat thick base */}
      <path d="M148 42 L148 46 Q149 48 152 48 L196 48 Q200 48 200 45 L200 42 Z" fill="#CAFF00"/>
      {/* Sole highlight */}
      <path d="M148 42 L200 42 L200 44 Q176 46 148 44 Z" fill="white" opacity="0.15"/>

      {/* Midsole */}
      <path d="M147 38 Q148 40 150 42 L200 42 L200 39 Q185 36 170 37 Q158 37 147 38 Z" fill="#CAFF00" opacity="0.7"/>

      {/* Main upper — bold chunky shoe body */}
      <path d="
        M152 38
        C150 34 149 28 151 22
        C153 17 158 13 163 12
        L178 11
        C181 11 183 12 184 14
        L185 20
        C185 22 186 24 189 25
        L197 27
        C200 28 201 30 200 33
        L200 38
        Z
      " fill="#CAFF00"/>

      {/* Toe cap */}
      <path d="M151 22 C151 18 154 13 159 12 L163 12 C158 13 153 17 151 22 Z" fill="white" opacity="0.2"/>

      {/* Tongue */}
      <path d="M172 11 L174 11 L176 20 L170 20 Z" fill="white" opacity="0.25"/>

      {/* Laces */}
      <path d="M165 15 L183 15" stroke="#0d0d0d" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
      <path d="M164 18 L184 18" stroke="#0d0d0d" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
      <path d="M164 21 L185 21" stroke="#0d0d0d" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>

      {/* Collar / ankle opening */}
      <path d="M178 11 Q184 7 185 11" fill="none" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>

      {/* Side stripe (swoosh-style) */}
      <path d="M155 36 Q168 26 196 30" fill="none" stroke="#0d0d0d" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>

      {/* ── SPEED LINES (to the right, like reference) ── */}
      <path d="M204 30 L230 30" stroke="#CAFF00" strokeWidth="3"   strokeLinecap="round"/>
      <path d="M204 34 L226 34" stroke="#CAFF00" strokeWidth="2.2" strokeLinecap="round" opacity="0.75"/>
      <path d="M204 38 L222 38" stroke="#CAFF00" strokeWidth="1.8" strokeLinecap="round" opacity="0.55"/>
      <path d="M204 42 L218 42" stroke="#CAFF00" strokeWidth="1.4" strokeLinecap="round" opacity="0.35"/>
      <path d="M204 26 L224 26" stroke="#CAFF00" strokeWidth="1.8" strokeLinecap="round" opacity="0.55"/>
      <path d="M204 22 L218 22" stroke="#CAFF00" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}
