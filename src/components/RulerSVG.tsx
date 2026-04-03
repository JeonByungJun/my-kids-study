/**
 * RulerSVG — 눈금자 인터랙티브 컴포넌트
 *
 * 2학년 수학 길이 재기 단원 (2-1 3단원 / 2-2 4단원) 게임 전용.
 * 자 위를 터치/클릭해 위치(mm 단위)를 선택하거나,
 * markerAt·markerEnd로 물체 양 끝을 표시해 길이를 보여줍니다.
 *
 * 사용 예:
 *   // 위치 선택형 (정답 입력)
 *   <RulerSVG selected={70} onSelect={setMm} />
 *
 *   // 길이 표시형 (문제 제시)
 *   <RulerSVG markerAt={20} markerEnd={90} readOnly />
 */
import { useCallback, useRef } from 'react';

// ─── Props 타입 ──────────────────────────────────────────────────────────────
export interface RulerSVGProps {
  /** 자 최대 길이 (cm 단위, 기본: 15) */
  maxCm?: number;
  /** 선택된 위치 (mm 단위, 0 = 왼쪽 끝) */
  selected?: number;
  /** 위치 선택 콜백 (mm) */
  onSelect?: (mm: number) => void;
  /**
   * 물체 시작 위치 (mm).
   * markerEnd와 함께 쓰면 측정 범위와 길이가 표시됩니다.
   */
  markerAt?: number;
  /** 물체 끝 위치 (mm) */
  markerEnd?: number;
  /** true: 표시 전용 (기본: false) */
  readOnly?: boolean;
  /** 선택 스냅 단위 (mm, 기본: 1) */
  snapMm?: number;
}

// ─── SVG 내부 상수 ───────────────────────────────────────────────────────────
const PX_PER_CM = 44;    // SVG 내부 픽셀 / cm (viewBox 기준)
const PAD_L = 28;        // 왼쪽 여백
const PAD_R = 28;        // 오른쪽 여백
const RULER_Y = 30;      // 자 상단 Y 위치
const RULER_H = 54;      // 자 몸체 높이
const LABEL_BOTTOM_H = 36; // 선택 레이블 영역 높이

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────
export default function RulerSVG({
  maxCm = 15,
  selected,
  onSelect,
  markerAt,
  markerEnd,
  readOnly = false,
  snapMm = 1,
}: RulerSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const pxPerMm = PX_PER_CM / 10;
  const rulerW = maxCm * PX_PER_CM;
  const totalW = PAD_L + rulerW + PAD_R;
  const totalH = RULER_Y + RULER_H + LABEL_BOTTOM_H;

  /** mm 값 → SVG X 좌표 */
  const mmToX = (mm: number) => PAD_L + mm * pxPerMm;

  /** 클라이언트 X → 스냅된 mm 값 */
  const clientToMm = useCallback(
    (clientX: number): number => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const rect = svg.getBoundingClientRect();
      const svgX = ((clientX - rect.left) / rect.width) * totalW;
      const rawMm = (svgX - PAD_L) / pxPerMm;
      const snapped = Math.round(rawMm / snapMm) * snapMm;
      return Math.max(0, Math.min(maxCm * 10, snapped));
    },
    [totalW, pxPerMm, maxCm, snapMm],
  );

  // ── 포인터 핸들러 ────────────────────────────────────────────────────────
  const handlePointer = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (readOnly || !onSelect) return;
      e.preventDefault();
      onSelect(clientToMm(e.clientX));
    },
    [readOnly, onSelect, clientToMm],
  );

  // ── 눈금 데이터 생성 ──────────────────────────────────────────────────────
  const ticks = Array.from({ length: maxCm * 10 + 1 }, (_, i) => {
    const isCm = i % 10 === 0;
    const isHalfCm = i % 5 === 0 && !isCm;
    const x = mmToX(i);
    const tickH = isCm ? 24 : isHalfCm ? 16 : 8;
    return { i, x, tickH, isCm, isHalfCm };
  });

  // ── 계산된 X 좌표 ─────────────────────────────────────────────────────────
  const selX = selected !== undefined ? mmToX(selected) : null;
  const markerAtX = markerAt !== undefined ? mmToX(markerAt) : null;
  const markerEndX = markerEnd !== undefined ? mmToX(markerEnd) : null;
  const hasRange = markerAtX !== null && markerEndX !== null;

  // ── cm 문자열 포맷 ────────────────────────────────────────────────────────
  const fmtCm = (mm: number) => {
    const cm = mm / 10;
    return Number.isInteger(cm) ? `${cm}cm` : `${cm.toFixed(1)}cm`;
  };

  return (
    <div className="ruler-wrapper">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{
          width: '100%',
          height: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          cursor: readOnly ? 'default' : 'crosshair',
          display: 'block',
        }}
        onPointerDown={handlePointer}
        onPointerMove={(e) => { if (e.buttons > 0) handlePointer(e); }}
        aria-label="눈금자"
        role="img"
      >
        {/* ── 자 몸체 그림자 ── */}
        <rect
          x={PAD_L - 4} y={RULER_Y + 4}
          width={rulerW + 8} height={RULER_H}
          rx={8} fill="rgba(0,0,0,0.07)"
        />

        {/* ── 자 몸체 ── */}
        <rect
          x={PAD_L - 4} y={RULER_Y}
          width={rulerW + 8} height={RULER_H}
          rx={8}
          fill="#fff8e2"
          stroke="#e8c97a"
          strokeWidth={2.5}
        />

        {/* ── 자 내부 광택 줄 ── */}
        <rect
          x={PAD_L - 2} y={RULER_Y + 2}
          width={rulerW + 4} height={8}
          rx={4}
          fill="rgba(255,255,255,0.6)"
        />

        {/* ── 눈금 ── */}
        {ticks.map((t) => (
          <g key={t.i}>
            <line
              x1={t.x} y1={RULER_Y}
              x2={t.x} y2={RULER_Y + t.tickH}
              stroke={t.isCm ? '#8b6914' : t.isHalfCm ? '#b89040' : '#d4a840'}
              strokeWidth={t.isCm ? 2.2 : t.isHalfCm ? 1.5 : 0.9}
              strokeLinecap="round"
            />
            {/* cm 단위 숫자 레이블 */}
            {t.isCm && (
              <text
                x={t.x}
                y={RULER_Y + RULER_H - 7}
                textAnchor="middle"
                fontSize={11}
                fontWeight="700"
                fontFamily="'Courier New', monospace"
                fill="#7a5c00"
              >
                {t.i / 10}
              </text>
            )}
          </g>
        ))}

        {/* ── 측정 범위 표시 (문제 제시용) ── */}
        {hasRange && (
          <g>
            {/* 수평 화살표 선 */}
            <line
              x1={markerAtX!} y1={RULER_Y - 10}
              x2={markerEndX!} y2={RULER_Y - 10}
              stroke="#ff7e67" strokeWidth={2.8} strokeLinecap="round"
            />
            {/* 왼쪽 세로 막대 */}
            <line
              x1={markerAtX!} y1={RULER_Y - 18}
              x2={markerAtX!} y2={RULER_Y - 2}
              stroke="#ff7e67" strokeWidth={2.8} strokeLinecap="round"
            />
            {/* 오른쪽 세로 막대 */}
            <line
              x1={markerEndX!} y1={RULER_Y - 18}
              x2={markerEndX!} y2={RULER_Y - 2}
              stroke="#ff7e67" strokeWidth={2.8} strokeLinecap="round"
            />
            {/* 길이 텍스트 */}
            <text
              x={(markerAtX! + markerEndX!) / 2}
              y={RULER_Y - 22}
              textAnchor="middle"
              fontSize={11}
              fontWeight="800"
              fontFamily="'Noto Sans KR', sans-serif"
              fill="#cc3300"
            >
              {fmtCm(markerEnd! - markerAt!)}
            </text>
          </g>
        )}

        {/* ── 선택 위치 마커 (정답 입력용) ── */}
        {selX !== null && (
          <g>
            {/* 점선 수직선 */}
            <line
              x1={selX} y1={RULER_Y - 4}
              x2={selX} y2={RULER_Y + RULER_H + 12}
              stroke="#5db8ff" strokeWidth={2.8}
              strokeDasharray="5,3" strokeLinecap="round"
            />
            {/* 마커 원 */}
            <circle
              cx={selX} cy={RULER_Y + RULER_H + 12}
              r={7} fill="#5db8ff" stroke="#fff" strokeWidth={2.5}
            />
            {/* 선택 값 텍스트 */}
            <text
              x={selX}
              y={RULER_Y + RULER_H + 28}
              textAnchor="middle"
              fontSize={12}
              fontWeight="800"
              fontFamily="'Noto Sans KR', sans-serif"
              fill="#1a6acc"
            >
              {fmtCm(selected!)}
            </text>
          </g>
        )}

        {/* ── 빈 상태 안내 (조작 모드) ── */}
        {!readOnly && selX === null && (
          <text
            x={totalW / 2}
            y={RULER_Y + RULER_H + 22}
            textAnchor="middle"
            fontSize={12}
            fontWeight="700"
            fontFamily="'Noto Sans KR', sans-serif"
            fill="#b0a080"
          >
            자를 눌러 길이를 선택하세요
          </text>
        )}
      </svg>
    </div>
  );
}
