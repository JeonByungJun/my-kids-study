/**
 * PatternSequence — 도형·색깔 패턴 카드 배열 컴포넌트
 *
 * 2학년 수학 2학기 6단원 "규칙 찾기" 게임 전용.
 * 패턴 슬롯을 배열하고, 빈 칸(?)에 들어갈 카드를 선택지에서 골라
 * 채워 넣는 방식으로 동작합니다.
 *
 * 사용 예:
 *   const slots = [
 *     { card: { shape: 'circle', color: 'red' } },
 *     { card: { shape: 'square', color: 'blue' } },
 *     { card: { shape: 'circle', color: 'red' } },
 *     { isBlank: true },
 *     { card: { shape: 'circle', color: 'red' } },
 *   ];
 *   const choices = [
 *     { shape: 'square', color: 'green' },
 *     { shape: 'square', color: 'blue' },  // ← 정답
 *     { shape: 'triangle', color: 'red' },
 *   ];
 *   <PatternSequence slots={slots} choices={choices} onChoiceClick={handleChoice} />
 */

// ─── 타입 정의 ────────────────────────────────────────────────────────────────
/** 카드에 표시할 도형 종류 */
export type PatternShape =
  | 'circle'    // 원
  | 'square'    // 사각형
  | 'triangle'  // 삼각형
  | 'star'      // 별
  | 'heart'     // 하트
  | 'diamond';  // 마름모

/** 카드 색상 */
export type PatternColor =
  | 'red' | 'orange' | 'yellow'
  | 'green' | 'blue' | 'purple' | 'pink';

/** 카드 한 장의 데이터 */
export interface PatternCard {
  shape: PatternShape;
  color: PatternColor;
}

/** 시퀀스의 슬롯 한 칸 */
export interface PatternSlot {
  /** 표시할 카드. isBlank가 true이면 채워질 예정 */
  card?: PatternCard;
  /** true이면 답 입력 대상 빈 칸 */
  isBlank?: boolean;
}

export interface PatternSequenceProps {
  /** 순서대로 표시할 슬롯 배열 */
  slots: PatternSlot[];
  /** 빈 칸에 넣을 선택지 카드들 */
  choices?: PatternCard[];

  /**
   * 현재 활성화된(포커스된) 빈 칸의 슬롯 인덱스.
   * 부모 컴포넌트에서 관리합니다.
   */
  activeBlankIndex?: number;

  /** 현재 선택된 선택지 인덱스 */
  selectedChoiceIndex?: number;

  /**
   * 채워진 빈 칸 데이터.
   * key: 슬롯 인덱스, value: 채워진 카드
   */
  filledBlanks?: Record<number, PatternCard>;

  /** 선택지 버튼 클릭 콜백 */
  onChoiceClick?: (choiceIndex: number, card: PatternCard) => void;
  /** 빈 칸 클릭 콜백 (여러 빈 칸 중 하나 활성화용) */
  onBlankClick?: (slotIndex: number) => void;
}

// ─── 색상 팔레트 (파스텔 계열) ───────────────────────────────────────────────
const COLOR_PALETTE: Record<PatternColor, {
  fill: string;
  stroke: string;
  label: string;
}> = {
  red:    { fill: '#ffb3ba', stroke: '#ff6b7a', label: '빨강' },
  orange: { fill: '#ffc9a0', stroke: '#ff8c42', label: '주황' },
  yellow: { fill: '#fff5a0', stroke: '#f5c400', label: '노랑' },
  green:  { fill: '#b8f0c8', stroke: '#44bb66', label: '초록' },
  blue:   { fill: '#b8d8ff', stroke: '#4488ee', label: '파랑' },
  purple: { fill: '#d8b8ff', stroke: '#9944ee', label: '보라' },
  pink:   { fill: '#ffb8e8', stroke: '#ee44aa', label: '분홍' },
};

// ─── 도형 SVG 경로 상수 ──────────────────────────────────────────────────────
/** 5각 별 (viewBox 0 0 48 48 기준) */
const STAR_PATH =
  'M24,4 L29.3,16.7 L43,17.8 L32.6,26.8 L35.8,40.2 L24,33 L12.2,40.2 L15.4,26.8 L5,17.8 L18.7,16.7 Z';

/** 하트 (viewBox 0 0 48 48 기준) */
const HEART_PATH =
  'M24,38 C24,38 6,26 6,16 C6,8 12,5 18,8 C21,9 24,12 24,12 C24,12 27,9 30,8 C36,5 42,8 42,16 C42,26 24,38 24,38 Z';

// ─── 도형 아이콘 서브컴포넌트 ────────────────────────────────────────────────
interface ShapeIconProps {
  shape: PatternShape;
  color: PatternColor;
  /** SVG 렌더 크기 (기본: 36) */
  size?: number;
}

/** 도형 + 색상 조합을 SVG로 렌더합니다. */
export function ShapeIcon({ shape, color, size = 36 }: ShapeIconProps) {
  const { fill, stroke } = COLOR_PALETTE[color];
  const shared = { fill, stroke, strokeWidth: 2.5 } as const;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden
    >
      {shape === 'circle' && (
        <circle cx={24} cy={24} r={19} {...shared} />
      )}
      {shape === 'square' && (
        <rect x={6} y={6} width={36} height={36} rx={6} {...shared} />
      )}
      {shape === 'triangle' && (
        <polygon points="24,5 45,43 3,43" {...shared} />
      )}
      {shape === 'star' && (
        <path d={STAR_PATH} {...shared} />
      )}
      {shape === 'heart' && (
        <path d={HEART_PATH} {...shared} />
      )}
      {shape === 'diamond' && (
        <polygon points="24,4 44,24 24,44 4,24" {...shared} />
      )}
    </svg>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function PatternSequence({
  slots,
  choices,
  activeBlankIndex,
  selectedChoiceIndex,
  filledBlanks = {},
  onChoiceClick,
  onBlankClick,
}: PatternSequenceProps) {
  const hasAnyBlank = slots.some((s) => s.isBlank);

  return (
    <div className="pattern-sequence">

      {/* ── 패턴 슬롯 행 ── */}
      <div className="pattern-slots" role="list" aria-label="패턴 순서">
        {slots.map((slot, i) => {
          const filled = filledBlanks[i];
          const cardToShow = filled ?? slot.card;
          const isBlank = !!slot.isBlank;
          const isActive = activeBlankIndex === i;
          const isFilled = isBlank && !!filled;

          return (
            <div
              key={i}
              role={isBlank ? 'button' : 'listitem'}
              aria-label={
                isBlank
                  ? `빈 칸 ${i + 1}${isFilled ? ` (${COLOR_PALETTE[filled!.color].label} ${filled!.shape})` : ''}`
                  : cardToShow
                  ? `${COLOR_PALETTE[cardToShow.color].label} ${cardToShow.shape}`
                  : `슬롯 ${i + 1}`
              }
              tabIndex={isBlank ? 0 : undefined}
              className={[
                'pattern-slot',
                isBlank ? 'blank' : '',
                isBlank && isActive ? 'active-slot' : '',
                isFilled ? 'filled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={isBlank ? () => onBlankClick?.(i) : undefined}
              onKeyDown={
                isBlank
                  ? (e) => { if (e.key === 'Enter' || e.key === ' ') onBlankClick?.(i); }
                  : undefined
              }
            >
              {cardToShow ? (
                <ShapeIcon shape={cardToShow.shape} color={cardToShow.color} />
              ) : (
                <span className="pattern-blank-mark" aria-hidden>?</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 선택지 영역 (빈 칸이 있을 때만 표시) ── */}
      {hasAnyBlank && choices && choices.length > 0 && (
        <>
          <p className="pattern-divider" aria-hidden>↓ 골라보세요 ↓</p>
          <div
            className="pattern-choices"
            role="group"
            aria-label="선택지"
          >
            {choices.map((card, i) => {
              const { label } = COLOR_PALETTE[card.color];
              return (
                <button
                  key={i}
                  className={[
                    'pattern-choice-btn',
                    selectedChoiceIndex === i ? 'selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onChoiceClick?.(i, card)}
                  aria-label={`선택지 ${i + 1}: ${label} ${card.shape}`}
                  aria-pressed={selectedChoiceIndex === i}
                >
                  <ShapeIcon shape={card.shape} color={card.color} />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 유틸리티 내보내기 ────────────────────────────────────────────────────────
export { COLOR_PALETTE };
