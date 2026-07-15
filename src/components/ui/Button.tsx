import Link from "next/link";
import { cn } from "@/lib/utils";

type CommonProps = {
  variant?: "primary" | "secondary" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
};

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-out focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:scale-100 whitespace-nowrap will-change-transform active:scale-[0.98]";

const variants: Record<NonNullable<CommonProps["variant"]>, string> = {
  primary:
    "bg-ink text-paper shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_1px_2px_rgba(11,11,11,0.15)] hover:-translate-y-0.5 hover:scale-[1.015] hover:bg-mist-800 hover:shadow-[0_0_0_1px_var(--color-beam-400),0_8px_28px_-6px_var(--color-beam-400),0_1px_0_0_rgba(255,255,255,0.08)_inset]",
  secondary:
    "bg-paper text-ink border border-mist-200 hover:-translate-y-0.5 hover:scale-[1.015] hover:border-beam-400 hover:bg-mist-50 hover:shadow-[0_8px_24px_-8px_rgba(11,11,11,0.18)]",
  ghost:
    "bg-transparent text-ink hover:-translate-y-0.5 hover:bg-mist-100",
  gradient:
    "text-ink bg-[linear-gradient(120deg,var(--color-beam-400),var(--color-gold-500))] shadow-[0_1px_0_0_rgba(255,255,255,0.35)_inset,0_8px_24px_-8px_var(--color-gold-500)] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.45)_inset,0_10px_32px_-6px_var(--color-gold-500)]",
};

const sizes: Record<NonNullable<CommonProps["size"]>, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-12 px-8 text-base",
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children, ...rest } =
    props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const isExternal = props.href.startsWith("http") || props.href.startsWith("mailto:");
    const anchorRest = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    if (isExternal) {
      return (
        <a
          href={props.href}
          className={classes}
          target={anchorRest.target ?? "_blank"}
          rel={anchorRest.rel ?? "noopener noreferrer"}
          {...anchorRest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
