import GameShell from '../../../components/GameShell';
import type { Problem } from '../../../components/GameShell';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

const generators: (() => Problem)[] = [
  /* ① 자릿값 — "385에서 십의 자리 숫자는?" */
  () => {
    const n = rand(100, 999);
    const places = ['백', '십', '일'] as const;
    const idx = rand(0, 2);
    const digit =
      idx === 0 ? Math.floor(n / 100) : idx === 1 ? Math.floor((n % 100) / 10) : n % 10;
    return {
      display: (
        <div className="quiz-text">
          <strong>{n}</strong>에서
          <br />
          <strong>{places[idx]}의 자리</strong> 숫자는?
        </div>
      ),
      answer: digit,
      hint: '세 자리 수에서 왼쪽부터 백 → 십 → 일의 자리예요! 예) 385 → 백=3, 십=8, 일=5',
    };
  },

  /* ② 뛰어세기 (10씩 / 100씩) */
  () => {
    const step = pick([10, 100]);
    const maxStart = step === 100 ? 500 : 700;
    const start = rand(100, maxStart);
    const count = rand(2, 4);
    const nums = Array.from({ length: count }, (_, i) => start + step * i);
    return {
      display: (
        <div className="quiz-text">
          {step}씩 뛰어세기
          <br />
          {nums.join(', ')}, <strong>?</strong>
        </div>
      ),
      answer: start + step * count,
      hint: step === 100
        ? '100씩 뛰어세면 백의 자리가 1씩 커져요!'
        : '10씩 뛰어세면 십의 자리가 1씩 커져요!',
    };
  },

  /* ③ 수 구성 — "100이 5, 10이 3, 1이 8인 수" (0인 자리 생략) */
  () => {
    const h = rand(1, 9);
    const t = rand(0, 9);
    const o = rand(0, 9);
    const parts: string[] = [`100이 ${h}`];
    if (t) parts.push(`10이 ${t}`);
    if (o) parts.push(`1이 ${o}`);
    return {
      display: (
        <div className="quiz-text">
          {parts.join(', ')}인
          <br />수는?
        </div>
      ),
      answer: h * 100 + t * 10 + o,
      hint: '100이 a개 → a×100, 10이 b개 → b×10, 1이 c개 → c, 이것들을 모두 더해요!',
    };
  },

  /* ④ 크기 비교 — 큰 수 고르기 */
  () => {
    let a: number, b: number;
    do {
      a = rand(100, 999);
      b = rand(100, 999);
    } while (a === b);
    const isBig = Math.random() < 0.5;
    return {
      display: (
        <div className="quiz-text">
          두 수 중 더 <strong>{isBig ? '큰' : '작은'}</strong> 수는?
          <br />
          {a} , {b}
        </div>
      ),
      answer: isBig ? Math.max(a, b) : Math.min(a, b),
      hint: '백의 자리부터 비교해요! 백이 같으면 십, 그 다음 일의 자리 순서로 비교해요.',
    };
  },

  /* ⑤ n보다 1/10/100 큰/작은 수 */
  () => {
    const delta = pick([1, 10, 100]);
    const isAdd = Math.random() < 0.5;
    const n = isAdd ? rand(100, 999 - delta) : rand(100 + delta, 999);
    const placeLabel = delta === 1 ? '일의 자리' : delta === 10 ? '십의 자리' : '백의 자리';
    return {
      display: (
        <div className="quiz-text">
          <strong>{n}</strong>보다
          <br />
          {delta} {isAdd ? '큰' : '작은'} 수는?
        </div>
      ),
      answer: isAdd ? n + delta : n - delta,
      hint: `${placeLabel}에 1을 ${isAdd ? '더하면' : '빼면'} 돼요!`,
    };
  },

  /* ⑥ 숫자 카드로 가장 큰/작은 세자리수 */
  () => {
    // 0이 포함될 수 있게
    const hasZero = Math.random() < 0.4;
    let digits: number[];
    if (hasZero) {
      digits = [0, rand(1, 9), rand(1, 9)];
    } else {
      digits = [rand(1, 9), rand(1, 9), rand(1, 9)];
    }
    // 셔플
    digits.sort(() => Math.random() - 0.5);
    const isBig = Math.random() < 0.5;
    const sorted = [...digits].sort((a, b) => (isBig ? b - a : a - b));
    // 가장 작은 수: 백의 자리에 0 불가
    let answer: number;
    if (isBig) {
      answer = sorted[0] * 100 + sorted[1] * 10 + sorted[2];
    } else {
      // 0이 맨 앞에 오면 다음 작은 수를 백의 자리로
      const s = [...digits].sort((a, b) => a - b);
      if (s[0] === 0) {
        answer = s[1] * 100 + s[0] * 10 + s[2];
      } else {
        answer = s[0] * 100 + s[1] * 10 + s[2];
      }
    }
    return {
      display: (
        <div className="quiz-text">
          숫자 카드 [{digits.join(', ')}](으)로
          <br />
          가장 <strong>{isBig ? '큰' : '작은'}</strong> 세자리수는?
        </div>
      ),
      answer,
      hint: isBig
        ? '가장 큰 수를 만들려면 큰 숫자를 앞자리(백의 자리)부터 놓아요!'
        : '가장 작은 수를 만들려면 작은 숫자를 앞자리에 놓아요. 단, 0은 백의 자리에 올 수 없어요!',
    };
  },

  /* ⑦ n에서 m씩 k번 뛰어세기 */
  () => {
    const step = pick([10, 100]);
    const times = rand(2, 7);
    const maxStart = step === 100 ? 999 - step * times : 999 - step * times;
    const start = rand(100, Math.max(100, maxStart));
    return {
      display: (
        <div className="quiz-text">
          <strong>{start}</strong>에서
          <br />
          {step}씩 {times}번 뛰어세면?
        </div>
      ),
      answer: start + step * times,
      hint: `시작 수에서 ${step}씩 ${times}번 더해요! ${start} + (${step} × ${times})를 계산해봐요.`,
    };
  },

];

function generate(): Problem {
  return pick(generators)();
}

export default function ThreeDigitGame() {
  return <GameShell title="1단원: 세자리수" backTo="/math/semester21" generate={generate} />;
}
