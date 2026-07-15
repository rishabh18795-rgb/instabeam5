"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Facebook,
  Globe,
  MessageCircle,
  Search,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";

/**
 * Hero centerpiece: InstaBeam as the "brain" every channel feeds into.
 * Six signal sources orbit a glowing center node; animated gradient beams
 * (SVG, percentage-space so it scales with the container) carry traveling
 * particles inward toward the logo. Entirely custom SVG/CSS/Framer
 * Motion — no stock imagery, no external assets.
 */

type Node = {
  key: string;
  label: string;
  icon: LucideIcon;
  x: number; // percent, 0-100
  y: number; // percent, 0-100
};

const R = 38;
const nodes: Node[] = [
  { key: "website", label: "Website", icon: Globe, x: 50, y: 50 - R },
  { key: "meta", label: "Meta Ads", icon: Facebook, x: 50 + R * 0.866, y: 50 - R * 0.5 },
  { key: "google", label: "Google Ads", icon: Search, x: 50 + R * 0.866, y: 50 + R * 0.5 },
  { key: "ga4", label: "GA4", icon: BarChart3, x: 50, y: 50 + R },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, x: 50 - R * 0.866, y: 50 + R * 0.5 },
  { key: "ai", label: "AI", icon: BrainCircuit, x: 50 - R * 0.866, y: 50 - R * 0.5 },
];

export function FunnelIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] select-none">
      {/* deep ambient glow behind the whole diagram — layered for depth */}
      <div className="absolute inset-[4%] rounded-full bg-[radial-gradient(circle,var(--color-beam-500)_0%,transparent_60%)] opacity-[0.14] blur-3xl" />
      <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,var(--color-gold-500)_0%,transparent_65%)] opacity-[0.12] blur-2xl" />

      {/* slow-rotating dotted orbit ring for depth */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full animate-[spin_60s_linear_infinite] overflow-visible opacity-30"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="url(#orbit-gradient)"
          strokeWidth="0.3"
          strokeDasharray="0.4 2.8"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="orbit-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#F4B400" />
          </linearGradient>
        </defs>
      </svg>

      {/* beams + traveling particles */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="beam-line" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#F4B400" />
          </linearGradient>
          <radialGradient id="particle-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
          </radialGradient>
          <filter id="beam-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>
        {nodes.map((node, i) => (
          <g key={node.key}>
            {/* soft glow pass underneath the crisp line, for a beam feel */}
            <line
              x1={node.x}
              y1={node.y}
              x2={50}
              y2={50}
              stroke="url(#beam-line)"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.18"
              filter="url(#beam-blur)"
            />
            <line
              x1={node.x}
              y1={node.y}
              x2={50}
              y2={50}
              stroke="url(#beam-line)"
              strokeWidth="0.35"
              strokeDasharray="1 2.4"
              strokeLinecap="round"
              opacity="0.5"
              className="animate-beam-flow"
            />
            {/* particle with glow trail */}
            <circle r="1.8" fill="url(#particle-glow)">
              <animateMotion
                dur={`${2.8 + i * 0.3}s`}
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
                path={`M ${node.x} ${node.y} L 50 50`}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.15;0.85;1"
                dur={`${2.8 + i * 0.3}s`}
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
              />
            </circle>
            <circle r="0.7" fill="#ffffff">
              <animateMotion
                dur={`${2.8 + i * 0.3}s`}
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
                path={`M ${node.x} ${node.y} L 50 50`}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.15;0.85;1"
                dur={`${2.8 + i * 0.3}s`}
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>

      {/* orbiting signal-source cards */}
      {nodes.map((node, i) => {
        const Icon = node.icon;
        return (
          <motion.div
            key={node.key}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 4.5 + (i % 3) * 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
              className="group relative flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))] px-3.5 py-3 shadow-[0_8px_28px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-shadow duration-300 hover:border-beam-400/40 hover:shadow-[0_8px_28px_-8px_rgba(0,217,255,0.35),inset_0_1px_0_0_rgba(255,255,255,0.12)]"
            >
              {/* per-node ambient glow, revealed on hover */}
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,var(--color-beam-400)_0%,transparent_70%)] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-25" />
              <Icon className="relative h-4 w-4 text-beam-300" strokeWidth={1.75} />
              <span className="relative whitespace-nowrap text-[10px] font-medium text-mist-300">
                {node.label}
              </span>
            </motion.div>
          </motion.div>
        );
      })}

      {/* center brain node — layered glow, glass surface, glossy reflection */}
      <div
        style={{ left: "50%", top: "50%" }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        {/* outer soft halo */}
        <span className="absolute inset-0 -m-10 rounded-full bg-[radial-gradient(circle,var(--color-beam-400)_0%,transparent_70%)] opacity-25 blur-2xl" />
        <span className="absolute inset-0 -m-4 animate-ping-slow rounded-full border border-beam-400/40" />
        <span className="absolute inset-0 -m-8 animate-ping-slower rounded-full border border-gold-500/25" />
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(160deg,rgba(255,255,255,0.12),rgba(11,11,11,0.9))] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_60px_-4px_var(--color-beam-500),0_0_120px_-20px_var(--color-gold-500)]"
        >
          {/* glossy top-light reflection */}
          <span className="pointer-events-none absolute inset-x-3 top-1.5 h-6 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent)] blur-[2px]" />
          <LogoMark className="relative h-9 w-9" />
        </motion.div>
      </div>
    </div>
  );
}
