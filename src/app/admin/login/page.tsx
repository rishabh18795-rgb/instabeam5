"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-beam-400/15 text-beam-300">
          <Lock className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-paper">
          InstaBeam Admin
        </h1>
        <p className="mt-1 text-sm text-mist-400">Sign in to manage leads.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            autoFocus
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-paper placeholder:text-mist-500 outline-none transition-colors focus:border-beam-400 focus:ring-2 focus:ring-beam-400/20"
          />

          {status === "error" && (
            <div className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-xs text-red-300">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="gradient"
            className="w-full justify-center"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
