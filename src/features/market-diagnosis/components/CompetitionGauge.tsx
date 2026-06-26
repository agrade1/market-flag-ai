import type { CompetitionInfo, OceanType } from "@/features/market-diagnosis/types";

interface CompetitionGaugeProps {
  competition: CompetitionInfo;
}

const OCEAN_META: Record<
  OceanType,
  { label: string; badgeClass: string; arcClass: string }
> = {
  red: {
    label: "레드오션",
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
    arcClass: "stroke-red-500",
  },
  mixed: {
    label: "혼합오션",
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    arcClass: "stroke-amber-500",
  },
  blue: {
    label: "블루오션",
    badgeClass:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300",
    arcClass: "stroke-blue-500",
  },
};

// 반원 게이지 기하 정보 (viewBox 200x110, 반지름 80)
const RADIUS = 80;
const CIRCUMFERENCE = Math.PI * RADIUS; // 반원 둘레

export default function CompetitionGauge({
  competition,
}: CompetitionGaugeProps) {
  const { ocean, score, summary } = competition;
  const meta = OCEAN_META[ocean];
  const clamped = Math.min(100, Math.max(0, score));
  // 0~100 점수를 반원 둘레 길이로 환산
  const dash = (clamped / 100) * CIRCUMFERENCE;

  return (
    <section className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">경쟁 강도</h3>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${meta.badgeClass}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <svg
          viewBox="0 0 200 110"
          className="w-full max-w-[260px]"
          role="img"
          aria-label={`경쟁 강도 ${clamped}점, ${meta.label}`}
        >
          {/* 배경 반원 */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            strokeWidth={16}
            strokeLinecap="round"
            className="stroke-zinc-200 dark:stroke-zinc-800"
          />
          {/* 점수 반원 */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            strokeWidth={16}
            strokeLinecap="round"
            className={meta.arcClass}
            strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
          />
          <text
            x="100"
            y="86"
            textAnchor="middle"
            className="fill-zinc-900 text-[2.4rem] font-bold dark:fill-zinc-50"
          >
            {clamped}
          </text>
          <text
            x="100"
            y="104"
            textAnchor="middle"
            className="fill-zinc-500 text-[0.75rem] dark:fill-zinc-400"
          >
            / 100
          </text>
        </svg>

        <div className="mt-1 flex w-full max-w-[260px] justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>여유 (블루)</span>
          <span>치열 (레드)</span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {summary}
      </p>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        점수가 높을수록 경쟁이 치열함을 뜻하는 참고용 추정치입니다.
      </p>
    </section>
  );
}
