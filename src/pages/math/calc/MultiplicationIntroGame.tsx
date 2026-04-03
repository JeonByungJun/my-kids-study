import { useCallback } from 'react';
import GameShell from '../../../components/GameShell';
import type { Problem } from '../../../components/GameShell';

/* ── 유틸 헬퍼 ── */
const rnd = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── 아이템 목록 ── */
const ITEMS_LIST = [
  { emoji: '🍎', name: '사과' },
  { emoji: '⭐', name: '별' },
  { emoji: '🍪', name: '쿠키' },
  { emoji: '🌸', name: '꽃' },
  { emoji: '🔵', name: '구슬' },
  { emoji: '🍓', name: '딸기' },
  { emoji: '🍭', name: '사탕' },
  { emoji: '🦋', name: '나비' },
] satisfies { emoji: string; name: string }[];

/* ─────────────────────────────────────────────────────
   GroupedItems: N개씩 M묶음 시각화 컴포넌트
───────────────────────────────────────────────────── */
function GroupedItems({
  itemsPerGroup,
  groups,
  emoji,
}: {
  itemsPerGroup: number;
  groups: number;
  emoji: string;
}) {
  return (
    <div className="mult-groups">
      {Array.from({ length: groups }, (_, g) => (
        <div key={g} className="mult-group">
          {Array.from({ length: itemsPerGroup }, (_, i) => (
            <span key={i} className="mult-item">
              {emoji}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   NumberLineSVG: 수직선 뛰어세기 시각화 컴포넌트
───────────────────────────────────────────────────── */
function NumberLineSVG({ step, count }: { step: number; count: number }) {
  const total = step * count;
  const W = 280;
  const PAD_L = 20;
  const PAD_R = 28;
  const lineY = 56;
  const lineLen = W - PAD_L - PAD_R;
  const toX = (n: number) => PAD_L + (n / total) * lineLen;

  return (
    <svg viewBox={`0 0 ${W} 80`} className="mult-numberline">
      <defs>
        <marker id="nl-end" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L0,7 L7,3.5 z" fill="#718096" />
        </marker>
        <marker id="nl-arc" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#f6ad55" />
        </marker>
      </defs>

      {/* 수직선 */}
      <line
        x1={PAD_L}
        y1={lineY}
        x2={W - PAD_R + 8}
        y2={lineY}
        stroke="#718096"
        strokeWidth={2}
        markerEnd="url(#nl-end)"
      />

      {/* 눈금 + 숫자 */}
      {Array.from({ length: count + 1 }, (_, i) => {
        const x = toX(step * i);
        return (
          <g key={i}>
            <line
              x1={x}
              y1={lineY - 5}
              x2={x}
              y2={lineY + 5}
              stroke="#4a5568"
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={lineY + 17}
              textAnchor="middle"
              fontSize={10}
              fill="#4a5568"
              fontWeight="bold"
            >
              {step * i}
            </text>
          </g>
        );
      })}

      {/* 뛰어세기 호 */}
      {Array.from({ length: count }, (_, i) => {
        const x1 = toX(step * i);
        const x2 = toX(step * (i + 1));
        const mid = (x1 + x2) / 2;
        return (
          <g key={i}>
            <path
              d={`M${x1},${lineY - 4} Q${mid},14 ${x2},${lineY - 4}`}
              fill="none"
              stroke="#f6ad55"
              strokeWidth={2}
              markerEnd="url(#nl-arc)"
            />
            <text
              x={mid}
              y={11}
              textAnchor="middle"
              fontSize={9}
              fill="#e53e3e"
              fontWeight="bold"
            >
              +{step}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────
   BlankFormula: □ × b = c  또는  a × □ = c
───────────────────────────────────────────────────── */
function BlankFormula({
  a,
  b,
  c,
  blankLeft,
}: {
  a: number;
  b: number;
  c: number;
  blankLeft: boolean;
}) {
  return (
    <div className="mult-formula">
      {blankLeft ? <span className="mult-blank">□</span> : <span>{a}</span>}
      <span>×</span>
      {blankLeft ? <span>{b}</span> : <span className="mult-blank">□</span>}
      <span>=</span>
      <span className="mult-answer-num">{c}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   문제 유형 A: 묶어 세기
   — N개씩 M묶음 그림 → 전체 개수 numpad 입력
───────────────────────────────────────────────────── */
function makeGroupCount(): Problem {
  const { emoji, name } = pick(ITEMS_LIST);
  const isHard = Math.random() > 0.5;
  const itemsPerGroup = isHard ? rnd(4, 5) : rnd(2, 3);
  const maxGroups = Math.floor(20 / itemsPerGroup);
  const groups = Math.min(isHard ? rnd(3, 5) : rnd(2, 4), maxGroups);
  const answer = itemsPerGroup * groups;

  return {
    answer,
    display: (
      <div className="mult-problem">
        <p className="mult-question">
          {name}가 <strong>{itemsPerGroup}개씩</strong>{' '}
          <strong>{groups}묶음</strong> 있어요.
          <br />
          {name}는 모두 몇 개인가요?
        </p>
        <GroupedItems itemsPerGroup={itemsPerGroup} groups={groups} emoji={emoji} />
      </div>
    ),
  };
}

/* ─────────────────────────────────────────────────────
   문제 유형 B: 몇의 몇 배
   — "N의 M배는?" 텍스트 + 수직선 → numpad 입력
───────────────────────────────────────────────────── */
function makeTimesOf(): Problem {
  const n = rnd(2, 5);
  const m = rnd(2, 5);
  const answer = n * m;
  const showLine = Math.random() > 0.3;

  return {
    answer,
    display: (
      <div className="mult-problem">
        <div className="mult-times-display">
          <span className="mult-times-num">{n}</span>
          <span className="mult-times-word">의</span>
          <span className="mult-times-num">{m}배</span>
          <span className="mult-times-word">는?</span>
        </div>
        {showLine && <NumberLineSVG step={n} count={m} />}
        <p className="mult-subtext">{Array(m).fill(n).join(' + ')} = ?</p>
      </div>
    ),
  };
}

/* ─────────────────────────────────────────────────────
   문제 유형 C: 곱셈식 만들기
   — (C1) 그림 보고 a × b = ? 결과 구하기
   — (C2) 덧셈식 → n × □ = n*m, 횟수(□) 구하기
───────────────────────────────────────────────────── */
function makeMakeMultiply(): Problem {
  if (Math.random() > 0.5) {
    /* C1: 그림 → 곱셈 결과 */
    const { emoji, name } = pick(ITEMS_LIST);
    const a = rnd(2, 5);
    const b = rnd(2, 4);
    const answer = a * b;
    return {
      answer,
      display: (
        <div className="mult-problem">
          <p className="mult-question">
            {name} {a}개씩 {b}묶음이에요.
          </p>
          <GroupedItems itemsPerGroup={a} groups={b} emoji={emoji} />
          <div className="mult-formula">
            <span>{a}</span>
            <span>×</span>
            <span>{b}</span>
            <span>=</span>
            <span className="mult-blank">?</span>
          </div>
        </div>
      ),
    };
  } else {
    /* C2: 덧셈식 → 곱셈식, 곱하는 수 구하기 */
    const n = rnd(2, 5);
    const m = rnd(2, 5);
    const addStr = Array(m).fill(n).join(' + ');
    return {
      answer: m,
      display: (
        <div className="mult-problem">
          <p className="mult-question">덧셈식을 곱셈식으로 나타내세요.</p>
          <p className="mult-formula-sm">{addStr}</p>
          <div className="mult-formula">
            <span>{n}</span>
            <span>×</span>
            <span className="mult-blank">□</span>
            <span>=</span>
            <span className="mult-answer-num">{n * m}</span>
          </div>
        </div>
      ),
    };
  }
}

/* ─────────────────────────────────────────────────────
   문제 유형 D: 곱셈식 빈칸 채우기
   — □ × b = c  또는  a × □ = c → numpad 입력
───────────────────────────────────────────────────── */
function makeFillBlank(): Problem {
  const a = rnd(2, 5);
  const b = rnd(2, 5);
  const c = a * b;
  const blankLeft = Math.random() > 0.5;

  return {
    answer: blankLeft ? a : b,
    display: (
      <div className="mult-problem">
        <p className="mult-question">□에 알맞은 수를 구하세요.</p>
        <BlankFormula a={a} b={b} c={c} blankLeft={blankLeft} />
      </div>
    ),
  };
}

/* ─────────────────────────────────────────────────────
   문제 유형 E: 덧셈↔곱셈 변환
   — 4지선다 choices 입력
───────────────────────────────────────────────────── */
function makeConvertExpr(): Problem {
  const n = rnd(2, 5);
  const m = rnd(2, 5);
  // 오답용 변형값 (항상 m, n과 다름이 보장됨)
  const nAlt = n < 5 ? n + 1 : n - 1;           // 값이 다른 단위
  const mAlt1 = m + 1;                           // 한 개 더
  const mAlt2 = m > 2 ? m - 1 : m + 2;          // 한 개 적거나 두 개 더

  if (Math.random() > 0.5) {
    /* E1: 덧셈식 → 곱셈식 선택 */
    const addStr = Array(m).fill(String(n)).join('+');
    const correct = `${n}×${m}`;
    const wrongs = shuffle([
      `${n}×${mAlt1}`,    // 묶음 수 착각
      `${n}×${mAlt2}`,    // 묶음 수 착각
      `${nAlt}×${m}`,     // 단위 값 착각
    ]);
    const choices = shuffle([correct, ...wrongs]);
    return {
      answer: choices.indexOf(correct),
      choices,
      display: (
        <div className="mult-problem">
          <p className="mult-question">
            덧셈식을 곱셈식으로
            <br />
            바르게 나타낸 것은?
          </p>
          <div className="mult-formula">{addStr}</div>
        </div>
      ),
    };
  } else {
    /* E2: 곱셈식 → 덧셈식 선택 */
    const correct = Array(m).fill(String(n)).join('+');
    const w1 = Array(mAlt1).fill(String(n)).join('+'); // 반복 횟수 +1
    const w2 = Array(mAlt2).fill(String(n)).join('+'); // 반복 횟수 -1 or +2
    const w3 = Array(m).fill(String(nAlt)).join('+');  // 다른 단위 값
    const wrongs = shuffle([w1, w2, w3].filter(w => w !== correct));
    const choices = shuffle([correct, ...wrongs.slice(0, 3)]);
    return {
      answer: choices.indexOf(correct),
      choices,
      display: (
        <div className="mult-problem">
          <p className="mult-question">
            곱셈식을 덧셈식으로
            <br />
            바르게 나타낸 것은?
          </p>
          <div className="mult-formula">
            <span>{n}</span>
            <span>×</span>
            <span>{m}</span>
          </div>
        </div>
      ),
    };
  }
}

/* ─────────────────────────────────────────────────────
   문제 유형 F: 두 곱셈식 크기 비교
   — "□ 안에 >, <, = 중 알맞은 것은?" (choices)
   — 교환법칙(=) 포함하여 곱셈의 성질도 학습
───────────────────────────────────────────────────── */
function makeCompare(): Problem {
  const n1 = rnd(2, 5);
  const m1 = rnd(2, 5);
  let n2: number;
  let m2: number;

  // 30% 확률로 교환법칙 (= 결과 유도): n1×m1 과 m1×n1
  if (Math.random() < 0.3 && n1 !== m1) {
    n2 = m1;
    m2 = n1;
  } else {
    // 값이 다른 두 곱셈식 생성 (다른 수 사용)
    n2 = rnd(2, 5);
    m2 = rnd(2, 5);
    // 완전히 같은 식은 재시도 (교육적 다양성)
    let tries = 0;
    while (n2 === n1 && m2 === m1 && tries < 8) {
      n2 = rnd(2, 5);
      m2 = rnd(2, 5);
      tries++;
    }
  }

  const v1 = n1 * m1;
  const v2 = n2 * m2;
  const correct = v1 > v2 ? '>' : v1 < v2 ? '<' : '=';
  const choices = ['>', '<', '='];

  return {
    display: (
      <div className="mult-problem">
        <p className="mult-question">□ 안에 &#62;, &#60;, = 중 알맞은 것은?</p>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', margin: '10px 0',
        }}>
          <span style={{
            fontSize: 'clamp(1.3rem, 5vw, 1.7rem)',
            fontWeight: 900, color: '#2b6cb0',
          }}>
            {n1} × {m1}
          </span>
          <span style={{
            fontSize: 'clamp(1.4rem, 5.5vw, 1.9rem)', fontWeight: 900,
            color: '#ed8936', background: 'rgba(255,255,255,0.75)',
            borderRadius: '8px', padding: '2px 12px',
          }}>
            □
          </span>
          <span style={{
            fontSize: 'clamp(1.3rem, 5vw, 1.7rem)',
            fontWeight: 900, color: '#2b6cb0',
          }}>
            {n2} × {m2}
          </span>
        </div>
      </div>
    ),
    answer: choices.indexOf(correct),
    choices,
  };
}

/* ─────────────────────────────────────────────────────
   메인 generate 함수: 6가지 유형 균등 출제
───────────────────────────────────────────────────── */
const GENERATORS = [
  makeGroupCount,
  makeTimesOf,
  makeMakeMultiply,
  makeFillBlank,
  makeConvertExpr,
  makeCompare,
] as const;

function generateProblem(): Problem {
  return pick(GENERATORS)();
}

/* ─────────────────────────────────────────────────────
   게임 컴포넌트
───────────────────────────────────────────────────── */
export default function MultiplicationIntroGame() {
  const generate = useCallback(() => generateProblem(), []);

  return (
    <GameShell
      title="✖️ 곱셈 입문"
      backTo="/math/calc"
      generate={generate}
      maxDigits={2}
    />
  );
}
