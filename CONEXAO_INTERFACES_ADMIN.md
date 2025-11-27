# Conexão das Interfaces Admin aos Smart Contracts

## Resumo das Correções

Todas as interfaces administrativas agora estão conectadas aos smart contracts. O admin pode criar e gerenciar planos de staking, mineração e segmentos da roda da fortuna diretamente via interface.

---

## 1. Funções Admin Criadas no `web3-api.ts`

### Staking Pool
- ✅ `addStakingPlan(userAddress, durationDays, apyPercent)` - Adiciona novo plano
- ✅ `modifyStakingPlan(userAddress, planId, durationDays, apyPercent, active)` - Modifica plano existente

### Mining Pool
- ✅ `addMiningPlan(userAddress, cost, power, durationDays)` - Adiciona novo plano
- ✅ `modifyMiningPlan(userAddress, planId, cost, power, durationDays, active)` - Modifica plano existente

### Wheel of Fortune
- ✅ `setWheelSegments(userAddress, multipliers[], weights[])` - Configura segmentos da roda

**Notas importantes:**
- Todas as funções convertem valores do frontend (dias, porcentagem) para o formato do contrato (segundos, basis points, wei)
- Todas aguardam confirmação da transação antes de retornar
- Apenas o owner pode executar essas funções (validação no contrato)

---

## 2. Interfaces Admin Conectadas

### `/admin/staking` - Staking Pool Management
**Antes:**
- Usava `initialPlans` (hardcoded)
- Salvava apenas em estado local
- Não interagía com o contrato

**Depois:**
- ✅ Busca planos do contrato usando `getStakingPlans()`
- ✅ Botão "Salvar" chama `addStakingPlan()` ou `modifyStakingPlan()`
- ✅ Botão "Desativar" chama `modifyStakingPlan()` com `active: false`
- ✅ Exibe planos do contrato com ID, status (ativo/inativo)
- ✅ Loading states e mensagens de erro/sucesso

### `/admin/mining` - Mining Pool Management
**Antes:**
- Usava `initialPlans` (hardcoded)
- Salvava apenas em estado local
- Não interagía com o contrato

**Depois:**
- ✅ Busca planos do contrato usando `getMiningPlans()`
- ✅ Botão "Salvar" chama `addMiningPlan()` ou `modifyMiningPlan()`
- ✅ Botão "Desativar" chama `modifyMiningPlan()` com `active: false`
- ✅ Exibe planos do contrato com ID, status (ativo/inativo)
- ✅ Conversão correta de cost e power (LIPT para wei)
- ✅ Loading states e mensagens de erro/sucesso

### `/admin/games/wheel` - Wheel of Fortune Management
**Antes:**
- Usava `initialSegments` (hardcoded)
- Salvava apenas em estado local
- Não interagía com o contrato

**Depois:**
- ✅ Busca segmentos do contrato usando `getWheelSegments()`
- ✅ Botão "Salvar Configuração" chama `setWheelSegments()`
- ✅ Exibe segmentos do contrato (ou mensagem se vazio)
- ✅ Converte multipliers de decimal para basis points
- ✅ Loading states e mensagens de erro/sucesso

---

## 3. Fluxo de Uso

### Para o Admin Criar Planos:

1. **Conectar carteira** como owner do contrato
2. **Navegar para** `/admin/staking` ou `/admin/mining`
3. **Clicar em** "Adicionar Novo Plano"
4. **Preencher os campos:**
   - Staking: Duration (dias), APY (%)
   - Mining: Cost (LIPT), Power (LIPT/s), Duration (dias)
5. **Clicar em** "Salvar Plano"
6. **Confirmar transação** na carteira
7. **Aguardar confirmação** (automático)
8. **Ver plano aparecer** na lista

### Para o Admin Configurar Segmentos da Roda:

1. **Conectar carteira** como owner do contrato
2. **Navegar para** `/admin/games/wheel`
3. **Se não há segmentos:** Clicar em "Adicionar Primeiro Segmento"
4. **Configurar segmentos:**
   - Multiplier (ex: 1.5 = 1.5x)
   - Weight (probabilidade)
   - Color (apenas visual)
5. **Clicar em** "Salvar Configuração"
6. **Confirmar transação** na carteira
7. **Aguardar confirmação** (automático)
8. **Ver segmentos aparecerem** na roda

---

## 4. Conversões Implementadas

### Staking Plans:
- **Duration**: Dias → Segundos (`days * 24 * 60 * 60`)
- **APY**: Porcentagem → Basis Points (`percent * 100`)

### Mining Plans:
- **Cost**: LIPT → Wei (usando `getTokenDecimals(LIPT_ADDRESS)`)
- **Power**: LIPT por segundo → Wei por segundo (assumindo 18 decimais)
- **Duration**: Dias → Segundos (`days * 24 * 60 * 60`)

### Wheel Segments:
- **Multiplier**: Decimal → Basis Points (`multiplier * 100`, ex: 1.5x = 150)
- **Weight**: Número inteiro (já está correto)

---

## 5. Melhorias Implementadas

1. ✅ **Loading states** durante carregamento e salvamento
2. ✅ **Mensagens de erro** claras quando falha
3. ✅ **Mensagens de sucesso** quando salva com sucesso
4. ✅ **Validação de campos** antes de salvar
5. ✅ **Atualização automática** dos dados após salvar
6. ✅ **Exibição de status** (ativo/inativo) dos planos
7. ✅ **ID dos planos** exibido na tabela
8. ✅ **Mensagem clara** quando não há planos/segmentos configurados

---

## 6. Próximos Passos

Agora o admin pode:
1. ✅ Criar planos de staking via interface
2. ✅ Criar planos de mineração via interface
3. ✅ Configurar segmentos da roda via interface
4. ✅ Modificar/desativar planos existentes

**Importante:** 
- Os usuários só verão planos que foram criados no contrato
- Se não houver planos, o frontend mostrará mensagem apropriada
- O admin deve criar os planos antes dos usuários poderem usar

---

## Arquivos Modificados

1. `src/services/web3-api.ts` - Funções admin criadas
2. `src/app/admin/staking/page.tsx` - Conectado ao contrato
3. `src/app/admin/mining/page.tsx` - Conectado ao contrato
4. `src/app/admin/games/wheel/page.tsx` - Conectado ao contrato

