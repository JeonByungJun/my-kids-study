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
function distract(answer: number, count: number): number[] {
  const s = new Set<number>();
  while (s.size < count) {
    const n = rand(Math.max(1, answer - 4), answer + 4);
    if (n !== answer) s.add(n);
  }
  return [...s];
}

// ─── 데이터 ───────────────────────────────────────────────────────────────────
interface ChartData {
  title: string;
  labels: string[];
  icons: string[];
  values: number[];
}

const TOPICS = [
  {
    title: '좋아하는 과일',
    labels: ['사과', '바나나', '포도', '딸기'],
    icons: ['🍎', '🍌', '🍇', '🍓'],
  },
  {
    title: '좋아하는 동물',
    labels: ['강아지', '고양이', '토끼', '새'],
    icons: ['🐶', '🐱', '🐰', '🐦'],
  },
  {
    title: '좋아하는 음식',
    labels: ['떡볶이', '피자', '라면', '김밥'],
    icons: ['🍢', '🍕', '🍜', '🍙'],
  },
];

function genData(): ChartData {
  const t = TOPICS[rand(0, TOPICS.length - 1)];
  return {
    title: t.title,
    labels: [...t.labels],
    icons: [...t.icons],
    values: t.labels.map(() => rand(2, 8)),
  };
}

// ─── 그림그래프 컴포넌트 ──────────────────────────────────────────────────────
function PictureGraph({ data }: { data: ChartData }) {
  return (
    <div style={{ textAlign: 'left', maxWidth: 320 }}>
      <div
        style={{
          fontWeight: 700,
          marginBottom: 6,
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#1e293b',
        }}
      >
        📋 {data.title} 그림그래프
      </div>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: '12px',
          background: '#fff',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th
              style={{
                border: '1.5px solid #cbd5e1',
                padding: '4px 6px',
                width: 68,
                fontWeight: 700,
              }}
            >
              항목
            </th>
            <th
              style={{
                border: '1.5px solid #cbd5e1',
                padding: '4px 6px',
                fontWeight: 700,
              }}
            >
              수 (🟡 = 1명)
            </th>
          </tr>
        </thead>
        <tbody>
          {data.labels.map((label, i) => (
            <tr key={i}>
              <td
                style={{
                  border: '1px solid #e2e8f0',
                  padding: '4px 6px',
                  fontSize: '11px',
                }}
              >
                {data.icons[i]} {label}
              </td>
              <td
                style={{
                  border: '1px solid #e2e8f0',
                  padding: '4px 6px',
                  fontSize: '15px',
                  letterSpacing: 2,
                  lineHeight: 1.4,
                }}
              >
                {'🟡'.repeat(data.values[i])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 막대그래프 SVG 컴포넌트 ──────────────────────────────────────────────────
const BAR_COLORS = ['#f87171', '#60a5fa', '#fbbf24', '#34d399'];

function BarGraph({ data }: { data: ChartData }) {
  const W = 264,
    H = 148;
  const PL = 28,
    PR = 8,
    PT = 14,
    PB = 30;
  const maxVal = Math.max(...data.values, 8);
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const n = data.values.length;
  const slotW = chartW / n;
  const barW = Math.floor(slotW - 6);

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.85rem', color: '#1e293b' }}
      >
        📊 {data.title} 막대그래프
      </div>
      <svg
        width={W}
        height={H}
        style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
      >
        {/* 눈금선 */}
        {[0, 2, 4, 6, 8]
          .filter((v) => v <= maxVal)
          .map((v) => {
            const y = PT + chartH - (v / maxVal) * chartH;
            return (
              <g key={v}>
                <line
                  x1={PL}
                  y1={y}
                  x2={W - PR}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                />
                <text
                  x={PL - 3}
                  y={y + 3}
                  fontSize={8}
                  textAnchor="end"
                  fill="#64748b"
                >
                  {v}
                </text>
              </g>
            );
          })}
        {/* 막대 + 레이블 */}
        {data.values.map((v, i) => {
          const x = PL + slotW * i + (slotW - barW) / 2;
          const bh = (v / maxVal) * chartH;
          const y = PT + chartH - bh;
          const lx = PL + slotW * i + slotW / 2;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={bh}
                fill={BAR_COLORS[i % BAR_COLORS.length]}
                rx={2}
              />
              <text
                x={lx}
                y={PT + chartH + 14}
                fontSize={9}
                textAnchor="middle"
                fill="#1e293b"
              >
                {data.labels[i]}
              </text>
              <text
                x={lx}
                y={y - 2}
                fontSize={9}
                textAnchor="middle"
                fill="#374151"
                fontWeight="bold"
              >
                {v}
              </text>
            </g>
          );
        })}
        {/* 축 */}
        <line
          x1={PL}
          y1={PT}
          x2={PL}
          y2={PT + chartH}
          stroke="#334155"
          strokeWidth={1.5}
        />
        <line
          x1={PL}
          y1={PT + chartH}
          x2={W - PR}
          y2={PT + chartH}
          stroke="#334155"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}

// ─── 문제 생성 함수 ────────────────────────────────────────────────────────────

/** P1 그림그래프 — 특정 항목 값 읽기 (선택지) */
function genReadPicture(): Problem {
  const data = genData();
  const ti = rand(0, data.labels.length - 1);
  const answer = data.values[ti];
  const opts = shuffle([answer, ...distract(answer, 3)]);
  return {
    display: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <PictureGraph data={data} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
          {data.icons[ti]} <strong>{data.labels[ti]}</strong>을(를) 좋아하는 학생은
          몇 명인가요?
        </p>
      </div>
    ),
    answer: opts.indexOf(answer),
    choices: opts.map(String),
  };
}

/** P2 막대그래프 — 특정 항목 값 읽기 (선택지) */
function genReadBar(): Problem {
  const data = genData();
  const ti = rand(0, data.labels.length - 1);
  const answer = data.values[ti];
  const opts = shuffle([answer, ...distract(answer, 3)]);
  return {
    display: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <BarGraph data={data} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
          <strong>{data.labels[ti]}</strong>을(를) 좋아하는 학생은 몇 명인가요?
        </p>
      </div>
    ),
    answer: opts.indexOf(answer),
    choices: opts.map(String),
  };
}

/** P3 막대그래프 — 가장 많은/적은 항목 찾기 (선택지) */
function genMostLeast(): Problem {
  const data = genData();
  // 최댓값·최솟값 중복 방지 (최대 20회 시도)
  for (let tries = 0; tries < 20; tries++) {
    const mx = Math.max(...data.values);
    const mn = Math.min(...data.values);
    const okMax = data.values.filter((v) => v === mx).length === 1;
    const okMin = data.values.filter((v) => v === mn).length === 1;
    if (okMax && okMin) break;
    data.values[rand(0, data.values.length - 1)] = rand(2, 8);
  }
  const isMost = Math.random() < 0.5;
  const target = isMost ? Math.max(...data.values) : Math.min(...data.values);
  const ansIdx = data.values.indexOf(target);
  return {
    display: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <BarGraph data={data} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
          가장 <strong>{isMost ? '많은' : '적은'}</strong> 학생이 좋아하는 것은
          무엇인가요?
        </p>
      </div>
    ),
    answer: ansIdx,
    choices: data.labels,
  };
}

/** P4 그림그래프 — 전체 합계 (숫자패드) */
function genTotal(): Problem {
  const data = genData();
  const total = data.values.reduce((a, b) => a + b, 0);
  return {
    display: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <PictureGraph data={data} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
          조사한 학생은 모두 몇 명인가요?
        </p>
      </div>
    ),
    answer: total,
  };
}

/** P5 막대그래프 — 두 항목 차이 (숫자패드) */
function genDiff(): Problem {
  const data = genData();
  const i = rand(0, data.labels.length - 1);
  let j: number;
  do {
    j = rand(0, data.labels.length - 1);
  } while (j === i);
  const diff = Math.abs(data.values[i] - data.values[j]);
  return {
    display: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <BarGraph data={data} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
          {data.icons[i]} <strong>{data.labels[i]}</strong>와(과) {data.icons[j]}{' '}
          <strong>{data.labels[j]}</strong>의 학생 수 차이는 몇 명인가요?
        </p>
      </div>
    ),
    answer: diff,
  };
}

function generate(): Problem {
  switch (rand(0, 4)) {
    case 0:
      return genReadPicture();
    case 1:
      return genReadBar();
    case 2:
      return genMostLeast();
    case 3:
      return genTotal();
    default:
      return genDiff();
  }
}

export default function GraphGame() {
  return (
    <GameShell
      title="📊 표와 그래프"
      backTo="/math/semester22"
      generate={generate}
      maxDigits={2}
    />
  );
}
