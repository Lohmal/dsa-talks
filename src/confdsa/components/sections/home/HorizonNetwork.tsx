"use client";

import { useEffect, useRef } from "react";

// The poster's network sphere, drawn huge so only its upper edge rises into view
// like a planet horizon. Nodes drift along the horizon; red signals run along links.

const NODE_SPACING = 70; // px between neighbouring nodes on the sphere surface
const TILT = 1.05; // leans the spin axis towards the viewer so nodes slide along the horizon
const PULSE_COUNT = 12;
const MAX_RADIUS = 4200;
const MIN_NODES = 1200;
const MAX_NODES = 12000;
const SURFACE_SPEED = 0.6; // px per frame at the horizon, whatever the radius

type Vec = [number, number, number];

function spherePoints(count: number): Vec[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    return [Math.cos(golden * i) * r, y, Math.sin(golden * i) * r];
  });
}

// On a Fibonacci lattice, a point's neighbours sit at Fibonacci index offsets,
// so we only test those instead of comparing every pair.
function nearestLinks(points: Vec[]): [number, number][] {
  const offsets: number[] = [];
  for (let a = 1, b = 2; a < points.length / 2; [a, b] = [b, a + b]) offsets.push(a);
  const seen = new Set<number>();
  const links: [number, number][] = [];
  points.forEach((p, i) => {
    const candidates = offsets
      .flatMap((o) => [i - o, i + o])
      .filter((j) => j >= 0 && j < points.length)
      .map((j) => ({ j, d: (p[0] - points[j][0]) ** 2 + (p[1] - points[j][1]) ** 2 + (p[2] - points[j][2]) ** 2 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const { j } of candidates) {
      const key = Math.min(i, j) * points.length + Math.max(i, j);
      if (!seen.has(key)) {
        seen.add(key);
        links.push([i, j]);
      }
    }
  });
  return links;
}

// The grid cells drawn by the links: triangles, plus four-sided cells that have no diagonal.
function meshFaces(count: number, links: [number, number][]): number[][] {
  const adjacent = Array.from({ length: count }, () => new Set<number>());
  for (const [a, b] of links) {
    adjacent[a].add(b);
    adjacent[b].add(a);
  }
  const faces: number[][] = [];
  const seen = new Set<string>();
  for (const [a, b] of links) {
    for (const c of adjacent[b]) {
      if (c === a) continue;
      if (adjacent[a].has(c)) {
        const key = [a, b, c].sort((x, y) => x - y).join();
        if (!seen.has(key)) {
          seen.add(key);
          faces.push([a, b, c]);
        }
        continue;
      }
      for (const d of adjacent[a]) {
        if (d === b || d === c || adjacent[b].has(d) || !adjacent[c].has(d)) continue;
        const key = [a, b, c, d].sort((x, y) => x - y).join();
        if (!seen.has(key)) {
          seen.add(key);
          faces.push([a, b, c, d]);
        }
      }
    }
  }
  return faces;
}

export default function HorizonNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let radius = 0;
    let horizon = 0;
    let points: Vec[] = [];
    let links: [number, number][] = [];
    let faces: number[][] = [];
    let heat = new Float32Array(0); // how lit each cell is; a cell fades quickly once the cursor leaves it
    let accent: boolean[] = [];
    let screen: { x: number; y: number; z: number; on: boolean }[] = [];
    let angle = 0;
    let frame = 0;
    let visible = true;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    // Cursor position on the canvas; strength eases in/out as the cursor enters or leaves the planet.
    const hover = { x: -9999, y: -9999, inside: false, strength: 0 };
    // Ray-casting test: is (x, y) inside the projected cell?
    const containsPoint = (face: number[], x: number, y: number) => {
      let inside = false;
      for (let i = 0, j = face.length - 1; i < face.length; j = i++) {
        const a = screen[face[i]];
        const b = screen[face[j]];
        if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
      }
      return inside;
    };
    const tracePath = (face: number[]) => {
      ctx.beginPath();
      ctx.moveTo(screen[face[0]].x, screen[face[0]].y);
      for (let k = 1; k < face.length; k++) ctx.lineTo(screen[face[k]].x, screen[face[k]].y);
      ctx.closePath();
    };
    const pulses = Array.from({ length: PULSE_COUNT }, () => ({ link: -1, t: 1, speed: 0 }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The field reaches up behind the copy, so the horizon sits lower inside it.
      horizon = height * 0.45;
      // Wide, short screens need a flatter curve, otherwise the arc drops out of the field
      // before the edges and the sphere reads as a dome. Keep the edge sag within ~40% of the
      // field below the horizon.
      const flatRadius = (width / 2) ** 2 / (2 * 0.4 * (height - horizon));
      const nextRadius = Math.min(MAX_RADIUS, Math.max(width * 1.05, 700, flatRadius));
      if (Math.abs(nextRadius - radius) > 40 || points.length === 0) {
        radius = nextRadius;
        const count = Math.round(
          Math.min(MAX_NODES, Math.max(MIN_NODES, (4 * Math.PI * radius * radius) / NODE_SPACING ** 2)),
        );
        points = spherePoints(count);
        links = nearestLinks(points);
        faces = meshFaces(points.length, links);
        heat = new Float32Array(faces.length);
        accent = points.map((_, i) => i % 13 === 5);
        screen = points.map(() => ({ x: 0, y: 0, z: 0, on: false }));
        pulses.forEach((p) => (p.t = 1));
      }
    };

    const project = () => {
      const a = angle + pointer.x * 0.04;
      const t = TILT + pointer.y * 0.03;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const ct = Math.cos(t);
      const st = Math.sin(t);
      const cx = width / 2;
      const cy = horizon + radius;
      for (let i = 0; i < points.length; i++) {
        const [x, y, z] = points[i];
        const x1 = x * ca + z * sa;
        const z1 = -x * sa + z * ca;
        const y2 = y * ct - z1 * st;
        const z2 = y * st + z1 * ct;
        const s = screen[i];
        s.x = cx + x1 * radius;
        s.y = cy + y2 * radius;
        s.z = z2;
        s.on = z2 > 0 && s.y < height + 20 && s.x > -20 && s.x < width + 20;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      project();
      const cx = width / 2;
      const cy = horizon + radius;

      // Red dawn rising behind the horizon.
      // Squash the glow so it has fully faded before the top of the canvas (no hard edge).
      const dawnRadius = width * 0.42;
      ctx.save();
      ctx.translate(cx, horizon);
      ctx.scale(1, Math.min(0.35, (horizon * 0.92) / dawnRadius));
      const dawn = ctx.createRadialGradient(0, 0, 0, 0, 0, dawnRadius);
      dawn.addColorStop(0, "rgba(215, 24, 42, 0.42)");
      dawn.addColorStop(0.45, "rgba(215, 24, 42, 0.12)");
      dawn.addColorStop(1, "rgba(215, 24, 42, 0)");
      ctx.fillStyle = dawn;
      ctx.fillRect(-width, -width, width * 2, width * 2);
      ctx.restore();

      // Planet body.
      const body = ctx.createLinearGradient(0, horizon, 0, height);
      body.addColorStop(0, "#14204a");
      body.addColorStop(1, "#090f26");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Thin atmosphere along the rim.
      const rim = ctx.createRadialGradient(cx, cy, radius - 70, cx, cy, radius + 40);
      rim.addColorStop(0, "rgba(143, 163, 199, 0)");
      rim.addColorStop(0.6, "rgba(160, 182, 225, 0.22)");
      rim.addColorStop(0.64, "rgba(214, 226, 255, 0.75)");
      rim.addColorStop(0.68, "rgba(160, 182, 225, 0.25)");
      rim.addColorStop(1, "rgba(143, 163, 199, 0)");
      ctx.fillStyle = rim;
      ctx.fillRect(0, 0, width, height);

      // Only the cell under the cursor fills with red; the previous one fades out quickly.
      let hovered = -1;
      for (let f = 0; f < faces.length; f++) {
        const face = faces[f];
        let on = true;
        let fx = 0;
        let fy = 0;
        let fz = 1;
        for (const v of face) {
          const p = screen[v];
          if (!p.on) {
            on = false;
            break;
          }
          fx += p.x;
          fy += p.y;
          fz = Math.min(fz, p.z);
        }
        if (!on) continue;
        fx /= face.length;
        fy /= face.length;
        if (
          hovered < 0 &&
          hover.strength > 0.01 &&
          Math.abs(fx - hover.x) < 80 &&
          Math.abs(fy - hover.y) < 80 &&
          containsPoint(face, hover.x, hover.y)
        ) {
          hovered = f;
          heat[f] = Math.max(heat[f], hover.strength);
        }
        if (heat[f] < 0.02) continue;
        ctx.fillStyle = `rgba(215, 24, 42, ${0.7 * heat[f] * Math.min(1, fz / 0.22)})`;
        tracePath(face);
        ctx.fill();
      }

      // Links, fading in from the rim.
      const live: number[] = [];
      ctx.lineWidth = 1;
      for (let k = 0; k < links.length; k++) {
        const [a, b] = links[k];
        const pa = screen[a];
        const pb = screen[b];
        if (!pa.on || !pb.on) continue;
        live.push(k);
        const fade = Math.min(1, Math.min(pa.z, pb.z) / 0.22);
        ctx.strokeStyle = `rgba(170, 190, 228, ${0.3 * fade})`;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // Brighter outline around the hovered cell.
      if (hovered >= 0) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(255, 90, 105, ${0.9 * hover.strength})`;
        tracePath(faces[hovered]);
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      for (let i = 0; i < screen.length; i++) {
        const p = screen[i];
        if (!p.on) continue;
        const fade = Math.min(1, p.z / 0.22);
        const r = accent[i] ? 2.6 : 1.5;
        if (accent[i]) {
          ctx.fillStyle = `rgba(215, 24, 42, ${0.18 * fade})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = accent[i]
          ? `rgba(230, 40, 58, ${fade})`
          : `rgba(255, 255, 255, ${0.85 * fade})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Signals hop between visible links.
      for (const pulse of pulses) {
        if (pulse.t >= 1 || !screen[links[pulse.link]?.[0]]?.on) {
          if (live.length === 0) continue;
          pulse.link = live[Math.floor(Math.random() * live.length)];
          pulse.t = 0;
          pulse.speed = 0.008 + Math.random() * 0.012;
        }
        const [a, b] = links[pulse.link];
        const pa = screen[a];
        const pb = screen[b];
        const fade = Math.min(1, Math.min(pa.z, pb.z) / 0.22);
        ctx.fillStyle = `rgba(255, 110, 120, ${fade})`;
        ctx.beginPath();
        ctx.arc(pa.x + (pb.x - pa.x) * pulse.t, pa.y + (pb.y - pa.y) * pulse.t, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      angle += SURFACE_SPEED / radius;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      for (const pulse of pulses) pulse.t += pulse.speed;
      hover.strength += ((hover.inside ? 1 : 0) - hover.strength) * 0.12;
      for (let f = 0; f < heat.length; f++) heat[f] *= 0.85;
      draw();
      frame = visible && !document.hidden ? requestAnimationFrame(step) : 0;
    };

    const start = () => {
      if (!frame && !reduceMotion && visible && !document.hidden) frame = requestAnimationFrame(step);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = event.clientX / window.innerWidth - 0.5;
      pointer.ty = event.clientY / window.innerHeight - 0.5;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const onPlanet = Math.hypot(x - width / 2, y - (horizon + radius)) < radius + 10;
      hover.inside = x >= 0 && x <= width && y >= 0 && y <= height && onPlanet;
      if (hover.inside) {
        hover.x = x;
        hover.y = y;
      }
      if (reduceMotion) {
        hover.strength = hover.inside ? 1 : 0;
        heat.fill(0);
        draw();
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
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const onPointerLeave = () => {
      hover.inside = false;
      if (reduceMotion) {
        hover.strength = 0;
        draw();
      }
    };
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    resize();
    draw();
    start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />;
}
