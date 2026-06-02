// 輕量內嵌 icon 組（stroke-based、繼承 currentColor），避免為了少數圖示引入 icon library。
type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconCode({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m8 6-6 6 6 6" />
      <path d="m16 6 6 6-6 6" />
    </svg>
  );
}

export function IconDatabase({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

export function IconDashboard({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

export function IconDeploy({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function IconLine({ className }: IconProps) {
  // LINE 標誌（填色），用於綠色 CTA
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2C6.48 2 2 5.64 2 10.12c0 4.01 3.55 7.37 8.35 8.01.32.07.77.21.88.49.1.25.06.64.03.9l-.14.85c-.04.25-.2.98.86.53s5.7-3.36 7.78-5.75c1.43-1.57 2.12-3.16 2.12-4.99C21.88 5.64 17.52 2 12 2Z" />
    </svg>
  );
}

export function IconGitHub({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.51v-1.8c-2.92.64-3.54-1.4-3.54-1.4-.48-1.22-1.17-1.55-1.17-1.55-.95-.65.08-.64.08-.64 1.05.07 1.6 1.08 1.6 1.08.94 1.6 2.46 1.14 3.06.87.1-.68.37-1.14.67-1.4-2.33-.27-4.78-1.17-4.78-5.18 0-1.15.4-2.08 1.07-2.81-.1-.27-.46-1.34.1-2.78 0 0 .88-.28 2.88 1.07a9.9 9.9 0 0 1 5.24 0c2-1.35 2.87-1.07 2.87-1.07.57 1.44.21 2.51.1 2.78.67.73 1.07 1.66 1.07 2.81 0 4.02-2.45 4.9-4.79 5.16.38.33.71.97.71 1.96v2.9c0 .28.19.62.73.51A10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  );
}
