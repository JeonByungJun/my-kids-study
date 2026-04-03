/**
 * TimeGame — 4단원 "시각과 시간" 게임 (확장판)
 *
 * ClockSVG를 활용한 6가지 문제 유형:
 *   ① 아날로그 시계 → 시각 고르기   (choices)
 *   ② 디지털 표시 → 시각 텍스트     (choices)
 *   ③ 시침이 가리키는 숫자           (choices)
 *   ④ 분침이 나타내는 분             (choices)
 *   ⑤ N시간 후 시각 계산             (numpad, maxDigits:2)
 *   ⑥ 걸린 시간 구하기 (두 시계 비교) (choices)
 */
import GameShell, { type Problem } from '../../../components/GameShell';
import ClockSVG from '../../../components/ClockSVG';

// ── 유틸 ────────────────────────────────────────────────────────────────
function rand(min: number, max: number): number {
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

// ── 시각 헬퍼 ────────────────────────────────────────────────────────────
/** 5분 단위 랜덤 시각 반환 (hour: 0=12시, 1~11) */
function randomTime(): { hour: number; minute: number } {
  return { hour: rand(0, 11), minute: rand(0, 11) * 5 };
}

/** "X시 Y분" 형식 (분=0이면 "X시") */
function fmt(h: number, m: number): string {
  const h12 = h === 0 ? 12 : h;
  return m === 0 ? `${h12}시` : `${h12}시 ${m}분`;
}

/** 정답 외 오답 3개 생성 */
function makeWrongTimes(correct: string): string[] {
  const wrongs = new Set<string>();
  while (wrongs.size < 3) {
    const { hour: wh, minute: wm } = randomTime();
    const w = fmt(wh, wm);
    if (w !== correct) wrongs.add(w);
  }
  return [...wrongs];
}

// ── 문제 생성기 ──────────────────────────────────────────────────────────
const generators: (() => Problem)[] = [

  /* ① 아날로그 시계 → 시각 고르기 */
  () => {
    const { hour, minute } = randomTime();
    const correct = fmt(hour, minute);
    const choices = shuffle([correct, ...makeWrongTimes(correct)]);
    return {
      display: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p className="quiz-text" style={{ textAlign: 'center', margin: 0 }}>
            시계가 나타내는 <strong>시각</strong>은?
          </p>
          <ClockSVG hour={hour} minute={minute} readOnly showLabel={false} />
        </div>
      ),
      answer: choices.indexOf(correct),
      choices,
    };
  },

  /* ② 디지털 표시 → 한글 시각 텍스트 */
  () => {
    const { hour, minute } = randomTime();
    const h12 = hour === 0 ? 12 : hour;
    const correct = fmt(hour, minute);
    const choices = shuffle([correct, ...makeWrongTimes(correct)]);
    return {
      display: (
        <div className="quiz-text" style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'clamp(1.8rem, 7vw, 2.6rem)',
            fontWeight: 900,
            fontFamily: "'Courier New', monospace",
            letterSpacing: '4px',
            color: '#2d3748',
            background: 'rgba(255,255,255,.88)',
            borderRadius: '20px',
            padding: '10px 24px',
            margin: '8px auto',
            boxShadow: '0 6px 0 rgba(0,0,0,.08)',
            display: 'inline-block',
          }}>
            {String(h12).padStart(2, '0')} : {String(minute).padStart(2, '0')}
          </div>
          <br />이 <strong>디지털 시각</strong>은?
        </div>
      ),
      answer: choices.indexOf(correct),
      choices,
    };
  },

  /* ③ 시침이 가리키는 숫자 */
  () => {
    const hour = rand(0, 11);
    const h12 = hour === 0 ? 12 : hour;
    const allH = Array.from({ length: 12 }, (_, i) => i + 1); // 1~12
    const wrongs = shuffle(allH.filter(n => n !== h12)).slice(0, 3);
    const choices = shuffle([h12, ...wrongs]).map(n => `${n}`);
    return {
      display: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p className="quiz-text" style={{ textAlign: 'center', margin: 0 }}>
            <strong>시침</strong>이 가리키는 숫자는?
          </p>
          <ClockSVG hour={hour} minute={0} readOnly showLabel={false} />
        </div>
      ),
      answer: choices.indexOf(`${h12}`),
      choices,
    };
  },

  /* ④ 분침이 나타내는 분 */
  () => {
    const minute = rand(0, 11) * 5;
    const hour = rand(0, 11);
    const allMinutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0~55 (5분 단위)
    const wrongs = shuffle(allMinutes.filter(m => m !== minute)).slice(0, 3);
    const choices = shuffle([minute, ...wrongs]).map(m => `${m}분`);
    return {
      display: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p className="quiz-text" style={{ textAlign: 'center', margin: 0 }}>
            <strong>분침</strong>이 나타내는 <strong>분</strong>은?
          </p>
          <ClockSVG hour={hour} minute={minute} readOnly showLabel={false} />
        </div>
      ),
      answer: choices.indexOf(`${minute}분`),
      choices,
    };
  },

  /* ⑤ N시간 후 시각 계산 (numpad) */
  /* 예: "3시에서 2시간 후는 몇 시?" → 5 */
  () => {
    const startH = rand(1, 9);            // 1~9시 시작 (12시간 경계 초과 방지)
    const delta = rand(1, 3);             // 1~3시간 후
    // 1~12 범위의 종료 시각 계산
    const endH = ((startH - 1 + delta) % 12) + 1;
    return {
      display: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p className="quiz-text" style={{ textAlign: 'center', margin: 0 }}>
            <strong>{startH}시</strong>에서 <strong>{delta}시간 후</strong>는<br />
            몇 시인가요?
          </p>
          <ClockSVG hour={startH} minute={0} readOnly showLabel={false} />
        </div>
      ),
      answer: endH,   // numpad로 입력; maxDigits=2 이면 10, 11, 12도 입력 가능
    };
  },

  /* ⑥ 걸린 시간 구하기 — 두 시계 비교 (choices) */
  /* 예: [시계 2시] → [시계 5시] "몇 시간 동안 했나요?" → "3시간" */
  () => {
    const startH = rand(1, 8);
    const duration = rand(1, 4);
    const endH = startH + duration;       // 최대 8+4=12, 항상 유효
    const correct = `${duration}시간`;
    const allDur = [1, 2, 3, 4, 5];
    const wrongs = shuffle(allDur.filter(d => d !== duration))
      .slice(0, 3)
      .map(d => `${d}시간`);
    const choices = shuffle([correct, ...wrongs]);
    return {
      display: (
        <div style={{ textAlign: 'center' }}>
          <p className="quiz-text" style={{ marginTop: 0, marginBottom: '6px' }}>
            몇 시간 동안 했나요?
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <ClockSVG hour={startH} minute={0} readOnly showLabel={false} size={120} />
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#666', marginTop: '2px' }}>
                시작
              </div>
            </div>
            <span style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              color: '#aaa',
              marginBottom: '22px',
            }}>
              →
            </span>
            <div style={{ textAlign: 'center' }}>
              <ClockSVG hour={endH % 12} minute={0} readOnly showLabel={false} size={120} />
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#666', marginTop: '2px' }}>
                끝
              </div>
            </div>
          </div>
        </div>
      ),
      answer: choices.indexOf(correct),
      choices,
    };
  },
];

function generate(): Problem {
  return pick(generators)();
}

// ── 컴포넌트 ─────────────────────────────────────────────────────────────
export default function TimeGame() {
  return (
    <GameShell
      title="4단원: 시각과 시간"
      backTo="/math/semester22"
      generate={generate}
      maxDigits={2}
    />
  );
}
