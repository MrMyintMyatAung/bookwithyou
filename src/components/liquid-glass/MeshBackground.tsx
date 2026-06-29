import { motion } from "framer-motion";
import Orb from "./Orb";

type OrbConfig = {
  size: number;
  color: string;
  origin: { left: string; top: string };
  path: { x: number[]; y: number[] };
  duration: number;
};

const ORBS: OrbConfig[] = [
  {
    size: 1500,
    color: "rgba(6,182,212,0.5)",
    origin: { left: "-15%", top: "-20%" },
    path: { x: [0, 360, 180, -140, 0], y: [0, 210, 360, 150, 0] },
    duration: 38,
  },
  {
    size: 1400,
    color: "rgba(8,145,178,0.55)",
    origin: { left: "45%", top: "-15%" },
    path: { x: [0, -330, -120, 240, 0], y: [0, 180, 390, 120, 0] },
    duration: 44,
  },
  {
    size: 1340,
    color: "rgba(14,116,144,0.5)",
    origin: { left: "-5%", top: "45%" },
    path: { x: [0, 270, 450, 180, 0], y: [0, -210, -60, 150, 0] },
    duration: 48,
  },
  {
    size: 1300,
    color: "rgba(34,211,238,0.45)",
    origin: { left: "45%", top: "40%" },
    path: { x: [0, -270, -420, -120, 0], y: [0, -180, 120, 270, 0] },
    duration: 52,
  },
];

export function MeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#18161a]" />

      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.origin.left,
            top: orb.origin.top,
            background: `radial-gradient(closest-side, ${orb.color}, transparent 70%)`,
            filter: "blur(40px)",
            transform: "translateZ(0)",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
          animate={{
            x: orb.path.x,
            y: orb.path.y,
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Orb
          hue={35}
          hoverIntensity={2.5}
          rotateOnHover={true}
          backgroundColor="#18161a"
          className="w-[800px] h-[800px]"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.5)_100%)]" />

      <div className="noise pointer-events-none absolute inset-0 opacity-[0.06]" />
    </div>
  );
}
