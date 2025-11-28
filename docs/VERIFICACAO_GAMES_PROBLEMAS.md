# 🔍 Problemas Encontrados nos Jogos

**Data:** Dezembro 2025

---

## ✅ Wheel of Fortune - CORRIGIDO

**Problema:** `spinWheel` retornava apenas hash, mas componente esperava `multiplier` e `winnings`

**Solução:**
- ✅ Atualizado `spinWheel` em `web3-api.ts` para aguardar receipt e extrair evento `WheelSpun`
- ✅ Retorna `{ hash, multiplier, winnings }` com valores reais do contrato
- ✅ Atualizado `mock-api.ts` para usar valores reais e converter corretamente

**Status:** ✅ Corrigido

---

## ⚠️ Rocket Game - PROBLEMA PARCIAL

**Problema:** `cashOutRocket` requer `betIndex`, mas `placeRocketBet` não retorna esse índice

**Detalhes:**
- O contrato não expõe uma função view para buscar apostas do usuário
- `currentRound` retorna apenas `(crashPoint, startTime, active)`, não inclui array `bets`
- Componente usa `betIndex = 0` hardcoded, o que pode estar errado

**Soluções possíveis:**
1. Criar função view no contrato para buscar apostas do usuário (requer modificação do contrato)
2. Escutar evento `RocketBetPlaced` e calcular betIndex baseado na ordem
3. Buscar o número de apostas antes da transação e usar como betIndex

**Status:** ⚠️ Funcional mas pode melhorar

**Nota:** O sistema atual funciona se cada usuário só fizer uma aposta por rodada. Para múltiplas apostas, seria necessário uma função view no contrato.

---

## 📝 RESUMO

**Total corrigido:** 1 (Wheel of Fortune)  
**Total parcial:** 1 (Rocket Game - funcional mas pode melhorar)

