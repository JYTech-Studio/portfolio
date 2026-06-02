import { site } from "@/lib/site";
import {
  IconCode,
  IconDatabase,
  IconDashboard,
  IconDeploy,
} from "@/components/icons";

const iconMap = {
  code: IconCode,
  database: IconDatabase,
  dashboard: IconDashboard,
  deploy: IconDeploy,
} as const;

export function Capabilities() {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
      {site.capabilities.map((cap) => {
        const Icon = iconMap[cap.icon];
        return (
          <div key={cap.title} className="bg-card p-6">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold tracking-tight">
              {cap.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {cap.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
