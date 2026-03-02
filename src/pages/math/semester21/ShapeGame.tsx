import GameShell from '../../../components/GameShell';
import type { Problem } from '../../../components/GameShell';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[rand(0, arr.length - 1)];
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── 도형 데이터 ── */
interface Shape {
  name: string;
  sides: number;
  vertices: number;
}

const SHAPES: Shape[] = [
  { name: '원', sides: 0, vertices: 0 },
  { name: '삼각형', sides: 3, vertices: 3 },
  { name: '사각형', sides: 4, vertices: 4 },
  { name: '오각형', sides: 5, vertices: 5 },
  { name: '육각형', sides: 6, vertices: 6 },
];

const POLY = SHAPES.filter((s) => s.sides > 0);

/* ── SVG 도형 컴포넌트 ── */
const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];

function ShapeSVG({ type, size = 48, color }: { type: string; size?: number; color?: string }) {
  const fill = color || '#60a5fa';
  const sw = 2.5;
  switch (type) {
    case '원':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill={fill} stroke="#334155" strokeWidth={sw} />
        </svg>
      );
    case '삼각형':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <polygon points="50,6 96,94 4,94" fill={fill} stroke="#334155" strokeWidth={sw} />
        </svg>
      );
    case '사각형':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="6" y="6" width="88" height="88" fill={fill} stroke="#334155" strokeWidth={sw} />
        </svg>
      );
    case '오각형':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <polygon points="50,6 97,38 79,94 21,94 3,38" fill={fill} stroke="#334155" strokeWidth={sw} />
        </svg>
      );
    case '육각형':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <polygon points="50,4 93,26 93,74 50,96 7,74 7,26" fill={fill} stroke="#334155" strokeWidth={sw} />
        </svg>
      );
    default:
      return null;
  }
}

const flexRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  justifyContent: 'center',
  margin: '10px 0',
};

const numBadge: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
};

const badgeNum: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 800,
  color: '#475569',
  background: '#f1f5f9',
  borderRadius: '50%',
  width: '22px',
  height: '22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

/* ── 표 스타일 ── */
const tableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  margin: '8px auto 0',
  fontSize: 'clamp(0.75rem, 3vw, 0.95rem)',
};
const thStyle: React.CSSProperties = {
  border: '2px solid #cbd5e1',
  padding: '5px 8px',
  background: '#f1f5f9',
  color: '#475569',
  fontWeight: 800,
  textAlign: 'center',
};
const tdStyle: React.CSSProperties = {
  border: '2px solid #cbd5e1',
  padding: '6px 10px',
  textAlign: 'center',
  fontWeight: 700,
  color: '#2d3748',
};
const blankTdStyle: React.CSSProperties = {
  ...tdStyle,
  background: '#fef3c7',
  color: '#f59e0b',
  fontSize: '1.2em',
  fontWeight: 900,
};

/* ── 도형 설명 생성 ── */
function makeStatements(shape: Shape) {
  const { name, sides, vertices } = shape;
  const isPoly = sides > 0;

  const trues: string[] = [];
  const falses: string[] = [];

  if (isPoly) {
    trues.push(`변이 ${sides}개`);
    trues.push(`꼭짓점이 ${vertices}개`);
    trues.push('곧은 선으로 둘러싸여 있음');
    trues.push(`뾰족한 부분이 ${vertices}개`);

    for (const s of POLY) {
      if (s.sides !== sides) falses.push(`변이 ${s.sides}개`);
      if (s.vertices !== vertices) falses.push(`꼭짓점이 ${s.vertices}개`);
    }
    falses.push('둥근 부분이 있음');
    falses.push('변과 꼭짓점이 없음');
  } else {
    trues.push('둥근 부분이 있음');
    trues.push('변이 없음');
    trues.push('꼭짓점이 없음');

    falses.push('변이 있음');
    falses.push('꼭짓점이 있음');
    falses.push('곧은 선으로 둘러싸여 있음');
    falses.push(`뾰족한 부분이 3개`);
  }
  return { name, trues: shuffle(trues), falses: shuffle(falses) };
}

/* ── 아이소메트릭 쌓기나무 ── */
type Block = [number, number, number];

const CUBE_PAL = [
  { top: '#fbbf24', left: '#d69e2e', right: '#b7791f' },
  { top: '#60a5fa', left: '#3b82f6', right: '#2563eb' },
  { top: '#34d399', left: '#10b981', right: '#059669' },
  { top: '#f472b6', left: '#ec4899', right: '#db2777' },
  { top: '#a78bfa', left: '#8b5cf6', right: '#7c3aed' },
];

function IsoCubes({ blocks, size = 120, pal = 0 }: { blocks: Block[]; size?: number; pal?: number }) {
  const dx = 14, dy = 8, dz = 16;
  const c = CUBE_PAL[pal % CUBE_PAL.length];
  const sorted = [...blocks].sort((a, b) => {
    const da = a[0] + a[1], db = b[0] + b[1];
    return da !== db ? da - db : a[2] - b[2];
  });
  let x1 = Infinity, x2 = -Infinity, y1 = Infinity, y2 = -Infinity;
  for (const [gx, gy, gz] of blocks) {
    const cx = (gx - gy) * dx, cy = (gx + gy) * dy - gz * dz;
    x1 = Math.min(x1, cx - dx); x2 = Math.max(x2, cx + dx);
    y1 = Math.min(y1, cy - dy); y2 = Math.max(y2, cy + dy + dz);
  }
  const p = 3, vw = x2 - x1 + p * 2, vh = y2 - y1 + p * 2;
  const ox = -x1 + p, oy = -y1 + p;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${vw} ${vh}`} style={{ display: 'block', margin: '0 auto' }}>
      {sorted.map(([gx, gy, gz], i) => {
        const cx = ox + (gx - gy) * dx, cy = oy + (gx + gy) * dy - gz * dz;
        return (
          <g key={i}>
            <polygon points={`${cx-dx},${cy} ${cx},${cy+dy} ${cx},${cy+dy+dz} ${cx-dx},${cy+dz}`} fill={c.left} stroke="#334155" strokeWidth="0.8" />
            <polygon points={`${cx+dx},${cy} ${cx},${cy+dy} ${cx},${cy+dy+dz} ${cx+dx},${cy+dz}`} fill={c.right} stroke="#334155" strokeWidth="0.8" />
            <polygon points={`${cx},${cy-dy} ${cx+dx},${cy} ${cx},${cy+dy} ${cx-dx},${cy}`} fill={c.top} stroke="#334155" strokeWidth="0.8" />
          </g>
        );
      })}
    </svg>
  );
}

/* 쌓기나무 프리셋 */
const BLOCK_PRESETS: Block[][] = [
  /* 3개 */ [[0,0,0],[1,0,0],[2,0,0]],
  /* 3개 */ [[0,0,0],[1,0,0],[1,1,0]],
  /* 3개 */ [[0,0,0],[0,0,1],[0,0,2]],
  /* 4개 */ [[0,0,0],[1,0,0],[0,1,0],[1,1,0]],
  /* 4개 */ [[0,0,0],[1,0,0],[2,0,0],[2,1,0]],
  /* 4개 */ [[0,0,0],[1,0,0],[1,0,1],[2,0,0]],
  /* 4개 */ [[0,0,0],[0,1,0],[0,0,1],[0,1,1]],
  /* 5개 */ [[0,0,0],[1,0,0],[2,0,0],[1,1,0],[1,0,1]],
  /* 5개 */ [[0,0,0],[1,0,0],[1,1,0],[0,0,1],[0,0,2]],
  /* 5개 */ [[0,0,0],[1,0,0],[2,0,0],[1,0,1],[2,0,1]],
  /* 6개 */ [[0,0,0],[1,0,0],[2,0,0],[0,1,0],[1,1,0],[2,1,0]],
  /* 6개 */ [[0,0,0],[1,0,0],[0,1,0],[0,0,1],[1,0,1],[0,1,1]],
  /* 7개 */ [[0,0,0],[1,0,0],[2,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1]],
];


/* ════════════════════════════════════════ */
/*                문제 생성기                */
/* ════════════════════════════════════════ */
const generators: (() => Problem)[] = [
  /* ──── 시각 문제 ──── */

  /* 🎨① 도형을 보고 변의 개수 */
  () => {
    const s = pick(SHAPES);
    const c = pick(COLORS);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <ShapeSVG type={s.name} size={80} color={c} />
          <br />이 도형의 <strong>변</strong>은 몇 개?
        </div>
      ),
      answer: s.sides,
    };
  },

  /* 🎨② 도형을 보고 꼭짓점의 개수 */
  () => {
    const s = pick(SHAPES);
    const c = pick(COLORS);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <ShapeSVG type={s.name} size={80} color={c} />
          <br />이 도형의 <strong>꼭짓점</strong>은 몇 개?
        </div>
      ),
      answer: s.vertices,
    };
  },

  /* 🎨③ 여러 도형 중 특정 도형 세기 */
  () => {
    const target = pick(SHAPES);
    const count = rand(4, 7);
    const items = Array.from({ length: count }, () => ({
      shape: pick(SHAPES),
      color: pick(COLORS),
    }));
    // 최소 1개는 target 보장
    if (!items.some((i) => i.shape.name === target.name)) {
      items[rand(0, count - 1)] = { shape: target, color: pick(COLORS) };
    }
    const answer = items.filter((i) => i.shape.name === target.name).length;
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <div style={flexRow}>
            {items.map((it, i) => (
              <ShapeSVG key={i} type={it.shape.name} size={40} color={it.color} />
            ))}
          </div>
          <strong>{target.name}</strong>은 몇 개?
        </div>
      ),
      answer,
    };
  },

  /* 🎨④ 번호 붙은 도형에서 특정 도형 찾기 */
  () => {
    const allNames = shuffle(SHAPES.map((s) => s.name)).slice(0, 4);
    const targetIdx = rand(0, 3);
    const targetName = allNames[targetIdx];
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <div style={flexRow}>
            {allNames.map((name, i) => (
              <div key={i} style={numBadge}>
                <ShapeSVG type={name} size={44} color={pick(COLORS)} />
                <span style={badgeNum}>{i + 1}</span>
              </div>
            ))}
          </div>
          <strong>{targetName}</strong>은 몇 번?
        </div>
      ),
      answer: targetIdx + 1,
    };
  },

  /* 🎨⑤ 도형을 보고 이름 맞추기 → 변의 개수로 답 */
  () => {
    const s = pick(POLY);
    const c = pick(COLORS);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <ShapeSVG type={s.name} size={80} color={c} />
          <br />이 도형의 <strong>변의 개수</strong>를
          <br />입력하세요
        </div>
      ),
      answer: s.sides,
    };
  },

  /* 🎨⑥ 두 도형 보여주고 변의 합 */
  () => {
    const a = pick(SHAPES);
    const b = pick(SHAPES);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <div style={flexRow}>
            <ShapeSVG type={a.name} size={56} color={pick(COLORS)} />
            <span style={{ fontSize: '1.8rem', fontWeight: 900, alignSelf: 'center' }}>+</span>
            <ShapeSVG type={b.name} size={56} color={pick(COLORS)} />
          </div>
          두 도형의 <strong>변의 합</strong>은?
        </div>
      ),
      answer: a.sides + b.sides,
    };
  },

  /* ──── 텍스트 문제 ──── */

  /* 📝① 변 + 꼭짓점 합 */
  () => {
    const s = pick(POLY);
    return {
      display: (
        <div className="quiz-text">
          <strong>{s.name}</strong>의
          <br />변 + 꼭짓점 = ?
        </div>
      ),
      answer: s.sides + s.vertices,
    };
  },

  /* 📝② 두 도형 차이 */
  () => {
    let a: Shape, b: Shape;
    do {
      a = pick(SHAPES);
      b = pick(SHAPES);
    } while (a.name === b.name);
    const big = a.sides >= b.sides ? a : b;
    const small = a.sides >= b.sides ? b : a;
    const prop = pick(['변', '꼭짓점']);
    const valBig = prop === '변' ? big.sides : big.vertices;
    const valSmall = prop === '변' ? small.sides : small.vertices;
    return {
      display: (
        <div className="quiz-text">
          <strong>{big.name}</strong>의 {prop} −<br />
          <strong>{small.name}</strong>의 {prop} = ?
        </div>
      ),
      answer: valBig - valSmall,
    };
  },

  /* 📝③ 복합 연산 */
  () => {
    const a = pick(SHAPES);
    const b = pick(SHAPES);
    const c = pick(SHAPES);
    const answer = a.sides - b.vertices + c.vertices;
    return {
      display: (
        <div className="quiz-text">
          {a.name}의 변 − {b.name}의 꼭짓점
          <br />+ <strong>{c.name}의 꼭짓점</strong> = ?
        </div>
      ),
      answer,
    };
  },

  /* 📝④ 조건 추리 */
  () => {
    const target = pick(POLY.filter((s) => s.sides >= 4 && s.sides <= 5));
    const lower = target.sides - 1;
    const upper = target.vertices + 1;
    return {
      display: (
        <div className="quiz-text">
          변이 {lower}개보다 많고
          <br />
          꼭짓점이 {upper}개보다 적은
          <br />
          도형의 <strong>변은 몇 개</strong>?
        </div>
      ),
      answer: target.sides,
    };
  },

  /* ──── 선택지(한글) 문제 ──── */

  /* 🔤① 도형을 보고 이름 맞추기 */
  () => {
    const target = pick(SHAPES);
    const c = pick(COLORS);
    const names = SHAPES.map((s) => s.name);
    const others = shuffle(names.filter((n) => n !== target.name)).slice(0, 3);
    const choices = shuffle([target.name, ...others]);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <ShapeSVG type={target.name} size={90} color={c} />
          <br />이 도형의 <strong>이름</strong>은?
        </div>
      ),
      answer: choices.indexOf(target.name),
      choices,
    };
  },

  /* 🔤② 설명을 보고 도형 이름 맞추기 */
  () => {
    const target = pick(POLY);
    const others = shuffle(POLY.filter((s) => s.name !== target.name).map((s) => s.name)).slice(0, 3);
    const choices = shuffle([target.name, ...others]);
    return {
      display: (
        <div className="quiz-text">
          변이 <strong>{target.sides}개</strong>이고
          <br />
          꼭짓점이 <strong>{target.vertices}개</strong>인
          <br />
          도형은?
        </div>
      ),
      answer: choices.indexOf(target.name),
      choices,
    };
  },

  /* 🔤③ 조건 추리 → 도형 이름 */
  () => {
    const target = pick(POLY.filter((s) => s.sides >= 4 && s.sides <= 5));
    const lower = target.sides - 1;
    const upper = target.vertices + 1;
    const others = shuffle(SHAPES.filter((s) => s.name !== target.name).map((s) => s.name)).slice(0, 3);
    const choices = shuffle([target.name, ...others]);
    return {
      display: (
        <div className="quiz-text">
          변이 {lower}개보다 많고
          <br />
          꼭짓점이 {upper}개보다 적은
          <br />
          도형은 <strong>무엇</strong>?
        </div>
      ),
      answer: choices.indexOf(target.name),
      choices,
    };
  },

  /* 🔤④ 꼭짓점/변이 없는 도형 */
  () => {
    const others = shuffle(POLY.map((s) => s.name)).slice(0, 3);
    const choices = shuffle(['원', ...others]);
    return {
      display: (
        <div className="quiz-text">
          변과 꼭짓점이
          <br />
          <strong>없는</strong> 도형은?
        </div>
      ),
      answer: choices.indexOf('원'),
      choices,
    };
  },

  /* ──── 빈칸 표 문제 ──── */

  /* 📊① 변/꼭짓점 표 빈칸 채우기 */
  () => {
    const shapes = shuffle([...POLY]).slice(0, 3);
    const blankRow = rand(0, 1); // 0=변, 1=꼭짓점
    const blankCol = rand(0, 2);
    const blankShape = shapes[blankCol];
    const answer = blankRow === 0 ? blankShape.sides : blankShape.vertices;

    return {
      display: (
        <div className="quiz-text" style={{ fontSize: 'clamp(0.8rem, 3.2vw, 1rem)' }}>
          빈 칸에 알맞은 수는?
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>도형</th>
                {shapes.map((s, i) => (
                  <th key={i} style={thStyle}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={thStyle}>변의 수</td>
                {shapes.map((s, i) => (
                  <td key={i} style={blankRow === 0 && blankCol === i ? blankTdStyle : tdStyle}>
                    {blankRow === 0 && blankCol === i ? '?' : s.sides}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={thStyle}>꼭짓점</td>
                {shapes.map((s, i) => (
                  <td key={i} style={blankRow === 1 && blankCol === i ? blankTdStyle : tdStyle}>
                    {blankRow === 1 && blankCol === i ? '?' : s.vertices}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ),
      answer,
    };
  },

  /* 📊② 원 포함 표 빈칸 */
  () => {
    const shapes = shuffle([...SHAPES]).slice(0, 3);
    const blankRow = rand(0, 1);
    const blankCol = rand(0, 2);
    const blankShape = shapes[blankCol];
    const answer = blankRow === 0 ? blankShape.sides : blankShape.vertices;

    return {
      display: (
        <div className="quiz-text" style={{ fontSize: 'clamp(0.8rem, 3.2vw, 1rem)' }}>
          빈 칸에 알맞은 수는?
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>도형</th>
                {shapes.map((s, i) => (
                  <th key={i} style={thStyle}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={thStyle}>변의 수</td>
                {shapes.map((s, i) => (
                  <td key={i} style={blankRow === 0 && blankCol === i ? blankTdStyle : tdStyle}>
                    {blankRow === 0 && blankCol === i ? '?' : s.sides}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={thStyle}>꼭짓점</td>
                {shapes.map((s, i) => (
                  <td key={i} style={blankRow === 1 && blankCol === i ? blankTdStyle : tdStyle}>
                    {blankRow === 1 && blankCol === i ? '?' : s.vertices}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ),
      answer,
    };
  },

  /* ──── 다중선택 문제 ──── */

  /* ✅① 여러 도형에서 특정 도형 모두 고르기 */
  () => {
    const labels = ['가', '나', '다', '라', '마', '바'];
    const count = rand(5, 6);
    const target = pick(SHAPES);
    const items = Array.from({ length: count }, () => ({
      shape: pick(SHAPES),
      color: pick(COLORS),
    }));
    // 최소 1개, 최대 count-1개 보장
    const tCount = items.filter(i => i.shape.name === target.name).length;
    if (tCount === 0) items[rand(0, count - 1)] = { shape: target, color: pick(COLORS) };
    if (tCount === count) {
      const other = SHAPES.filter(s => s.name !== target.name);
      items[rand(0, count - 1)] = { shape: pick(other), color: pick(COLORS) };
    }
    const correctIndices = items
      .map((it, i) => (it.shape.name === target.name ? i : -1))
      .filter(i => i >= 0);

    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <div style={flexRow}>
            {items.map((it, i) => (
              <div key={i} style={numBadge}>
                <ShapeSVG type={it.shape.name} size={40} color={it.color} />
                <span style={badgeNum}>{labels[i]}</span>
              </div>
            ))}
          </div>
          <strong>{target.name}</strong>을 모두 고르세요
        </div>
      ),
      answer: -1,
      multiChoices: labels.slice(0, count),
      multiAnswer: correctIndices,
    };
  },

  /* ✅② 도형 설명 옳은 것 고르기 */
  () => {
    const shape = pick(SHAPES);
    const { trues, falses } = makeStatements(shape);
    const trueCount = rand(2, Math.min(3, trues.length));
    const falseCount = 4 - trueCount;
    const pickedTrue = trues.slice(0, trueCount);
    const pickedFalse = falses.slice(0, falseCount);

    const stmts = [...pickedTrue, ...pickedFalse];
    const order = shuffle(stmts.map((_, i) => i));
    const ordered = order.map(i => stmts[i]);
    const correctIndices = order
      .map((origIdx, newIdx) => (origIdx < trueCount ? newIdx : -1))
      .filter(i => i >= 0);

    const labels = ['가', '나', '다', '라'];
    return {
      display: (
        <div className="quiz-text">
          <strong>{shape.name}</strong>에 대한 설명으로
          <br />
          <strong>옳은 것</strong>을 모두 고르세요
        </div>
      ),
      answer: -1,
      multiChoices: ordered.map((s, i) => `${labels[i]}. ${s}`),
      multiAnswer: correctIndices,
    };
  },

  /* ✅③ 변이 N개인 도형 모두 고르기 */
  () => {
    const labels = ['가', '나', '다', '라', '마'];
    const targetSides = pick([3, 4, 5, 6]);
    const items = Array.from({ length: 5 }, () => ({
      shape: pick(SHAPES),
      color: pick(COLORS),
    }));
    // 최소 1개 target 보장
    const matching = items.filter(i => i.shape.sides === targetSides);
    if (matching.length === 0) {
      const target = SHAPES.find(s => s.sides === targetSides)!;
      items[rand(0, 4)] = { shape: target, color: pick(COLORS) };
    }
    // 전부 target이면 하나 바꿈
    if (items.every(i => i.shape.sides === targetSides)) {
      const other = SHAPES.filter(s => s.sides !== targetSides);
      items[rand(0, 4)] = { shape: pick(other), color: pick(COLORS) };
    }
    const correctIndices = items
      .map((it, i) => (it.shape.sides === targetSides ? i : -1))
      .filter(i => i >= 0);

    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <div style={flexRow}>
            {items.map((it, i) => (
              <div key={i} style={numBadge}>
                <ShapeSVG type={it.shape.name} size={40} color={it.color} />
                <span style={badgeNum}>{labels[i]}</span>
              </div>
            ))}
          </div>
          <strong>변이 {targetSides}개</strong>인 도형을
          <br />모두 고르세요
        </div>
      ),
      answer: -1,
      multiChoices: labels,
      multiAnswer: correctIndices,
    };
  },

  /* ✅④ 두 도형의 공통점 고르기 */
  () => {
    let a: Shape, b: Shape;
    do {
      a = pick(POLY);
      b = pick(POLY);
    } while (a.name === b.name);

    const labels = ['가', '나', '다', '라'];
    type Stmt = { text: string; correct: boolean };
    const pool: Stmt[] = shuffle([
      { text: '변과 꼭짓점이 있다', correct: true },
      { text: '곧은 선으로 둘러싸여 있다', correct: true },
      { text: '둥근 부분이 있다', correct: false },
      { text: `변이 ${a.sides}개, 꼭짓점이 ${a.vertices}개`, correct: a.sides === b.sides },
      { text: '변과 꼭짓점이 없다', correct: false },
      { text: `변의 수와 꼭짓점의 수가 같다`, correct: true },
    ]);
    const stmts = pool.slice(0, 4);
    const correctIndices = stmts
      .map((s, i) => (s.correct ? i : -1))
      .filter(i => i >= 0);

    // 최소 1개 정답 보장
    if (correctIndices.length === 0) {
      stmts[0] = { text: '변과 꼭짓점이 있다', correct: true };
      correctIndices.push(0);
    }

    return {
      display: (
        <div className="quiz-text">
          <strong>{a.name}</strong>과 <strong>{b.name}</strong>의
          <br />
          <strong>공통점</strong>을 모두 고르세요
        </div>
      ),
      answer: -1,
      multiChoices: stmts.map((s, i) => `${labels[i]}. ${s.text}`),
      multiAnswer: correctIndices,
    };
  },

  /* ──── 쌓기나무 문제 ──── */

  /* 🧱① 쌓기나무 세기 */
  () => {
    const blocks = pick(BLOCK_PRESETS);
    const pal = rand(0, CUBE_PAL.length - 1);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <IsoCubes blocks={blocks} size={100} pal={pal} />
          <br />
          <strong>쌓기나무</strong>는 모두 몇 개?
        </div>
      ),
      answer: blocks.length,
    };
  },

  /* 🧱② 쌓기나무 층별 세기 */
  () => {
    const multiLayer = BLOCK_PRESETS.filter(
      b => new Set(b.map(v => v[2])).size > 1
    );
    const blocks = pick(multiLayer);
    const layers = [...new Set(blocks.map(b => b[2]))].sort((a, b) => a - b);
    const targetLayer = pick(layers);
    const count = blocks.filter(b => b[2] === targetLayer).length;
    const pal = rand(0, CUBE_PAL.length - 1);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <IsoCubes blocks={blocks} size={100} pal={pal} />
          <br />
          <strong>{targetLayer + 1}층</strong>의 쌓기나무는 몇 개?
        </div>
      ),
      answer: count,
    };
  },

];

function generate(): Problem {
  return pick(generators)();
}

export default function ShapeGame() {
  return <GameShell title="2단원: 여러가지도형" backTo="/math/semester21" generate={generate} maxDigits={2} />;
}
