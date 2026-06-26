// 시장진단 API — POST /api/market-diagnosis
//
// 얇은 HTTP 경계: 요청 본문 검증(zod) → 서비스 호출 → 응답 포장만 담당하고
// 비즈니스 로직은 두지 않는다(로직은 lib/ai/market-diagnosis-service).
//
// 응답 규약:
// - 200: DiagnosisResult 직접 반환(래퍼 없음). 데이터 부족도 에러가 아니라 200(저신뢰).
// - 400: 본문 JSON 파싱 실패 / keyword 누락·형식 오류 / 빈 값·과길이.
// - 500: 그 외 처리 중 오류.

import { NextResponse } from "next/server";
import {
  diagnose,
  InvalidKeywordError,
} from "@/lib/ai/market-diagnosis-service";
import { diagnosisRequestSchema } from "@/lib/ai/report-schema";

/** 통일된 에러 응답 포맷. */
function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  // 1) 본문 JSON 파싱
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "INVALID_JSON",
      "요청 본문(JSON)을 해석할 수 없습니다.",
      400,
    );
  }

  // 2) 요청 스키마 검증
  const parsed = diagnosisRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "INVALID_REQUEST",
      "요청 형식이 올바르지 않습니다. keyword(문자열)가 필요합니다.",
      400,
    );
  }

  // 3) 진단 수행
  try {
    const result = await diagnose(parsed.data.keyword);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof InvalidKeywordError) {
      return errorResponse("INVALID_KEYWORD", error.message, 400);
    }
    console.error("[market-diagnosis] 진단 처리 실패:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "진단 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      500,
    );
  }
}
