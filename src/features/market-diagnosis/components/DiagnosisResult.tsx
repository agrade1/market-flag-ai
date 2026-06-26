import { getMockDiagnosis } from "@/lib/data-sources/mock-market-data";
import DiagnosisSummaryCard from "./DiagnosisSummaryCard";
import CompetitionGauge from "./CompetitionGauge";
import MarketSizeChart from "./MarketSizeChart";
import PersonaCard from "./PersonaCard";
import AssumptionNotice from "./AssumptionNotice";

interface DiagnosisResultProps {
  keyword: string;
}

export default function DiagnosisResult({ keyword }: DiagnosisResultProps) {
  // 서버에서 deterministic Mock 데이터를 생성 (같은 키워드 → 같은 결과)
  const result = getMockDiagnosis(keyword);

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* 1. 진단 요약 */}
      <DiagnosisSummaryCard
        keyword={result.keyword}
        summary={result.summary}
        confidence={result.confidence}
        isEstimated={result.isEstimated}
      />

      {/* 2. 경쟁 강도 + 시장 규모 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CompetitionGauge competition={result.competition} />
        <MarketSizeChart marketSize={result.marketSize} />
      </div>

      {/* 3. 타겟 페르소나 */}
      <section>
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-bold tracking-tight">타겟 페르소나</h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            비중은 타겟 고객 내 추정 분포입니다
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </section>

      {/* 4. 추정 안내 */}
      <AssumptionNotice
        notices={result.notices}
        isEstimated={result.isEstimated}
      />
    </div>
  );
}
