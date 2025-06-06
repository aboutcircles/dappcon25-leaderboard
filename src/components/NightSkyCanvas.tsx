import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import { useInvitesStore } from '@/stores/invitesStore';
import type { TopPlayer } from '@/types';

const STAR_COUNT = 120;
const STAR_MIN_RADIUS = 0.5;
const STAR_MAX_RADIUS = 2.2;
const STAR_MIN_SPEED = 0.2;
const STAR_MAX_SPEED = 0.9;

const IMAGE_SIZE = 8;
const ROCKET_SCALE = 10;
const ROCKET_SIZE = IMAGE_SIZE * ROCKET_SCALE;
const WINDOW_SIZE = ROCKET_SIZE * 0.2; // 40% of rocket size
const WINDOW_OFFSET = (ROCKET_SIZE - WINDOW_SIZE) / 2;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

type P5WithCustomHandler = p5 & {
  myCustomRedrawAccordingToNewPropsHandler: (props: {
    invites: TopPlayer[];
  }) => void;
};

const NightSkyCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const rocketImgRef = useRef<p5.Image | null>(null);

  const top10Invites = useInvitesStore(state => state.top10);

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

    // Holds { invite, image }
    let inviteData: { invite: TopPlayer; image: p5.Image | null }[] = [];
    let imagesLoaded = false;

    const sketch = (p: p5) => {
      const loadInviteImages = (invites: TopPlayer[]) => {
        let loadedCount = 0;
        inviteData = invites.map(invite => ({
          invite,
          image: null,
        }));

        if (inviteData.length === 0) {
          imagesLoaded = true;
          return;
        }

        inviteData.forEach((data, index) => {
          const { invite } = data;
          if (invite.image) {
            p.loadImage(
              invite.image,
              img => {
                console.log(`Loaded image for invite ${invite.name}`);
                inviteData[index].image = img;
                loadedCount++;
                if (loadedCount === inviteData.length) {
                  imagesLoaded = true;
                  console.log('All images loaded');
                }
              },
              err => {
                console.error(
                  `Failed to load image for invite ${invite.name}:`,
                  err
                );
                inviteData[index].image = null;
                loadedCount++;
                if (loadedCount === inviteData.length) {
                  imagesLoaded = true;
                  console.log('All images attempted');
                }
              }
            );
          } else {
            loadedCount++;
            if (loadedCount === inviteData.length) {
              imagesLoaded = true;
              console.log('All images attempted');
            }
          }
        });
      };

      p.setup = async () => {
        if (containerNode) {
          width = containerNode.offsetWidth;
          height = containerNode.offsetHeight;
        }
        p.createCanvas(width, height);
        p.noStroke();

        // Load rocket image asynchronously
        rocketImgRef.current = await new Promise<p5.Image>(resolve => {
          p.loadImage('images/rocket.png', img => resolve(img));
        });

        // Stars
        stars = Array.from({ length: STAR_COUNT }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: randomBetween(STAR_MIN_RADIUS, STAR_MAX_RADIUS),
          speed: randomBetween(STAR_MIN_SPEED, STAR_MAX_SPEED),
          alpha: randomBetween(120, 255),
        }));

        // Sort invites here, once, and load images in same order
        const sortedInvites = [...top10Invites].sort(
          (a, b) => a.score - b.score
        );
        loadInviteImages(sortedInvites);
      };

      p.draw = () => {
        p.background(10, 14, 40, 255);

        // Draw stars
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

        // Draw invites
        if (imagesLoaded) {
          inviteData.forEach((data, index) => {
            const { image, invite } = data;
            // Center rocket horizontally
            const x = width / 2 - ROCKET_SIZE / 2;
            const y = height - (index + 1) * (ROCKET_SIZE + 10);

            // Draw invite image clipped to window (centered in rocket)
            p.push();
            p.ellipseMode(p.CORNER);
            p.drawingContext.save();
            p.drawingContext.beginPath();
            p.drawingContext.arc(
              x + WINDOW_OFFSET + WINDOW_SIZE / 2,
              y + WINDOW_OFFSET + WINDOW_SIZE / 2,
              WINDOW_SIZE / 2,
              0,
              2 * Math.PI
            );
            p.drawingContext.clip();
            if (image) {
              p.image(
                image,
                x + WINDOW_OFFSET,
                y + WINDOW_OFFSET,
                WINDOW_SIZE,
                WINDOW_SIZE
              );
            }
            p.drawingContext.restore();
            p.pop();

            // Draw rocket overlay
            if (rocketImgRef.current) {
              p.image(rocketImgRef.current, x, y, ROCKET_SIZE, ROCKET_SIZE);
            }

            // Draw name/score below
            p.fill(255);
            p.textSize(12);
            p.textAlign(p.CENTER, p.TOP);
            p.text(invite.name || '', x + ROCKET_SIZE / 2, y + ROCKET_SIZE + 4);
          });
        } else {
          p.fill(255);
          p.textSize(20);
          p.textAlign(p.CENTER, p.CENTER);
          p.text('Loading images...', width / 2, height / 2);
        }
      };

      (p as P5WithCustomHandler).myCustomRedrawAccordingToNewPropsHandler =
        (newProps: { invites: typeof top10Invites }) => {
          imagesLoaded = false;
          if (newProps.invites && newProps.invites.length > 0) {
            const sortedInvites = [...newProps.invites].sort(
              (a, b) => a.score - b.score
            );
            loadInviteImages(sortedInvites);
          } else {
            inviteData = [];
            imagesLoaded = true;
          }
        };
    };

    p5Instance.current = new p5(sketch, containerNode!);

    // Resize observer
    let resizeObserver: ResizeObserver | null = null;
    if (containerNode && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
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
  }, [top10Invites]);

  useEffect(() => {
    if (
      p5Instance.current &&
      'myCustomRedrawAccordingToNewPropsHandler' in p5Instance.current
    ) {
      (
        p5Instance.current as P5WithCustomHandler
      ).myCustomRedrawAccordingToNewPropsHandler({ invites: top10Invites });
    }
  }, [top10Invites]);

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
