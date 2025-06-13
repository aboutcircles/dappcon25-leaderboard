'use client';
import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import { useInvitesStore } from '@/stores/invitesStore';
import type { RocketData, TopPlayer, TrustData } from '@/types';
import { useTrustsStore } from '@/stores/trustsStore';
import { drawRocketGroup } from '@/lib/draw/drawRocketGroup';

const STAR_COUNT = 120;
const STAR_MIN_RADIUS = 0.5;
const STAR_MAX_RADIUS = 2.2;
const STAR_MIN_SPEED = 0.2;
const STAR_MAX_SPEED = 1.4;

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

const RocketCanvas: React.FC<{
  leftTableWidth: number;
  rightTableWidth: number;
}> = ({ leftTableWidth, rightTableWidth }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const rocketImgRef = useRef<p5.Image | null>(null);
  const placeholderImgRef = useRef<p5.Image | null>(null);
  const prevLeftTableWidth = useRef<number | null>(null);
  const prevRightTableWidth = useRef<number | null>(null);

  const top10Invites = useInvitesStore(state => state.top10);
  const top10Trusts = useTrustsStore(state => state.top10);

  useEffect(() => {
    const containerNode = containerRef.current;

    // --- CLEANUP FIRST ---
    if (p5Instance.current) {
      p5Instance.current.remove();
      p5Instance.current = null;
    }
    if (containerNode) {
      const canvases = containerNode.querySelectorAll('canvas');
      canvases.forEach(canvas => canvas.remove());
    }

    let width = 400;
    let height = 200;

    // Holds { invite, image, xOffset, yOffset, xSpeed, ySpeed }
    let inviteData: RocketData[] = [];
    let trustData: TrustData[] = [];

    let imagesLoadedInvites = false;
    let imagesLoadedTrusts = false;

    let pressStartFont: p5.Font | null = null;

    // Store sizes here
    let sizes = {
      IMAGE_SIZE: 0,
      ROCKET_SIZE: 0,
      WINDOW_SIZE: 0,
      WINDOW_OFFSET: 0,
      TOP_MARGIN: 200,
      BOTTOM_MARGIN: 300,
    };

    function recalcSizes(w: number, h: number) {
      const IMAGE_SIZE = h / 100;
      const ROCKET_SCALE = 10;
      const BOTTOM_MARGIN = h < 900 ? (h / 10) * 2 : h / 10;
      const TOP_MARGIN = (h / 10) * 2;
      const ROCKET_SIZE = IMAGE_SIZE * ROCKET_SCALE;
      const WINDOW_SIZE = ROCKET_SIZE * 0.2;
      const WINDOW_OFFSET = (ROCKET_SIZE - WINDOW_SIZE) / 2;
      sizes = {
        IMAGE_SIZE,
        ROCKET_SIZE,
        WINDOW_SIZE,
        WINDOW_OFFSET,
        TOP_MARGIN,
        BOTTOM_MARGIN,
      };
      // console.log('=============h, sizes', h, sizes);
    }

    const sketch = (p: p5) => {
      let stars: {
        x: number;
        y: number;
        r: number;
        speed: number;
        alpha: number;
      }[] = [];

      const loadInviteImages = (invites: TopPlayer[]) => {
        let loadedCount = 0;
        inviteData = invites.map(invite => ({
          invite,
          image: null,
          xOffset: 0,
          yOffset: 0,
          xSpeed: (Math.random() - 0.5) * 0.08,
          ySpeed: (Math.random() - 0.5) * 0.06,
          groupYOffset: (Math.random() - 0.5) * sizes.ROCKET_SIZE,
          singleGroupXOffset: (Math.random() - 0.5) * sizes.ROCKET_SIZE,
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
                inviteData[index].image = img;
                loadedCount++;
                if (loadedCount === inviteData.length) {
                  imagesLoadedInvites = true;
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
                }
              }
            );
          } else {
            loadedCount++;
            if (loadedCount === inviteData.length) {
              imagesLoadedInvites = true;
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
          groupYOffset: ((Math.random() - 0.7) * sizes.ROCKET_SIZE) / 10,
          singleGroupXOffset: (Math.random() - 0.5) * sizes.ROCKET_SIZE * 2,
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
                trustData[index].image = img;
                loadedCount++;
                if (loadedCount === trustData.length) {
                  imagesLoadedTrusts = true;
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
                }
              }
            );
          } else {
            loadedCount++;
            if (loadedCount === trustData.length) {
              imagesLoadedTrusts = true;
            }
          }
        });
      };

      p.setup = async () => {
        if (containerNode) {
          width = containerNode.offsetWidth;
          height = containerNode.offsetHeight;
        }
        recalcSizes(width, height);
        p.createCanvas(width, height);
        p.noStroke();

        pressStartFont = await new Promise<p5.Font>(resolve => {
          p.loadFont('/fonts/PressStart2P-Regular.ttf', font => resolve(font));
        });

        rocketImgRef.current = await new Promise<p5.Image>(resolve => {
          p.loadImage('images/rocket.png', img => resolve(img));
        });

        placeholderImgRef.current = await new Promise<p5.Image>(resolve => {
          p.loadImage('images/circles.png', img => resolve(img));
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
        const {
          ROCKET_SIZE,
          WINDOW_SIZE,
          WINDOW_OFFSET,
          TOP_MARGIN,
          BOTTOM_MARGIN,
        } = sizes;
        p.clear();
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

        // Draw invites (left)
        drawRocketGroup<RocketData>(
          p,
          imagesLoadedInvites,
          inviteData,
          data => data.invite.name || '',
          data => data.invite.score,
          data => data.image,
          true,
          width,
          leftTableWidth,
          height,
          ROCKET_SIZE,
          TOP_MARGIN,
          BOTTOM_MARGIN,
          WINDOW_SIZE,
          WINDOW_OFFSET,
          rocketImgRef,
          placeholderImgRef
        );
        // Draw trusts (right)
        drawRocketGroup<TrustData>(
          p,
          imagesLoadedTrusts,
          trustData,
          data => data.trust.name || '',
          data => data.trust.score,
          data => data.image,
          false,
          width,
          rightTableWidth,
          height,
          ROCKET_SIZE,
          TOP_MARGIN,
          BOTTOM_MARGIN,
          WINDOW_SIZE,
          WINDOW_OFFSET,
          rocketImgRef,
          placeholderImgRef
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
            // Reset if width or tableWidth changed
            if (
              w !== width ||
              prevLeftTableWidth.current !== leftTableWidth ||
              prevRightTableWidth.current !== rightTableWidth
            ) {
              inviteData.forEach(d => {
                d.randomXBase = undefined;
              });
              trustData.forEach(d => {
                d.randomXBase = undefined;
              });
            }
            prevLeftTableWidth.current = leftTableWidth;
            prevRightTableWidth.current = rightTableWidth;
            width = w;
            height = h;

            recalcSizes(w, h);
          }
        }, 50);
      });
      resizeObserver.observe(containerNode);
    }

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
      if (resizeObserver && containerNode) {
        resizeObserver.disconnect();
      }
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      if (containerNode) {
        const canvases = containerNode.querySelectorAll('canvas');
        canvases.forEach(canvas => canvas.remove());
      }
    };
  }, [leftTableWidth, rightTableWidth, top10Invites, top10Trusts]);

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
      className="starry-bg"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    />
  );
};

export default RocketCanvas;
