"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, TriangleAlert, ArrowRight } from "lucide-react";
import {
  adSpendLabels,
  adSpendRanges,
  enquirySchema,
  type EnquiryInput,
} from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { cn } from "@/lib/utils";

type FormValues = Pick<
  EnquiryInput,
  "name" | "email" | "phone" | "company" | "websiteUrl" | "adSpend" | "company_website"
>;

const heroInputClasses =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-paper placeholder:text-mist-500 transition-colors focus:border-beam-400 focus:outline-none focus:ring-2 focus:ring-beam-400/20";

export function HeroEnquiryForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      enquirySchema.pick({
        name: true,
        email: true,
        phone: true,
        company: true,
        websiteUrl: true,
        adSpend: true,
        company_website: true,
      })
    ),
  });

  const onSubmit = async (values: FormValues) => {
    setStatus("submitting");
    setErrorMessage("");

    const adSpendLabel = values.adSpend ? adSpendLabels[values.adSpend] : "not specified";
    const message = `Free funnel audit request from the homepage.\nWebsite: ${
      values.websiteUrl || "not provided"
    }\nMonthly ad spend: ${adSpendLabel}`;

    const payload: EnquiryInput = {
      ...values,
      service: "not-sure",
      message,
      source: "hero-audit",
    };

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setErrorMessage(json.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      reset();
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center backdrop-blur-xl"
      >
        <CheckCircle2 className="h-10 w-10 text-beam-400" strokeWidth={1.5} />
        <h3 className="mt-4 font-display text-lg font-semibold text-paper">
          Audit request sent.
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-mist-400">
          We&apos;ll review your funnel and get back to you within one business day.
        </p>
        <Button variant="secondary" size="sm" className="mt-5 border-white/15 bg-transparent text-paper hover:bg-white/5" onClick={() => setStatus("idle")}>
          Request another audit
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-beam-300">
        Free funnel audit
      </p>
      <h3 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-paper">
        See what your funnel is leaking.
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-3.5">
        <div className="hidden" aria-hidden="true">
          <label htmlFor="hero-company-website">Company website</label>
          <input id="hero-company-website" type="text" tabIndex={-1} autoComplete="off" {...register("company_website")} />
        </div>

        <div>
          <input
            type="text"
            placeholder="Website URL (e.g. yourstore.com)"
            className={cn(heroInputClasses, errors.websiteUrl && "border-red-400/60 focus:ring-red-400/20")}
            {...register("websiteUrl")}
          />
          {errors.websiteUrl && <p className="mt-1 text-xs text-red-400">{errors.websiteUrl.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <input
              type="text"
              placeholder="Business name"
              className={heroInputClasses}
              {...register("company")}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Your name"
              className={cn(heroInputClasses, errors.name && "border-red-400/60 focus:ring-red-400/20")}
              {...register("name")}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <input
              type="email"
              placeholder="Email"
              className={cn(heroInputClasses, errors.email && "border-red-400/60 focus:ring-red-400/20")}
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone (optional)"
              className={heroInputClasses}
              {...register("phone")}
            />
          </div>
        </div>

        <div>
          <select
            defaultValue=""
            className={cn(heroInputClasses, "appearance-none text-mist-300")}
            {...register("adSpend")}
          >
            <option value="" disabled>
              Monthly ad spend
            </option>
            {adSpendRanges.map((range) => (
              <option key={range} value={range} className="bg-ink text-paper">
                {adSpendLabels[range]}
              </option>
            ))}
          </select>
        </div>

        <AnimatePresence>
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 overflow-hidden rounded-xl border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-xs text-red-300"
            >
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Magnetic strength={0.15} className="block">
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Get Free Funnel Audit
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </Magnetic>

        <p className="text-center text-[11px] text-mist-500">
          No spam. We reply within one business day.
        </p>
      </form>
    </div>
  );
}
