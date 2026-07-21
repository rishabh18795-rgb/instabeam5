"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import {
  adSpendLabels,
  adSpendRanges,
  enquirySchema,
  enquiryServices,
  type EnquiryInput,
} from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { WhatsAppCta } from "@/components/shared/WhatsAppCta";
import { cn } from "@/lib/utils";

const serviceOptions: { value: (typeof enquiryServices)[number]; label: string }[] = [
  { value: "website-shopify", label: "Website & Shopify" },
  { value: "meta-google-ads", label: "Meta & Google Ads" },
  { value: "ga4-tracking", label: "GA4 & Tracking" },
  { value: "whatsapp-ai-bots", label: "WhatsApp & AI Bots" },
];

const inputClasses =
  "w-full rounded-xl border border-mist-200 bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-mist-400 transition-colors focus:border-beam-500 focus:outline-none focus:ring-2 focus:ring-beam-100";

export function ContactForm() {
  const toast = useToast();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { service: "not-sure", source: "contact-page", servicesInterested: [] },
  });

  const onSubmit = async (data: EnquiryInput) => {
    setStatus("submitting");
    setErrorMessage("");

    const primaryService = data.servicesInterested?.[0] ?? "not-sure";
    const payload: EnquiryInput = { ...data, service: primaryService };

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        const message = json.error ?? "Something went wrong. Please try again.";
        setErrorMessage(message);
        setStatus("error");
        toast.show("error", message);
        return;
      }

      setStatus("success");
      toast.show("success", "Message sent — we'll be in touch shortly.");
      reset();
    } catch {
      const message = "Network error. Please check your connection and try again.";
      setErrorMessage(message);
      setStatus("error");
      toast.show("error", message);
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center rounded-2xl border border-mist-200 bg-mist-50 px-8 py-16 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-beam-600" strokeWidth={1.5} />
        <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-ink">
          Thank you. Our team will contact you shortly.
        </h3>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-mist-600">
          Someone from the InstaBeam team will get back to you within one
          business day. Check your inbox for a confirmation.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <WhatsAppCta message="Hi InstaBeam, I just submitted the contact form and wanted to follow up." />
          <Button variant="secondary" onClick={() => setStatus("idle")}>
            Send another message
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot — hidden from real users, catches basic bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("company_website")}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Priya Sharma"
            className={cn(inputClasses, errors.name && "border-red-400 focus:ring-red-100")}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-ink">
            Company <span className="text-mist-400">(optional)</span>
          </label>
          <input
            id="company"
            type="text"
            autoComplete="organization"
            placeholder="Your business name"
            className={inputClasses}
            {...register("company")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="priya@yourbusiness.com"
            className={cn(inputClasses, errors.email && "border-red-400 focus:ring-red-100")}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink">
            Phone <span className="text-mist-400">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            className={cn(inputClasses, errors.phone && "border-red-400 focus:ring-red-100")}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="websiteUrl" className="mb-1.5 block text-sm font-medium text-ink">
            Website <span className="text-mist-400">(optional)</span>
          </label>
          <input
            id="websiteUrl"
            type="text"
            autoComplete="url"
            placeholder="yourbusiness.com"
            className={cn(inputClasses, errors.websiteUrl && "border-red-400 focus:ring-red-100")}
            {...register("websiteUrl")}
          />
          {errors.websiteUrl && (
            <p className="mt-1.5 text-xs text-red-600">{errors.websiteUrl.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="adSpend" className="mb-1.5 block text-sm font-medium text-ink">
            Monthly budget <span className="text-mist-400">(optional)</span>
          </label>
          <select
            id="adSpend"
            defaultValue=""
            className={cn(inputClasses, "appearance-none")}
            {...register("adSpend")}
          >
            <option value="">Prefer not to say</option>
            {adSpendRanges.map((range) => (
              <option key={range} value={range}>
                {adSpendLabels[range]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink">
          What do you need help with?
        </legend>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {serviceOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-mist-200 px-4 py-3 text-sm text-ink transition-colors has-[:checked]:border-beam-500 has-[:checked]:bg-beam-50"
            >
              <input
                type="checkbox"
                value={opt.value}
                className="h-4 w-4 rounded border-mist-300 text-beam-600 focus:ring-beam-400"
                {...register("servicesInterested")}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Tell us about your site/store, current ads setup, and what you're hoping to fix or grow."
          className={cn(inputClasses, "resize-none", errors.message && "border-red-400 focus:ring-red-100")}
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-1.5 text-xs text-red-600">{errors.message.message}</p>
        )}
      </div>

      <AnimatePresence>
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2.5 overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}
