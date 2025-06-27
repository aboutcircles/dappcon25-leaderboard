import { parseEther } from 'ethers';

const minCirclesEnv = process.env.NEXT_PUBLIC_MIN_CIRCLES || '1';
const minCirclesValue = (parseFloat(minCirclesEnv) * 0.9).toString();

export const MIN_CIRCLES = parseEther(minCirclesValue);

export const MIN_CIRCLES_TO_JOIN = process.env.NEXT_PUBLIC_MIN_CIRCLES;

export const ORG_ADDRESS =
  (process.env.NEXT_PUBLIC_ORG_ADDRESS as `0x${string}`) ||
  '0xb6994c4227e4dd79f8f81e5f698853ed57ad7258';
// export const START_BLOCK = parseInt(
//   process.env.NEXT_PUBLIC_START_BLOCK || '40407277'
// );

export const TIMESTAMP_START = parseInt(
  process.env.NEXT_PUBLIC_TIMESTAMP_START || '1748736000'
);
export const TIMESTAMP_END = parseInt(
  process.env.NEXT_PUBLIC_TIMESTAMP_END || '1751536800' // Thursday, July 3, 2025 2:00:00 PM GMT+02:00
);

// export const QR_CODE_VALUE = `https://app.metri.xyz/transfer/${process.env.NEXT_PUBLIC_ORG_ADDRESS}/crc`;
export const QR_CODE_VALUE = `https://app.metri.xyz/transfer/${process.env.NEXT_PUBLIC_ORG_ADDRESS}/crc/${process.env.NEXT_PUBLIC_MIN_CIRCLES}`;

export const COLORS = {
  1: '#00e2ff',
  2: '#71ff49',
};

export const SHOW_WINNERS_TIMESTAMP =
  parseInt(process.env.NEXT_PUBLIC_TIMESTAMP_END || '1751544000') * 1000;
