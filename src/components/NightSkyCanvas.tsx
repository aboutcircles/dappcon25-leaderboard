import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const STAR_COUNT = 120;
const STAR_MIN_RADIUS = 0.5;
const STAR_MAX_RADIUS = 2.2;
const STAR_MIN_SPEED = 0.2;
const STAR_MAX_SPEED = 0.9;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

const NightSkyCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const containerNode = containerRef.current;
    let width = 400;
    let height = 200;
    let stars: {
      x: number;
      y: number;
      r: number;
      speed: number;
      alpha: number;
    }[] = [];

    const sketch = (p: p5) => {
      p.setup = () => {
        if (containerNode) {
          width = containerNode.offsetWidth;
          height = containerNode.offsetHeight;
        }
        p.createCanvas(width, height);
        p.noStroke();
        stars = Array.from({ length: STAR_COUNT }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: randomBetween(STAR_MIN_RADIUS, STAR_MAX_RADIUS),
          speed: randomBetween(STAR_MIN_SPEED, STAR_MAX_SPEED),
          alpha: randomBetween(120, 255),
        }));
      };

      p.draw = () => {
        p.background(10, 14, 40, 255); // deep night blue
        for (const star of stars) {
          p.fill(255, 255, 255, star.alpha);
          p.ellipse(star.x, star.y, star.r, star.r);
          star.y += star.speed;
          if (star.y > height + star.r) {
            star.x = Math.random() * width;
            star.y = -star.r;
            star.r = randomBetween(STAR_MIN_RADIUS, STAR_MAX_RADIUS);
            star.speed = randomBetween(STAR_MIN_SPEED, STAR_MAX_SPEED);
            star.alpha = randomBetween(120, 255);
          }
        }
      };
    };

    p5Instance.current = new p5(sketch, containerNode!);

    // Use ResizeObserver for robust resizing
    let resizeObserver: ResizeObserver | null = null;
    if (containerNode && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
        // Debounce to avoid too many resizes
        resizeTimeout.current = setTimeout(() => {
          if (containerNode && p5Instance.current) {
            const w = containerNode.offsetWidth;
            const h = containerNode.offsetHeight;
            p5Instance.current.resizeCanvas(w, h);
            width = w;
            height = h;
          }
        }, 50);
      });
      resizeObserver.observe(containerNode);
    }

    return () => {
      p5Instance.current?.remove();
      p5Instance.current = null;
      if (resizeObserver && containerNode) {
        resizeObserver.disconnect();
      }
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    };
  }, []);

  // Make the container fill its parent
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
      }}
    />
  );
};

export default NightSkyCanvas;
