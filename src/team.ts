import { getAddress } from 'ethers';

const TEAM_ADDRESSES = [
  '0x866eade109f26e130b527a4e9a8350272967fc2c', // lukas
  '0xde374ece6fa50e781e81aac78e811b33d16912c7', // jaensen
  '0xa571627c6ce9c7faebd2ae67cc9212787ad77f0c', // theo
  '0x1d05d960d3b6ce8514ba8baf49488b2ebb5134dc', // daece
  '0x342ea25b5bbb874f3b89070024da7077fa05f287', // gabriel fior
  '0x42cedde51198d1773590311e2a340dc06b24cb37', // martin
  '0x1248d4388a179e61deab16b66a0a25a011c01dcd', // carolina
  '0x14aab8d72b68c79cbb7873d003585a7c3ef98633', // yevgeniy
  '0xed1afb38731ce824d51e01ef733b0031b69fead9', // deep
  '0x15b1818724e7ba721c09ae6f49339d33292e1a75', // philippe
  '0x4d9145def1647eff0136205ab3034f5297b524ac', // gnc
  '0x0c8c747f838dc2641040a1bbc330edc346e31d99', // matheus
];

export const TEAM = TEAM_ADDRESSES.map(address => getAddress(address));
