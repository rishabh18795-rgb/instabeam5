"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { WhatsAppCta } from "@/components/shared/WhatsAppCta";

export function NewsletterBox() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company_website: honeypot }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      setStatus("success");
      toast.show("success", "You're on the list — check your inbox.");
      setEmail("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setStatus("error");
      setErrorMsg(message);
      toast.show("error", message);
    }
  };

  return (
    <div className="rounded-3xl border border-mist-200 bg-gradient-to-br from-ink to-mist-900 p-8 text-paper">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-beam-300">
        Newsletter
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
        One practical growth idea, every couple of weeks.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-mist-300">
        No fluff, no daily noise — just what we&apos;re actually seeing work (or fail) across ads, tracking, and WhatsApp.
      </p>

      {status === "success" ? (
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-beam-400/40 bg-beam-400/10 px-4 py-3 text-sm text-beam-200">
            <Check className="h-4 w-4 shrink-0" />
            You&apos;re on the list — check your inbox.
          </div>
          <WhatsAppCta message="Hi InstaBeam, I just subscribed to the newsletter and had a question." />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="hidden" aria-hidden="true">
            <label htmlFor="newsletter-company-website">Company website</label>
            <input
              id="newsletter-company-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-paper placeholder:text-mist-400 outline-none focus:border-beam-400"
          />
          <Button
            type="submit"
            variant="gradient"
            disabled={status === "loading"}
            className="shrink-0 justify-center"
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-300">{errorMsg}</p>
      )}
    </div>
  );
}
