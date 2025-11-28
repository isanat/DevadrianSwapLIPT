# Tokenomics do LIPT Token: Modelo Deflacionário Híbrido

Este documento detalha o modelo de Tokenomics proposto para o LIPT Token, o token nativo da plataforma DeFi "DevAdrian Swap". O modelo visa impulsionar a valorização rápida, a alta liquidez e a escassez através de mecanismos de queima (burn) e recompra (buyback), alinhando os incentivos de todos os participantes.

## 1. Modelo de Fornecimento e Distribuição

O LIPT terá um **Fornecimento Total Fixo** (a ser definido, ex: 1 Bilhão de LIPT), com um mecanismo de cunhagem controlada para recompensas de Staking e Mineração, compensado por uma taxa de queima maior.

### 1.1. Alocação Inicial (Exemplo)

| Categoria | Percentual (%) | Detalhes e Bloqueio (Vesting) | Objetivo |
| :--- | :--- | :--- | :--- |
| **Pool de Liquidez (LP)** | **30%** | Bloqueado por 2 anos ou mais. | Garantir liquidez profunda e estabilidade de preço inicial. |
| **Recompensas (Staking/Mineração)** | **35%** | Liberado gradualmente ao longo de 5 anos (linear vesting). | Incentivar a retenção e o uso do token na plataforma. |
| **Desenvolvimento e Equipe** | **15%** | Bloqueado por 6 meses, liberado linearmente ao longo de 3 anos. | Recompensa e alinhamento de longo prazo com o sucesso do projeto. |
| **Reserva Estratégica (Buyback)** | **10%** | Bloqueado, usado exclusivamente para Buyback e parcerias. | Fundo para estabilização e recompra de tokens no mercado. |
| **Venda Pública (IDO/Launchpad)** | **10%** | 100% desbloqueado no lançamento. | Distribuição inicial e captação de capital para o projeto. |
| **Total** | **100%** | | |

## 2. Mecanismos de Valorização Rápida (Queima e Buyback)

Estes mecanismos criam um ciclo virtuoso de demanda e escassez, impulsionando o preço do LIPT.

### 2.1. Taxa de Transação (Reflection Tax)

Uma taxa de 3% será aplicada em **todas as transações de compra e venda** do LIPT no Pool de Liquidez (AMM).

| Destino da Taxa | Percentual (%) | Objetivo |
| :--- | :--- | :--- |
| **Queima (Burn)** | **1%** | Redução permanente da oferta (Escassez Deflacionária). |
| **Liquidez (LP)** | **1%** | Adicionado ao Pool de Liquidez (Aumento da Profundidade). |
| **Recompensas (Reflection)** | **1%** | Distribuído proporcionalmente aos holders de LIPT (Incentivo à Retenção). |
| **Total da Taxa** | **3%** | |

### 2.2. Buyback e Queima Baseado em Receita

A receita gerada pelas funcionalidades da plataforma (Taxas de Swap, Taxas de Jogos, Penalidades de Staking) será usada para recomprar e queimar o LIPT.

*   **70% da Receita da Plataforma (em USDT) será usada para Buyback:** O contrato usará o USDT acumulado para comprar LIPT no mercado aberto.
*   **100% do LIPT comprado será imediatamente Queimado (Burn):** O token recomprado é removido permanentemente da circulação.

## 3. Sustentabilidade e Compensação do Desenvolvedor

*   **20% da Receita da Plataforma (em USDT) será alocada para o Fundo de Desenvolvimento:** Fluxo de caixa contínuo para operações, manutenção e compensação do desenvolvedor.
*   **15% da Alocação Inicial de Tokens:** Compensação de longo prazo, alinhada com a valorização do token.

---
*Este documento deve ser usado como base para a implementação dos Smart Contracts e para a comunicação com a comunidade.*
