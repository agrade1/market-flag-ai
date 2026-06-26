// 추론 공용 헬퍼 — deterministic 시드 난수 + 수치 반올림.
//
// 같은 키워드 → 같은 결과를 보장하기 위해 Math.random()/Date.now() 대신 키워드
// 해시 기반 시드를 사용한다. (data-sources mock 어댑터도 이걸 공유)

/** 문자열을 32-bit 정수 해시로 변환 (FNV-1a 변형, deterministic). */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** 시드 기반 의사난수 생성기 (mulberry32). 호출할 때마다 0~1 값을 반환. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 키워드에서 네임스페이스별 독립 RNG를 만든다(소스마다 시드 분리). */
export function rngFor(keyword: string, namespace: string): () => number {
  return createRng(hashString(`${namespace}::${keyword.toLowerCase()}`));
}

/** [min, max] 실수 난수. */
export function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/**
 * 유효숫자 sig자리로 반올림 — 거짓 정밀도(예: 1,234,567,890원) 방지.
 * 기획서 §3-1: 단일 정밀값 금지, 2~3자리로 반올림.
 */
export function roundSig(value: number, sig = 2): number {
  if (value === 0 || !Number.isFinite(value)) return 0;
  const digits = Math.ceil(Math.log10(Math.abs(value)));
  const power = sig - digits;
  const factor = 10 ** power;
  return Math.round(value * factor) / factor;
}

/** 0~1 비율을 정수 퍼센트 배열로 정규화(합 100 보장). */
export function normalizeToPercent(weights: number[]): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0) || 1;
  const pct = weights.map((w) => Math.round((w / total) * 100));
  const diff = 100 - pct.reduce((sum, p) => sum + p, 0);
  if (pct.length > 0) pct[0] += diff;
  return pct;
}
