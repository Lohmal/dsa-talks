"use client";

import { MotionConfig, motion } from "motion/react";
import HorizonNetwork from "./HorizonNetwork";
import StarField from "./StarField";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

// Entrance easings (quint, expo and the hairline's in-out curve).
const QUINT = [0.22, 1, 0.36, 1] as const;
const EXPO = [0.16, 1, 0.3, 1] as const;
const HAIRLINE = [0.7, 0, 0.2, 1] as const;

function rise(delay: number, y: number, duration: number, ease: typeof QUINT | typeof EXPO = QUINT) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration, ease },
  };
}

// One headline line that rises out of a mask at its baseline.
function MaskedLine({ children, delay, className = "" }: { children: string; delay: number; className?: string }) {
  return (
    <span className="mb-[-0.14em] block overflow-hidden pb-[0.14em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "104%" }}
        animate={{ y: "0%" }}
        transition={{ delay, duration: 1.1, ease: EXPO }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const { m } = useLanguage();
  const meta = [m.meta.dateRange, m.meta.city, m.meta.universityShort];
  // The centre item enters first, then the outer two.
  const metaDelay = [0.49, 0.42, 0.49];

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="relative flex min-h-[calc(100svh-7.25rem+3rem)] flex-col overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(90deg, #0a1129 0%, #0c1430 22%, #0d1633 45%, #0c1430 62%, #0a1229 80%, #080f24 100%)",
        }}
      >
        <StarField />

        {/* Masthead: hairline and key facts */}
        {/* The hairline takes the width of the facts row, never narrower than 284px. */}
        <div className="relative z-10 mx-auto flex w-fit min-w-[min(284px,calc(100vw-32px))] max-w-[calc(100vw-32px)] flex-col items-stretch pt-10">
          <motion.span
            aria-hidden
            className="block h-px bg-white/20"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.18, duration: 1, ease: HAIRLINE }}
          />
          <ul className="mt-4 flex flex-wrap justify-between gap-x-6 gap-y-1 px-2 text-[13px] whitespace-nowrap sm:gap-x-9 tracking-[-0.02em] text-[rgba(238,242,255,0.9)] sm:text-sm">
            {meta.map((item, i) => (
              <motion.li key={i} {...rise(metaDelay[i], -4, 0.7)}>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="min-h-6 flex-83" />

        {/* Copy */}
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <h1 className="text-[clamp(2rem,min(5.3vw,8.5svh),4.25rem)] font-medium leading-[1.02] tracking-[-0.028em]">
            <MaskedLine delay={0.2}>{m.home.heroLine1}</MaskedLine>
            <MaskedLine delay={0.29} className="tracking-[-0.03em]">
              {m.home.heroLine2}
            </MaskedLine>
          </h1>

          <motion.p
            className="mt-5 max-w-3xl text-balance text-[clamp(1rem,min(1.65vw,2.7svh),1.3rem)] tracking-[-0.005em] text-[rgba(226,233,255,0.74)]"
            {...rise(0.7, 10, 0.85)}
          >
            {m.meta.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.86, duration: 0.9, ease: EXPO }}
          >
            {/* Main action for now: scroll down to the conference introduction. */}
            <a
              href="#about"
              className="group mt-7 inline-flex h-12 min-w-54 items-center justify-center gap-2.5 rounded-[5px] bg-white px-7 text-[17px] font-semibold tracking-[-0.02em] text-[#0a0a0a] transition-[background-color,box-shadow] duration-200 hover:bg-[#e8eef7] hover:shadow-[0_0_0_4px_rgba(120,200,255,0.12)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7fd4ff]"
            >
              {m.home.discover}
              <svg
                aria-hidden
                viewBox="0 0 11 12.6"
                className="h-[0.8em] w-[0.64em] transition-transform duration-200 group-hover:translate-y-[0.15em]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.5 .4V12M1 7.5L5.5 12L10 7.5" />
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Horizon field */}
        <motion.div
          className="relative -mt-24 min-h-56 flex-319 mask-[linear-gradient(to_bottom,transparent,black_38%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1.6, ease: "easeOut" }}
        >
          <HorizonNetwork />
        </motion.div>

        {/* The planet sinks into the deep navy of the next section, so there is no visible edge.
            pointer-events-none keeps the cell hover working underneath. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-navy-deep/0 to-navy-deep"
        />
      </section>
    </MotionConfig>
  );
}
