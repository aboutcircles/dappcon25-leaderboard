import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import { useInvitesStore } from '@/stores/invitesStore';
import type { TopPlayer } from '@/types';
import { useTrustsStore } from '@/stores/trustsStore';

const STAR_COUNT = 120;
const STAR_MIN_RADIUS = 0.5;
const STAR_MAX_RADIUS = 2.2;
const STAR_MIN_SPEED = 0.2;
const STAR_MAX_SPEED = 0.9;

const IMAGE_SIZE = 20;
const ROCKET_SCALE = 10;
const ROCKET_SIZE = IMAGE_SIZE * ROCKET_SCALE;
const WINDOW_SIZE = ROCKET_SIZE * 0.2;
const WINDOW_OFFSET = (ROCKET_SIZE - WINDOW_SIZE) / 2;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

type P5WithCustomHandler = p5 & {
  myCustomRedrawAccordingToNewPropsHandlerInvites: (props: {
    invites: TopPlayer[];
  }) => void;
  myCustomRedrawAccordingToNewPropsHandlerTrusts: (props: {
    trusts: TopPlayer[];
  }) => void;
};

type RocketData = {
  invite: TopPlayer;
  image: p5.Image | null;
  xOffset: number;
  yOffset: number;
  xSpeed: number;
  ySpeed: number;
};
type TrustData = {
  trust: TopPlayer;
  image: p5.Image | null;
  xOffset: number;
  yOffset: number;
  xSpeed: number;
  ySpeed: number;
};

const NightSkyCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const rocketImgRef = useRef<p5.Image | null>(null);

  const top10Invites = useInvitesStore(state => state.top10);
  const top10Trusts = useTrustsStore(state => state.top10);

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

    // Holds { invite, image, xOffset, yOffset, xSpeed, ySpeed }
    let inviteData: RocketData[] = [];
    let trustData: TrustData[] = [];

    let imagesLoadedInvites = false;
    let imagesLoadedTrusts = false;

    let pressStartFont: p5.Font | null = null;

    const sketch = (p: p5) => {
      const loadInviteImages = (invites: TopPlayer[]) => {
        let loadedCount = 0;
        inviteData = invites.map(invite => ({
          invite,
          image: null,
          xOffset: 0,
          yOffset: 0,
          xSpeed: (Math.random() - 0.5) * 0.06,
          ySpeed: (Math.random() - 0.5) * 0.04,
        }));

        if (inviteData.length === 0) {
          imagesLoadedInvites = true;
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
                  imagesLoadedInvites = true;
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
                  imagesLoadedInvites = true;
                  console.log('All images attempted');
                }
              }
            );
          } else {
            loadedCount++;
            if (loadedCount === inviteData.length) {
              imagesLoadedInvites = true;
              console.log('All images attempted');
            }
          }
        });
      };

      const loadTrustImages = (trusts: TopPlayer[]) => {
        let loadedCount = 0;
        trustData = trusts.map(trust => ({
          trust,
          image: null,
          xOffset: 0,
          yOffset: 0,
          xSpeed: (Math.random() - 0.5) * 0.06,
          ySpeed: (Math.random() - 0.5) * 0.04,
        }));

        if (trustData.length === 0) {
          imagesLoadedTrusts = true;
          return;
        }

        trustData.forEach((data, index) => {
          const { trust } = data;
          if (trust.image) {
            p.loadImage(
              trust.image,
              img => {
                console.log(`Loaded image for trust ${trust.name}`);
                trustData[index].image = img;
                loadedCount++;
                if (loadedCount === trustData.length) {
                  imagesLoadedTrusts = true;
                  console.log('All images loaded');
                }
              },
              err => {
                console.error(
                  `Failed to load image for trust ${trust.name}:`,
                  err
                );
                trustData[index].image = null;
                loadedCount++;
                if (loadedCount === trustData.length) {
                  imagesLoadedTrusts = true;
                  console.log('All images attempted');
                }
              }
            );
          } else {
            loadedCount++;
            if (loadedCount === trustData.length) {
              imagesLoadedTrusts = true;
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

        pressStartFont = await new Promise<p5.Font>(resolve => {
          p.loadFont('/fonts/PressStart2P-Regular.ttf', font => resolve(font));
        });

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

        // Sort trust here, once, and load images in same order
        const sortedTrusts = [...top10Trusts].sort((a, b) => a.score - b.score);
        loadTrustImages(sortedTrusts);
      };

      p.draw = () => {
        p.background(10, 14, 40, 255);
        if (pressStartFont) {
          p.textFont(pressStartFont);
        }

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

        // Helper function to draw a group (invites or trusts)
        function drawRocketGroup<T extends RocketData | TrustData>(
          p: p5,
          imagesLoaded: boolean,
          dataArray: T[],
          getName: (item: T) => string,
          getScore: (item: T) => number,
          getImage: (item: T) => p5.Image | null,
          left: boolean
        ) {
          if (!imagesLoaded) return;

          // 1. Group by score
          const scoreGroups: Record<number, T[]> = {};
          dataArray.forEach((data: T) => {
            const score = getScore(data);
            if (!scoreGroups[score]) scoreGroups[score] = [];
            scoreGroups[score].push(data);
          });

          // 2. Sort scores descending (highest score at the top)
          const sortedScores = Object.keys(scoreGroups)
            .map(Number)
            .sort((a, b) => b - a);

          const verticalSpacing =
            (height - 2 * ROCKET_SIZE) / (sortedScores.length - 1 || 1);

          sortedScores.forEach((score, groupIdx) => {
            const group = scoreGroups[score];
            const n = group.length;
            const yBase = ROCKET_SIZE + groupIdx * verticalSpacing;

            group.forEach((data: T, i: number) => {
              // Evenly distribute across half width
              const halfWidth = width / 2;
              const xBase = left
                ? ((halfWidth - ROCKET_SIZE) * (i + 0.5)) / n
                : halfWidth + ((halfWidth - ROCKET_SIZE) * (i + 0.5)) / n;
              // Update rocket position
              data.xOffset += data.xSpeed;
              data.yOffset += data.ySpeed;
              if (Math.abs(data.xOffset) > 30) data.xSpeed *= -1;
              if (Math.abs(data.yOffset) > 10) data.ySpeed *= -1;
              const x = xBase + data.xOffset;
              const y = yBase + data.yOffset - 50;

              // Draw invite/trust image clipped to window (centered in rocket)
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
              const img = getImage(data);
              if (img) {
                p.image(
                  img,
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
              p.text(
                getName(data) || '',
                x + ROCKET_SIZE / 2,
                y + ROCKET_SIZE + 4
              );
              p.text(
                getScore(data) || '',
                x + ROCKET_SIZE / 2,
                y + ROCKET_SIZE + 20
              );
            });
          });
        }

        // Draw invites (left)
        drawRocketGroup<RocketData>(
          p,
          imagesLoadedInvites,
          inviteData,
          data => data.invite.name || '',
          data => data.invite.score,
          data => data.image,
          true
        );
        // Draw trusts (right)
        drawRocketGroup<TrustData>(
          p,
          imagesLoadedTrusts,
          trustData,
          data => data.trust.name || '',
          data => data.trust.score,
          data => data.image,
          false
        );
      };

      (
        p as P5WithCustomHandler
      ).myCustomRedrawAccordingToNewPropsHandlerInvites = (newProps: {
        invites: typeof top10Invites;
      }) => {
        imagesLoadedInvites = false;
        if (newProps.invites && newProps.invites.length > 0) {
          const sortedInvites = [...newProps.invites].sort(
            (a, b) => a.score - b.score
          );
          loadInviteImages(sortedInvites);
        } else {
          inviteData = [];
          imagesLoadedInvites = true;
        }
      };

      (
        p as P5WithCustomHandler
      ).myCustomRedrawAccordingToNewPropsHandlerTrusts = (newProps: {
        trusts: typeof top10Trusts;
      }) => {
        imagesLoadedTrusts = false;
        if (newProps.trusts && newProps.trusts.length > 0) {
          const sortedTrusts = [...newProps.trusts].sort(
            (a, b) => a.score - b.score
          );
          loadTrustImages(sortedTrusts);
        } else {
          trustData = [];
          imagesLoadedTrusts = true;
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
  }, [top10Invites, top10Trusts]);

  useEffect(() => {
    if (
      p5Instance.current &&
      'myCustomRedrawAccordingToNewPropsHandlerInvites' in p5Instance.current
    ) {
      (
        p5Instance.current as P5WithCustomHandler
      ).myCustomRedrawAccordingToNewPropsHandlerInvites({
        invites: top10Invites,
      });
    }
  }, [top10Invites]);

  useEffect(() => {
    if (
      p5Instance.current &&
      'myCustomRedrawAccordingToNewPropsHandlerTrusts' in p5Instance.current
    ) {
      (
        p5Instance.current as P5WithCustomHandler
      ).myCustomRedrawAccordingToNewPropsHandlerTrusts({ trusts: top10Trusts });
    }
  }, [top10Trusts]);

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
