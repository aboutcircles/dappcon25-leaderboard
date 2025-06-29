import { gql } from 'urql';
import { urqlClient } from '@/lib/envio/envioClient';
import { TIMESTAMP_START, TIMESTAMP_END } from '@/const';
import { ORG_ADDRESS } from '@/const';
import { getAddress } from 'ethers';
import { formatUnixTimestampToISO } from '../utils/formatTimestampToISO';
import { TransferData } from '@/types';

export const TRANSFERS_SUBSCRIPTION = gql`
  subscription onTransfersData(
    $orgAddress: String
    $startTimeDb: timestamp
    $endTimeDb: timestamp
  ) {
    Transfer(
      where: {
        to: { _eq: $orgAddress }
        db_write_timestamp: { _gte: $startTimeDb, _lte: $endTimeDb }
        transferType: { _eq: "StreamCompleted" }
        isPartOfStreamOrHub: { _eq: false }
      }
    ) {
      from
      to
      token
      value
      transferType
      db_write_timestamp
    }
  }
`;

const orgAddress = getAddress(ORG_ADDRESS);
const startTimeDb = formatUnixTimestampToISO(TIMESTAMP_START);
const endTimeDb = formatUnixTimestampToISO(TIMESTAMP_END);

// console.log(orgAddress, startTimeDb, endTimeDb);

export function subscribeToTransfers(
  handler: (transfers: TransferData[]) => void
) {
  try {
    const subscription = urqlClient
      .subscription(TRANSFERS_SUBSCRIPTION, {
        orgAddress,
        startTimeDb,
        endTimeDb,
      })
      .subscribe(result => {
        console.log('Transfers subscription:', result);
        if (result.data) {
          handler(result.data.Transfer || []);
        }
      });
    return subscription;
  } catch (error) {
    console.log('Error subscribing to transfers:', error);
    return { unsubscribe: () => {} };
  }
}
