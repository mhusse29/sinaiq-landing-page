import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import NavBar from "./NavBar";
import PillButton from "./ui/PillButton";

// ===== CONFIG =====
const SKY_CUTOFF = 0.62; // stars/meteor draw only above 62% of hero height

// Aurora & Fog Configuration
const EFFECTS_CONFIG = {
  aurora: {
    intensity: 0.32,        // max opacity
    hueShiftSpeed: 0.05,    // color cycle speed (0.02 = slower, 0.08 = faster)
    motionSpeed: 10,        // px/s noise movement
    baseHue: 140,          // neon green base hue
    length: 1200,          // desktop length in px
    thickness: 120,        // base thickness in px
    fps: 35,               // target FPS
  },
  fog: {
    intensity: 0.35,       // max opacity on scroll
    driftSpeed: 1.5,       // px/s horizontal drift
    turbulenceSpeed: 0.03, // noise animation speed
    scaleRange: [1.00, 1.03], // scale from/to on scroll
    baseHue: 210,         // blue-gray base hue
  }
};

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

/* ---------- Realistic Neon-Green Aurora ---------- */
function RealisticAurora() {
  const ref = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0, running = true, hidden = false;
    let t0 = performance.now();
    
    const { aurora: cfg } = EFFECTS_CONFIG;
    const targetInterval = 1000 / cfg.fps;
    let lastFrame = 0;

    // Simple noise function (pseudo-Perlin)
    const noise = (x: number, y: number, time: number): number => {
      const a = Math.sin(x * 0.01 + time * 0.001) * Math.cos(y * 0.008 + time * 0.0008);
      const b = Math.sin(x * 0.017 + time * 0.0006) * Math.cos(y * 0.013 + time * 0.0012);
      return (a + b) * 0.5;
    };

    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = Math.max(1, Math.floor(p.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(p.clientHeight * dpr));
      canvas.style.width = p.clientWidth + "px";
      canvas.style.height = p.clientHeight + "px";
    };

    const onResize = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); resize(); };
    const onVisibilityChange = () => { hidden = document.hidden; };
    
    resize();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const drawAurora = (now: number) => {
      const w = canvas.width, h = canvas.height;
      const t = (now - t0) / 1000;
      
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Responsive aurora dimensions
      const isMobile = w < 768 * dpr;
      const isTablet = w >= 768 * dpr && w < 1024 * dpr;
      
      let auroraLength = cfg.length * dpr;
      let thickness = cfg.thickness * dpr;
      
      if (isMobile) {
        auroraLength *= 0.6;
        thickness *= 0.7;
      } else if (isTablet) {
        auroraLength *= 0.8;
        thickness *= 0.85;
      }

      // Aurora path: curved arc above mountain's right ridge
      const startX = w * 0.45;
      const startY = h * 0.25;
      const endX = w * 0.85;
      const endY = h * 0.35;
      
      const steps = Math.floor(auroraLength / (8 * dpr));
      
      // Color cycling: neon green base with blue/cyan edges
      const hueShift = reduce ? 0 : Math.sin(t * cfg.hueShiftSpeed) * 15;
      const baseHue = cfg.baseHue + hueShift; // 140° base (neon green)
      const edgeHue = 190; // cyan-blue for edges

      for (let i = 0; i < steps; i++) {
        const progress = i / (steps - 1);
        
        // Base curve
        const x = startX + (endX - startX) * progress;
        const y = startY + (endY - startY) * progress + Math.sin(progress * Math.PI) * h * 0.08;
        
        // Noise-driven undulation
        const noiseOffset = reduce ? 0 : noise(x * 0.1, y * 0.1, t * cfg.motionSpeed * 100) * 12 * dpr;
        const finalX = x + noiseOffset;
        const finalY = y + noiseOffset * 0.5;
        
        // Variable thickness along path
        const thicknessMod = 0.8 + 0.4 * Math.sin(progress * Math.PI * 3 + t * 0.5);
        const currentThickness = thickness * thicknessMod * (1 - Math.abs(progress - 0.5) * 0.3);
        
        // Tapering at ends
        const edgeFade = Math.min(progress * 4, (1 - progress) * 4, 1);
        
        // Aurora layers for depth
        for (let layer = 0; layer < 3; layer++) {
          const layerScale = 1 - layer * 0.3;
          const layerThickness = currentThickness * layerScale;
          const layerAlpha = cfg.intensity * edgeFade * (0.8 - layer * 0.2);
          
          // Core (neon green)
          if (layer === 0) {
            const coreGrad = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, layerThickness * 0.4);
            coreGrad.addColorStop(0, `hsla(${baseHue}, 85%, 65%, ${layerAlpha})`);
            coreGrad.addColorStop(0.7, `hsla(${baseHue}, 75%, 55%, ${layerAlpha * 0.6})`);
            coreGrad.addColorStop(1, `hsla(${baseHue}, 65%, 45%, 0)`);
            
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(finalX, finalY, layerThickness * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Edge glow (cyan/blue)
          const edgeGrad = ctx.createRadialGradient(finalX, finalY, layerThickness * 0.3, finalX, finalY, layerThickness);
          edgeGrad.addColorStop(0, `hsla(${edgeHue}, 90%, 70%, ${layerAlpha * 0.3})`);
          edgeGrad.addColorStop(0.5, `hsla(${edgeHue + 20}, 85%, 60%, ${layerAlpha * 0.2})`);
          edgeGrad.addColorStop(1, `hsla(${edgeHue}, 80%, 50%, 0)`);
          
          ctx.fillStyle = edgeGrad;
          ctx.beginPath();
          ctx.arc(finalX, finalY, layerThickness, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Soft drop haze (bloom effect)
        if (i % 3 === 0) {
          const hazeGrad = ctx.createRadialGradient(finalX, finalY + thickness * 0.5, 0, finalX, finalY + thickness * 0.5, thickness * 1.5);
          hazeGrad.addColorStop(0, `hsla(${baseHue}, 70%, 55%, ${cfg.intensity * 0.15 * edgeFade})`);
          hazeGrad.addColorStop(1, `hsla(${baseHue}, 60%, 45%, 0)`);
          
          ctx.fillStyle = hazeGrad;
          ctx.beginPath();
          ctx.arc(finalX, finalY + thickness * 0.5, thickness * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    };

    const frame = (now: number) => {
      if (!running) return;
      
      // FPS throttling and tab visibility
      if (hidden || (now - lastFrame < targetInterval)) {
        raf = requestAnimationFrame(frame);
        return;
      }
      
      lastFrame = now;
      
      if (reduce) {
        // Static frame for reduced motion
        if (lastFrame === now) drawAurora(t0 + 5000); // fixed time
      } else {
        drawAurora(now);
      }
      
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ opacity: 1 }}
    />
  );
}

/* ---------- Scroll-Triggered Ground Fog ---------- */
function ScrollTriggeredFog() {
  const fogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = fogRef.current!;
    const section = document.querySelector('section[data-hero-section]') as HTMLElement;
    if (!section) return;
    
    let raf = 0, running = true, t0 = performance.now();
    let scrollProgress = 0;
    
    const { fog: cfg } = EFFECTS_CONFIG;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    // Intersection Observer for scroll tracking
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          const rect = entry.boundingClientRect;
          const viewportHeight = window.innerHeight;
          
          // Map scroll progress: 0 when hero top in view, 1 when nearly pinned bottom
          const topInView = Math.max(0, -rect.top / viewportHeight);
          const bottomApproach = Math.min(1, (viewportHeight - rect.bottom) / (viewportHeight * 0.4));
          
          scrollProgress = Math.min(1, Math.max(topInView, bottomApproach));
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(section);

    // Simple noise for turbulence
    const noise = (x: number, y: number, time: number): number => {
      return Math.sin(x * 0.01 + time) * Math.cos(y * 0.008 + time * 0.7) * 0.5;
    };

    const tick = (now: number) => {
      if (!running) return;
      
      const t = (now - t0) / 1000;
      
      // Scroll-based opacity mapping
      const baseOpacity = 0.10 + (scrollProgress * 0.25); // 0.10 → 0.35
      const maxOpacity = Math.min(cfg.intensity, baseOpacity);
      
      // Scroll-based scale mapping
      const [minScale, maxScale] = cfg.scaleRange;
      const scale = minScale + (scrollProgress * (maxScale - minScale));
      
      // Subtle drift and turbulence (if motion enabled)
      const driftX = reduce ? 0 : (t * cfg.driftSpeed) % 100;
      const turbulence = reduce ? 0 : noise(t * 50, t * 30, t * cfg.turbulenceSpeed) * 3;
      
      // Apply transforms and opacity
      el.style.transform = `
        scale(${scale}) 
        translateX(${driftX + turbulence}px) 
        translateZ(0)
      `;
      el.style.opacity = String(maxOpacity);
      
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={fogRef}
      className="pointer-events-none absolute z-10"
      style={{
        left: "-8vw",
        right: "-8vw", 
        bottom: "-12vh",
        height: "50vh",
        filter: "blur(42px)",
        mixBlendMode: "screen",
        transformOrigin: "center bottom",
        opacity: 0.10,
        background: [
          // Deep navy base with cyan haze - 3 layered fields
          `radial-gradient(75% 85% at 75% 100%, 
            hsla(${EFFECTS_CONFIG.fog.baseHue}, 60%, 35%, 0.25), 
            hsla(${EFFECTS_CONFIG.fog.baseHue}, 70%, 45%, 0.12) 45%, 
            transparent 65%)`,
          `radial-gradient(60% 70% at 60% 100%, 
            hsla(${EFFECTS_CONFIG.fog.baseHue - 30}, 75%, 50%, 0.18), 
            transparent 55%)`,
          `radial-gradient(90% 60% at 50% 100%, 
            rgba(70,160,220,0.12), 
            transparent 50%)`
        ].join(", "),
      }}
    />
  );
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
    <section ref={wrap} data-hero-section className="relative overflow-hidden min-h-[calc(var(--vh,1vh)*100)] bg-[var(--hero-deep)]">
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

      {/* Realistic Neon-Green Aurora (z-10, above stars, behind mountain) */}
      <RealisticAurora />

      {/* Scroll-Triggered Ground Fog (z-10, behind mountain) */}
      <ScrollTriggeredFog />

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

      {/* COPY (z-40 → above overlays) */}
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
              <PillButton className="js-primary-cta" variant="primary" size="lg" href="#consult">Get Your Free Consultation</PillButton>
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