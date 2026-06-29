import { useTheme } from "../../hooks/useTheme";

/* ─── Animated mesh gradient background for the dashboard ─── */

interface BlobConfig {
  size: number;
  left: string;
  top: string;
  darkColor: string;
  lightColor: string;
  duration: number;
  delay: number;
  path: string; /* CSS animation name */
}

const BLOBS: BlobConfig[] = [
  {
    size: 800,
    left: "-10%",
    top: "-15%",
    darkColor: "rgba(6,182,212,0.2)",
    lightColor: "rgba(253,230,138,0.3)",
    duration: 28,
    delay: 0,
    path: "mesh-drift-1",
  },
  {
    size: 700,
    left: "55%",
    top: "-10%",
    darkColor: "rgba(8,145,178,0.18)",
    lightColor: "rgba(254,243,199,0.35)",
    duration: 34,
    delay: -8,
    path: "mesh-drift-2",
  },
  {
    size: 650,
    left: "-5%",
    top: "50%",
    darkColor: "rgba(14,116,144,0.15)",
    lightColor: "rgba(34,211,238,0.15)",
    duration: 30,
    delay: -14,
    path: "mesh-drift-3",
  },
  {
    size: 600,
    left: "60%",
    top: "55%",
    darkColor: "rgba(34,211,238,0.15)",
    lightColor: "rgba(6,182,212,0.12)",
    duration: 36,
    delay: -20,
    path: "mesh-drift-4",
  },
];

export function DashboardMeshBg() {
  const { isDark } = useTheme();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base color handled by html/body; this layer adds the gradient blobs */}
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.left,
            top: blob.top,
            background: `radial-gradient(closest-side, ${isDark ? blob.darkColor : blob.lightColor}, transparent 70%)`,
            filter: "blur(60px)",
            animation: `${blob.path} ${blob.duration}s ease-in-out infinite`,
            animationDelay: `${blob.delay}s`,
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />
      ))}

      {/* Noise texture */}
      <div
        className="noise absolute inset-0"
        style={{ opacity: isDark ? 0.06 : 0.03 }}
      />

      {/* Radial vignette — keeps edges darker for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(24,22,26,0.6) 100%)"
            : "radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(250,248,245,0.6) 100%)",
        }}
      />
    </div>
  );
}
