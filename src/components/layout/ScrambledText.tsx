'use client';

import { useEffect, useRef, CSSProperties, ReactNode } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText.js';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin.js';

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style = {},
  children
}: ScrambledTextProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    // We need to query for the <p> tag within the component
    const pTag = rootRef.current.querySelector('p');
    if (!pTag) return;

    const split = SplitText.create(pTag, {
      type: 'chars',
      charsClass: 'inline-block will-change-transform'
    });

    split.chars.forEach(el => {
      const c = el;
      gsap.set(c, { attr: { 'data-content': c.innerHTML } });
    });

    const handleMove = (e: PointerEvent) => {
      split.chars.forEach(el => {
        const c = el;
        const { left, top, width, height } = c.getBoundingClientRect();
        const dx = e.clientX - (left + width / 2);
        const dy = e.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          gsap.to(c, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: {
              text: c.dataset.content || '',
              chars: scrambleChars,
              speed
            },
            ease: 'none'
          });
        }
      });
    };

    const el = rootRef.current;
    el.addEventListener('pointermove', handleMove);

    return () => {
      el.removeEventListener('pointermove', handleMove);
      if (split.revert) {
          split.revert();
      }
    };
  }, [radius, duration, speed, scrambleChars, children]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={style}
    >
      <p>{children}</p>
    </div>
  );
};

export default ScrambledText;
