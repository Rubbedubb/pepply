import { Brain, Zap } from "lucide-react";
import type { AiMode } from "@/lib/types";

const options: Array<{
  value: AiMode;
  label: string;
  model: string;
  description: string;
  icon: typeof Zap;
}> = [
  {
    value: "direct",
    label: "Direkt",
    model: "8B",
    description: "Snabbt och konkret",
    icon: Zap,
  },
  {
    value: "advanced",
    label: "Avancerat",
    model: "70B",
    description: "Mer nyans och sammanhang",
    icon: Brain,
  },
];

export function AiModeSelector({
  value,
  onChange,
  disabled = false,
  compact = false,
}: {
  value: AiMode;
  onChange: (mode: AiMode) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <div>
      <div
        role="group"
        aria-label="Välj AI-läge"
        className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-muted p-1.5"
      >
        {options.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              disabled={disabled}
              className={`min-h-11 rounded-xl px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon aria-hidden="true" size={15} />
                {option.label}
                <span className="text-[0.65rem] font-bold text-brand-strong">
                  {option.model}
                </span>
              </span>
              {!compact ? (
                <span className="mt-0.5 block text-[0.7rem] leading-4 text-muted">
                  {option.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {!compact ? (
        <p className="mt-2 text-xs leading-5 text-muted">
          Avancerat kan ta lite längre tid och använder mer av Cloudflares fria
          dagskvot. Båda lägena delar samma gräns på tre AI-svar per dygn.
        </p>
      ) : null}
    </div>
  );
}
