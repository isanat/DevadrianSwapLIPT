'use client';

import { SWRConfig } from 'swr';
import React from 'react';
import { getStakingData } from '@/services/mock-api';


// By enabling a refresh interval, we simulate real-time data updates
// by re-fetching the data every 5 seconds.
export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher: (resource) => {
            // A simple router for our mock API based on the SWR key
            if (resource === 'staking') {
                return getStakingData();
            }
            // Add other resources as needed
            return Promise.resolve(undefined);
        },
        refreshInterval: 5000, // Poll for new data every 5 seconds
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
      }}
    >
      {children}
    </SWRConfig>
  );
};
