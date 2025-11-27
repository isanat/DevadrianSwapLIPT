import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Obtém a URL base do site dinamicamente
 * Prioridade:
 * 1. NEXT_PUBLIC_SITE_URL (se configurado manualmente)
 * 2. VERCEL_URL (domínio do Vercel - automático)
 * 3. window.location.origin (domínio atual no cliente)
 * 4. Fallback para localhost em desenvolvimento
 */
export function getSiteUrl(): string {
  // No servidor (SSR)
  if (typeof window === 'undefined') {
    // Usar variável de ambiente se disponível
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
    
    // Vercel automaticamente injeta VERCEL_URL, mas não inclui protocolo
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // Fallback para desenvolvimento local
    return 'http://localhost:3000';
  }
  
  // No cliente
  // Usar variável de ambiente se disponível
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Usar window.location.origin como fallback (sempre correto no cliente)
  return window.location.origin;
}

/**
 * Gera link de afiliado com o domínio correto
 */
export function getReferralLink(userAddress: string): string {
  const baseUrl = getSiteUrl();
  return `${baseUrl}/invite?ref=${userAddress}`;
}
