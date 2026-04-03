/**
 * LengthCmMGame — 2학기 3단원 "길이 재기 (m와 cm)" 게임
 *
 * GameShell 기반, 5가지 문제 유형:
 *   ① m·cm → cm 변환   — numpad (maxDigits: 3)
 *   ② cm → m·cm 변환   — choices
 *   ③ 길이의 합          — choices
 *   ④ 길이의 차          — choices
 *   ⑤ 길이 어림 (실생활) — choices
 *
 * 핵심 개념: 1m = 100cm, m와 cm 단위 혼합 표기
 */
import GameShell, { type Problem } from '../../../components/GameShell';

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

/** cm 값을 "Xm Ycm" / "Xm" / "Ycm" 형식으로 변환 */
function fmtLen(totalCm: number): string {
  const m = Math.floor(totalCm / 100);
  const cm = totalCm % 100;
  if (m === 0) return `${cm}cm`;
  if (cm === 0) return `${m}m`;
  return `${m}m ${cm}cm`;
}

/** 정답과 다른 오답 3개 생성 */
function makeWrongs(correctCm: number): string[] {
  const wrongs: string[] = [];
  const used = new Set<string>([fmtLen(correctCm)]);
  // 우선 순위 델타 후보
  for (const d of [10, -10, 100, -100, 20, -20, 50, 30, -30, 5]) {
    const v = correctCm + d;
    if (v > 0 && v < 1000) {
      const s = fmtLen(v);
      if (!used.has(s)) {
        wrongs.push(s);
        used.add(s);
        if (wrongs.length === 3) break;
      }
    }
  }
  // 폴백 (거의 발생 안 하지만 안전망)
  let extra = 10;
  while (wrongs.length < 3) {
    const v = correctCm + extra;
    if (v > 0 && v < 1000) {
      const s = fmtLen(v);
      if (!used.has(s)) { wrongs.push(s); used.add(s); }
    }
    extra += 10;
  }
  return wrongs.slice(0, 3);
}

// ── 문제 생성기 ──────────────────────────────────────────────────────────
const generators: (() => Problem)[] = [

  /* ① m·cm → cm 변환 (numpad) */
  /* 예: "2m 30cm는 몇 cm인가요?" → 230 */
  () => {
    const m = rand(1, 5);
    const cm = rand(0, 9) * 10;           // 0, 10, 20, …, 90
    const total = m * 100 + cm;
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <strong>{m}m{cm > 0 ? ` ${cm}cm` : ''}</strong>는<br />
          몇 cm인가요?
        </div>
      ),
      answer: total,
    };
  },

  /* ② cm → m·cm 변환 (choices) */
  /* 예: "230cm를 m와 cm로 나타내면?" → "2m 30cm" */
  () => {
    const m = rand(1, 5);
    const cm = rand(1, 9) * 10;           // 10~90 (cm 파트가 항상 있음)
    const total = m * 100 + cm;
    const correct = fmtLen(total);
    const choices = shuffle([correct, ...makeWrongs(total)]);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <strong>{total}cm</strong>를<br />
          m와 cm로 나타내면?
        </div>
      ),
      answer: choices.indexOf(correct),
      choices,
    };
  },

  /* ③ 길이의 합 (choices) */
  /* 예: "1m 30cm + 2m 40cm = ?" → "3m 70cm" */
  /* cm 합이 100 미만이 되도록 제한 (Level 1) */
  () => {
    const m1 = rand(1, 3), cm1 = rand(1, 4) * 10;   // 10~40
    const m2 = rand(1, 3), cm2 = rand(0, 4) * 10;   // 0~40
    const total = m1 * 100 + cm1 + m2 * 100 + cm2;
    const correct = fmtLen(total);
    const choices = shuffle([correct, ...makeWrongs(total)]);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <strong>{fmtLen(m1 * 100 + cm1)}</strong><br />
          + <strong>{fmtLen(m2 * 100 + cm2)}</strong><br />
          = ?
        </div>
      ),
      answer: choices.indexOf(correct),
      choices,
    };
  },

  /* ④ 길이의 차 (choices) */
  /* 예: "3m 80cm − 1m 50cm = ?" → "2m 30cm" */
  /* m2 < m1, cm2 < cm1 이 되도록 생성 (받아내림 없음) */
  () => {
    const m1 = rand(2, 6);
    const cm1 = rand(2, 9) * 10;                              // 20~90
    const m2 = rand(1, m1 - 1);
    const cm2 = rand(0, Math.floor(cm1 / 10) - 1) * 10;      // 0 ~ (cm1-10)
    const total1 = m1 * 100 + cm1;
    const total2 = m2 * 100 + cm2;
    const diff = total1 - total2;                             // 항상 양수
    const correct = fmtLen(diff);
    const choices = shuffle([correct, ...makeWrongs(diff)]);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <strong>{fmtLen(total1)}</strong><br />
          − <strong>{fmtLen(total2)}</strong><br />
          = ?
        </div>
      ),
      answer: choices.indexOf(correct),
      choices,
    };
  },

  /* ⑤ 길이 어림 — 실생활 m 단위 감각 */
  () => {
    const ITEMS = [
      {
        q: '교실 문의 높이는 약?',
        correct: '2m',
        wrongs: ['20cm', '20m', '200m'],
      },
      {
        q: '어른의 키는 약?',
        correct: '1m 70cm',
        wrongs: ['70cm', '17m', '170m'],
      },
      {
        q: '책상의 높이는 약?',
        correct: '70cm',
        wrongs: ['7cm', '7m', '70m'],
      },
      {
        q: '교실의 가로 길이는 약?',
        correct: '8m',
        wrongs: ['80cm', '80m', '8cm'],
      },
      {
        q: '연필의 길이는 약?',
        correct: '18cm',
        wrongs: ['1m 80cm', '180cm', '1cm'],
      },
      {
        q: '칠판의 가로 길이는 약?',
        correct: '3m',
        wrongs: ['30cm', '30m', '300m'],
      },
      {
        q: '아파트 한 층의 높이는 약?',
        correct: '3m',
        wrongs: ['30cm', '3cm', '300m'],
      },
    ];
    const item = pick(ITEMS);
    const choices = shuffle([item.correct, ...item.wrongs]);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          {item.q}
        </div>
      ),
      answer: choices.indexOf(item.correct),
      choices,
    };
  },
];

function generate(): Problem {
  return pick(generators)();
}

// ── 컴포넌트 ─────────────────────────────────────────────────────────────
export default function LengthCmMGame() {
  return (
    <GameShell
      title="3단원: 길이재기 (m·cm)"
      backTo="/math/semester22"
      generate={generate}
      maxDigits={3}
    />
  );
}
