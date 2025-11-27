# 💰 Resumo: Tokens e Gas Fee no Sistema

**Data de atualização:** Dezembro de 2025

## 🎯 Resumo Executivo

| Item | Valor |
|------|-------|
| **Rede Principal** | Polygon Mainnet (Chain ID: 137) |
| **Token de Gas** | **POL** (Polygon Ecosystem Token) |
| **Token de Troca** | MockUSDT (para testes/desenvolvimento) |
| **Token da Plataforma** | LIPT (ERC-20 próprio) |

---

## 🔹 Token de Gas: POL

### Status Atual
✅ **Sistema configurado corretamente** - A Polygon Mainnet agora usa **POL** como token nativo para pagamento de gas fees.

### Mudança Histórica
- **Até setembro 2024:** MATIC era o token de gas
- **Setembro 2024 - Dezembro 2025:** Migração gradual de MATIC para POL
- **Dezembro 2025 (atual):** POL é o único token aceito para gas na Polygon Mainnet

### Como Funciona
- O viem/wagmi automaticamente detecta POL na rede Polygon
- Usuários precisam ter **POL** na carteira para pagar taxas de transação
- Não é necessário alterar código - a biblioteca já está atualizada

### Onde Obter POL
- Exchanges de criptomoedas principais
- Pontes (bridges) para Polygon
- **Importante:** MATIC não está mais disponível para compra - apenas POL

---

## 🔹 Token de Troca: MockUSDT

### Status Atual
⚠️ **Em desenvolvimento/testes** - O sistema atualmente usa **MockUSDT**, um token de teste.

### Endereço na Polygon Mainnet
```
0x47A50422F81327139A4796C7494E7B8725D3EB30
```

### Características
- Token mock/simulado para testes
- Pode mintar tokens livremente (função `mint()` pública)
- **Não é o USDT real da Tether**

### Para Produção
✅ **Recomendação:** Migrar para USDT real da Tether:
- **Endereço oficial USDT na Polygon:** `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- USDT real tem valor de mercado e liquidez real

---

## 🔹 Token da Plataforma: LIPT

### Informações
- **Nome:** LIPT Token
- **Símbolo:** LIPT
- **Padrão:** ERC-20
- **Endereço na Polygon Mainnet:** `0x15F6CAfD1fE68B0BCddecb28a739d14dB38947e6`

---

## ✅ Configuração Atual do Sistema

### Rede
- ✅ Configurada para **Polygon Mainnet** (Chain ID: 137)
- ✅ Usa `polygon` chain do viem que automaticamente reconhece POL
- ✅ RPC URL configurada para Polygon Mainnet

### Gas Fee
- ✅ Automaticamente pago com **POL** (detectado pelo viem/wagmi)
- ✅ Usuários precisam ter POL na carteira

### Conclusão
O sistema está **corretamente configurado** para usar POL como token de gas. Não são necessárias alterações no código.

---

**Última atualização:** Dezembro de 2025

