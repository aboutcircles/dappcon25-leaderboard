import { parseEther } from 'ethers';

// export const START_BLOCK = parseInt(
//   process.env.NEXT_PUBLIC_START_BLOCK || '40407277'
// );
export const START_BLOCK = 25261057;
export const MIN_CIRCLES = parseEther(
  process.env.NEXT_PUBLIC_MIN_CIRCLES || '1'
);
export const ORG_ADDRESS = process.env.NEXT_PUBLIC_ORG_ADDRESS as `0x${string}`;
export const TIMESTAMP_END = parseInt(
  process.env.NEXT_PUBLIC_TIMESTAMP_END || '1750262400' // Wednesday, June 18, 2025 6:00:00 PM CEST
);
