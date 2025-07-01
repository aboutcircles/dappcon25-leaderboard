import { gql } from 'urql';
import { urqlClient } from '@/lib/envio/envioClient';
import { TIMESTAMP_START, TIMESTAMP_END } from '@/const';
import { InvitesRedeemed } from '@/types';
import { InviteSent } from '@/types';

export const INVITES_QUERY = gql`
  query getInvitesData($addressList: [String!], $fromTime: Int, $toTime: Int) {
    invitesRedeemed: Avatar(
      where: {
        invitedBy: { _in: $addressList }
        version: { _eq: 2 }
        timestamp: { _gte: $fromTime, _lte: $toTime }
      }
    ) {
      profile {
        name
        id
      }
      timestamp
      invitedBy
    }
    invitesSent: TrustRelation(
      where: {
        truster_id: { _in: $addressList }
        trustee: { avatarType: { _eq: "Invite" } }
        limit: { _neq: 0 }
        expiryTime: { _neq: 0 }
        version: { _eq: 2 }
        timestamp: { _gte: $fromTime, _lte: $toTime }
      }
    ) {
      trustee {
        profile {
          name
          id
        }
        transactionHash
      }
      truster_id
      timestamp
    }
  }
`;

export const INVITES_SUBSCRIPTION = gql`
  subscription onInvitesData(
    $addressList: [String!]
    $fromTime: Int
    $toTime: Int
  ) {
    invitesRedeemed: Avatar(
      where: {
        invitedBy: { _in: $addressList }
        version: { _eq: 2 }
        timestamp: { _gte: $fromTime, _lte: $toTime }
      }
    ) {
      profile {
        name
        id
      }
      timestamp
      invitedBy
    }
  }
`;

export async function fetchInvites(addressList: string[]): Promise<{
  invitesRedeemed: InvitesRedeemed[];
  invitesSent: InviteSent[];
}> {
  // console.log('Fetching invites:', addressList, TIMESTAMP_START, TIMESTAMP_END);
  const result = await urqlClient
    .query(INVITES_QUERY, {
      addressList,
      fromTime: TIMESTAMP_START,
      toTime: TIMESTAMP_END,
    })
    .toPromise();
  console.log('Invites fetched:', result.data);
  if (result.error) throw result.error;
  return {
    invitesRedeemed: result.data?.invitesRedeemed || [],
    invitesSent: result.data?.invitesSent || [],
  };
}

export function subscribeToInvites(
  addressList: string[],
  handler: (data: { invitesRedeemed: InvitesRedeemed[] }) => void
) {
  return urqlClient
    .subscription(INVITES_SUBSCRIPTION, {
      addressList,
      fromTime: TIMESTAMP_START,
      toTime: TIMESTAMP_END,
    })
    .subscribe(result => {
      if (result.data) {
        handler({
          invitesRedeemed: result.data.invitesRedeemed || [],
        });
      }
    });
}
