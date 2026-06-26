import { Info, TriangleAlert } from "lucide-react";

interface AssumptionNoticeProps {
  notices: string[];
  isEstimated: boolean;
}

export default function AssumptionNotice({
  notices,
  isEstimated,
}: AssumptionNoticeProps) {
  // 데이터 부족/추정 비중이 높을 때 강조 스타일로 전환
  const containerClass = isEstimated
    ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
    : "border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/40";
  const iconClass = isEstimated
    ? "text-amber-600 dark:text-amber-400"
    : "text-blue-600 dark:text-blue-400";
  const Icon = isEstimated ? TriangleAlert : Info;

  return (
    <section
      className={`rounded-xl border p-5 ${containerClass}`}
      aria-label="추정 안내"
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {isEstimated
              ? "데이터 부족 · AI 추정 리포트 안내"
              : "참고용 추정치 안내"}
          </p>
          <ul className="mt-2 space-y-1.5">
            {notices.map((notice) => (
              <li
                key={notice}
                className="flex gap-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
              >
                <span aria-hidden="true" className="text-zinc-400">
                  ·
                </span>
                <span>{notice}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
