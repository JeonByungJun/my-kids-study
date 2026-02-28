import GameShell from '../../components/GameShell';
import type { Problem } from '../../components/GameShell';

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
];

function generate(): Problem {
  return pick(generators)();
}

export default function ShapeGame() {
  return <GameShell title="2단원: 여러가지도형" backTo="/math/semester21" generate={generate} maxDigits={2} />;
}
