// JYTech 品牌標記：粉色「視窗」chip + JY_ 終端游標。
// 同一套設計也用在 favicon / apple-icon / OG 圖（見 src/app 下的對應檔）。
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="jyChip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2A0C0" />
          <stop offset="1" stopColor="#D85A86" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="url(#jyChip)" />
      {/* 視窗上排三點 */}
      <circle cx="22" cy="20" r="3.5" fill="#fff" opacity="0.9" />
      <circle cx="33" cy="20" r="3.5" fill="#fff" opacity="0.9" />
      <circle cx="44" cy="20" r="3.5" fill="#fff" opacity="0.9" />
      <path d="M12 32 H88" stroke="#fff" strokeWidth="3" opacity="0.55" />
      {/* JY + 游標 */}
      <text
        x="43"
        y="74"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="40"
        fontWeight="800"
        fill="#fff"
      >
        JY
      </text>
      <rect x="66" y="63" width="15" height="7" fill="#fff" />
    </svg>
  );
}
