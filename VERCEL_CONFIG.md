# 🔧 Configuração do Vercel - Link de Afiliado

## 📋 Problema Resolvido

O sistema de afiliado estava usando domínios hardcoded (`devadrianswap.com` e `devadrian.com`) que não existem. Agora o sistema detecta automaticamente o domínio correto.

---

## ✅ Como Funciona Agora

O sistema usa uma função `getReferralLink()` que detecta o domínio automaticamente seguindo esta prioridade:

1. **`NEXT_PUBLIC_SITE_URL`** (se configurado manualmente no Vercel)
2. **`VERCEL_URL`** (injetado automaticamente pelo Vercel)
3. **`window.location.origin`** (domínio atual do navegador - sempre correto no cliente)

---

## 🚀 Configuração Recomendada no Vercel

### Opção 1: Usar Domínio Customizado (Recomendado)

Se você tem um domínio customizado configurado no Vercel:

1. Vá para **Settings** → **Environment Variables**
2. Adicione:
   ```
   Nome: NEXT_PUBLIC_SITE_URL
   Valor: https://seu-dominio.com
   ```
3. Selecione todos os ambientes (Production, Preview, Development)
4. Clique em **Save**

### Opção 2: Usar Domínio do Vercel Automático

O sistema já detecta automaticamente o domínio do Vercel usando `VERCEL_URL`.

Se você quiser usar o domínio do Vercel (ex: `seu-projeto.vercel.app`), não precisa fazer nada - o sistema já funciona!

### Opção 3: Deixar Detecção Automática (Padrão)

Se não configurar nada, o sistema usa `window.location.origin` no cliente, que sempre pega o domínio correto automaticamente.

---

## 📝 Exemplo de Link de Afiliado

**Antes (hardcoded - ERRADO):**
```
https://devadrianswap.com/invite?ref=0x642dA0e0C51e02d4Fe7C4b557C49F9D1111cF903
```

**Depois (dinâmico - CORRETO):**
```
https://seu-projeto.vercel.app/invite?ref=0x642dA0e0C51e02d4Fe7C4b557C49F9D1111cF903
```

ou

```
https://seu-dominio.com/invite?ref=0x642dA0e0C51e02d4Fe7C4b557C49F9D1111cF903
```

---

## 🔍 Arquivos Modificados

- ✅ `src/lib/utils.ts` - Adicionada função `getReferralLink()`
- ✅ `src/components/dashboard/referral-program.tsx` - Usando função dinâmica
- ✅ `src/services/mock-api.ts` - Usando função dinâmica

---

## ⚠️ Importante

O sistema agora funciona automaticamente, mas para garantir consistência em SSR (Server-Side Rendering), recomenda-se configurar a variável `NEXT_PUBLIC_SITE_URL` no Vercel.

**Última atualização:** 2025-11-26

