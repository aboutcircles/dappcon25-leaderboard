export interface Player {
  address: string;
  transactionHash: string;
  blockNumber: number;
  amount: bigint;
  name?: string;
  image?: string;
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
  image?: string;
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
