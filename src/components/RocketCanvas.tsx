'use client';
import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import { useInvitesStore } from '@/stores/invitesStore';
import type { RocketData, TopPlayer, TrustData } from '@/types';
import { useTrustsStore } from '@/stores/trustsStore';
import { drawRocketGroup } from '@/lib/draw/drawRocketGroup';
import { getProfileFromDB } from '@/lib/profileDb';

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

const imageCache = new Map<string, p5.Image>();

const RocketCanvas: React.FC<{
  leftTableWidth: number;
  rightTableWidth: number;
  showInvites: boolean;
}> = ({ leftTableWidth, rightTableWidth, showInvites }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const rocketImgRef = useRef<p5.Image | null>(null);
  const crcImgRef = useRef<p5.Image | null>(null);
  const placeholderImgRef = useRef<p5.Image | null>(null);
  const prevLeftTableWidth = useRef<number | null>(null);
  const prevRightTableWidth = useRef<number | null>(null);

  const top10Invites = useInvitesStore(state => state.invitesTop10);
  const top10Trusts = useTrustsStore(state => state.trustsTop10);

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
      const BOTTOM_MARGIN = h < 900 ? (h / 10) * 3 : h / 10;
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
    }

    const sketch = (p: p5) => {
      let stars: {
        x: number;
        y: number;
        r: number;
        speed: number;
        alpha: number;
      }[] = [];

      // Circles-white images as moving stars
      type CircleStar = {
        x: number;
        y: number;
        size: number;
        speed: number;
        alpha: number;
      };
      let circleStars: CircleStar[] = [];

      // These functions will be called by the custom redraw handlers only
      const setupInviteData = (invites: TopPlayer[]) => {
        inviteData = invites.map(invite => ({
          invite,
          address: invite.address,
          image: null,
          imageUrl: null, // will be set after fetching profile
          imageLoading: false,
          xOffset: 0,
          yOffset: 0,
          xSpeed: (Math.random() - 0.5) * 0.08,
          ySpeed: (Math.random() - 0.5) * 0.06,
          groupYOffset: (Math.random() - 0.5) * sizes.ROCKET_SIZE,
          singleGroupXOffset: (Math.random() - 0.5) * sizes.ROCKET_SIZE,
        }));
        // Fetch profile images asynchronously
        inviteData.forEach(async (data, index) => {
          const profile = await getProfileFromDB(data.invite.address);
          if (typeof profile?.image === 'string') {
            inviteData[index].imageUrl = profile.image;
          }
        });
      };

      const setupTrustData = (trusts: TopPlayer[]) => {
        trustData = trusts.map(trust => ({
          trust,
          address: trust.address,
          image: null,
          imageUrl: null, // will be set after fetching profile
          imageLoading: false,
          xOffset: 0,
          yOffset: 0,
          xSpeed: (Math.random() - 0.5) * 0.06,
          ySpeed: (Math.random() - 0.5) * 0.04,
          groupYOffset: ((Math.random() - 0.7) * sizes.ROCKET_SIZE) / 10,
          singleGroupXOffset: (Math.random() - 0.5) * sizes.ROCKET_SIZE * 2,
        }));
        // Fetch profile images asynchronously
        trustData.forEach(async (data, index) => {
          const profile = await getProfileFromDB(data.trust.address);
          if (typeof profile?.image === 'string') {
            trustData[index].imageUrl = profile.image;
          }
        });
      };

      p.setup = async () => {
        if (containerNode) {
          width = containerNode.offsetWidth;
          height = containerNode.offsetHeight;
        }
        recalcSizes(width, height);
        p.createCanvas(width, height, p.P2D);
        p.frameRate(15);
        p.noStroke();

        rocketImgRef.current = await new Promise<p5.Image>(resolve => {
          p.loadImage('images/rocket-crc.png', img => resolve(img));
          // or we could use 'images/rocket-circles'
        });

        placeholderImgRef.current = await new Promise<p5.Image>(resolve => {
          p.loadImage('images/circles.png', img => resolve(img));
        });

        crcImgRef.current = await new Promise<p5.Image>(resolve => {
          p.loadImage('images/circles-logo-text.png', img => resolve(img));
        });

        // Stars
        stars = Array.from({ length: STAR_COUNT }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: randomBetween(STAR_MIN_RADIUS, STAR_MAX_RADIUS),
          speed: randomBetween(STAR_MIN_SPEED, STAR_MAX_SPEED),
          alpha: randomBetween(120, 255),
        }));

        // Circles-white images as moving stars
        const CIRCLE_STAR_COUNT = Math.floor(randomBetween(3, 8));
        circleStars = [];
        for (let i = 0; i < CIRCLE_STAR_COUNT; i++) {
          circleStars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: randomBetween(30, 40),
            speed: randomBetween(0.2, 0.8),
            alpha: 255,
          });
        }
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

        // Draw moving circles-white images as stars
        if (circleStars && crcImgRef.current) {
          for (const cStar of circleStars) {
            p.push();
            p.tint(255, cStar.alpha);
            p.image(
              crcImgRef.current,
              cStar.x,
              cStar.y,
              cStar.size,
              cStar.size
            );
            p.pop();
            cStar.y += cStar.speed;
            if (cStar.y > height + cStar.size) {
              cStar.x = Math.random() * width;
              cStar.y = -cStar.size;
              cStar.size = randomBetween(30, 40);
              cStar.speed = randomBetween(0.2, 0.8);
              cStar.alpha = 255;
            }
          }
        }

        // Draw invites (left)
        if (showInvites) {
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
            placeholderImgRef,
            showInvites,
            imageCache
          );
        }
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
          placeholderImgRef,
          showInvites,
          imageCache
        );
      };

      (
        p as P5WithCustomHandler
      ).myCustomRedrawAccordingToNewPropsHandlerInvites = (newProps: {
        invites: TopPlayer[];
      }) => {
        imagesLoadedInvites = false;
        if (newProps.invites && newProps.invites.length > 0) {
          const sortedInvites = [...newProps.invites].sort(
            (a, b) => a.score - b.score
          );
          setupInviteData(sortedInvites);
        } else {
          inviteData = [];
          imagesLoadedInvites = true;
        }
      };

      (
        p as P5WithCustomHandler
      ).myCustomRedrawAccordingToNewPropsHandlerTrusts = (newProps: {
        trusts: TopPlayer[];
      }) => {
        imagesLoadedTrusts = false;
        if (newProps.trusts && newProps.trusts.length > 0) {
          const sortedTrusts = [...newProps.trusts].sort(
            (a, b) => a.score - b.score
          );
          setupTrustData(sortedTrusts);
        } else {
          trustData = [];
          imagesLoadedTrusts = true;
        }
      };
    };

    p5Instance.current = new p5(sketch, containerNode!);

    // Call redraw handlers immediately after p5 instance creation
    // if (
    //   p5Instance.current &&
    //   'myCustomRedrawAccordingToNewPropsHandlerInvites' in p5Instance.current
    // ) {
    //   (
    //     p5Instance.current as P5WithCustomHandler
    //   ).myCustomRedrawAccordingToNewPropsHandlerInvites({
    //     invites: top10Invites,
    //   });
    // }
    // if (
    //   p5Instance.current &&
    //   'myCustomRedrawAccordingToNewPropsHandlerTrusts' in p5Instance.current
    // ) {
    //   (
    //     p5Instance.current as P5WithCustomHandler
    //   ).myCustomRedrawAccordingToNewPropsHandlerTrusts({
    //     trusts: top10Trusts,
    //   });
    // }

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
  }, [leftTableWidth, rightTableWidth, showInvites]);

  useEffect(() => {
    console.log('useEffect top10Invites', top10Invites, new Date());
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
    console.log('useEffect top10Trusts', top10Trusts, new Date());
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
