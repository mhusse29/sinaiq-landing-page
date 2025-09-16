import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import NavBar from "./NavBar";
import PillButton from "./ui/PillButton";

// ===== CONFIG =====
const SKY_CUTOFF = 0.62; // stars/meteor draw only above 62% of hero height

/* ---------- Stars (subtle twinkle, sky only) ---------- */
function Stars({ count = 300 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!, ctx = canvas.getContext("2d", { alpha: true })!;
    let dpr = Math.min(window.devicePixelRatio || 1, 2), raf = 0, running = true;

    const stars = Array.from({ length: count }, () => ({
      x: Math.random(),                  // 0..1
      y: Math.random() * SKY_CUTOFF,     // stay above horizon
      r: Math.random() * 0.8 + 0.3,      // px
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 0.5,
      tint: Math.random(),               // 0→blue, 1→purple
    }));

    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width  = Math.max(1, Math.floor(p.clientWidth  * dpr));
      canvas.height = Math.max(1, Math.floor(p.clientHeight * dpr));
      canvas.style.width  = p.clientWidth  + "px";
      canvas.style.height = p.clientHeight + "px";
    };
    const onResize = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); resize(); };
    resize(); window.addEventListener("resize", onResize);

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const frame = (t: number) => {
      if (!running) return;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const cy = s.y * h; if (cy > SKY_CUTOFF * h) continue;
        const cx = s.x * w;
        const a = reduce ? 0.30 : 0.28 + 0.30 * Math.sin((t / 1000) * s.speed + s.phase);
        const r = Math.floor(160 + 40 * s.tint);
        const g = Math.floor(180 + 20 * s.tint);
        const b = Math.floor(200 + 55 * (1 - s.tint));
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.beginPath();
        ctx.arc(cx, cy, s.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [count]);

  return <canvas ref={ref} className="absolute inset-0 z-0 pointer-events-none" />;
}

/* ---------- Meteor (random start/dir, slow, sky only) ---------- */
function Meteor() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!, ctx = canvas.getContext("2d", { alpha: true })!;
    let dpr = Math.min(window.devicePixelRatio || 1, 2), raf = 0, timer: number | undefined;
    let running = true;

    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width  = Math.max(1, Math.floor(p.clientWidth  * dpr));
      canvas.height = Math.max(1, Math.floor(p.clientHeight * dpr));
      canvas.style.width  = p.clientWidth  + "px";
      canvas.style.height = p.clientHeight + "px";
    };
    const onResize = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); resize(); };
    resize(); window.addEventListener("resize", onResize);

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    type Shot = { sx:number; sy:number; ex:number; ey:number; vx:number; vy:number; start:number; dur:number; len:number; hue:number; };
    let shot: Shot | null = null;

    function spawn(now: number) {
      if (reduce) return;
      const w = canvas.width,  h = canvas.height;

      // random start high in sky
      const sx = (0.08 + Math.random() * 0.84) * w;
      const sy = (0.06 + Math.random() * (SKY_CUTOFF - 0.12)) * h;

      // random diagonal (left/right), clamp end Y to sky band
      const left = Math.random() < 0.5;
      let ex = sx + (left ? -1 : 1) * ((0.25 + Math.random() * 0.42) * w);
      let ey = sy + ((0.18 + Math.random() * 0.22) * h);
      ey = Math.min(ey, SKY_CUTOFF * h);

      // slower: 3.8–6.0s
      const dur = 3800 + Math.random() * 2200;
      const durSec = dur / 1000;
      const vx = (ex - sx) / durSec;
      const vy = (ey - sy) / durSec;

      shot = { sx, sy, ex, ey, vx, vy, start: now, dur, len: 100 * dpr, hue: 210 + Math.random() * 60 };
    }

    function scheduleNext(now: number) {
      const wait = 9000 + Math.random() * 9000; // 9–18s
      timer = window.setTimeout(() => spawn(now + wait), wait) as unknown as number;
    }

    const frame = (now: number) => {
      if (!running) return;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (shot) {
        const t = Math.min(1, (now - shot.start) / shot.dur);
        const headX = shot.sx + shot.vx * ((now - shot.start) / 1000);
        const headY = shot.sy + shot.vy * ((now - shot.start) / 1000);

        // stop at horizon
        if (headY > SKY_CUTOFF * h) {
          shot = null; scheduleNext(now);
        } else {
          const mag = Math.hypot(shot.vx, shot.vy) || 1;
          const tailX = headX - (shot.vx / mag) * shot.len;
          const tailY = headY - (shot.vy / mag) * shot.len;

          const alpha = 0.6 * (1 - t);
          const grad = ctx.createLinearGradient(headX, headY, tailX, tailY);
          grad.addColorStop(0, `hsla(${shot.hue}, 90%, 75%, ${alpha})`);
          grad.addColorStop(1, `hsla(${shot.hue + 30}, 90%, 55%, 0)`);

          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6 * dpr;
          ctx.lineCap = "round";
          ctx.shadowColor = `hsla(${shot.hue}, 100%, 60%, ${alpha * 0.5})`;
          ctx.shadowBlur = 10 * dpr;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.stroke();
          ctx.restore();

          if (t >= 1 || headX < -120 || headX > w + 120) {
            shot = null; scheduleNext(now);
          }
        }
      } else {
        if (timer === undefined && !reduce) scheduleNext(now);
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 z-0 pointer-events-none" />;
}

/** ====== MAIN HERO ====== */
export default function InteractiveHero() {
  const wrap = useRef<HTMLElement>(null);

  // subtle parallax on scroll (optional)
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start","end start"]});
  const yImg = useTransform(scrollYProgress, [0,1], [0,-40]); // background
  const yFog = useTransform(scrollYProgress, [0,1], [0,-20]); // mist

  // mobile 100vh fix
  useEffect(() => {
    const set = () => document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    set(); window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);

  return (
    <section ref={wrap} className="relative overflow-hidden min-h-[calc(var(--vh,1vh)*100)] bg-[var(--hero-deep)]">
      <NavBar />

      {/* SKY gradient (behind everything) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, #0E1A2A 0%, #08111B 55%, #050B13 100%)",
        }}
      />

      <Stars count={300} />
      <Meteor />

      {/* Base mountain (no glow) */}
      <motion.img
        src={`${import.meta.env.BASE_URL}assets/mountain-cutout.webp?v=9`}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = `${import.meta.env.BASE_URL}assets/mountain-cutout.png?v=9`; }}
        alt="Mountain"
        style={{
          y: yImg as any,
          willChange: "transform",
          position: "absolute",
          bottom: "-1.5vh",
          right: "clamp(-14vw, -10vw, -6vw)",   // right-anchored
          width: "min(1650px, 118vw)",
          height: "auto",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 20,
        }}
      />

      {/* Neon glow — masked to ONLY show around the peak & right ridge */}
      <img
        src={`${import.meta.env.BASE_URL}assets/mountain-cutout.webp?v=9`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none"
        style={{
          position: "absolute",
          bottom: "-1.5vh",
          right: "clamp(-14vw, -10vw, -6vw)",
          width: "min(1650px, 118vw)",
          height: "auto",
          zIndex: 30,
          mixBlendMode: "screen",
          /* Soft neon edge */
          filter: `
            drop-shadow(0 0 26px rgba(93,168,255,.36))
            drop-shadow(0 0 64px rgba(93,168,255,.20))
          `,
          /* Mask that HIDES the left/under-headline side.
             White = visible, Transparent = hidden. */
          WebkitMaskImage:
            "radial-gradient(120% 110% at 76% 38%, rgba(255,255,255,1) 36%, rgba(255,255,255,.75) 52%, rgba(255,255,255,0) 70%)",
          maskImage:
            "radial-gradient(120% 110% at 76% 38%, rgba(255,255,255,1) 36%, rgba(255,255,255,.75) 52%, rgba(255,255,255,0) 70%)",
          /* Slow breathing pulse */
          animation: "glowPulse 9s ease-in-out infinite",
        }}
      />

      {/* Peak crest under-glow (subtle, screen blend) */}
      <div
        className="pointer-events-none absolute z-30 mix-blend-screen"
        style={{
          right: "20vw",            // roughly above the peak; nudge if needed
          bottom: "26vh",
          width: "28vw",
          height: "24vh",
          background:
            "radial-gradient(closest-side at 58% 40%, rgba(93,168,255,.32), rgba(93,168,255,.10) 48%, rgba(0,0,0,0) 70%)",
          filter: "blur(14px) saturate(135%)",
        }}
      />

      {/* Left edge feather → blends inner edge into sky */}
      <div
        className="pointer-events-none absolute z-30"
        style={{
          left: 0,
          bottom: 0,
          width: "72vw",
          height: "62vh",
          background:
            "radial-gradient(72% 90% at 90% 78%, rgba(12,18,28,.70), rgba(12,18,28,0) 74%)",
          filter: "blur(36px) saturate(112%)",
        }}
      />

      {/* Ground haze left → softens base seam */}
      <div
        className="pointer-events-none absolute z-30"
        style={{
          left: 0,
          bottom: "-2vh",
          width: "48vw",
          height: "28vh",
          background:
            "radial-gradient(70% 100% at 18% 100%, rgba(28,42,70,.35), rgba(10,16,28,0) 62%)",
          filter: "blur(28px)",
        }}
      />

      {/* VIGNETTE (z-40) */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{ background:"linear-gradient(to bottom, rgba(0,0,0,.65) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,.5) 100%)" }}
      />

      <motion.div style={{ y: yFog }} className="pointer-events-none absolute inset-x-0 bottom-[-12%] z-20 h-[55%] blur-2xl mix-blend-screen">
        <div className="h-full w-full" style={{ background: "radial-gradient(80% 60% at 86% 104%, rgba(54,86,183,.18), rgba(0,9,87,0) 56%)" }}/>
      </motion.div>

      {/* Bottom blend: fade hero into page bg */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[26vh]"
        style={{
          background: "linear-gradient(to bottom, rgba(6,11,18,0) 0%, rgba(6,11,18,.55) 52%, rgba(6,11,18,1) 90%)"
        }}
      />

      {/* COPY (z-40) */}
      <div className="relative z-40 mx-auto max-w-7xl px-6 pt-32 sm:pt-40 md:pt-48 pb-28">
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-8 lg:col-span-7 xl:col-span-6">
            <h1 className="text-left text-balance max-w-[16ch]
                           text-5xl md:text-7xl xl:text-8xl leading-[1.05]
                           font-semibold tracking-tight text-white text-glow">
              Elevate Your Brand with
              <span className="bg-gradient-to-r from-[var(--ai-1)] to-[var(--ai-2)] bg-clip-text text-transparent">
                {" "}SINAIQ
              </span>{" "}
              Marketing Agency
            </h1>
            <p className="mt-5 max-w-2xl text-left text-lg md:text-xl text-white/85">
              We blend creativity, data, and AI to deliver marketing strategies that drive business growth and engage your audience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillButton variant="primary" size="lg" href="#consult">Get Your Free Consultation</PillButton>
              <PillButton variant="outline" size="lg" href="#work">See our work</PillButton>
            </div>
          </div>
        </div>
      </div>

      {/* Reduced motion + keyframes */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-[breath_7s_ease-in-out_infinite] { animation: none !important; }
          @keyframes glowPulse {}
        }
        @keyframes breath { 0%,100% { transform: scale(.985); opacity:.45 } 50% { transform: scale(1.03); opacity:.78 } }
        @keyframes glowPulse {
          0%, 100% {
            filter:
              drop-shadow(0 0 22px rgba(93,168,255,.32))
              drop-shadow(0 0 56px rgba(93,168,255,.18));
          }
          50% {
            filter:
              drop-shadow(0 0 34px rgba(93,168,255,.46))
              drop-shadow(0 0 78px rgba(93,168,255,.26));
          }
        }
      `}</style>
    </section>
  );
}