import p5 from 'p5';

export interface Player {
  address: string;
  // transactionHash: string;
  // blockNumber: number;
  amount: bigint;
  name?: string;
  image?: string;
  // timestamp: number;
}

export interface InvitesStats {
  player: string;
  invitesSent: number;
  invitesRedeemed: number;
}

export interface TrustsStats {
  player: string;
  trusts: number;
  mutualTrusts: number;
}

export interface TopPlayer {
  address: string;
  name?: string;
  // image?: string;
  score: number;
}

export interface Profile {
  cidV0: string;
  id?: string;
  address?: string;
  name: string;
  isImageAvailable?: boolean;
  image?: string;
}

export interface InvitesRedeemed {
  profile: { name: string; id: string };
  timestamp: number;
  invitedBy: string;
}

export interface InviteSent {
  trustee: {
    profile: { name: string; id: string };
    transactionHash: string;
  };
  truster_id: string;
  timestamp: number;
}

export type RocketData = {
  invite: TopPlayer;
  address: string;
  image: p5.Image | null;
  imageUrl: string | null;
  imageLoading: boolean;
  xOffset: number;
  yOffset: number;
  xSpeed: number;
  ySpeed: number;
  groupYOffset: number;
  singleGroupXOffset: number;
  randomXBase?: number;
  randomXOffset?: number;
};

export type TrustData = {
  trust: TopPlayer;
  address: string;
  image: p5.Image | null;
  imageUrl: string | null;
  imageLoading: boolean;
  xOffset: number;
  yOffset: number;
  xSpeed: number;
  ySpeed: number;
  groupYOffset: number;
  singleGroupXOffset: number;
  randomXBase?: number;
  randomXOffset?: number;
};

export type TransferData = {
  from: string;
  to: string;
  token: string;
  value: string;
  transferType: string;
  db_write_timestamp: string;
};
