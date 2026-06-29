import { useEffect, useRef } from "react";

export function useGlassHighlight<HOST extends HTMLElement>() {
  const hostRef = useRef<HOST | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const hl = highlightRef.current;
    if (!host || !hl) return;

    let raf = 0;
    let pendingX = 50;
    let pendingY = 0;
    let active = false;

    const flush = () => {
      raf = 0;
      hl.style.setProperty("--gx", `${pendingX}%`);
      hl.style.setProperty("--gy", `${pendingY}%`);
      hl.style.opacity = active ? "1" : "0";
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(flush);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      pendingX = ((e.clientX - r.left) / r.width) * 100;
      pendingY = ((e.clientY - r.top) / r.height) * 100;
      active = true;
      schedule();
    };
    const onLeave = () => {
      active = false;
      schedule();
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { hostRef, highlightRef };
}
