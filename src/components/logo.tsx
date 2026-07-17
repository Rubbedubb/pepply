import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Pepply startsida"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-[#ffd878] to-[#ed9828] text-[#5d3d0c] shadow-sm">
        <Sparkles aria-hidden="true" size={18} strokeWidth={2.5} />
      </span>
      <span className="text-xl font-bold tracking-tight">Pepply</span>
    </Link>
  );
}
