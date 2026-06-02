export const site = {
  brand: "JYTech",
  // 主理人本人（顯示在 About）
  name: "王經元",
  title: "網站開發 · 系統客製",
  tagline: "用程式碼把想法做成可上線的產品。",
  email: "wjycompany@gmail.com",
  location: "Taiwan",
  // 目前正式部署網址（Vercel）；之後若掛自訂網域再更換
  url: "https://portfolio-sage-six-44.vercel.app",
  socials: {
    github: "https://github.com/JYTech-Studio",
    line: "https://lin.ee/Np2Yxwk",
  },
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "PostgreSQL",
    "Supabase",
    "RWD / SEO",
  ],
  // 能力項目（首頁與 About 共用）；icon 對應 src/components/icons.tsx
  capabilities: [
    {
      icon: "code" as const,
      title: "Next.js / React 前端",
      desc: "App Router、Server Components、TypeScript、RWD 與 SEO。",
    },
    {
      icon: "database" as const,
      title: "Supabase / 資料庫 / Auth",
      desc: "PostgreSQL 結構設計、RLS、角色權限與第三方整合。",
    },
    {
      icon: "dashboard" as const,
      title: "後台管理系統",
      desc: "報名、財務、CRM、報表等多模組營運後台與工作流。",
    },
    {
      icon: "deploy" as const,
      title: "部署與維護",
      desc: "CI / CD、production 部署，以及長期迭代與維運合約。",
    },
  ],
};
