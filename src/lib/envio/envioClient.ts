import {
  createClient,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from 'urql';
import { createClient as createWSClient, Client as WSClient } from 'graphql-ws';

export const url = 'https://gnosis-e702590.dedicated.hyperindex.xyz/v1/graphql';
export const wsUrl = url.replace('https://', 'wss://');

const wsClient: WSClient = createWSClient({
  url: wsUrl,
  shouldRetry: () => true,
});

export const urqlClient = createClient({
  url,
  exchanges: [
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: operation => ({
        subscribe: sink => {
          const op = { ...operation, query: String(operation.query) };
          return { unsubscribe: wsClient.subscribe(op, sink) };
        },
      }),
    }),
  ],
});
