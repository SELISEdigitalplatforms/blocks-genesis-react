import { useEffect, type RefObject } from "react";

const hslToRgb = (
  hue: number,
  s: number,
  l: number,
): [number, number, number] => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255),
  ];
};

export function useAtmosphericCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    let dpr = window.devicePixelRatio || 1;
    let w = 0;
    let h = 0;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      w = canvas.width = Math.floor(window.innerWidth * dpr);
      h = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const time = t * 0.008;
      const baseHue = 185 + 15 * Math.sin(time);
      const c1 = hslToRgb(baseHue, 100, 50);
      const c2 = hslToRgb(baseHue + 15, 100, 50);
      const c3 = hslToRgb(baseHue - 15, 100, 50);
      const cx = (w / dpr) * 0.5;
      const cy = (h / dpr) * 0.5;
      ctx.clearRect(0, 0, w / dpr, h / dpr);

      const r1 = (Math.max(w, h) / dpr) * 0.6;
      const g1 = ctx.createRadialGradient(
        cx * 0.6,
        cy * 0.7,
        0,
        cx * 0.6,
        cy * 0.7,
        r1,
      );
      g1.addColorStop(0, `rgba(${c1[0]},${c1[1]},${c1[2]},0.18)`);
      g1.addColorStop(1, `rgba(${c1[0]},${c1[1]},${c1[2]},0)`);
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w / dpr, h / dpr);

      const r2 = (Math.max(w, h) / dpr) * 0.5;
      const g2 = ctx.createRadialGradient(
        cx * 1.3,
        cy * 0.4,
        0,
        cx * 1.3,
        cy * 0.4,
        r2,
      );
      g2.addColorStop(0, `rgba(${c2[0]},${c2[1]},${c2[2]},0.12)`);
      g2.addColorStop(1, `rgba(${c2[0]},${c2[1]},${c2[2]},0)`);
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w / dpr, h / dpr);

      const r3 = (Math.max(w, h) / dpr) * 0.45;
      const g3 = ctx.createRadialGradient(
        cx * 0.3,
        cy * 1.2,
        0,
        cx * 0.3,
        cy * 1.2,
        r3,
      );
      g3.addColorStop(0, `rgba(${c3[0]},${c3[1]},${c3[2]},0.10)`);
      g3.addColorStop(1, `rgba(${c3[0]},${c3[1]},${c3[2]},0)`);
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w / dpr, h / dpr);

      t++;
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}
