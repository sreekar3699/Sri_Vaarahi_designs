import { useEffect, useState, useRef } from 'react';

interface RollingNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
}

export default function RollingNumber({ value, duration = 500, className = '', prefix = '₹' }: RollingNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    setIsAnimating(true);
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
        setIsAnimating(false);
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return (
    <span className={`rolling-digit ${className} ${isAnimating ? 'scale-110 text-gold-600' : 'text-forest-800'}`}>
      {prefix}{displayValue.toLocaleString('en-IN')}
    </span>
  );
}
