import { parseEther } from 'ethers';

const minCirclesEnv = process.env.NEXT_PUBLIC_MIN_CIRCLES || '1';
const minCirclesValue = (parseFloat(minCirclesEnv) * 0.9).toString();

export const MIN_CIRCLES = parseEther(minCirclesValue);

export const MIN_CIRCLES_TO_JOIN = process.env.NEXT_PUBLIC_MIN_CIRCLES;

export const ORG_ADDRESS = process.env.NEXT_PUBLIC_ORG_ADDRESS as `0x${string}`;
export const START_BLOCK = parseInt(
  process.env.NEXT_PUBLIC_START_BLOCK || '40407277'
);

export const TIMESTAMP_START = parseInt(
  process.env.NEXT_PUBLIC_TIMESTAMP_START || '1748736000'
);
export const TIMESTAMP_END = parseInt(
  process.env.NEXT_PUBLIC_TIMESTAMP_END || '1750262400' // Wednesday, June 18, 2025 6:00:00 PM CEST
);

// export const QR_CODE_VALUE = `https://app.metri.xyz/transfer/${process.env.NEXT_PUBLIC_ORG_ADDRESS}/crc`;
export const QR_CODE_VALUE = `https://app.metri.xyz/${process.env.NEXT_PUBLIC_ORG_ADDRESS}`;

export const COLORS = {
  1: '#00e2ff',
  2: '#71ff49',
};
