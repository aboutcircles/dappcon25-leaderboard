import { COLORS } from '@/const';
import { InviteData, TrustData } from '@/types';
import p5 from 'p5';

export function drawRocketGroup<T extends InviteData | TrustData>(
  p: p5,
  imagesLoaded: boolean,
  dataArray: T[],
  getName: (item: T) => string,
  getScore: (item: T) => number,
  getImage: (item: T) => p5.Image | null,
  left: boolean,
  width: number,
  tableWidth: number,
  height: number,
  ROCKET_SIZE: number,
  TOP_MARGIN: number,
  BOTTOM_MARGIN: number,
  WINDOW_SIZE: number,
  WINDOW_OFFSET: number,
  rocketImgRef: React.RefObject<p5.Image> | React.RefObject<null> | null,
  placeholderImgRef: React.RefObject<p5.Image> | React.RefObject<null>,
  showInvites: boolean,
  imageCache: Map<string, p5.Image>,
  RANGE: number = 3
) {
  const centerX = width / 2;

  const smallestScore =
    left && dataArray[0]
      ? (dataArray[0] as InviteData).invite?.score
      : dataArray[0]
      ? (dataArray[0] as TrustData).trust?.score
      : 0;

  // 1. Group by score bucket
  const scoreGroups: Record<number, T[]> = {};
  dataArray.forEach((data: T) => {
    const score = getScore(data);
    const bucket = Math.floor(score / RANGE);
    if (!scoreGroups[bucket]) scoreGroups[bucket] = [];
    scoreGroups[bucket].push(data);
  });

  // 2. Sort scores descending (highest score at the top)
  const sortedScores = Object.keys(scoreGroups)
    .map(Number)
    .sort((a, b) => b - a);

  const availableHeight = height - TOP_MARGIN - BOTTOM_MARGIN - ROCKET_SIZE;

  const verticalSpacing =
    sortedScores.length > 1
      ? availableHeight /
        (sortedScores[0] - sortedScores[sortedScores.length - 1])
      : 0;

  let maxN = 0;

  const calculateXStart = () => {
    if (showInvites) {
      return left ? tableWidth ?? 0 : centerX;
    } else {
      return 0;
    }
  };

  const calculateXEnd = () => {
    if (showInvites) {
      return left ? centerX : width - (tableWidth ?? 0);
    } else {
      return width - (tableWidth ?? 0);
    }
  };

  const xStart = calculateXStart();
  const xEnd = calculateXEnd();

  sortedScores.forEach(score => {
    const group = scoreGroups[score];
    const n = group.length;
    maxN = Math.max(maxN, n);

    // Start at TOP_MARGIN
    const yBase =
      TOP_MARGIN + availableHeight - (score - smallestScore) * verticalSpacing;

    // Assign a persistent random x value for each element in the group
    group.forEach((data: T) => {
      if (data.randomXBase === undefined) {
        data.randomXBase =
          xStart + Math.random() * (xEnd - ROCKET_SIZE - xStart);
      }
    });
    const basePositions: number[] = group.map(data => data.randomXBase!);

    // Assign a persistent random offset to each rocket
    group.forEach((data: T) => {
      if (data.randomXOffset === undefined) {
        data.randomXOffset = ((Math.sin(999) + Math.random()) / 2 - 0.5) * 60;
      }
    });

    group.forEach((data: T, i: number) => {
      // Use the calculated base position and persistent random offset
      let x = basePositions[i];

      // Update rocket position
      data.xOffset += data.xSpeed;
      data.yOffset += data.ySpeed;
      if (Math.abs(data.xOffset) > 30) data.xSpeed *= -1;
      if (Math.abs(data.yOffset) > 10) data.ySpeed *= -1;
      x += data.xOffset;

      // Use the fixed groupYOffset for each rocket
      const y = yBase + data.yOffset + data.groupYOffset / 10;

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
      // Lazy load and cache images
      const cacheKey = data.address;
      let img = data.image;
      if (!img && cacheKey && imageCache.has(cacheKey)) {
        img = imageCache.get(cacheKey)!;
        data.image = img;
      }
      if (img) {
        p.image(
          img,
          x + WINDOW_OFFSET,
          y + WINDOW_OFFSET,
          WINDOW_SIZE,
          WINDOW_SIZE
        );
      } else {
        // If not loading, start loading
        if (data.imageUrl && !data.imageLoading) {
          data.imageLoading = true;
          p.loadImage(
            data.imageUrl,
            loadedImg => {
              data.image = loadedImg;
              imageCache.set(cacheKey, loadedImg);
              data.imageLoading = false;
            },
            () => {
              data.image = null;
              data.imageLoading = false;
            }
          );
        }
        // Always draw placeholder if image is not ready
        if (placeholderImgRef.current) {
          p.image(
            placeholderImgRef.current,
            x + WINDOW_OFFSET,
            y + WINDOW_OFFSET,
            WINDOW_SIZE,
            WINDOW_SIZE
          );
        }
      }
      p.drawingContext.restore();
      p.pop();

      // Draw rocket overlay
      if (rocketImgRef && rocketImgRef.current) {
        p.image(rocketImgRef.current, x, y, ROCKET_SIZE, ROCKET_SIZE);
      }

      // Draw name/score below
      p.fill(COLORS[left ? 1 : 2]);
      if (height < 1000) {
        p.textSize(12);
      } else {
        p.textSize(16);
      }
      p.textAlign(p.CENTER, p.TOP);
      p.text(getName(data) || '', x + ROCKET_SIZE / 2, y + ROCKET_SIZE + 4);
      p.text(getScore(data) || '', x + ROCKET_SIZE / 2, y + ROCKET_SIZE + 20);
    });
  });
}
