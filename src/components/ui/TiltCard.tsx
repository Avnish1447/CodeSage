import React, { useRef, useState, useEffect } from 'react';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
  cardClassName?: string;
  enableGlare?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 8,
  className = '',
  cardClassName = '',
  enableGlare = true,
  ...props
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !outerRef.current || !cardRef.current) return;
    const rect = outerRef.current.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));

    const rx = ((0.5 - py) * maxTilt).toFixed(2);
    const ry = ((px - 0.5) * maxTilt).toFixed(2);
    const gx = (px * 100).toFixed(1);
    const gy = (py * 100).toFixed(1);

    const card = cardRef.current;
    card.style.setProperty('--tilt-rx', `${rx}deg`);
    card.style.setProperty('--tilt-ry', `${ry}deg`);
    card.style.setProperty('--tilt-gx', `${gx}%`);
    card.style.setProperty('--tilt-gy', `${gy}%`);
    if (!isHovered) setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--tilt-rx', '0deg');
    cardRef.current.style.setProperty('--tilt-ry', '0deg');
  };

  return (
    <div
      ref={outerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`t-tilt select-none ${isHovered ? 'is-hover' : ''} ${className}`}
      {...props}
    >
      <div
        ref={cardRef}
        className={`t-tilt-card ${isHovered ? 'is-tilting' : ''} ${cardClassName}`}
      >
        {children}
        {enableGlare && <div className="t-tilt-glare" aria-hidden="true" />}
      </div>
    </div>
  );
};
