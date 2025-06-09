'use client';
import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import { useInvitesStore } from '@/stores/invitesStore';
import type { RocketData, TopPlayer, TrustData } from '@/types';
import { useTrustsStore } from '@/stores/trustsStore';
import { drawRocketGroup } from '@/lib/draw/drawRocketGroup';

const TOP_MARGIN = 200;
const BOTTOM_MARGIN = 200;

type P5WithCustomHandler = p5 & {
  myCustomRedrawAccordingToNewPropsHandlerInvites: (props: {
    invites: TopPlayer[];
  }) => void;
  myCustomRedrawAccordingToNewPropsHandlerTrusts: (props: {
    trusts: TopPlayer[];
  }) => void;
};

const RocketCanvas: React.FC<{ tableWidth: number }> = ({ tableWidth }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const rocketImgRef = useRef<p5.Image | null>(null);
  const placeholderImgRef = useRef<p5.Image | null>(null);

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
    };

    function recalcSizes(h: number) {
      const IMAGE_SIZE = h / 80;
      const ROCKET_SCALE = 10;
      const ROCKET_SIZE = IMAGE_SIZE * ROCKET_SCALE;
      const WINDOW_SIZE = ROCKET_SIZE * 0.2;
      const WINDOW_OFFSET = (ROCKET_SIZE - WINDOW_SIZE) / 2;
      sizes = { IMAGE_SIZE, ROCKET_SIZE, WINDOW_SIZE, WINDOW_OFFSET };
    }

    const sketch = (p: p5) => {
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
                // console.log(`Loaded image for invite ${invite.name}`);
                inviteData[index].image = img;
                loadedCount++;
                if (loadedCount === inviteData.length) {
                  imagesLoadedInvites = true;
                  // console.log('All images loaded');
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
                  // console.log('All images attempted');
                }
              }
            );
          } else {
            loadedCount++;
            if (loadedCount === inviteData.length) {
              imagesLoadedInvites = true;
              // console.log('All images attempted');
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
          groupYOffset: (Math.random() - 0.7) * sizes.ROCKET_SIZE,
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
                // console.log(`Loaded image for trust ${trust.name}`);
                trustData[index].image = img;
                loadedCount++;
                if (loadedCount === trustData.length) {
                  imagesLoadedTrusts = true;
                  // console.log('All images loaded');
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
                  // console.log('All images attempted');
                }
              }
            );
          } else {
            loadedCount++;
            if (loadedCount === trustData.length) {
              imagesLoadedTrusts = true;
              // console.log('All images attempted');
            }
          }
        });
      };

      p.setup = async () => {
        if (containerNode) {
          width = containerNode.offsetWidth;
          height = containerNode.offsetHeight;
        }
        recalcSizes(height);
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
        const { ROCKET_SIZE, WINDOW_SIZE, WINDOW_OFFSET } = sizes;
        // p.background(10, 14, 40, 255);
        p.clear();
        if (pressStartFont) {
          p.textFont(pressStartFont);
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
          tableWidth,
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
          tableWidth,
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
            p5Instance.current.resizeCanvas(w, h);
            width = w;
            height = h;
            recalcSizes(h);
          }
        }, 50);
      });
      resizeObserver.observe(containerNode);
    }

    // Cleanup function (for unmount)
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
  }, [tableWidth, top10Invites, top10Trusts]);

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
        height: '100%',
        position: 'relative',
      }}
    />
  );
};

export default RocketCanvas;
