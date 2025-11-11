'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { get } from 'lodash';

export type Locale = 'en' | 'pt-BR' | 'es' | 'it';

const translations = {
  en: {
    toggleLanguage: 'Toggle language',
    stats: {
      liptPrice: {
        title: 'LIPT Token Price',
        description: 'Last 24 hours',
      },
      tvl: {
        title: 'Total Value Locked (TVL)',
        description: 'Across all pools',
      },
      liptBalance: {
        title: 'Your LIPT Balance',
        description: 'In your wallet',
      },
      usdtBalance: {
        title: 'Your USDT Balance',
        description: 'In your wallet',
      },
    },
  },
  'pt-BR': {
    toggleLanguage: 'Trocar idioma',
    stats: {
      liptPrice: {
        title: 'Preço do Token LIPT',
        description: 'Últimas 24 horas',
      },
      tvl: {
        title: 'Valor Total Bloqueado (TVL)',
        description: 'Em todas as pools',
      },
      liptBalance: {
        title: 'Seu Saldo LIPT',
        description: 'Na sua carteira',
      },
      usdtBalance: {
        title: 'Seu Saldo USDT',
        description: 'Na sua carteira',
      },
    },
  },
  es: {
    toggleLanguage: 'Cambiar idioma',
    stats: {
      liptPrice: {
        title: 'Precio del Token LIPT',
        description: 'Últimas 24 horas',
      },
      tvl: {
        title: 'Valor Total Bloqueado (TVL)',
        description: 'En todas las piscinas',
      },
      liptBalance: {
        title: 'Tu Saldo LIPT',
        description: 'En tu billetera',
      },
      usdtBalance: {
        title: 'Tu Saldo USDT',
        description: 'En tu billetera',
      },
    },
  },
  it: {
    toggleLanguage: 'Cambia lingua',
    stats: {
      liptPrice: {
        title: 'Prezzo del Token LIPT',
        description: 'Ultime 24 ore',
      },
      tvl: {
        title: 'Valore Totale Bloccato (TVL)',
        description: 'In tutte le pool',
      },
      liptBalance: {
        title: 'Il Tuo Saldo LIPT',
        description: 'Nel tuo portafoglio',
      },
      usdtBalance: {
        title: 'Il Tuo Saldo USDT',
        description: 'Nel tuo portafoglio',
      },
    },
  },
};

interface I18nContextData {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextData | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('pt-BR');

  const t = (key: string) => {
    return get(translations[locale], key, key);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
