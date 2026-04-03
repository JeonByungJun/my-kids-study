/**
 * ClassifyGame — 1학기 5단원 "분류하기" 게임
 *
 * GameShell 기반, 5가지 문제 유형:
 *   ① 색깔로 분류    — multiSelect
 *   ② 모양으로 분류  — multiSelect
 *   ③ 분류 기준 맞추기 — choices
 *   ④ 분류 결과 세기  — numpad
 *   ⑤ 올바른 분류 기준 판단 — choices
 */
import GameShell, { type Problem } from '../../../components/GameShell';

// ── 타입 & 상수 ─────────────────────────────────────────────────────────
type Color = 'red' | 'blue' | 'yellow' | 'green';
type Shape = 'circle' | 'triangle' | 'square' | 'star';

const COLORS: Color[] = ['red', 'blue', 'yellow', 'green'];
const SHAPES: Shape[] = ['circle', 'triangle', 'square', 'star'];

const COLOR_EMOJI: Record<Color, string> = {
  red: '🔴', blue: '🔵', yellow: '🟡', green: '🟢',
};
const COLOR_NAMES: Record<Color, string> = {
  red: '빨간색', blue: '파란색', yellow: '노란색', green: '초록색',
};
const SHAPE_NAMES: Record<Shape, string> = {
  circle: '원', triangle: '삼각형', square: '사각형', star: '별',
};

// ── 유틸 ────────────────────────────────────────────────────────────────
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
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

// ── 아이템 생성 (8개: 각 색 2회, 각 모양 2회, 중복 (색,모양) 쌍 없음) ───
interface Item { color: Color; shape: Shape; label: string }

/**
 * 배치 패턴 (cs=셔플 색, ss=셔플 모양):
 *   cs[0]:ss[0], cs[0]:ss[1]
 *   cs[1]:ss[1], cs[1]:ss[2]
 *   cs[2]:ss[2], cs[2]:ss[3]
 *   cs[3]:ss[3], cs[3]:ss[0]
 * → 각 색 2회, 각 모양 2회, 모든 쌍이 유일
 */
function makeItems(): Item[] {
  const cs = shuffle([...COLORS]) as [Color, Color, Color, Color];
  const ss = shuffle([...SHAPES]) as [Shape, Shape, Shape, Shape];
  const pairs: [Color, Shape][] = [
    [cs[0], ss[0]], [cs[0], ss[1]],
    [cs[1], ss[1]], [cs[1], ss[2]],
    [cs[2], ss[2]], [cs[2], ss[3]],
    [cs[3], ss[3]], [cs[3], ss[0]],
  ];
  return shuffle(
    pairs.map(([color, shape]) => ({
      color, shape,
      label: `${COLOR_EMOJI[color]}${SHAPE_NAMES[shape]}`,
    }))
  );
}

// ── 문제 생성기 ──────────────────────────────────────────────────────────
const generators: (() => Problem)[] = [

  /* ① 색깔로 분류 — "빨간색인 것을 모두 고르세요" */
  () => {
    const items = makeItems();
    const target = pick(COLORS);
    const multiAnswer = items.reduce<number[]>((acc, it, i) => {
      if (it.color === target) acc.push(i);
      return acc;
    }, []);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          다음 중<br />
          <strong>{COLOR_NAMES[target]}</strong>인 것을<br />
          모두 고르세요
        </div>
      ),
      answer: 0,
      multiChoices: items.map(it => it.label),
      multiAnswer,
    };
  },

  /* ② 모양으로 분류 — "원을 모두 고르세요" */
  () => {
    const items = makeItems();
    const target = pick(SHAPES);
    const multiAnswer = items.reduce<number[]>((acc, it, i) => {
      if (it.shape === target) acc.push(i);
      return acc;
    }, []);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          다음 중<br />
          <strong>{SHAPE_NAMES[target]}</strong>을(를)<br />
          모두 고르세요
        </div>
      ),
      answer: 0,
      multiChoices: items.map(it => it.label),
      multiAnswer,
    };
  },

  /* ③ 분류 기준 맞추기 — "어떤 기준으로 나누었나요?"
   *   8개 아이템 전체를 두 그룹(각 4개)으로 나눠 표시 */
  () => {
    const items = makeItems();
    const byColor = Math.random() < 0.5;
    let groupA: Item[];
    let groupB: Item[];
    let answerText: string;

    if (byColor) {
      // 색깔 2가지 vs 2가지 → 각 4개
      const cs = shuffle([...COLORS]) as [Color, Color, Color, Color];
      groupA = items.filter(i => i.color === cs[0] || i.color === cs[1]);
      groupB = items.filter(i => i.color === cs[2] || i.color === cs[3]);
      answerText = '색깔';
    } else {
      // 모양 2가지 vs 2가지 → 각 4개
      const ss = shuffle([...SHAPES]) as [Shape, Shape, Shape, Shape];
      groupA = items.filter(i => i.shape === ss[0] || i.shape === ss[1]);
      groupB = items.filter(i => i.shape === ss[2] || i.shape === ss[3]);
      answerText = '모양';
    }

    const choices = shuffle(['색깔', '모양', '크기', '무게']);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.85)', borderRadius: '14px',
              padding: '8px 14px', minWidth: '90px', flex: 1,
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.75em', color: '#555', marginBottom: '4px' }}>그룹 가</div>
              <div style={{ fontSize: '1.1em', lineHeight: 1.6 }}>
                {groupA.map((item, idx) => <span key={idx}>{item.label} </span>)}
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.85)', borderRadius: '14px',
              padding: '8px 14px', minWidth: '90px', flex: 1,
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.75em', color: '#555', marginBottom: '4px' }}>그룹 나</div>
              <div style={{ fontSize: '1.1em', lineHeight: 1.6 }}>
                {groupB.map((item, idx) => <span key={idx}>{item.label} </span>)}
              </div>
            </div>
          </div>
          <strong>어떤 기준으로 나누었나요?</strong>
        </div>
      ),
      answer: choices.indexOf(answerText),
      choices,
    };
  },

  /* ④ 분류 결과 세기 — "사과는 몇 개인가요?" */
  () => {
    const FRUITS = [
      { name: '사과', emoji: '🍎' },
      { name: '바나나', emoji: '🍌' },
      { name: '딸기', emoji: '🍓' },
      { name: '포도', emoji: '🍇' },
    ];
    // 종류별 2~5개로 확대 (현실감 있는 분류 세기 연습)
    const counts: Record<string, number> = {};
    FRUITS.forEach(f => { counts[f.name] = rand(2, 5); });
    const fruitList = shuffle(
      FRUITS.flatMap(f => Array.from({ length: counts[f.name] }, () => f))
    );
    const target = pick(FRUITS);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
            lineHeight: 1.8,
            marginBottom: '12px',
            letterSpacing: '3px',
            wordBreak: 'break-all',
          }}>
            {fruitList.map((f, i) => <span key={i}>{f.emoji} </span>)}
          </div>
          {target.emoji} <strong>{target.name}</strong>는 몇 개인가요?
        </div>
      ),
      answer: counts[target.name],
    };
  },

  /* ⑤ 올바른 분류 기준 판단 — 2학년 수준: 구체적이고 직관적인 기준 판별 */
  () => {
    const QUESTIONS = [
      {
        q: '나누는 기준으로 알맞은 것은?',
        items: ['좋아하는 색깔', '빨간색인 것', '이쁜 것', '먹고 싶은 것'],
        answer: '빨간색인 것',
      },
      {
        q: '"날개가 있는 동물"로\n나눌 수 있나요?',
        items: ['네, 나눌 수 있어요', '아니요, 날개를 셀 수 없어요', '아니요, 너무 어려워요', '아니요, 동물이 아니에요'],
        answer: '네, 나눌 수 있어요',
      },
      {
        q: '"맛있는 과일"로 나누면\n누구나 같은 결과가 나올까요?',
        items: ['네, 항상 같아요', '아니요, 사람마다 달라요', '네, 색깔로 나눠요', '아니요, 과일이 없어요'],
        answer: '아니요, 사람마다 달라요',
      },
      {
        q: '다음 중 모두가 같은 결과로\n나눌 수 있는 기준은?',
        items: ['예쁜 것', '둥근 모양', '좋아하는 것', '맛있는 것'],
        answer: '둥근 모양',
      },
      {
        q: '"파란색인 것"으로 나누면?',
        items: ['사람마다 달라요', '누가 봐도 결과가 같아요', '나눌 수 없어요', '색깔이 없어요'],
        answer: '누가 봐도 결과가 같아요',
      },
    ];
    const q = pick(QUESTIONS);
    const choices = shuffle([...q.items]);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>
          {q.q}
        </div>
      ),
      answer: choices.indexOf(q.answer),
      choices,
    };
  },
];

/* ⑥ 표 읽기 — 분류 결과 표에서 특정 항목의 개수 찾기 (D 유형) */
const genTableRead = (): Problem => {
  const byColor = Math.random() < 0.5;

  if (byColor) {
    const counts = Object.fromEntries(
      COLORS.map(c => [c, rand(1, 5)])
    ) as Record<Color, number>;
    const target = pick(COLORS);

    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 800, marginBottom: '10px' }}>색깔별 물건 수</p>
          <table style={{
            borderCollapse: 'collapse', margin: '0 auto',
            background: 'rgba(255,255,255,0.9)', borderRadius: '10px',
            overflow: 'hidden', fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
          }}>
            <thead>
              <tr style={{ background: '#bee3f8' }}>
                <th style={{ padding: '6px 10px', fontWeight: 800 }}>색깔</th>
                {COLORS.map(c => (
                  <th key={c} style={{ padding: '6px 10px' }}>{COLOR_EMOJI[c]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th style={{ padding: '6px 10px', fontWeight: 700 }}>개수</th>
                {COLORS.map(c => (
                  <td key={c} style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800, color: '#2d3748' }}>
                    {counts[c]}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: '12px', fontWeight: 700 }}>
            {COLOR_EMOJI[target]} <strong>{COLOR_NAMES[target]}</strong>는 몇 개인가요?
          </p>
        </div>
      ),
      answer: counts[target],
    };
  } else {
    const counts = Object.fromEntries(
      SHAPES.map(s => [s, rand(1, 5)])
    ) as Record<Shape, number>;
    const target = pick(SHAPES);

    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 800, marginBottom: '10px' }}>모양별 물건 수</p>
          <table style={{
            borderCollapse: 'collapse', margin: '0 auto',
            background: 'rgba(255,255,255,0.9)', borderRadius: '10px',
            overflow: 'hidden', fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
          }}>
            <thead>
              <tr style={{ background: '#c6f6d5' }}>
                <th style={{ padding: '6px 10px', fontWeight: 800 }}>모양</th>
                {SHAPES.map(s => (
                  <th key={s} style={{ padding: '6px 10px' }}>{SHAPE_NAMES[s]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th style={{ padding: '6px 10px', fontWeight: 700 }}>개수</th>
                {SHAPES.map(s => (
                  <td key={s} style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800, color: '#2d3748' }}>
                    {counts[s]}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: '12px', fontWeight: 700 }}>
            <strong>{SHAPE_NAMES[target]}</strong>는 몇 개인가요?
          </p>
        </div>
      ),
      answer: counts[target],
    };
  }
};

generators.push(genTableRead);

function generate(): Problem {
  return pick(generators)();
}

// ── 컴포넌트 ─────────────────────────────────────────────────────────────
export default function ClassifyGame() {
  return (
    <GameShell
      title="5단원: 분류하기"
      backTo="/math/semester21"
      generate={generate}
    />
  );
}
