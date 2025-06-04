import { gql } from 'urql';
import { urqlClient } from '@/lib/envioClient';
import { TIMESTAMP_START, TIMESTAMP_END } from '@/const';

export const TRUSTS_QUERY = gql`
  query getTrusts($addressList: [String!], $fromTime: Int, $toTime: Int) {
    TrustRelation(
      where: {
        truster_id: { _in: $addressList }
        timestamp: { _gte: $fromTime, _lte: $toTime }
        _or: [
          { trustee: { acceptedInviteTimestamp: { _gt: $fromTime } } }
          { trustee: { avatarType: { _eq: "Invite" } } }
        ]
        limit: { _neq: 0 }
        expiryTime: { _neq: 0 }
        version: { _eq: 2 }
      }
    ) {
      trustee {
        profile {
          name
        }
      }
      isMutual
      truster {
        id
        profile {
          name
        }
      }
    }
  }
`;

export const TRUSTS_SUBSCRIPTION = gql`
  subscription onTrusts($addressList: [String!], $fromTime: Int, $toTime: Int) {
    TrustRelation(
      where: {
        truster_id: { _in: $addressList }
        timestamp: { _gte: $fromTime, _lte: $toTime }
        _or: [
          { trustee: { acceptedInviteTimestamp: { _gt: $fromTime } } }
          { trustee: { avatarType: { _eq: "Invite" } } }
        ]
        limit: { _neq: 0 }
        expiryTime: { _neq: 0 }
        version: { _eq: 2 }
      }
    ) {
      trustee {
        profile {
          name
        }
      }
      isMutual
      truster {
        id
        profile {
          name
        }
      }
    }
  }
`;

export interface Trust {
  trustee: {
    profile: {
      name: string;
    };
  };
  isMutual: boolean;
  truster: {
    id: string;
    profile: {
      name: string;
    };
  };
}

export interface TrustsResult {
  TrustRelation: Trust[];
}

export async function fetchTrusts(addressList: string[]): Promise<Trust[]> {
  const result = await urqlClient
    .query(TRUSTS_QUERY, {
      addressList,
      fromTime: TIMESTAMP_START,
      toTime: TIMESTAMP_END,
    })
    .toPromise();
  if (result.error) throw result.error;
  return result.data?.TrustRelation || [];
}

export function subscribeToTrusts(
  addressList: string[],
  handler: (trusts: Trust[]) => void
) {
  const subscription = urqlClient
    .subscription(TRUSTS_SUBSCRIPTION, {
      addressList,
      fromTime: TIMESTAMP_START,
      toTime: TIMESTAMP_END,
    })
    .subscribe(result => {
      if (result.data) {
        handler(result.data.TrustRelation || []);
      }
    });
  return subscription;
}
