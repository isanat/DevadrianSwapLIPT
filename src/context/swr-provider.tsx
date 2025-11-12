// src/context/SWRProvider.tsx
'use client';

import { SWRConfig } from 'swr';
import React from 'react';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher: (resource: any) => resource(), // Use the function itself as the fetcher
        refreshInterval: 30000, // Optional: auto-refresh data every 30 seconds
      }}
    >
      {children}
    </SWRConfig>
  );
};
