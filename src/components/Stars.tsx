import { useMemo } from 'react';

export default function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const size = Math.random() * 12 + 4;
      return (
        <div
          key={i}
          className="star"
          style={{
            width: size,
            height: size,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 12 + 8}s`,
            animationDelay: `-${Math.random() * 20}s`,
          }}
        />
      );
    }),
  []);

  return <div className="stars">{stars}</div>;
}
