import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFlagProps {
  /** 강조 라벨 (예: "MOCK", "후속 예정") */
  label: string;
  /** 본문 설명 */
  children: React.ReactNode;
  /** 강조 톤: amber=미구현/mock, violet=사용자 결정 필요 */
  tone?: "amber" | "violet";
  className?: string;
}

/**
 * 라이브 확인용 리뷰 플래그.
 * "미구현 / 사용자가 손댈 부분"을 화면에서 눈에 띄게 강조한다(점선 테두리 + 강조 톤).
 * 실제 사용자 배포 시에는 제거 대상이며, 검수 단계에서만 노출한다.
 */
export default function ReviewFlag({
  label,
  children,
  tone = "amber",
  className,
}: ReviewFlagProps) {
  const toneClass =
    tone === "amber"
      ? "border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200"
      : "border-violet-400 bg-violet-50 text-violet-900 dark:border-violet-500/60 dark:bg-violet-950/30 dark:text-violet-200";
  const badgeClass =
    tone === "amber"
      ? "bg-amber-400 text-amber-950 dark:bg-amber-500 dark:text-amber-950"
      : "bg-violet-400 text-violet-950 dark:bg-violet-500 dark:text-violet-950";

  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border-2 border-dashed p-4",
        toneClass,
        className,
      )}
    >
      <Wrench className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            badgeClass,
          )}
        >
          검수 · {label}
        </span>
        <div className="mt-1.5 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
