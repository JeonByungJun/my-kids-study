import { useParams, Navigate } from 'react-router-dom';
import GameShell, { type Problem } from '../../../components/GameShell';

/* ══════════════════════════════════════
   유형 정의
══════════════════════════════════════ */
export type AddSubType =
  | 'two-add'   // ① 두 자리 수 덧셈
  | 'two-sub'   // ② 두 자리 수 뺄셈
  | 'relation'  // ③ 덧셈·뺄셈의 관계
  | 'missing'   // ④ □ 채우기
  | 'three'     // ⑤ 세 수의 계산
  | 'carry'     // ⑥ 받아올림·받아내림 집중
  | 'story';    // ⑦ 문장제

/* ── 난수 헬퍼 ── */
function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ══════════════════════════════════════
   ① 두 자리 수 덧셈 (받아올림 보장)
══════════════════════════════════════ */
function genTwoAdd(): Problem {
  // 받아올림 보장: 일의 자리 합 >= 10
  const aOnes = rnd(2, 9);
  const bOnes = rnd(Math.max(1, 10 - aOnes), 9);
  const aTens = rnd(1, 6);
  const bTens = rnd(1, 6);
  const a = aTens * 10 + aOnes;
  const b = bTens * 10 + bOnes;
  const useVertical = Math.random() < 0.4; // 40% 확률 세로셈
  return {
    display: useVertical ? (
      <div className="addsub-vertical">
        <div className="vert-top">{a}</div>
        <div className="vert-op-row">
          <span className="vert-op">+</span>
          <span className="vert-num">{b}</span>
        </div>
        <div className="vert-divider" />
      </div>
    ) : (
      <div className="addsub-horz">
        <span className="addsub-num">{a}</span>
        <span className="addsub-op"> + </span>
        <span className="addsub-num">{b}</span>
        <span className="addsub-eq"> = </span>
        <span className="q-mark">?</span>
      </div>
    ),
    answer: a + b,
  };
}

/* ══════════════════════════════════════
   ② 두 자리 수 뺄셈 (받아내림 보장)
══════════════════════════════════════ */
function genTwoSub(): Problem {
  // 받아내림 보장: bOnes > aOnes (일의 자리에서 뺄 수 없는 경우)
  const aOnes = rnd(0, 7);
  const bOnes = rnd(aOnes + 1, 9);
  const bTens = rnd(1, 5);
  const aTens = rnd(bTens + 1, bTens + 4); // a > b 보장
  const a = aTens * 10 + aOnes;
  const b = bTens * 10 + bOnes;
  const useVertical = Math.random() < 0.4; // 40% 확률 세로셈
  return {
    display: useVertical ? (
      <div className="addsub-vertical">
        <div className="vert-top">{a}</div>
        <div className="vert-op-row">
          <span className="vert-op">−</span>
          <span className="vert-num">{b}</span>
        </div>
        <div className="vert-divider" />
      </div>
    ) : (
      <div className="addsub-horz">
        <span className="addsub-num">{a}</span>
        <span className="addsub-op"> − </span>
        <span className="addsub-num">{b}</span>
        <span className="addsub-eq"> = </span>
        <span className="q-mark">?</span>
      </div>
    ),
    answer: a - b,
  };
}

/* ══════════════════════════════════════
   ③ 덧셈·뺄셈의 관계
══════════════════════════════════════ */
function genRelation(): Problem {
  const a = rnd(5, 45);
  const b = rnd(5, 45);
  const c = a + b;
  const askB = Math.random() < 0.5; // true: c-a=? / false: c-b=?
  return {
    display: (
      <div className="addsub-relation">
        <div className="relation-given">
          <span className="addsub-num">{a}</span>
          <span className="addsub-op"> + </span>
          <span className="addsub-num">{b}</span>
          <span className="addsub-eq"> = </span>
          <span className="rel-ans">{c}</span>
        </div>
        <div className="relation-arrow">이므로 ↓</div>
        <div className="relation-ask">
          <span className="addsub-num">{c}</span>
          <span className="addsub-op"> − </span>
          <span className="rel-known">{askB ? a : b}</span>
          <span className="addsub-eq"> = </span>
          <span className="q-mark">?</span>
        </div>
      </div>
    ),
    answer: askB ? b : a,
  };
}

/* ══════════════════════════════════════
   ④ □ 채우기 (미지수)
══════════════════════════════════════ */
function genMissing(): Problem {
  const level = rnd(1, 4) as 1 | 2 | 3 | 4;

  if (level === 1) {
    // □ + a = b  →  missing = b - a
    const missing = rnd(10, 55);
    const a = rnd(5, 40);
    const b = missing + a;
    return {
      display: (
        <div className="addsub-missing">
          <span className="miss-box">□</span>
          <span className="addsub-op"> + </span>
          <span className="addsub-num">{a}</span>
          <span className="addsub-eq"> = </span>
          <span className="addsub-num">{b}</span>
        </div>
      ),
      answer: missing,
    };
  }

  if (level === 2) {
    // a + □ = b  →  missing = b - a
    const a = rnd(5, 40);
    const missing = rnd(10, 55);
    const b = a + missing;
    return {
      display: (
        <div className="addsub-missing">
          <span className="addsub-num">{a}</span>
          <span className="addsub-op"> + </span>
          <span className="miss-box">□</span>
          <span className="addsub-eq"> = </span>
          <span className="addsub-num">{b}</span>
        </div>
      ),
      answer: missing,
    };
  }

  if (level === 3) {
    // a − □ = b  →  missing = a - b
    const missing = rnd(5, 35);
    const b = rnd(5, 40);
    const a = b + missing;
    return {
      display: (
        <div className="addsub-missing">
          <span className="addsub-num">{a}</span>
          <span className="addsub-op"> − </span>
          <span className="miss-box">□</span>
          <span className="addsub-eq"> = </span>
          <span className="addsub-num">{b}</span>
        </div>
      ),
      answer: missing,
    };
  }

  // level 4: □ − a = b  →  missing = a + b
  const a = rnd(5, 35);
  const b = rnd(5, 40);
  const missing = a + b;
  return {
    display: (
      <div className="addsub-missing">
        <span className="miss-box">□</span>
        <span className="addsub-op"> − </span>
        <span className="addsub-num">{a}</span>
        <span className="addsub-eq"> = </span>
        <span className="addsub-num">{b}</span>
      </div>
    ),
    answer: missing,
  };
}

/* ══════════════════════════════════════
   ⑤ 세 수의 계산
══════════════════════════════════════ */
function genThree(): Problem {
  const type = rnd(1, 3) as 1 | 2 | 3;

  if (type === 1) {
    // a + b + c
    const a = rnd(5, 40);
    const b = rnd(5, 35);
    const c = rnd(5, 25);
    return {
      display: (
        <div className="addsub-three">
          <div className="three-hint">앞에서부터 차례로 계산해요 😊</div>
          <div className="addsub-horz">
            <span className="addsub-num">{a}</span>
            <span className="addsub-op"> + </span>
            <span className="addsub-num">{b}</span>
            <span className="addsub-op"> + </span>
            <span className="addsub-num">{c}</span>
            <span className="addsub-eq"> = </span>
            <span className="q-mark">?</span>
          </div>
        </div>
      ),
      answer: a + b + c,
    };
  }

  if (type === 2) {
    // a - b - c  (b+c < a 보장)
    const b = rnd(5, 20);
    const c = rnd(5, 20);
    const a = b + c + rnd(5, 30);
    return {
      display: (
        <div className="addsub-three">
          <div className="three-hint">앞에서부터 차례로 계산해요 😊</div>
          <div className="addsub-horz">
            <span className="addsub-num">{a}</span>
            <span className="addsub-op"> − </span>
            <span className="addsub-num">{b}</span>
            <span className="addsub-op"> − </span>
            <span className="addsub-num">{c}</span>
            <span className="addsub-eq"> = </span>
            <span className="q-mark">?</span>
          </div>
        </div>
      ),
      answer: a - b - c,
    };
  }

  // type 3: a + b - c  (결과 >= 1 보장)
  const a = rnd(10, 50);
  const b = rnd(10, 50);
  const c = rnd(5, Math.min(a + b - 1, 55));
  return {
    display: (
      <div className="addsub-three">
        <div className="three-hint">앞에서부터 차례로 계산해요 😊</div>
        <div className="addsub-horz">
          <span className="addsub-num">{a}</span>
          <span className="addsub-op"> + </span>
          <span className="addsub-num">{b}</span>
          <span className="addsub-op"> − </span>
          <span className="addsub-num">{c}</span>
          <span className="addsub-eq"> = </span>
          <span className="q-mark">?</span>
        </div>
      </div>
    ),
    answer: a + b - c,
  };
}

/* ══════════════════════════════════════
   ⑥ 받아올림·받아내림 집중 (세로셈)
══════════════════════════════════════ */
function genCarry(): Problem {
  const isAdd = Math.random() < 0.5;

  if (isAdd) {
    // 일의 자리 합 >= 10 보장하여 직접 생성
    const aOnes = rnd(2, 9);
    const bOnes = rnd(Math.max(1, 10 - aOnes), 9);
    const aTens = rnd(1, 7);
    const bTens = rnd(1, 9 - aTens);
    const a = aTens * 10 + aOnes;
    const b = bTens * 10 + bOnes;
    return {
      display: (
        <div className="addsub-vertical">
          <div className="vert-top">{a}</div>
          <div className="vert-op-row">
            <span className="vert-op">+</span>
            <span className="vert-num">{b}</span>
          </div>
          <div className="vert-divider" />
        </div>
      ),
      answer: a + b,
    };
  }

  // 뺄셈: bOnes > aOnes 보장하여 받아내림 발생
  const aOnes = rnd(0, 7);
  const bOnes = rnd(aOnes + 1, 9);
  const bTens = rnd(1, 7);
  // aTens > bTens 보장(a > b 위해)
  const aTens = rnd(bTens + 1, bTens + 4);
  const a = aTens * 10 + aOnes;
  const b = bTens * 10 + bOnes;
  return {
    display: (
      <div className="addsub-vertical">
        <div className="vert-top">{a}</div>
        <div className="vert-op-row">
          <span className="vert-op">−</span>
          <span className="vert-num">{b}</span>
        </div>
        <div className="vert-divider" />
      </div>
    ),
    answer: a - b,
  };
}

/* ══════════════════════════════════════
   ⑦ 문장제
══════════════════════════════════════ */
function genStory(): Problem {
  const type = rnd(1, 5) as 1 | 2 | 3 | 4 | 5;

  if (type === 1) {
    // "어떤 수에 {a}를 더했더니 {c}가 되었습니다."
    const missing = rnd(10, 60);
    const a = rnd(5, 35);
    const c = missing + a;
    return {
      display: (
        <div className="story-problem">
          <p>어떤 수에 <strong>{a}</strong>를 더했더니</p>
          <p><strong>{c}</strong>이(가) 되었습니다.</p>
          <p className="story-q">어떤 수는 얼마일까요?</p>
        </div>
      ),
      answer: missing,
    };
  }

  if (type === 2) {
    // "어떤 수에서 {a}를 뺐더니 {c}가 되었습니다."
    const a = rnd(5, 35);
    const c = rnd(5, 40);
    const missing = c + a;
    return {
      display: (
        <div className="story-problem">
          <p>어떤 수에서 <strong>{a}</strong>를 뺐더니</p>
          <p><strong>{c}</strong>이(가) 되었습니다.</p>
          <p className="story-q">어떤 수는 얼마일까요?</p>
        </div>
      ),
      answer: missing,
    };
  }

  if (type === 3) {
    // 덧셈 상황: "과일 {a}개와 과일 {b}개, 모두?"
    // maxDigits:2 제한으로 합계 ≤ 99 보장 (각 최대 44+44=88)
    const fruits = ['사과', '귤', '복숭아', '딸기', '포도', '바나나'];
    const f1 = fruits[rnd(0, 5)];
    let f2Idx = rnd(0, 5);
    while (fruits[f2Idx] === f1) f2Idx = rnd(0, 5);
    const f2 = fruits[f2Idx];
    const a = rnd(10, 44);
    const b = rnd(10, 44);
    return {
      display: (
        <div className="story-problem">
          <p><strong>{f1}</strong> <strong>{a}</strong>개와</p>
          <p><strong>{f2}</strong> <strong>{b}</strong>개가 있습니다.</p>
          <p className="story-q">모두 몇 개일까요?</p>
        </div>
      ),
      answer: a + b,
    };
  }

  if (type === 4) {
    // 뺄셈 상황: "물건 {a}개 중 {b}개를 나눠줬다"
    const items = ['구슬', '색연필', '사탕', '스티커', '공깃돌'];
    const item = items[rnd(0, 4)];
    const b = rnd(5, 40);
    const a = b + rnd(5, 40);
    return {
      display: (
        <div className="story-problem">
          <p><strong>{item}</strong> <strong>{a}</strong>개 중에서</p>
          <p><strong>{b}</strong>개를 나눠줬습니다.</p>
          <p className="story-q">몇 개가 남을까요?</p>
        </div>
      ),
      answer: a - b,
    };
  }

  // type 5: 차이 구하기
  const bigger = rnd(30, 90);
  const smaller = rnd(10, bigger - 5);
  const nouns = [
    ['형', '동생'],
    ['언니', '나'],
    ['파란 팀', '빨간 팀'],
    ['토끼', '거북이'],
  ];
  const [n1, n2] = nouns[rnd(0, 3)];
  return {
    display: (
      <div className="story-problem">
        <p><strong>{n1}</strong>은 <strong>{bigger}</strong>점,</p>
        <p><strong>{n2}</strong>은 <strong>{smaller}</strong>점입니다.</p>
        <p className="story-q">몇 점 차이일까요?</p>
      </div>
    ),
    answer: bigger - smaller,
  };
}

/* ══════════════════════════════════════
   설정 맵
══════════════════════════════════════ */
const CONFIG: Record<
  AddSubType,
  { title: string; generate: () => Problem; maxDigits: number }
> = {
  'two-add':  { title: '두 자리 수 덧셈',   generate: genTwoAdd,   maxDigits: 3 },
  'two-sub':  { title: '두 자리 수 뺄셈',   generate: genTwoSub,   maxDigits: 2 },
  'relation': { title: '덧셈·뺄셈의 관계',  generate: genRelation, maxDigits: 2 },
  'missing':  { title: '□ 채우기',          generate: genMissing,  maxDigits: 2 },
  'three':    { title: '세 수의 계산',       generate: genThree,    maxDigits: 3 },
  'carry':    { title: '받아올림·받아내림', generate: genCarry,    maxDigits: 3 },
  'story':    { title: '문장제',             generate: genStory,    maxDigits: 2 },
};

/* ══════════════════════════════════════
   컴포넌트
══════════════════════════════════════ */
export default function AddSubGame() {
  const { type } = useParams<{ type: string }>();
  const config = type ? CONFIG[type as AddSubType] : undefined;

  if (!config) {
    return <Navigate to="/math/calc/addsub" replace />;
  }

  return (
    <GameShell
      title={config.title}
      backTo="/math/calc/addsub"
      generate={config.generate}
      maxDigits={config.maxDigits}
    />
  );
}
