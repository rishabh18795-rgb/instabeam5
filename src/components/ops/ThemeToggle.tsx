"use client";
import { Moon, Sun, Monitor } from "lucide-react";
import { useState } from "react";
import { setTheme } from "@/lib/ops/actions/settings";

const OPTIONS = [
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
] as const;

export function ThemeToggle({ initial, compact }: { initial: "dark" | "light" | "system"; compact?: boolean }) {
  const [theme, set] = useState(initial);
  function choose(v: (typeof OPTIONS)[number]["value"]) {
    set(v);
    document.querySelector(".ops-root")?.setAttribute("data-theme", v);
    void setTheme(v);
  }
  if (compact) {
    const next = theme === "dark" ? "light" : "dark";
    const Icon = theme === "dark" ? Sun : Moon;
    return (
      <button type="button" className="ops-btn ops-btn-ghost ops-btn-icon" onClick={() => choose(next)} aria-label={`Switch to ${next} theme`}>
        <Icon size={17} />
      </button>
    );
  }
  return (
    <div className="ops-seg" role="group" aria-label="Theme">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button key={value} type="button" aria-pressed={theme === value} onClick={() => choose(value)}>
          <Icon size={14} /> {label}
        </button>
      ))}
    </div>
  );
}
