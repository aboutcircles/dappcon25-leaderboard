import { TIMESTAMP_START, TIMESTAMP_END } from '@/const';

// Type for a TrustRelation row
export type TrustRelation = {
  blockNumber: number;
  timestamp: number;
  transactionIndex: number;
  logIndex: number;
  transactionHash: string;
  trustee: string;
  truster: string;
  expiryTime: string;
};

type TrustMap = Record<
  string,
  { in: string[]; out: string[]; mutual: string[] }
>;

async function getTrustInits(addresses: string[]): Promise<TrustMap> {
  let queryTimestamp = TIMESTAMP_START;
  const trustMap: TrustMap = {};
  addresses.forEach(addr => {
    trustMap[addr.toLowerCase()] = { in: [], out: [], mutual: [] };
  });
  let keepFetching = true;

  while (keepFetching) {
    const response = await fetch('https://rpc.aboutcircles.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'circles_query',
        params: [
          {
            Namespace: 'V_CrcV2',
            Table: 'TrustRelations',
            Columns: [
              'blockNumber',
              'timestamp',
              'transactionHash',
              'trustee',
              'truster',
              'expiryTime',
            ],
            Filter: [
              {
                Type: 'Conjunction',
                ConjunctionType: 'And',
                Predicates: [
                  {
                    Type: 'Conjunction',
                    ConjunctionType: 'Or',
                    Predicates: [
                      {
                        Type: 'FilterPredicate',
                        FilterType: 'In',
                        Column: 'trustee',
                        Value: addresses,
                      },
                      {
                        Type: 'FilterPredicate',
                        FilterType: 'In',
                        Column: 'truster',
                        Value: addresses,
                      },
                    ],
                  },
                  {
                    Type: 'FilterPredicate',
                    FilterType: 'GreaterThanOrEquals',
                    Column: 'timestamp',
                    Value: queryTimestamp,
                  },
                  {
                    Type: 'FilterPredicate',
                    FilterType: 'LessThanOrEquals',
                    Column: 'timestamp',
                    Value: TIMESTAMP_END,
                  },
                  {
                    Type: 'FilterPredicate',
                    FilterType: 'GreaterThanOrEquals',
                    Column: 'expiryTime',
                    Value: TIMESTAMP_END,
                  },
                ],
              },
            ],
            Order: [
              {
                Column: 'timestamp',
                SortOrder: 'ASC',
              },
            ],
            Limit: 1000,
          },
        ],
      }),
    });
    const json = await response.json();
    const result = json?.result || [];
    const rows = result.rows || [];
    // console.log('rows', rows);
    for (const rel of rows) {
      const truster = rel[4].toLowerCase();
      const trustee = rel[3].toLowerCase();
      if (truster === trustee) {
        continue;
      }
      if (trustMap[truster] && !trustMap[truster].out.includes(trustee)) {
        trustMap[truster].out.push(trustee);

        if (
          trustMap[truster].in.includes(trustee) &&
          !trustMap[truster].mutual.includes(trustee)
        ) {
          trustMap[truster].mutual.push(trustee);
        }
      }
      if (trustMap[trustee] && !trustMap[trustee].in.includes(truster)) {
        trustMap[trustee].in.push(truster);

        if (
          trustMap[trustee].out.includes(truster) &&
          !trustMap[trustee].mutual.includes(truster)
        ) {
          trustMap[trustee].mutual.push(truster);
        }
      }
    }
    if (result.length === 1000) {
      queryTimestamp = result[result.length - 1].timestamp;
    } else {
      keepFetching = false;
    }
  }
  return trustMap;
}

export default getTrustInits;
