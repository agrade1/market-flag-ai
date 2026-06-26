import { User, AlertCircle } from "lucide-react";
import type { Persona } from "@/features/market-diagnosis/types";

interface PersonaCardProps {
  persona: Persona;
}

export default function PersonaCard({ persona }: PersonaCardProps) {
  const { name, ageRange, gender, traits, painPoint, share } = persona;
  const clampedShare = Math.min(100, Math.max(0, share));

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-blue-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <User className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-base font-semibold">{name}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {ageRange} · {gender}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          타겟 {clampedShare}%
        </span>
      </div>

      {/* 비중 바 */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-blue-500 dark:bg-blue-500"
          style={{ width: `${clampedShare}%` }}
        />
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          소비 성향
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {traits.map((trait) => (
            <li
              key={trait}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
            >
              {trait}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/40">
        <AlertCircle
          className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            핵심 페인포인트
          </p>
          <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">
            {painPoint}
          </p>
        </div>
      </div>
    </article>
  );
}
