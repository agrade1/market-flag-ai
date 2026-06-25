import Link from "next/link";
import {
  ArrowRight,
  Flag,
  Search,
  Compass,
  PieChart,
  Users,
  ShieldAlert,
} from "lucide-react";
import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";

const features = [
  {
    icon: Search,
    title: "키워드 기반 시장진단",
    description:
      "‘반려동물 프리미엄 사료’처럼 아이디어 키워드만 입력하면 시장성을 분석합니다.",
  },
  {
    icon: Compass,
    title: "레드오션 / 블루오션 판별",
    description:
      "검색 관심도와 경쟁 강도, 성장 가능성을 바탕으로 시장의 경쟁 상태를 추정합니다.",
  },
  {
    icon: PieChart,
    title: "TAM / SAM / SOM 추정",
    description:
      "공공데이터와 AI 추론으로 전체·접근 가능·현실적 확보 가능 시장 규모를 추정합니다.",
  },
  {
    icon: Users,
    title: "타겟 페르소나 도출",
    description:
      "성별·연령대·소비 성향·문제 상황을 기반으로 주요 고객 페르소나를 제안합니다.",
  },
  {
    icon: ShieldAlert,
    title: "데이터 부족 대응",
    description:
      "데이터가 부족한 틈새 키워드도 서비스가 멈추지 않고 ‘AI 추정 리포트’로 안내합니다.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <Container className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />
              초기 창업자를 위한 AI 시장진단
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Market Flag AI
            </h1>
            <p className="mt-4 text-lg font-medium text-zinc-700 dark:text-zinc-300 sm:text-xl">
              시장에 깃발을 꽂기 전, 먼저 진단하세요.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
              공공데이터·검색 트렌드·AI 추론을 결합해 시장 규모, 경쟁 강도, 타겟
              고객, 진입 가능성을 대시보드로 제공합니다.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/diagnosis"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                무료로 시장 진단하기
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionTitle
            eyebrow="핵심 기능"
            title="아이디어 검증, 데이터로 시작하세요"
            description="완벽한 미시 데이터가 없어도 거시 데이터와 AI 추론으로 초기 의사결정을 돕습니다."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-blue-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Footer note */}
      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <Container>
          <p className="text-center text-xs text-zinc-500">
            본 서비스가 제공하는 시장 규모·경쟁 강도·타겟 정보는 공공데이터,
            검색 트렌드, AI 추론에 기반한 참고용 추정치입니다. 실제 창업·투자
            의사결정 전에는 추가 검증이 필요합니다.
          </p>
        </Container>
      </footer>
    </main>
  );
}
