import p5 from 'p5';

export interface Player {
  address: string;
  transactionHash: string;
  blockNumber: number;
  amount: bigint;
  name?: string;
  // image?: string;
  timestamp: number;
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
  image: p5.Image | null;
  xOffset: number;
  yOffset: number;
  xSpeed: number;
  ySpeed: number;
  groupYOffset: number;
  singleGroupXOffset: number;
  randomXOffset?: number;
  randomXBase?: number;
};

export type TrustData = {
  trust: TopPlayer;
  image: p5.Image | null;
  xOffset: number;
  yOffset: number;
  xSpeed: number;
  ySpeed: number;
  groupYOffset: number;
  singleGroupXOffset: number;
  randomXOffset?: number;
  randomXBase?: number;
};
