import type { MarketSize } from "@/features/market-diagnosis/types";

interface MarketSizeChartProps {
  marketSize: MarketSize;
}

/** 큰 금액을 조/억 단위 한글로 포맷. unit 미지정 시 "원". */
function formatKoreanCurrency(value: number, unit = "원"): string {
  const JO = 1_0000_0000_0000; // 1조
  const EOK = 1_0000_0000; // 1억

  if (value >= JO) {
    const jo = Math.floor(value / JO);
    const eok = Math.round((value % JO) / EOK);
    return eok > 0
      ? `${jo.toLocaleString("ko-KR")}조 ${eok.toLocaleString("ko-KR")}억 ${unit}`
      : `${jo.toLocaleString("ko-KR")}조 ${unit}`;
  }
  if (value >= EOK) {
    return `${Math.round(value / EOK).toLocaleString("ko-KR")}억 ${unit}`;
  }
  return `${value.toLocaleString("ko-KR")} ${unit}`;
}

const TIERS = [
  {
    key: "tam" as const,
    label: "TAM",
    sub: "전체 시장",
    barClass: "bg-blue-200 dark:bg-blue-900/60",
    dotClass: "bg-blue-300 dark:bg-blue-800",
  },
  {
    key: "sam" as const,
    label: "SAM",
    sub: "접근 가능 시장",
    barClass: "bg-blue-400 dark:bg-blue-700",
    dotClass: "bg-blue-400 dark:bg-blue-700",
  },
  {
    key: "som" as const,
    label: "SOM",
    sub: "현실적 확보 가능 시장",
    barClass: "bg-blue-600 dark:bg-blue-500",
    dotClass: "bg-blue-600 dark:bg-blue-500",
  },
];

export default function MarketSizeChart({ marketSize }: MarketSizeChartProps) {
  const { tam, unit } = marketSize;
  const max = Math.max(tam, 1); // 0 분모 방지

  return (
    <section className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">시장 규모 (TAM / SAM / SOM)</h3>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {TIERS.map((tier) => {
          const value = marketSize[tier.key];
          const widthPct = Math.max(6, (value / max) * 100); // 최소 가시 너비 확보
          return (
            <div key={tier.key}>
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold">{tier.label}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {tier.sub}
                  </span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatKoreanCurrency(value, unit)}
                </span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full ${tier.barClass}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs text-zinc-500 dark:text-zinc-400">
        막대 길이는 전체 시장(TAM) 대비 상대 비율입니다. 모든 금액은 참고용
        추정치입니다.
      </p>
    </section>
  );
}
