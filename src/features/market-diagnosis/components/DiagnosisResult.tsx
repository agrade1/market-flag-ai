// 플레이스홀더 — 후속 대시보드 작업에서 이 파일을 통째로 대체한다.
import { Loader2, Info } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface DiagnosisResultProps {
  keyword: string;
}

export default function DiagnosisResult({ keyword }: DiagnosisResultProps) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Loader2
            className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          ‘{keyword}’ 시장진단 리포트 준비 중
        </CardTitle>
        <CardDescription>
          레드오션/블루오션 판별, 시장 규모(TAM/SAM/SOM), 타겟 페르소나 분석을
          곧 이 자리에서 보여드릴 예정입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          본 리포트의 수치는 공공데이터·검색 트렌드·AI 추론 기반의 참고용
          추정치이며, 실제 의사결정 전 추가 검증이 필요합니다.
        </p>
      </CardContent>
    </Card>
  );
}
