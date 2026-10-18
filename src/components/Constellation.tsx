"use client";

import { useEffect, useRef } from "react";

// The poster's node network, alive: white nodes drift slowly, nearby nodes link up,
// a few hubs glow, and the cursor pulls in links of its own.

const LINK_DISTANCE = 170;
const POINTER_DISTANCE = 220;
const SPEED = 0.18;

type Node = { x: number; y: number; vx: number; vy: number; r: number; hub: boolean; phase: number };

export default function Constellation({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let frame = 0;
    let visible = true;
    let time = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(90, Math.max(28, (width * height) / 16000)));
      nodes = Array.from({ length: count }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const hub = i % 9 === 0;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * SPEED * (0.4 + Math.random()),
          vy: Math.sin(angle) * SPEED * (0.4 + Math.random()),
          r: hub ? 5 + Math.random() * 2.5 : 1.6 + Math.random() * 1.6,
          hub,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK_DISTANCE) continue;
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.42 * (1 - d / LINK_DISTANCE)})`;
          ctx.lineWidth = a.hub || b.hub ? 1.4 : 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        if (pointer.active) {
          const d = Math.hypot(a.x - pointer.x, a.y - pointer.y);
          if (d < POINTER_DISTANCE) {
            ctx.strokeStyle = `rgba(19, 34, 75, ${0.55 * (1 - d / POINTER_DISTANCE)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        if (node.hub) {
          const pulse = 0.5 + 0.5 * Math.sin(time * 0.03 + node.phase);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + 0.1 * pulse})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r * (2.6 + pulse), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = node.hub ? "#ffffff" : "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      time++;
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        // Wrap around softly so the field never empties.
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      }
      draw();
      frame = visible && !document.hidden ? requestAnimationFrame(step) : 0;
    };

    const start = () => {
      if (!frame && !reduceMotion && visible && !document.hidden) frame = requestAnimationFrame(step);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
      if (reduceMotion) draw();
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
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    resize();
    draw();
    start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
