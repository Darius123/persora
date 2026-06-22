"use client";

import { useRef, useState } from "react";

export function SpotlightCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={className}
      style={{ position: "relative", ...style }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity,
          transition: "opacity 0.3s ease",
          background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.07), transparent 40%)`,
          zIndex: 1,
        }}
      />
      {children}
    </div>
  );
}
