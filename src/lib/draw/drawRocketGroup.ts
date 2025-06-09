import { COLORS } from '@/const';
import { RocketData, TrustData } from '@/types';
import p5 from 'p5';

export function drawRocketGroup<T extends RocketData | TrustData>(
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
  RANGE: number = 5
) {
  if (!imagesLoaded) return;

  const centerX = (width - (tableWidth ?? 0)) / 2;

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
    sortedScores.length > 1 ? availableHeight / (sortedScores.length - 1) : 0;

  let maxN = 0;

  const xStart = left ? 0 : centerX;
  const xEnd = left ? centerX : width - (tableWidth ?? 0);

  sortedScores.forEach((score, groupIdx) => {
    const group = scoreGroups[score];
    const n = group.length;
    maxN = Math.max(maxN, n);

    // Start at TOP_MARGIN
    const yBase = TOP_MARGIN + groupIdx * verticalSpacing; // +
    // (sortedScores.length > 1 ? 0 : availableHeight / 2);

    // Assign a persistent random x value for each element in the group
    group.forEach((data: T) => {
      if (data.randomXBase === undefined) {
        data.randomXBase = xStart + Math.random() * (xEnd - xStart);
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
      let x = basePositions[i] + data.randomXOffset!;
      x = Math.max(xStart, Math.min(x, xEnd - ROCKET_SIZE));

      // Update rocket position
      data.xOffset += data.xSpeed;
      data.yOffset += data.ySpeed;
      if (Math.abs(data.xOffset) > 30) data.xSpeed *= -1;
      if (Math.abs(data.yOffset) > 10) data.ySpeed *= -1;
      x += data.xOffset;
      // Clamp x so the rocket stays within [xStart, xEnd - ROCKET_SIZE]
      x = Math.max(xStart, Math.min(x, xEnd - ROCKET_SIZE));

      // Use the fixed groupYOffset for each rocket
      const y = yBase + data.yOffset + data.groupYOffset;

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
      } else if (placeholderImgRef.current) {
        p.image(
          placeholderImgRef.current,
          x + WINDOW_OFFSET,
          y + WINDOW_OFFSET,
          WINDOW_SIZE,
          WINDOW_SIZE
        );
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
        p.textSize(6);
      } else {
        p.textSize(12);
      }
      p.textAlign(p.CENTER, p.TOP);
      p.text(getName(data) || '', x + ROCKET_SIZE / 2, y + ROCKET_SIZE + 4);
      p.text(getScore(data) || '', x + ROCKET_SIZE / 2, y + ROCKET_SIZE + 20);
    });
  });
}
