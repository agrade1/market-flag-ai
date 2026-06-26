"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Flag, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  EXAMPLE_KEYWORDS,
  KEYWORD_MIN_LENGTH,
  KEYWORD_MAX_LENGTH,
} from "@/constants/market";

interface KeywordSearchFormProps {
  /** 결과 페이지에서 현재 키워드를 미리 채우기 위한 초기값. */
  defaultKeyword?: string;
}

export default function KeywordSearchForm({
  defaultKeyword = "",
}: KeywordSearchFormProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [error, setError] = useState<string | null>(null);

  function validate(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return "진단할 키워드를 입력해 주세요.";
    }
    if (trimmed.length < KEYWORD_MIN_LENGTH) {
      return `키워드는 최소 ${KEYWORD_MIN_LENGTH}글자 이상 입력해 주세요.`;
    }
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = keyword.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    router.push(`/diagnosis?keyword=${encodeURIComponent(trimmed)}`);
  }

  function handleExampleClick(example: string) {
    setKeyword(example);
    setError(null);
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              aria-hidden="true"
            />
            <Input
              type="text"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                if (error) setError(null);
              }}
              maxLength={KEYWORD_MAX_LENGTH}
              placeholder="예: 반려동물 프리미엄 사료"
              aria-label="진단할 시장 키워드"
              aria-invalid={error ? true : undefined}
              className="h-12 rounded-lg pl-9 text-base"
            />
          </div>
          <Button
            type="submit"
            className="h-12 gap-2 rounded-lg bg-blue-600 px-6 text-base font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            <Flag className="h-4 w-4" aria-hidden="true" />
            시장 진단하기
          </Button>
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          예시 키워드
        </span>
        {EXAMPLE_KEYWORDS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExampleClick(example)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
