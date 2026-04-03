import GameShell from '../../../components/GameShell';
import type { Problem } from '../../../components/GameShell';

// ─── 유틸 ─────────────────────────────────────────────────────────────────────
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 오답 후보를 n개 생성 (answer 제외, 양수) */
function distractNums(answer: number, n: number, lo: number, hi: number): number[] {
  const s = new Set<number>();
  let safety = 0;
  while (s.size < n && safety++ < 200) {
    const v = rand(lo, hi);
    if (v !== answer && v > 0) s.add(v);
  }
  return [...s].slice(0, n);
}

// ─── 수 타일 렌더링 ────────────────────────────────────────────────────────────
function NumBox({
  value,
  isBlank,
  bg = '#eff6ff',
  border = '#93c5fd',
  color = '#1e40af',
}: {
  value: string | number;
  isBlank?: boolean;
  bg?: string;
  border?: string;
  color?: string;
}) {
  if (isBlank) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 10,
          background: '#fef3c7',
          border: '2.5px solid #f59e0b',
          fontWeight: 800,
          fontSize: '1.2rem',
          color: '#b45309',
          flexShrink: 0,
        }}
      >
        □
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 10,
        background: bg,
        border: `2px solid ${border}`,
        fontWeight: 700,
        fontSize: '1rem',
        color,
        flexShrink: 0,
      }}
    >
      {value}
    </span>
  );
}

const Arrow = () => (
  <span style={{ color: '#94a3b8', fontSize: '0.75rem', flexShrink: 0 }}>→</span>
);

// ─── P1 증가 수열 (숫자패드) ──────────────────────────────────────────────────
function genIncSeq(): Problem {
  const step = rand(2, 6);
  const start = rand(1, 15);
  const len = 5;
  const blankPos = rand(2, len - 1);
  const seq = Array.from({ length: len }, (_, i) => start + i * step);
  const answer = seq[blankPos];
  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 10 }}>
          규칙을 찾아 □에 알맞은 수를 쓰세요.
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {seq.map((v, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <NumBox value={v} isBlank={i === blankPos} />
              {i < len - 1 && <Arrow />}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8 }}>
          +{step}씩 커지는 규칙
        </p>
      </div>
    ),
    answer,
  };
}

// ─── P2 감소 수열 (숫자패드) ──────────────────────────────────────────────────
function genDecSeq(): Problem {
  const step = rand(2, 5);
  const start = rand(20 + step * 4, 50);
  const len = 5;
  const blankPos = rand(2, len - 1);
  const seq = Array.from({ length: len }, (_, i) => start - i * step);
  const answer = seq[blankPos];
  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 10 }}>
          규칙을 찾아 □에 알맞은 수를 쓰세요.
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {seq.map((v, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <NumBox
                value={v}
                isBlank={i === blankPos}
                bg="#f0fdf4"
                border="#86efac"
                color="#166534"
              />
              {i < len - 1 && <Arrow />}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8 }}>
          -{step}씩 작아지는 규칙
        </p>
      </div>
    ),
    answer,
  };
}

// ─── P3 도형/이모지 패턴 (선택지) ─────────────────────────────────────────────
const SHAPE_SETS = [
  ['🔴', '🔵', '🟡'],
  ['⭐', '🔺', '⬛'],
  ['🍎', '🍊', '🍋'],
  ['🐶', '🐱', '🐰'],
  ['🏠', '🌳', '⛅'],
];

function genShapePattern(): Problem {
  const shapeSet = SHAPE_SETS[rand(0, SHAPE_SETS.length - 1)];
  const period = rand(2, 3);
  const pattern = shapeSet.slice(0, period);
  const seqLen = period * 3;
  const seq = Array.from({ length: seqLen }, (_, i) => pattern[i % period]);
  const blankPos = seqLen - 1;
  const answer = seq[blankPos];
  const opts = shuffle([...shapeSet]);
  const ansIdx = opts.indexOf(answer);
  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 10 }}>
          □에 알맞은 그림을 골라요.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 5,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {seq.map((v, i) => (
            <span
              key={i}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: i === blankPos ? '#fef3c7' : '#f8fafc',
                border:
                  i === blankPos ? '2.5px solid #f59e0b' : '1.5px solid #e2e8f0',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
              }}
            >
              {i === blankPos ? '？' : v}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8 }}>
          {period}개씩 반복되는 규칙
        </p>
      </div>
    ),
    answer: ansIdx,
    choices: opts,
  };
}

// ─── P4 곱셈 수열 (선택지) ────────────────────────────────────────────────────
function genMultSeq(): Problem {
  const factor = rand(2, 3);
  const start = rand(1, 3);
  const len = 4;
  const blankPos = rand(2, len - 1);
  const seq = Array.from({ length: len }, (_, i) => start * Math.round(Math.pow(factor, i)));
  const answer = seq[blankPos];

  const wrongs = new Set<number>();
  for (const n of [
    answer + factor,
    Math.max(1, answer - factor),
    answer * factor,
    Math.max(1, Math.round(answer / factor)),
  ]) {
    if (n !== answer && n > 0) wrongs.add(n);
  }
  let safety = 0;
  while (wrongs.size < 3 && safety++ < 100) {
    const n = rand(Math.max(1, answer - 10), answer + 10);
    if (n !== answer) wrongs.add(n);
  }
  const opts = shuffle([String(answer), ...[...wrongs].slice(0, 3).map(String)]);
  const ansIdx = opts.indexOf(String(answer));

  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 10 }}>
          규칙을 찾아 □에 알맞은 수를 골라요.
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {seq.map((v, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <NumBox
                value={v}
                isBlank={i === blankPos}
                bg="#fdf4ff"
                border="#d8b4fe"
                color="#7e22ce"
              />
              {i < len - 1 && <Arrow />}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8 }}>
          ×{factor}씩 커지는 규칙
        </p>
      </div>
    ),
    answer: ansIdx,
    choices: opts,
  };
}

// ─── P5 수 배열 표 (숫자패드) ─────────────────────────────────────────────────
function genNumTable(): Problem {
  const stepCol = rand(2, 5);
  const stepRow = rand(1, 3);
  const start = rand(1, 10);
  const COLS = 5;
  const ROWS = 2;
  const table = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => start + r * stepRow + c * stepCol),
  );
  const br = rand(0, ROWS - 1);
  const bc = rand(2, COLS - 1);
  const answer = table[br][bc];

  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 10 }}>
          규칙을 찾아 □에 알맞은 수를 쓰세요.
        </p>
        <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
          <tbody>
            {table.map((row, ri) => (
              <tr key={ri}>
                {row.map((v, ci) => {
                  const isBlank = ri === br && ci === bc;
                  return (
                    <td
                      key={ci}
                      style={{
                        width: 44,
                        height: 40,
                        border: '1.5px solid #cbd5e1',
                        background: isBlank
                          ? '#fef3c7'
                          : ri % 2 === 0
                            ? '#eff6ff'
                            : '#f0fdf4',
                        textAlign: 'center',
                        fontWeight: isBlank ? 800 : 600,
                        color: isBlank ? '#b45309' : '#1e293b',
                        fontSize: isBlank ? '1.2rem' : '0.9rem',
                      }}
                    >
                      {isBlank ? '□' : v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8 }}>
          오른쪽 +{stepCol} / 아래쪽 +{stepRow}
        </p>
      </div>
    ),
    answer,
  };
}

// ─── P6 두 수 사이의 규칙 찾기 (선택지) ──────────────────────────────────────
function genSkipCount(): Problem {
  const step = rand(3, 7);
  const start = rand(2, 10);
  const len = 6;
  const seq = Array.from({ length: len }, (_, i) => start + i * step);
  const blankPos = rand(3, len - 1);
  const answer = seq[blankPos];

  const wrongs = distractNums(answer, 3, Math.max(1, answer - step * 2), answer + step * 2);
  const opts = shuffle([String(answer), ...wrongs.map(String)]);
  const ansIdx = opts.indexOf(String(answer));

  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 10 }}>
          규칙을 찾아 □에 알맞은 수를 골라요.
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {seq.map((v, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <NumBox
                value={v}
                isBlank={i === blankPos}
                bg="#fff7ed"
                border="#fdba74"
                color="#9a3412"
              />
              {i < len - 1 && <Arrow />}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8 }}>
          +{step}씩 커지는 규칙
        </p>
      </div>
    ),
    answer: ansIdx,
    choices: opts,
  };
}

function generate(): Problem {
  switch (rand(0, 5)) {
    case 0:
      return genIncSeq();
    case 1:
      return genDecSeq();
    case 2:
      return genShapePattern();
    case 3:
      return genMultSeq();
    case 4:
      return genNumTable();
    default:
      return genSkipCount();
  }
}

export default function PatternGame() {
  return (
    <GameShell
      title="🔮 규칙 찾기"
      backTo="/math/semester22"
      generate={generate}
      maxDigits={2}
    />
  );
}
