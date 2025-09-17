import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import NavBar from "./NavBar";
import PillButton from "./ui/PillButton";

// ===== CONFIG =====
const SKY_CUTOFF = 0.62; // stars/meteor draw only above 62% of hero height

// Aurora & Fog Configuration
const EFFECTS_CONFIG = {
  aurora: {
    intensity: 0.14,        // global max opacity (hard cap)
    peakIntensity: 0.20,    // local peak alpha spikes
    driftSpeed: 7.5,        // px/s leftward drift (desktop)
    undulationAmp: 11,      // px amplitude for noise undulation
    length: 1400,           // desktop length in px
    thickness: 100,         // base thickness in px
    fps: 35,                // target FPS
    fadeOutWidth: 0.23,     // fade out over last 23% of width
  },
  fog: {
    baseOpacity: 0.10,      // at 0% scroll
    midOpacity: 0.22,       // at 60% scroll
    maxOpacity: 0.32,       // at 95-100% scroll (capped)
    scaleRange: [1.00, 1.02], // scale from/to on scroll
    driftSpeed: 1.8,        // px/s convection drift
    turbulenceSpeed: 0.02,  // noise wobble speed
    baseHue: 210,          // blue-navy base hue
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

/* ---------- Subtle Realistic Aurora ---------- */
function RealisticAurora({ debugIntensity }: { debugIntensity?: number }) {
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

    // Simple noise function for subtle undulation
    const noise = (x: number, y: number, time: number): number => {
      const a = Math.sin(x * 0.008 + time * 0.0003) * Math.cos(y * 0.005 + time * 0.0002);
      const b = Math.sin(x * 0.012 + time * 0.0004) * Math.cos(y * 0.009 + time * 0.0005);
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
      ctx.globalCompositeOperation = "lighter"; // additive for star visibility

      // Responsive aurora dimensions with text margins
      const isMobile = w < 768 * dpr;
      const isTablet = w >= 768 * dpr && w < 1024 * dpr;
      
      let auroraLength = cfg.length * dpr;
      let thickness = cfg.thickness * dpr;
      let driftSpeed = cfg.driftSpeed;
      
      if (isMobile) {
        auroraLength *= 0.65;
        thickness *= 0.75;
        driftSpeed *= 0.7; // proportionally slower
      } else if (isTablet) {
        auroraLength *= 0.85;
        thickness *= 0.9;
        driftSpeed *= 0.85;
      }

      // Leftward drift position
      const driftOffset = reduce ? 0 : (t * driftSpeed * dpr) % (w + auroraLength);
      
      // Aurora path: curved arc above mountain's right ridge, with margin from text
      const textMargin = 16 * dpr; // minimum margin from text
      const startX = w * 0.55 + textMargin - driftOffset; // starts further right, drifts left
      const startY = h * 0.22;
      const endX = startX + auroraLength;
      const endY = h * 0.32;
      
      const steps = Math.floor(auroraLength / (6 * dpr));
      
      // Use debug intensity if provided, otherwise use config
      const globalIntensity = debugIntensity !== undefined ? debugIntensity : cfg.intensity;
      
      for (let i = 0; i < steps; i++) {
        const progress = i / (steps - 1);
        const segmentX = startX + (endX - startX) * progress;
        
        // Skip if segment is completely off-screen left
        if (segmentX + thickness < -50 * dpr) continue;
        
        // Base curve with gentle arc
        const x = segmentX;
        const y = startY + (endY - startY) * progress + Math.sin(progress * Math.PI * 0.8) * h * 0.06;
        
        // Subtle noise-driven undulation
        const undulation = reduce ? 0 : noise(x * 0.02, y * 0.02, t * 20) * cfg.undulationAmp * dpr;
        const finalX = x + undulation;
        const finalY = y + undulation * 0.3;
        
        // Fade out as band exits left (last 23% of width)
        const fadeZone = auroraLength * cfg.fadeOutWidth;
        const distanceFromLeft = finalX - startX;
        let fadeMultiplier = 1;
        
        if (distanceFromLeft > auroraLength - fadeZone) {
          const fadeProgress = (distanceFromLeft - (auroraLength - fadeZone)) / fadeZone;
          fadeMultiplier = Math.max(0, 1 - fadeProgress);
        }
        
        // Skip invisible segments
        if (fadeMultiplier <= 0.01) continue;
        
        // Variable thickness with noise
        const thicknessNoise = 0.8 + 0.3 * Math.sin(progress * Math.PI * 4 + t * 0.3);
        const currentThickness = thickness * thicknessNoise;
        
        // Filament intensity variation for realistic aurora
        const filamentIntensity = 0.6 + 0.4 * Math.sin(progress * Math.PI * 6 + t * 0.4);
        const peakAlpha = Math.min(cfg.peakIntensity, globalIntensity * 1.4) * filamentIntensity * fadeMultiplier;
        const baseAlpha = globalIntensity * filamentIntensity * fadeMultiplier;
        
        // Core filament (neon green with low saturation)
        const coreGrad = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, currentThickness * 0.3);
        coreGrad.addColorStop(0, `rgba(91, 255, 122, ${peakAlpha})`); // #5BFF7A
        coreGrad.addColorStop(0.4, `rgba(42, 229, 184, ${baseAlpha * 0.7})`); // #2AE5B8
        coreGrad.addColorStop(1, `rgba(42, 229, 184, 0)`);
        
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(finalX, finalY, currentThickness * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Fringe glow (cyan at 12-18%)
        const fringeGrad = ctx.createRadialGradient(finalX, finalY, currentThickness * 0.2, finalX, finalY, currentThickness * 0.8);
        fringeGrad.addColorStop(0, `rgba(127, 232, 255, ${baseAlpha * 0.18})`); // #7FE8FF
        fringeGrad.addColorStop(0.6, `rgba(127, 232, 255, ${baseAlpha * 0.12})`);
        fringeGrad.addColorStop(1, `rgba(127, 232, 255, 0)`);
        
        ctx.fillStyle = fringeGrad;
        ctx.beginPath();
        ctx.arc(finalX, finalY, currentThickness * 0.8, 0, Math.PI * 2);
        ctx.fill();
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
      drawAurora(now);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [debugIntensity]);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ opacity: 1 }}
    />
  );
}

/* ---------- Scroll-Triggered Ground Fog ---------- */
function ScrollTriggeredFog({ debugOpacity }: { debugOpacity?: number }) {
  const fogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = fogRef.current!;
    const section = document.querySelector('section[data-hero-section]') as HTMLElement;
    if (!section) return;
    
    let raf = 0, running = true, t0 = performance.now();
    let scrollProgress = 0;
    
    const { fog: cfg } = EFFECTS_CONFIG;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    // Intersection Observer for precise scroll tracking
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          const rect = entry.boundingClientRect;
          
          // Improved scroll progress mapping
          if (rect.top >= 0) {
            // Hero top is visible - 0% progress
            scrollProgress = 0;
          } else {
            // Hero is scrolling up
            const scrolled = Math.abs(rect.top);
            const heroHeight = rect.height;
            
            // More precise mapping: 0% → 60% → 95-100%
            if (scrolled < heroHeight * 0.6) {
              // 0% to 60% of hero scrolled
              scrollProgress = scrolled / (heroHeight * 0.6) * 0.6;
            } else {
              // 60% to 100% of hero scrolled
              const remainingScroll = scrolled - (heroHeight * 0.6);
              const remainingHeight = heroHeight * 0.4;
              scrollProgress = 0.6 + (remainingScroll / remainingHeight) * 0.4;
              scrollProgress = Math.min(1, scrollProgress);
            }
          }
        } else if (entry.boundingClientRect.bottom < 0) {
          // Hero completely scrolled past
          scrollProgress = 1;
        }
      },
      { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(section);

    // Subtle noise for convection movement
    const noise = (x: number, y: number, time: number): number => {
      return Math.sin(x * 0.006 + time * 0.8) * Math.cos(y * 0.004 + time * 0.5) * 0.5;
    };

    const tick = (now: number) => {
      if (!running) return;
      
      const t = (now - t0) / 1000;
      
      // Use debug opacity if provided, otherwise calculate from scroll
      let opacity: number;
      if (debugOpacity !== undefined) {
        opacity = debugOpacity;
      } else {
        // Improved opacity mapping: 0.10 → 0.22 → 0.32
        if (scrollProgress <= 0.6) {
          // 0% to 60%: 0.10 → 0.22
          opacity = cfg.baseOpacity + (scrollProgress / 0.6) * (cfg.midOpacity - cfg.baseOpacity);
        } else {
          // 60% to 100%: 0.22 → 0.32
          const remainingProgress = (scrollProgress - 0.6) / 0.4;
          opacity = cfg.midOpacity + remainingProgress * (cfg.maxOpacity - cfg.midOpacity);
        }
        opacity = Math.min(cfg.maxOpacity, opacity);
      }
      
      // Scale mapping with improved progression
      const [minScale, maxScale] = cfg.scaleRange;
      const scale = minScale + (scrollProgress * (maxScale - minScale));
      
      // Convection drift and subtle turbulence
      const driftX = reduce ? 0 : (t * cfg.driftSpeed) % 120;
      const turbulence = reduce ? 0 : noise(t * 40, t * 25, t * cfg.turbulenceSpeed * 50) * 2;
      
      // Apply transforms and opacity with smoother animation
      el.style.transform = `
        scale(${scale}) 
        translateX(${driftX + turbulence}px) 
        translateZ(0)
      `;
      el.style.opacity = String(opacity);
      
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [debugOpacity]);

  return (
    <div
      ref={fogRef}
      className="pointer-events-none absolute z-10"
      style={{
        left: "-10vw",
        right: "-10vw", 
        bottom: "-14vh",
        height: "55vh",
        filter: "blur(48px)",
        mixBlendMode: "screen",
        transformOrigin: "center bottom",
        opacity: 0.10,
        background: [
          // Deep navy base (#0A1A2A) with cyan haze - 3 layered volumetric fields
          `radial-gradient(80% 90% at 70% 100%, 
            rgba(10, 26, 42, 0.28), 
            rgba(15, 35, 55, 0.16) 40%, 
            transparent 70%)`,
          `radial-gradient(65% 75% at 55% 100%, 
            rgba(25, 45, 75, 0.20), 
            rgba(35, 60, 95, 0.12) 50%, 
            transparent 65%)`,
          `radial-gradient(95% 65% at 50% 100%, 
            rgba(70, 160, 220, 0.16), 
            rgba(90, 180, 240, 0.08) 45%, 
            transparent 55%)`
        ].join(", "),
      }}
    />
  );
}

/* ---------- Scene Debug Panel (dev only) ---------- */
function SceneDebugPanel({ 
  auroraIntensity, 
  setAuroraIntensity, 
  fogOpacity, 
  setFogOpacity, 
  enabled, 
  setEnabled 
}: {
  auroraIntensity: number;
  setAuroraIntensity: (v: number) => void;
  fogOpacity: number;
  setFogOpacity: (v: number) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}) {
  if (import.meta.env.PROD) return null; // Only show in development
  
  return (
    <div className="fixed top-4 right-4 z-[60] bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white text-sm font-mono">
      <div className="flex items-center gap-2 mb-3">
        <input 
          type="checkbox" 
          checked={enabled} 
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="font-semibold">Scene Debug</span>
      </div>
      
      {enabled && (
        <div className="space-y-3 min-w-[200px]">
          <div>
            <label className="block mb-1">Aurora Intensity: {auroraIntensity.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={auroraIntensity}
              onChange={(e) => setAuroraIntensity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block mb-1">Fog Opacity: {fogOpacity.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="0.35"
              step="0.01"
              value={fogOpacity}
              onChange={(e) => setFogOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="text-xs text-gray-400 mt-2">
            <div>Aurora: {enabled ? 'Override' : 'Animated'}</div>
            <div>Fog: {enabled ? 'Override' : 'Scroll-driven'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/** ====== MAIN HERO ====== */
export default function InteractiveHero() {
  const wrap = useRef<HTMLElement>(null);
  
  // Debug state (dev only)
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugAuroraIntensity, setDebugAuroraIntensity] = useState(EFFECTS_CONFIG.aurora.intensity);
  const [debugFogOpacity, setDebugFogOpacity] = useState(EFFECTS_CONFIG.fog.baseOpacity);

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
      <RealisticAurora debugIntensity={debugEnabled ? debugAuroraIntensity : undefined} />

      {/* Scroll-Triggered Ground Fog (z-10, behind mountain) */}
      <ScrollTriggeredFog debugOpacity={debugEnabled ? debugFogOpacity : undefined} />

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

      {/* Scene Debug Panel (dev only) */}
      <SceneDebugPanel
        auroraIntensity={debugAuroraIntensity}
        setAuroraIntensity={setDebugAuroraIntensity}
        fogOpacity={debugFogOpacity}
        setFogOpacity={setDebugFogOpacity}
        enabled={debugEnabled}
        setEnabled={setDebugEnabled}
      />
    </section>
  );
}