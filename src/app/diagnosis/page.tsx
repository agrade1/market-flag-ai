import type { Metadata } from "next";
import { Search } from "lucide-react";
import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";
import KeywordSearchForm from "@/features/market-diagnosis/components/KeywordSearchForm";
import DiagnosisResult from "@/features/market-diagnosis/components/DiagnosisResult";

export const metadata: Metadata = {
  title: "시장진단 — Market Flag AI",
  description:
    "키워드를 입력하면 레드오션/블루오션 판별, 시장 규모, 타겟 페르소나를 AI가 추정해 보여드립니다.",
};

export default async function DiagnosisPage(props: PageProps<"/diagnosis">) {
  const { keyword: rawKeyword } = await props.searchParams;
  const keyword =
    typeof rawKeyword === "string" ? rawKeyword.trim() : undefined;

  return (
    <main className="flex flex-1 flex-col py-12 sm:py-16">
      <Container>
        <SectionTitle
          align="left"
          eyebrow="시장진단"
          title="키워드로 시장을 진단해 보세요"
          description="아이디어 키워드를 입력하면 시장 규모, 경쟁 강도, 타겟 고객을 추정해 드립니다."
        />

        <div className="mt-8 max-w-2xl">
          <KeywordSearchForm defaultKeyword={keyword} />
        </div>

        {keyword ? (
          <DiagnosisResult keyword={keyword} />
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Search className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-semibold">
              키워드를 입력해 진단을 시작하세요
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              위 검색창에 시장 키워드를 입력하거나 예시 키워드를 눌러 보세요.
            </p>
          </div>
        )}
      </Container>
    </main>
  );
}
