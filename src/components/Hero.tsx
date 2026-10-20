"use client";

import { MotionConfig, motion } from "motion/react";
import { ArrowDown, CalendarDays, Clock, MapPin } from "lucide-react";
import Constellation from "./Constellation";
import { Container } from "./ui";
import { useLanguage } from "@/i18n/LanguageProvider";

const EASE = [0.22, 1, 0.36, 1] as const;

const rise = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

// Red invitation band from the poster: giant "DSATalks", the slogan with its navy
// highlight, a live node network on the right and the round date badge.
export default function Hero() {
  const { m } = useLanguage();

  return (
    <MotionConfig reducedMotion="user">
      <section id="top" className="relative flex scroll-mt-24 flex-col text-white lg:min-h-[calc(100svh-4.75rem)]">
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden bg-[linear-gradient(115deg,#e41f35_0%,#d7182a_42%,#ab1022_100%)]"
        >
          {/* Concentric rings and the soft disc behind the network, as on the poster */}
          <svg
            viewBox="0 0 1200 1200"
            className="absolute -right-88 top-1/2 size-288 -translate-y-1/2 sm:-right-64"
          >
            {[150, 250, 360, 480, 600].map((r) => (
              <circle key={r} cx="600" cy="600" r={r} fill="none" stroke="white" strokeOpacity="0.1" />
            ))}
          </svg>
          <div className="absolute right-[6%] top-[38%] size-72 rounded-full bg-white/10 blur-[2px] sm:right-[14%]" />
          <div className="absolute -left-40 -top-40 size-136 rounded-full bg-[#ff3b52]/25 blur-3xl" />
          <Constellation className="absolute inset-y-0 right-0 h-full w-full opacity-60 mask-[linear-gradient(to_right,transparent_15%,black_60%)] lg:w-[62%] lg:opacity-100 lg:mask-[linear-gradient(to_right,transparent,black_35%)]" />
        </div>

        <Container className="relative flex flex-1 flex-col justify-center pb-24 pt-14 sm:pt-20 lg:pb-[clamp(5rem,12svh,8rem)] lg:pt-[clamp(2.5rem,7svh,5rem)]">
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.12 }}
            className="max-w-5xl"
          >
            <motion.h1
              variants={rise}
              className="text-[clamp(4.6rem,14vw,12rem)] font-black leading-[0.86] tracking-[-0.055em] lg:whitespace-nowrap lg:text-[clamp(6rem,min(10vw,18svh),11rem)]"
            >
              <span className="text-white">DSA</span><span className="text-ink">Talks</span>
            </motion.h1>

            <motion.span
              variants={rise}
              aria-hidden
              className="mt-8 block h-2.5 w-36 origin-left rounded-full bg-ink sm:w-48 lg:mt-[clamp(1.25rem,3svh,2rem)]"
            />

            <motion.p
              variants={rise}
              className="mt-8 text-[2rem] font-extrabold leading-[1.15] tracking-[-0.03em] sm:text-5xl lg:mt-[clamp(1.25rem,3svh,2rem)] lg:text-[clamp(2.25rem,5.4svh,3rem)]"
            >
              {m.hero.line1}
              <br />
              {m.hero.line2}{" "}
              <span className="inline-block rounded-2xl bg-ink px-4 pb-1.5 pt-0.5 shadow-[0_14px_30px_-12px_rgba(11,21,51,0.7)]">
                {m.hero.highlight}
              </span>
            </motion.p>

            <motion.p variants={rise} className="mt-8 max-w-xl text-lg leading-relaxed text-white/85 lg:mt-[clamp(1rem,2.6svh,2rem)]">
              {m.hero.intro}
            </motion.p>

            <motion.div variants={rise} className="mt-10 flex flex-wrap gap-3 lg:mt-[clamp(1.5rem,4svh,2.5rem)]">
              <a
                href="#speakers"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-ink shadow-lg shadow-black/15 transition-transform hover:-translate-y-0.5"
              >
                {m.hero.ctaSpeakers}
                <ArrowDown className="size-4" />
              </a>
              <a
                href="#program"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold text-white ring-2 ring-white/40 transition-colors hover:bg-white/10 hover:ring-white"
              >
                {m.hero.ctaProgram}
              </a>
            </motion.div>
          </motion.div>

          <DateBadge className="absolute bottom-0 right-8 z-20 hidden translate-y-1/2 lg:grid" />
        </Container>
      </section>

      <InfoStrip />
    </MotionConfig>
  );
}

function DateBadge({ className = "" }: { className?: string }) {
  const { m } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      className={`size-64 place-items-center rounded-full bg-ink text-center shadow-[0_30px_60px_-20px_rgba(11,21,51,0.7)] ring-10 ring-white ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-3 rounded-full border-2 border-dashed border-white/25 motion-safe:animate-spin-slow"
      />
      <div>
        <p className="text-7xl font-black leading-none tracking-tighter text-white">4–5</p>
        <p className="mt-3 text-lg font-extrabold uppercase tracking-[0.22em] text-brand-soft">{m.hero.badgeMonth}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">{m.hero.badgeDays}</p>
      </div>
    </motion.div>
  );
}

// White band under the hero with the date and venue, like the poster's middle row.
function InfoStrip() {
  const { m } = useLanguage();
  const items = [
    { icon: CalendarDays, label: m.info.date, value: m.meta.dateRange, detail: m.meta.weekdays },
    { icon: MapPin, label: m.info.venue, value: m.meta.venue, detail: m.meta.venueDetail },
    { icon: Clock, label: m.info.start, value: "09:30", detail: m.info.startValue },
  ];

  return (
    <section className="relative border-b border-line bg-white">
      <Container className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:pr-80">
        {items.map(({ icon: Icon, label, value, detail }) => (
          <div key={label} className="py-7 sm:px-6 sm:py-10 sm:first:pl-0 lg:px-8">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.32em] text-brand">
              <Icon className="size-4" />
              {label}
            </p>
            <p className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-ink xl:text-[1.7rem]">{value}</p>
            <p className="mt-1 text-muted">{detail}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
