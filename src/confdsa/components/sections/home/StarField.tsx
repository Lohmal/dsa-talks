"use client";

import { useEffect, useRef } from "react";

// Faint twinkling stars in the hero sky. They drift very slowly and stay dimmer
// behind the headline so the text keeps its contrast.

type Star = { x: number; y: number; r: number; alpha: number; phase: number; speed: number; mist: boolean };

const DRIFT = 0.05; // px per frame, barely noticeable

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let frame = 0;
    let visible = true;
    let last = performance.now();
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Roughly one star per 16,000 px², capped so wide screens stay calm.
      const count = Math.round(Math.min(80, Math.max(28, (width * height) / 16000)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.78, // keep to the sky above the planet
        r: 0.4 + Math.random() * 1.1,
        alpha: 0.25 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.1,
        mist: Math.random() < 0.18,
      }));
    };

    // 0.3 in the middle of the headline area, rising to 1 outside it.
    const textDim = (x: number, y: number) => {
      const dx = (x - width / 2) / Math.min(width * 0.34, 560);
      const dy = (y - height * 0.42) / (height * 0.24);
      const d = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      return 0.3 + 0.7 * d * d;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(time * s.speed + s.phase);
        const a = s.alpha * twinkle * textDim(s.x, s.y);
        ctx.fillStyle = s.mist ? `rgba(170, 190, 228, ${a})` : `rgba(255, 255, 255, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        // A soft halo on the brighter stars.
        if (s.r > 1.1) {
          ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.15})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const step = (now: number) => {
      time += Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const s of stars) {
        s.x += DRIFT;
        if (s.x > width + 4) s.x = -4;
      }
      draw();
      frame = visible && !document.hidden ? requestAnimationFrame(step) : 0;
    };

    const start = () => {
      if (!frame && !reduceMotion && visible && !document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(step);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    intersection.observe(canvas);
    document.addEventListener("visibilitychange", start);

    resize();
    draw();
    start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}
