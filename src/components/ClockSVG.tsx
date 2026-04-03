/**
 * ClockSVG — 아날로그 시계 인터랙티브 컴포넌트
 *
 * 2학년 수학 4단원 "시각과 시간" 게임 전용.
 * 시침(빨강)·분침(파랑) 끝의 드래그 핸들을 터치/드래그해 시간 설정.
 *
 * 사용 예:
 *   <ClockSVG hour={3} minute={30} onChange={(h, m) => setTime(h, m)} />
 *   <ClockSVG hour={9} minute={15} readOnly />
 */
import { useCallback, useRef } from 'react';

// ─── Props 타입 ──────────────────────────────────────────────────────────────
export interface ClockSVGProps {
  /** 시 (0–11, 12시간제) */
  hour: number;
  /** 분 (0–59) */
  minute: number;
  /** 시간 변경 콜백 — readOnly가 false일 때 사용 */
  onChange?: (hour: number, minute: number) => void;
  /** true: 표시 전용 / false: 터치 드래그 가능 (기본: false) */
  readOnly?: boolean;
  /** SVG viewBox 기준 크기(px). 실제 렌더는 width:100%로 반응형 (기본: 280) */
  size?: number;
  /** 디지털 시간 레이블 표시 여부 (기본: true) */
  showLabel?: boolean;
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────
export default function ClockSVG({
  hour,
  minute,
  onChange,
  readOnly = false,
  size = 280,
  showLabel = true,
}: ClockSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  /** 현재 드래그 중인 침: 'hour' | 'minute' | null */
  const draggingRef = useRef<'hour' | 'minute' | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 18; // 눈금 외곽 반지름

  // ── 각도 계산 (12시 = -π/2, 시계방향) ──────────────────────────────────
  const h12 = hour % 12;
  const hourAngle = ((h12 + minute / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const minuteAngle = (minute / 60) * Math.PI * 2 - Math.PI / 2;

  const hourLen = R * 0.54;   // 시침 길이
  const minuteLen = R * 0.78; // 분침 길이

  // 침 끝(tip) 좌표
  const hourTip = {
    x: cx + hourLen * Math.cos(hourAngle),
    y: cy + hourLen * Math.sin(hourAngle),
  };
  const minuteTip = {
    x: cx + minuteLen * Math.cos(minuteAngle),
    y: cy + minuteLen * Math.sin(minuteAngle),
  };

  // 드래그 핸들 반지름 (터치 타깃 ≥ 48×48px 확보)
  const handleR = size * 0.096;

  // ── 좌표 변환 ────────────────────────────────────────────────────────────
  /** 클라이언트 픽셀 → SVG 좌표계 */
  const toSVG = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: cx, y: cy };
      const rect = svg.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * size,
        y: ((clientY - rect.top) / rect.height) * size,
      };
    },
    [cx, cy, size],
  );

  // ── 포인터 이벤트 핸들러 ──────────────────────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (readOnly || !onChange) return;
      const { x, y } = toSVG(e.clientX, e.clientY);
      // 가까운 침 판별 (유클리드 거리²)
      const dH = (x - hourTip.x) ** 2 + (y - hourTip.y) ** 2;
      const dM = (x - minuteTip.x) ** 2 + (y - minuteTip.y) ** 2;
      draggingRef.current = dH <= dM ? 'hour' : 'minute';
      svgRef.current?.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [readOnly, onChange, toSVG, hourTip, minuteTip],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draggingRef.current || !onChange) return;
      e.preventDefault();
      const { x, y } = toSVG(e.clientX, e.clientY);

      // 중심으로부터의 각도 → 시간 변환
      let angle = Math.atan2(y - cy, x - cx) + Math.PI / 2;
      if (angle < 0) angle += Math.PI * 2;

      if (draggingRef.current === 'minute') {
        const newMin = Math.round((angle / (Math.PI * 2)) * 60) % 60;
        onChange(hour, newMin);
      } else {
        const newHour = Math.floor((angle / (Math.PI * 2)) * 12) % 12;
        onChange(newHour, minute);
      }
    },
    [toSVG, onChange, cx, cy, hour, minute],
  );

  const onPointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  // ── 눈금·숫자 데이터 생성 ────────────────────────────────────────────────
  /** 12시간 숫자 (1~12) 의 SVG 좌표 */
  const hourNums = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
    const nr = R * 0.80;
    return { n, x: cx + nr * Math.cos(a), y: cy + nr * Math.sin(a) };
  });

  /** 60개 분 눈금 */
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 5 === 0; // 5분 단위 주 눈금
    const tickLen = isMajor ? 13 : 6;
    return {
      x1: cx + (R - tickLen) * Math.cos(a),
      y1: cy + (R - tickLen) * Math.sin(a),
      x2: cx + R * Math.cos(a),
      y2: cy + R * Math.sin(a),
      isMajor,
    };
  });

  // 디지털 표시 문자열
  const hStr = String(h12 === 0 ? 12 : h12).padStart(2, '0');
  const mStr = String(minute).padStart(2, '0');

  return (
    <div className="clock-wrapper">
      {/* ── 아날로그 시계 SVG ── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          width: '100%',
          maxWidth: size,
          height: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          cursor: readOnly ? 'default' : 'grab',
          display: 'block',
          margin: '0 auto',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label={`시계: ${hStr}시 ${mStr}분`}
        role="img"
      >
        {/* 그림자 */}
        <circle cx={cx} cy={cy + 9} r={R + 10} fill="rgba(0,0,0,0.07)" />

        {/* 베젤 (파스텔 황금색) */}
        <circle cx={cx} cy={cy} r={R + 10} fill="#edd9a0" />

        {/* 시계 면 */}
        <circle cx={cx} cy={cy} r={R + 5} fill="#fff9f0" />

        {/* 눈금 */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke={t.isMajor ? '#c8a882' : '#e5d5b8'}
            strokeWidth={t.isMajor ? 2.6 : 1.2}
            strokeLinecap="round"
          />
        ))}

        {/* 숫자 */}
        {hourNums.map(({ n, x, y }) => (
          <text
            key={n}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size * 0.072}
            fontWeight="800"
            fontFamily="'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif"
            fill="#7a5c3e"
          >
            {n}
          </text>
        ))}

        {/* 시침 (꼬리 포함) — 파스텔 빨강 */}
        <line
          x1={cx - Math.cos(hourAngle) * hourLen * 0.18}
          y1={cy - Math.sin(hourAngle) * hourLen * 0.18}
          x2={hourTip.x}
          y2={hourTip.y}
          stroke="#ff7e67"
          strokeWidth={size * 0.038}
          strokeLinecap="round"
        />

        {/* 분침 (꼬리 포함) — 파스텔 파랑 */}
        <line
          x1={cx - Math.cos(minuteAngle) * minuteLen * 0.14}
          y1={cy - Math.sin(minuteAngle) * minuteLen * 0.14}
          x2={minuteTip.x}
          y2={minuteTip.y}
          stroke="#5db8ff"
          strokeWidth={size * 0.024}
          strokeLinecap="round"
        />

        {/* 중심 핀 */}
        <circle cx={cx} cy={cy} r={size * 0.050} fill="#fff" stroke="#e0cdb0" strokeWidth={2.5} />
        <circle cx={cx} cy={cy} r={size * 0.024} fill="#888" />

        {/* ── 드래그 핸들 (조작 모드에서만 표시) ── */}
        {!readOnly && (
          <g>
            {/* 시침 핸들 — 빨강 계열 점선 원 */}
            <circle
              cx={hourTip.x} cy={hourTip.y}
              r={handleR}
              fill="rgba(255,126,103,0.18)"
              stroke="rgba(255,126,103,0.65)"
              strokeWidth={2.5}
              strokeDasharray="5,3"
            />
            {/* 시침 핸들 레이블 */}
            <text
              x={hourTip.x} y={hourTip.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize={size * 0.058} fill="rgba(255,90,60,0.75)" fontWeight="900"
            >
              시
            </text>

            {/* 분침 핸들 — 파랑 계열 점선 원 */}
            <circle
              cx={minuteTip.x} cy={minuteTip.y}
              r={handleR * 0.85}
              fill="rgba(93,184,255,0.18)"
              stroke="rgba(93,184,255,0.65)"
              strokeWidth={2.5}
              strokeDasharray="5,3"
            />
            {/* 분침 핸들 레이블 */}
            <text
              x={minuteTip.x} y={minuteTip.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize={size * 0.054} fill="rgba(30,130,220,0.75)" fontWeight="900"
            >
              분
            </text>
          </g>
        )}
      </svg>

      {/* 디지털 시간 레이블 */}
      {showLabel && (
        <div className="clock-time-display">
          {hStr} : {mStr}
        </div>
      )}

      {/* 사용법 힌트 */}
      {!readOnly && (
        <p className="clock-hint">⬆️ 손잡이를 잡아 돌려보세요!</p>
      )}
    </div>
  );
}
