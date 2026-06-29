import { MeshBackground } from "../../components/liquid-glass/MeshBackground";
import { ForgotPasswordCard } from "../../components/liquid-glass/ForgotPasswordCard";

export function ForgotPasswordPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MeshBackground />

      <main className="relative z-10 flex h-full items-center justify-center px-6">
        <ForgotPasswordCard />
      </main>

      {/* Top-right status chip */}
      <div className="absolute right-6 top-6 z-10 hidden items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10 backdrop-blur-md md:flex">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        All systems normal
      </div>
    </div>
  );
}
