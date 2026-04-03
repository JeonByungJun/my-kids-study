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

// ─── 파이 그래프 (원 분할) ────────────────────────────────────────────────────
function FractionPie({
  total,
  colored,
  color = '#60a5fa',
}: {
  total: number;
  colored: number;
  color?: string;
}) {
  const R = 42;
  const cx = 50;
  const cy = 50;
  const parts = Array.from({ length: total }, (_, i) => {
    const a0 = (i / total) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + R * Math.cos(a0);
    const y0 = cy + R * Math.sin(a0);
    const x1 = cx + R * Math.cos(a1);
    const y1 = cy + R * Math.sin(a1);
    const large = 1 / total > 0.5 ? 1 : 0;
    return {
      d: `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`,
      fill: i < colored ? color : '#f1f5f9',
    };
  });
  return (
    <svg
      width={100}
      height={100}
      viewBox="0 0 100 100"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {parts.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} stroke="#334155" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

// ─── 막대 그래프 (분수 막대) ──────────────────────────────────────────────────
function FractionBar({
  total,
  colored,
  color = '#f87171',
}: {
  total: number;
  colored: number;
  color?: string;
}) {
  const W = 200;
  const H = 36;
  const pw = W / total;
  return (
    <svg width={W} height={H} style={{ display: 'block', margin: '0 auto' }}>
      {Array.from({ length: total }, (_, i) => (
        <rect
          key={i}
          x={i * pw}
          y={0}
          width={pw}
          height={H}
          fill={i < colored ? color : '#f1f5f9'}
          stroke="#334155"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

// ─── 분수 표기 컴포넌트 ───────────────────────────────────────────────────────
function Frac({ n, d }: { n: number; d: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        verticalAlign: 'middle',
        lineHeight: 1.1,
        margin: '0 4px',
      }}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize: '1.1rem',
          borderBottom: '2px solid #1e293b',
          paddingBottom: 1,
          minWidth: 22,
          textAlign: 'center',
        }}
      >
        {n}
      </span>
      <span
        style={{
          fontWeight: 800,
          fontSize: '1.1rem',
          paddingTop: 1,
          minWidth: 22,
          textAlign: 'center',
        }}
      >
        {d}
      </span>
    </span>
  );
}

const PIE_COLORS = ['#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa'];
const BAR_COLORS = ['#f87171', '#60a5fa', '#34d399', '#fbbf24'];

// ─── P1 그림 보고 분수 고르기 (선택지) ───────────────────────────────────────
function genReadFraction(): Problem {
  const den = rand(2, 6);
  const num = rand(1, den - 1);
  const useBar = Math.random() < 0.5;
  const clr = useBar
    ? BAR_COLORS[rand(0, BAR_COLORS.length - 1)]
    : PIE_COLORS[rand(0, PIE_COLORS.length - 1)];

  const correct = `${num}/${den}`;
  const wrongs = new Set<string>();
  let safety = 0;
  while (wrongs.size < 3 && safety++ < 200) {
    const wd = rand(2, 6);
    const wn = rand(1, wd - 1);
    const w = `${wn}/${wd}`;
    if (w !== correct) wrongs.add(w);
  }
  const opts = shuffle([correct, ...[...wrongs].slice(0, 3)]);
  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8 }}>
          색칠된 부분을 분수로 나타내세요.
        </p>
        <div style={{ margin: '8px 0' }}>
          {useBar ? (
            <FractionBar total={den} colored={num} color={clr} />
          ) : (
            <FractionPie total={den} colored={num} color={clr} />
          )}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          전체를 {den}으로 나눈 것 중 {num}만큼 색칠
        </p>
      </div>
    ),
    answer: opts.indexOf(correct),
    choices: opts,
  };
}

// ─── P2 분수 크기 비교 (선택지) ──────────────────────────────────────────────
function genCompareFrac(): Problem {
  const den = rand(3, 6); // 3 이상으로 분자 변화 가능
  let num1 = rand(1, den - 1);
  let num2 = rand(1, den - 1);
  let safety = 0;
  while (num1 === num2 && safety++ < 50) {
    num2 = rand(1, den - 1);
  }

  const bigger = num1 > num2 ? 0 : 1; // 0=왼쪽, 1=오른쪽

  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8 }}>
          두 분수 중 더 큰 것을 골라요.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <FractionBar total={den} colored={num1} color="#f87171" />
            <div style={{ marginTop: 6, fontWeight: 800, fontSize: '1.1rem' }}>
              <Frac n={num1} d={den} />
            </div>
          </div>
          <span style={{ fontSize: '1.3rem', color: '#94a3b8' }}>vs</span>
          <div style={{ textAlign: 'center' }}>
            <FractionBar total={den} colored={num2} color="#60a5fa" />
            <div style={{ marginTop: 6, fontWeight: 800, fontSize: '1.1rem' }}>
              <Frac n={num2} d={den} />
            </div>
          </div>
        </div>
      </div>
    ),
    answer: bigger,
    choices: [`${num1}/${den}`, `${num2}/${den}`, '같아요'],
  };
}

// ─── P3 분모 찾기 (숫자패드) ──────────────────────────────────────────────────
function genFindDen(): Problem {
  const den = rand(2, 8);
  const num = rand(1, den - 1);
  const clr = PIE_COLORS[rand(0, PIE_COLORS.length - 1)];
  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8 }}>
          □에 알맞은 수를 쓰세요.
        </p>
        <div style={{ margin: '8px 0' }}>
          <FractionPie total={den} colored={num} color={clr} />
        </div>
        {/* 분모 □ */}
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1.2,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.3rem',
              borderBottom: '2.5px solid #1e293b',
              paddingBottom: 3,
              minWidth: 28,
              textAlign: 'center',
            }}
          >
            {num}
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.3rem',
              paddingTop: 3,
              minWidth: 28,
              textAlign: 'center',
              background: '#fef3c7',
              borderRadius: 6,
              color: '#b45309',
              padding: '2px 10px',
            }}
          >
            □
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 8 }}>
          전체를 몇 칸으로 나누었나요?
        </p>
      </div>
    ),
    answer: den,
  };
}

// ─── P4 분자 찾기 (숫자패드) ──────────────────────────────────────────────────
function genFindNum(): Problem {
  const den = rand(2, 8);
  const num = rand(1, den - 1);
  const clr = BAR_COLORS[rand(0, BAR_COLORS.length - 1)];
  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8 }}>
          □에 알맞은 수를 쓰세요.
        </p>
        <div style={{ margin: '8px 0' }}>
          <FractionBar total={den} colored={num} color={clr} />
        </div>
        {/* 분자 □ */}
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1.2,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.3rem',
              borderBottom: '2.5px solid #1e293b',
              paddingBottom: 3,
              minWidth: 28,
              textAlign: 'center',
              background: '#fef3c7',
              borderRadius: 6,
              color: '#b45309',
              padding: '2px 10px',
            }}
          >
            □
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.3rem',
              paddingTop: 3,
              minWidth: 28,
              textAlign: 'center',
            }}
          >
            {den}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 8 }}>
          색칠된 칸은 몇 개인가요?
        </p>
      </div>
    ),
    answer: num,
  };
}

// ─── P5 색칠된 칸 수 세기 (선택지) ───────────────────────────────────────────
function genCountColored(): Problem {
  const den = rand(3, 8);
  const num = rand(1, den - 1);
  const clr = PIE_COLORS[rand(0, PIE_COLORS.length - 1)];

  const candidateNums = new Set<number>();
  for (const n of [num - 1, num + 1, den - num, den]) {
    if (n > 0 && n !== num && n <= den) candidateNums.add(n);
  }
  let safety = 0;
  while (candidateNums.size < 3 && safety++ < 50) {
    const n = rand(1, den);
    if (n !== num) candidateNums.add(n);
  }
  const opts = shuffle([num, ...[...candidateNums].slice(0, 3)]).map(String);
  return {
    display: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8 }}>
          색칠된 부분은 몇 칸인가요?
        </p>
        <div style={{ margin: '8px 0' }}>
          <FractionPie total={den} colored={num} color={clr} />
        </div>
        <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>
          전체 {den}칸 중 색칠된 칸 수는?
        </p>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          이 분수는&nbsp;
          <Frac n={num} d={den} />
          &nbsp;입니다.
        </p>
      </div>
    ),
    answer: opts.indexOf(String(num)),
    choices: opts,
  };
}

function generate(): Problem {
  switch (rand(0, 4)) {
    case 0:
      return genReadFraction();
    case 1:
      return genCompareFrac();
    case 2:
      return genFindDen();
    case 3:
      return genFindNum();
    default:
      return genCountColored();
  }
}

export default function FractionGame() {
  return (
    <GameShell
      title="🍕 분수"
      backTo="/math/semester22"
      generate={generate}
      maxDigits={1}
    />
  );
}
