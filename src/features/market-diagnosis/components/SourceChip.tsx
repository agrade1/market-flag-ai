"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { methodMeta } from "@/features/market-diagnosis/lib/verdict";
import type { SourceRef, EstimateMethod } from "@/features/market-diagnosis/types";

interface SourceChipProps {
  /** 출처 참조. method 가 없으면 fallbackMethod 사용 */
  source?: SourceRef;
  /** source 없이 method만 표기할 때 */
  method?: EstimateMethod;
  /** source.method 가 비었을 때 보조 */
  fallbackMethod?: EstimateMethod;
  className?: string;
}

/**
 * 데이터 출처 칩 (Preuve 변형 — §2.3 색코딩).
 * 공공=source-public 실선 / 트렌드=source-trend 실선 / AI추론=source-ai 점선 테두리.
 * 좌측 색 도트로 method 를 즉시 구분. note/url 이 있으면 클릭 시 펼침.
 */
export default function SourceChip({
  source,
  method,
  fallbackMethod = "inferred",
  className,
}: SourceChipProps) {
  const [open, setOpen] = useState(false);

  const resolvedMethod: EstimateMethod =
    method ?? source?.method ?? fallbackMethod;
  const meta = methodMeta(resolvedMethod);
  const label = source?.name ?? meta.label;
  const expandable = Boolean(source?.note || source?.url);

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={expandable ? () => setOpen((v) => !v) : undefined}
        aria-expanded={expandable ? open : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium text-foreground/80 transition",
          meta.borderClass,
          meta.bgClass,
          meta.dashed && "border-dashed",
          expandable
            ? "cursor-pointer hover:text-foreground"
            : "cursor-default",
          className,
        )}
        title={`산출 방법: ${meta.label}`}
      >
        <span
          className={cn("h-2 w-2 shrink-0 rounded-full", meta.colorClass)}
          aria-hidden="true"
        />
        <span className="truncate">{label}</span>
        <span className="text-[10px] text-foreground/50">· {meta.label}</span>
        {expandable && (
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 transition-transform",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        )}
      </button>

      {expandable && open && (
        <span className="mt-1 flex flex-col gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground">
          {source?.note && <span>{source.note}</span>}
          {source?.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 font-medium text-brand hover:underline"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              원본 출처 열기
            </a>
          )}
        </span>
      )}
    </span>
  );
}
