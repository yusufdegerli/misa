import type { CategorySlug } from "@/lib/catalog";

/**
 * Temporary wordmark until the SVG logo arrives: "Mişa" in a gold script over spaced "SILVER".
 * Always left-to-right, also on Arabic pages.
 */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const script = { sm: "text-[34px]", md: "text-[44px]", lg: "text-[56px]" }[size];
  const caps = { sm: "text-[8px]", md: "text-[9px]", lg: "text-[10px]" }[size];
  return (
    <span dir="ltr" className="inline-flex flex-col items-center leading-none">
      <span className={`text-gold-gradient font-script px-1.5 ${script}`}>Mişa</span>
      <span className={`-mt-0.5 ps-[0.55em] font-sans tracking-[0.55em] text-ink ${caps}`}>SILVER</span>
    </span>
  );
}

/** Silver gradient shared by every jewellery illustration on the page. Render once per document. */
export function SilverDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <linearGradient id="misa-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#DADAD7" />
          <stop offset="0.4" stopColor="#8F8F8B" />
          <stop offset="0.6" stopColor="#C9C9C5" />
          <stop offset="1" stopColor="#6E6E6A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const silver = "url(#misa-silver)";

/** Line illustration of a piece, used as a stand-in until product photos exist. */
export function JewelryArt({ category, className }: { category: CategorySlug; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      {category === "rings" && (
        <>
          <ellipse cx="100" cy="122" rx="58" ry="24" fill="none" stroke={silver} strokeWidth="8" />
          <path d="M88 100 L100 84 L112 100 L100 108 Z" fill="#F2F2F0" stroke="#9A9A96" strokeWidth="1" />
          <path d="M92 99 L100 89 L108 99" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
        </>
      )}
      {category === "necklaces" && (
        <>
          <path d="M36 40 Q100 150 164 40" fill="none" stroke={silver} strokeWidth="3" />
          <path d="M100 96 L100 106" stroke="#A5A5A1" strokeWidth="2" />
          <path d="M100 106 L111 124 L100 146 L89 124 Z" fill="#F2F2F0" stroke="#8F8F8B" strokeWidth="1" />
        </>
      )}
      {category === "earrings" &&
        [70, 130].map((x) => (
          <g key={x}>
            <circle cx={x} cy="56" r="7" fill="none" stroke={silver} strokeWidth="3" />
            <path d={`M${x} 63 L${x} 90`} stroke="#A5A5A1" strokeWidth="2" />
            <path
              d={`M${x} 90 C${x - 12} 108 ${x - 12} 128 ${x} 140 C${x + 12} 128 ${x + 12} 108 ${x} 90 Z`}
              fill="#F2F2F0"
              stroke="#8F8F8B"
              strokeWidth="1"
            />
          </g>
        ))}
      {category === "bracelets" && (
        <>
          <ellipse cx="100" cy="110" rx="70" ry="32" fill="none" stroke={silver} strokeWidth="6" />
          <ellipse
            cx="100"
            cy="110"
            rx="70"
            ry="32"
            fill="none"
            stroke="#6E6E6A"
            strokeWidth="6"
            strokeDasharray="2 10"
            opacity="0.3"
          />
        </>
      )}
      {category === "sets" && (
        <>
          <path d="M50 36 Q100 120 150 36" fill="none" stroke={silver} strokeWidth="2.5" />
          <path d="M100 79 L108 92 L100 106 L92 92 Z" fill="#F2F2F0" stroke="#8F8F8B" strokeWidth="1" />
          <ellipse cx="78" cy="150" rx="30" ry="12" fill="none" stroke={silver} strokeWidth="5" />
          <circle cx="140" cy="132" r="5" fill="none" stroke={silver} strokeWidth="2.5" />
          <path d="M140 137 C132 150 132 162 140 170 C148 162 148 150 140 137 Z" fill="#F2F2F0" stroke="#8F8F8B" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}
