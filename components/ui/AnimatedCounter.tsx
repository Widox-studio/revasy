"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  duration?: number; // milliseconds
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  target,
  duration = 1800,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Use IntersectionObserver to start counting only when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            const startTime = performance.now();
            const startValue = 0;

            const step = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // Ease-out cubic curve: fast start, soft landing
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const currentValue = Math.round(startValue + (target - startValue) * easeOut);

              setCount(currentValue);

              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                setCount(target);
              }
            };

            requestAnimationFrame(step);
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: "0px 0px -40px 0px", // Slight offset so it starts comfortably within viewport
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [target, duration, hasAnimated]);

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {hasAnimated ? count : 0}
      {suffix}
    </span>
  );
}
