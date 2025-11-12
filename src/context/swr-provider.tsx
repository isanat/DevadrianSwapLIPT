'use client';

import { SWRConfig } from 'swr';
import React from 'react';

// We remove the global fetcher. Data fetching will be specified
// directly in the useSWR hooks when we integrate with the blockchain.
export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        // By setting a fetcher that does nothing, we disable the old mock calls.
        fetcher: () => Promise.resolve(undefined),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      {children}
    </SWRConfig>
  );
};
