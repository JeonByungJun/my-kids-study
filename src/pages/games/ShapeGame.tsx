import GameShell from '../../components/GameShell';
import type { Problem } from '../../components/GameShell';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[rand(0, arr.length - 1)];
}

/* 도형 데이터 */
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

const generators: (() => Problem)[] = [
  /* ① 변의 개수 */
  () => {
    const s = pick(SHAPES);
    return {
      display: (
        <div className="quiz-text">
          <strong>{s.name}</strong>의
          <br />
          변은 몇 개?
        </div>
      ),
      answer: s.sides,
    };
  },

  /* ② 꼭짓점의 개수 */
  () => {
    const s = pick(SHAPES);
    return {
      display: (
        <div className="quiz-text">
          <strong>{s.name}</strong>의
          <br />
          꼭짓점은 몇 개?
        </div>
      ),
      answer: s.vertices,
    };
  },

  /* ③ 변 + 꼭짓점 합 */
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

  /* ④ 두 도형의 변(또는 꼭짓점) 차이 */
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

  /* ⑤ 여러 도형의 변의 합 */
  () => {
    const count = rand(2, 3);
    const chosen = Array.from({ length: count }, () => pick(POLY));
    const total = chosen.reduce((sum, s) => sum + s.sides, 0);
    return {
      display: (
        <div className="quiz-text">
          {chosen.map((s) => s.name).join(', ')}의
          <br />
          <strong>변의 수의 합</strong>은?
        </div>
      ),
      answer: total,
    };
  },

  /* ⑥ 복합 연산 (ㅇ의 변 − ㅇ의 꼭짓점 + ㅇ의 꼭짓점) */
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

  /* ⑦ 조건 추리 → 변의 개수로 답 */
  () => {
    // "변이 X개보다 많고 꼭짓점이 Y개보다 적은 도형"
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

  /* ⑧ 꼭짓점이 가장 많은/적은 도형 */
  () => {
    const count = rand(2, 3);
    const chosen: Shape[] = [];
    const used = new Set<string>();
    while (chosen.length < count) {
      const s = pick(POLY);
      if (!used.has(s.name)) {
        chosen.push(s);
        used.add(s.name);
      }
    }
    const isMost = Math.random() < 0.5;
    const prop = pick(['변', '꼭짓점']);
    const vals = chosen.map((s) => (prop === '변' ? s.sides : s.vertices));
    const answer = isMost ? Math.max(...vals) : Math.min(...vals);
    return {
      display: (
        <div className="quiz-text">
          {chosen.map((s) => s.name).join(', ')} 중<br />
          {prop}이 가장 {isMost ? '많은' : '적은'} 도형의
          <br />
          <strong>{prop}은 몇 개</strong>?
        </div>
      ),
      answer,
    };
  },
];

function generate(): Problem {
  return pick(generators)();
}

export default function ShapeGame() {
  return <GameShell title="2단원: 여러가지도형" backTo="/math/semester21" generate={generate} maxDigits={2} />;
}
