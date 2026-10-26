import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="ops-in w-full max-w-[420px]">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <span className="text-xl font-semibold tracking-tight">InstaBeam <span className="ops-muted font-normal">Workspace</span></span>
        </div>
        <div className="ops-card ops-card-pad !p-7">
          <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="ops-muted mt-1.5 text-[13.5px]">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="ops-muted mt-5 text-center text-[13px]">{footer}</div>}
        <p className="ops-faint mt-8 text-center text-xs">One Signal. Full Funnel. · Private to the InstaBeam co-founders</p>
      </div>
    </main>
  );
}
