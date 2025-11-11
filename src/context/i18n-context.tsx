'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { get } from 'lodash';

export type Locale = 'en' | 'pt-BR' | 'es' | 'it';

const translations = {
  en: {
    toggleLanguage: 'Toggle language',
    header: {
      resetLayout: 'Reset Layout',
    },
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
      },
      usdtBalance: {
        title: 'Your USDT Balance',
      },
      totalInvested: {
        title: 'Total Invested',
        description: 'Your total capital on the platform',
      },
      totalReturns: {
        title: 'Total Returns',
        description: 'Total value returned from investments',
      }
    },
    stakingPool: {
      title: 'LIPT Staking Pool',
      description: 'Stake your LIPT tokens to earn higher rewards with longer lock-in periods.',
      tooltip: 'Here you "lock" your LIPT tokens for a set period to earn rewards. The longer you lock them, the higher the annual percentage yield (APY). Think of it like a fixed-term savings account, but with crypto!',
      totalStaked: 'Total Staked Balance',
      unclaimedRewards: 'Unclaimed Rewards',
      stakeTab: 'Stake',
      manageTab: 'Manage Stakes',
      selectPlan: 'Select Staking Plan',
      days: 'Days',
      apy: 'APY',
      amountToStake: 'Amount to Stake',
      walletBalance: 'Your wallet balance',
      stakeButton: 'Stake',
      yourActiveStakes: 'Your Active Stakes',
      noActiveStakes: 'You have no active stakes.',
      unstakeButton: 'Unstake',
      complete: 'complete',
      remaining: 'remaining',
      mature: 'Mature',
      claimRewardsButton: 'Claim All Rewards',
      unstakeModal: {
        title: 'Are you sure you want to unstake?',
        descriptionMature: 'Your funds will be returned to your wallet.',
        descriptionPenalty: 'This stake is not mature. A 10% penalty will be applied to the principal amount.',
        cancel: 'Cancel',
        confirm: 'Yes, Unstake',
      },
      toast: {
        staked: {
          title: 'Staked Successfully',
          description: 'You have staked {amount} LIPT for {duration} days.',
        },
        invalidAmount: {
          title: 'Invalid Amount',
          description: 'Please check your balance and try again.',
        },
        unstaked: {
          title: 'Unstaked Successfully',
          description: 'Your funds have been returned to your wallet.',
          descriptionPenalty: 'You have unstaked. A penalty of {penalty} LIPT was applied.',
        },
        rewardsClaimed: {
          title: 'Rewards Claimed',
          description: 'You have claimed {amount} LIPT.',
        },
        noRewards: {
          title: 'No Rewards',
          description: 'You have no rewards to claim.',
        },
      },
    },
    liquidityPool: {
      title: 'Liquidity Pool (LIPT/USDT)',
      description: 'Provide liquidity to earn trading fees from the LIPT/USDT pair.',
      tooltip: 'Here you provide both LIPT and USDT tokens to facilitate trades on the platform. In return, you earn a share of the trading fees. Your earnings depend on how much of the pool you own.',
      yourPoolShare: 'Your Pool Share',
      yourLpTokens: 'Your LP Tokens',
      feesEarned: 'Fees Earned',
      addTab: 'Add Liquidity',
      removeTab: 'Remove Liquidity',
      liptAmount: 'LIPT Amount',
      usdtAmount: 'USDT Amount',
      balance: 'Balance',
      addButton: 'Add Liquidity',
      removeLpAmount: 'LP Token Amount to Remove',
      removeButton: 'Remove',
      toast: {
        added: {
          title: 'Liquidity Added',
          description: 'Added {lipt} LIPT and {usdt} USDT.',
        },
        removed: {
          title: 'Liquidity Removed',
          description: 'You removed {amount} LP tokens.',
        },
        invalidAmount: {
          title: 'Invalid Amount',
          description: 'Please check your balances and try again.',
        },
      },
    },
    tokenPurchase: {
      title: 'Buy LIPT Token',
      description: 'Purchase LIPT tokens using USDT.',
      tooltip: 'This is the easiest way to get LIPT tokens. Simply enter the amount of USDT you want to spend, and we will calculate how many LIPT tokens you will receive at the current market price.',
      youPay: 'You pay (USDT)',
      youReceive: 'You receive (LIPT)',
      purchaseButton: 'Purchase LIPT',
      toast: {
        success: {
          title: 'Purchase Successful!',
          description: 'You have purchased {amount} LIPT.',
        },
        invalid: {
          title: 'Invalid Amount',
          description: 'Please check your USDT balance and try again.',
        }
      },
    },
    referralProgram: {
      title: 'Unilevel Referral Program',
      description: 'Invite friends and earn rewards from their activities across multiple levels.',
      tooltip: 'Share your unique link with friends. When they join and participate in staking or mining, you earn a commission. The more people in your network, the more you can earn!',
      yourLink: 'Your Unique Referral Link',
      copied: 'Copied to clipboard!',
      copiedDesc: 'You can now share your referral link.',
      totalReferrals: 'Total Referrals',
      totalRewards: 'Total Referral Rewards',
      totalTeam: 'Total Team Members',
      networkTitle: 'Your Unilevel Network',
      networkDescription: 'View the members and commissions earned from each level of your network.',
      level: 'Level',
      members: 'Members',
      commission: 'Commission',
    },
    wallet: {
      connect: 'Connect Wallet',
      disconnect: 'Wallet Disconnected',
      connected: 'Wallet Connected Successfully!',
      metaMaskNotFound: 'MetaMask Not Found',
      installMetaMask: 'Please install the MetaMask browser extension.',
    },
    miningPool: {
      title: 'Mining Room',
      description: 'Activate miners to generate LIPT tokens over time.',
      tooltip: 'Activate a "miner" by paying a one-time LIPT cost. The miner will then generate LIPT for you over a set period. Higher-tier miners cost more but generate rewards faster. It\'s like having a machine that prints money!',
      totalPower: 'Total Mining Power',
      unclaimedRewards: 'Mined Rewards',
      activateTab: 'Activate Miner',
      activeTab: 'Active Miners',
      selectMiner: 'Select a Miner',
      hour: 'hr',
      cost: 'Cost',
      activateButton: 'Activate',
      yourActiveMiners: 'Your Active Miners',
      noActiveMiners: 'You have no active miners.',
      mined: 'Mined',
      completed: 'Completed',
      claimRewardsButton: 'Claim Mined Rewards',
      toast: {
        activated: {
          title: 'Miner Activated!',
          description: 'Your {name} miner is now active.',
        },
        insufficientFunds: {
          title: 'Insufficient LIPT',
          description: 'You do not have enough LIPT to activate this miner.',
        },
        rewardsClaimed: {
          title: 'Mined Rewards Claimed',
          description: 'You have claimed {amount} LIPT from mining.',
        },
      },
    },
    leaderboard: {
      title: 'Referral Champions',
      description: 'Top 10 users by referral commission earned.',
      tooltip: 'See who is leading the pack! This leaderboard shows the top earners from the referral program. A little friendly competition to see who can build the biggest network.',
      rank: 'Rank',
      user: 'User',
      commission: 'Commission (LIPT)',
    },
    gameZone: {
      title: 'Game Zone',
      description: 'Play games to win LIPT prizes!',
      tooltip: 'Feeling lucky? Place your bets and play exciting games to multiply your LIPT. Remember to play responsibly!',
      wheelOfFortune: {
        title: 'Wheel of Fortune',
        betAmount: 'Bet Amount',
        spinButton: 'Spin the Wheel!',
        spinning: 'Spinning...',
        toast: {
          win: {
            title: 'You Won!',
            description: 'You won {amount} LIPT!',
          },
          lose: {
            title: 'You Lost',
            description: 'Better luck next time!',
          },
          invalidBet: {
            title: 'Invalid Bet',
            description: 'Please check your balance and bet amount.',
          },
        },
      },
      report: {
        title: 'Report',
        totalPlays: 'Total Plays',
        totalWagered: 'Total Wagered',
        netBalance: 'Net Balance (W/L)',
        last5Plays: 'Last 5 Plays',
        last5PlaysDesc: 'Here are the results of your last five spins.',
        bet: 'Bet',
        multiplier: 'Multiplier',
        result: 'Result',
        noPlays: 'No plays recorded yet. Spin the wheel to start!',
      },
      rocket: {
        title: 'LIPT Rocket',
      },
      lottery: {
        title: 'Daily Lottery',
      }
    },
  },
  'pt-BR': {
    toggleLanguage: 'Trocar idioma',
    header: {
      resetLayout: 'Redefinir Layout',
    },
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
      },
      usdtBalance: {
        title: 'Seu Saldo USDT',
      },
      totalInvested: {
        title: 'Total Investido',
        description: 'Seu capital total na plataforma',
      },
      totalReturns: {
        title: 'Retorno Total',
        description: 'Valor total retornado dos investimentos',
      }
    },
    stakingPool: {
      title: 'Pool de Staking LIPT',
      description: 'Faça stake de seus tokens LIPT para ganhar maiores recompensas com períodos de bloqueio mais longos.',
      tooltip: 'Aqui você "trava" seus tokens LIPT por um período definido para ganhar recompensas. Quanto mais tempo você os trava, maior o rendimento percentual anual (APY). Pense nisso como uma poupança de prazo fixo, mas com cripto!',
      totalStaked: 'Saldo Total em Stake',
      unclaimedRewards: 'Recompensas Não Reivindicadas',
      stakeTab: 'Stake',
      manageTab: 'Gerenciar Stakes',
      selectPlan: 'Selecione o Plano de Staking',
      days: 'Dias',
      apy: 'APY',
      amountToStake: 'Quantidade para Stake',
      walletBalance: 'Saldo na sua carteira',
      stakeButton: 'Fazer Stake',
      yourActiveStakes: 'Seus Stakes Ativos',
      noActiveStakes: 'Você não tem stakes ativos.',
      unstakeButton: 'Retirar',
      complete: 'completo',
      remaining: 'restantes',
      mature: 'Maturado',
      claimRewardsButton: 'Reivindicar Todas as Recompensas',
      unstakeModal: {
        title: 'Tem certeza que deseja retirar o stake?',
        descriptionMature: 'Seus fundos serão devolvidos para sua carteira.',
        descriptionPenalty: 'Este stake ainda não maturou. Uma penalidade de 10% será aplicada sobre o valor principal.',
        cancel: 'Cancelar',
        confirm: 'Sim, Retirar',
      },
      toast: {
        staked: {
          title: 'Stake Realizado com Sucesso',
          description: 'Você fez stake de {amount} LIPT por {duration} dias.',
        },
        invalidAmount: {
          title: 'Valor Inválido',
          description: 'Por favor, verifique seu saldo e tente novamente.',
        },
        unstaked: {
          title: 'Retirada Realizada com Sucesso',
          description: 'Seus fundos foram devolvidos para sua carteira.',
          descriptionPenalty: 'Você retirou o stake. Uma penalidade de {penalty} LIPT foi aplicada.',
        },
        rewardsClaimed: {
          title: 'Recompensas Reivindicadas',
          description: 'Você reivindicou {amount} LIPT.',
        },
        noRewards: {
          title: 'Sem Recompensas',
          description: 'Você não tem recompensas para reivindicar.',
        },
      },
    },
    liquidityPool: {
      title: 'Pool de Liquidez (LIPT/USDT)',
      description: 'Forneça liquidez para ganhar taxas de negociação do par LIPT/USDT.',
      tooltip: 'Aqui você fornece tokens LIPT e USDT para facilitar as negociações na plataforma. Em troca, você ganha uma parte das taxas de negociação. Seus ganhos dependem de quanto da pool você possui.',
      yourPoolShare: 'Sua Participação na Pool',
      yourLpTokens: 'Seus Tokens LP',
      feesEarned: 'Taxas Ganhas',
      addTab: 'Adicionar Liquidez',
      removeTab: 'Remover Liquidez',
      liptAmount: 'Quantidade de LIPT',
      usdtAmount: 'Quantidade de USDT',
      balance: 'Saldo',
      addButton: 'Adicionar Liquidez',
      removeLpAmount: 'Quantidade de Tokens LP para Remover',
      removeButton: 'Remover',
      toast: {
        added: {
          title: 'Liquidez Adicionada',
          description: 'Adicionado {lipt} LIPT e {usdt} USDT.',
        },
        removed: {
          title: 'Liquidez Removida',
          description: 'Você removeu {amount} tokens LP.',
        },
        invalidAmount: {
          title: 'Valor Inválido',
          description: 'Por favor, verifique seus saldos e tente novamente.',
        },
      },
    },
    tokenPurchase: {
      title: 'Comprar Token LIPT',
      description: 'Compre tokens LIPT usando USDT.',
      tooltip: 'Esta é a maneira mais fácil de obter tokens LIPT. Basta inserir a quantidade de USDT que deseja gastar, e nós calcularemos quantos tokens LIPT você receberá pelo preço de mercado atual.',
      youPay: 'Você paga (USDT)',
      youReceive: 'Você recebe (LIPT)',
      purchaseButton: 'Comprar LIPT',
      toast: {
        success: {
          title: 'Compra Realizada com Sucesso!',
          description: 'Você comprou {amount} LIPT.',
        },
        invalid: {
          title: 'Valor Inválido',
          description: 'Por favor, verifique seu saldo de USDT e tente novamente.',
        },
      },
    },
    referralProgram: {
      title: 'Programa de Indicação Unilevel',
      description: 'Convide amigos e ganhe recompensas de suas atividades em múltiplos níveis.',
      tooltip: 'Compartilhe seu link exclusivo com amigos. Quando eles entram e participam no staking ou na mineração, você ganha uma comissão. Quanto mais pessoas na sua rede, mais você pode ganhar!',
      yourLink: 'Seu Link de Indicação Único',
      copied: 'Copiado para a área de transferência!',
      copiedDesc: 'Você já pode compartilhar seu link de indicação.',
      totalReferrals: 'Total de Indicados',
      totalRewards: 'Recompensas Totais de Indicação',
      totalTeam: 'Total de Membros da Equipe',
      networkTitle: 'Sua Rede Unilevel',
      networkDescription: 'Veja os membros e comissões ganhas de cada nível da sua rede.',
      level: 'Nível',
      members: 'Membros',
      commission: 'Comissão',
    },
    wallet: {
      connect: 'Conectar Carteira',
      disconnect: 'Carteira Desconectada',
      connected: 'Carteira Conectada com Sucesso!',
      metaMaskNotFound: 'MetaMask Não Encontrado',
      installMetaMask: 'Por favor, instale a extensão MetaMask no seu navegador.',
    },
    miningPool: {
      title: 'Sala de Mineração',
      description: 'Ative mineradores para gerar tokens LIPT ao longo do tempo.',
      tooltip: 'Ative um "minerador" pagando um custo único em LIPT. O minerador então gerará LIPT para você por um período determinado. Mineradores de nível superior custam mais, mas geram recompensas mais rápido. É como ter uma máquina que imprime dinheiro!',
      totalPower: 'Poder de Mineração Total',
      unclaimedRewards: 'Recompensas Mineradas',
      activateTab: 'Ativar Minerador',
      activeTab: 'Mineradores Ativos',
      selectMiner: 'Selecione um Minerador',
      hour: 'h',
      cost: 'Custo',
      activateButton: 'Ativar',
      yourActiveMiners: 'Seus Mineradores Ativos',
      noActiveMiners: 'Você não tem mineradores ativos.',
      mined: 'Minerado',
      completed: 'Concluído',
      claimRewardsButton: 'Reivindicar Recompensas Mineradas',
      toast: {
        activated: {
          title: 'Minerador Ativado!',
          description: 'Seu minerador {name} agora está ativo.',
        },
        insufficientFunds: {
          title: 'LIPT Insuficiente',
          description: 'Você não tem LIPT suficiente para ativar este minerador.',
        },
        rewardsClaimed: {
          title: 'Recompensas Mineradas Reivindicadas',
          description: 'Você reivindicou {amount} LIPT da mineração.',
        },
      },
    },
    leaderboard: {
      title: 'Campeões de Indicação',
      description: 'Top 10 usuários por comissão de indicação ganha.',
      tooltip: 'Veja quem está liderando o grupo! Este placar mostra os maiores ganhadores do programa de indicação. Uma competição amigável para ver quem consegue construir a maior rede.',
      rank: 'Pos.',
      user: 'Usuário',
      commission: 'Comissão (LIPT)',
    },
    gameZone: {
      title: 'Área de Jogos',
      description: 'Jogue para ganhar prêmios em LIPT!',
      tooltip: 'Está com sorte? Faça suas apostas e jogue jogos emocionantes para multiplicar seus LIPT. Lembre-se de jogar com responsabilidade!',
      wheelOfFortune: {
        title: 'Roda da Fortuna',
        betAmount: 'Valor da Aposta',
        spinButton: 'Girar a Roda!',
        spinning: 'Girando...',
        toast: {
          win: {
            title: 'Você Ganhou!',
            description: 'Você ganhou {amount} LIPT!',
          },
          lose: {
            title: 'Você Perdeu',
            description: 'Mais sorte da próxima vez!',
          },
          invalidBet: {
            title: 'Aposta Inválida',
            description: 'Por favor, verifique seu saldo e o valor da aposta.',
          },
        },
      },
      report: {
        title: 'Relatório',
        totalPlays: 'Total de Jogadas',
        totalWagered: 'Total Apostado',
        netBalance: 'Balanço (G/P)',
        last5Plays: 'Últimas 5 Jogadas',
        last5PlaysDesc: 'Aqui estão os resultados das suas últimas cinco jogadas.',
        bet: 'Aposta',
        multiplier: 'Multiplicador',
        result: 'Resultado',
        noPlays: 'Nenhuma jogada registada ainda. Gire a roda para começar!',
      },
      rocket: {
        title: 'Foguete LIPT',
      },
      lottery: {
        title: 'Loteria Diária',
      }
    },
  },
  es: {
    toggleLanguage: 'Cambiar idioma',
    header: {
      resetLayout: 'Restablecer Diseño',
    },
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
      },
      usdtBalance: {
        title: 'Tu Saldo USDT',
      },
      totalInvested: {
        title: 'Total Invertido',
        description: 'Tu capital total en la plataforma',
      },
      totalReturns: {
        title: 'Retorno Total',
        description: 'Valor total devuelto de las inversiones',
      }
    },
    stakingPool: {
      title: 'Piscina de Staking LIPT',
      description: 'Haz stake con tus tokens LIPT para ganar mayores recompensas con períodos de bloqueo más largos.',
      tooltip: 'Aquí "bloqueas" tus tokens LIPT por un período definido para ganar recompensas. Cuanto más tiempo los bloquees, mayor será el rendimiento porcentual anual (APY). ¡Piénsalo como una cuenta de ahorros a plazo fijo, pero con cripto!',
      totalStaked: 'Saldo Total en Stake',
      unclaimedRewards: 'Recompensas No Reclamadas',
      stakeTab: 'Hacer Stake',
      manageTab: 'Gestionar Stakes',
      selectPlan: 'Seleccionar Plan de Staking',
      days: 'Días',
      apy: 'APY',
      amountToStake: 'Cantidad para Stake',
      walletBalance: 'Saldo en tu billetera',
      stakeButton: 'Hacer Stake',
      yourActiveStakes: 'Tus Stakes Activos',
      noActiveStakes: 'No tienes stakes activos.',
      unstakeButton: 'Retirar',
      complete: 'completado',
      remaining: 'restantes',
      mature: 'Madurado',
      claimRewardsButton: 'Reclamar Todas las Recompensas',
      unstakeModal: {
        title: '¿Estás seguro de que quieres retirar el stake?',
        descriptionMature: 'Tus fondos serán devueltos a tu billetera.',
        descriptionPenalty: 'Este stake aún no ha madurado. Se aplicará una penalización del 10% sobre el monto principal.',
        cancel: 'Cancelar',
        confirm: 'Sí, Retirar',
      },
      toast: {
        staked: {
          title: 'Stake Realizado con Éxito',
          description: 'Has hecho stake de {amount} LIPT por {duration} días.',
        },
        invalidAmount: {
          title: 'Cantidad Inválida',
          description: 'Por favor, revisa tu saldo e inténtalo de nuevo.',
        },
        unstaked: {
          title: 'Retiro Realizado con Éxito',
          description: 'Tus fondos han sido devueltos a tu billetera.',
          descriptionPenalty: 'Has retirado el stake. Se aplicó una penalización de {penalty} LIPT.',
        },
        rewardsClaimed: {
          title: 'Recompensas Reclamadas',
          description: 'Has reclamado {amount} LIPT.',
        },
        noRewards: {
          title: 'Sin Recompensas',
          description: 'No tienes recompensas para reclamar.',
        },
      },
    },
    liquidityPool: {
      title: 'Piscina de Liquidez (LIPT/USDT)',
      description: 'Proporciona liquidez para ganar comisiones de trading del par LIPT/USDT.',
      tooltip: 'Aquí proporcionas tokens LIPT y USDT para facilitar las operaciones en la plataforma. A cambio, ganas una parte de las comisiones de trading. Tus ganancias dependen de la parte de la piscina que poseas.',
      yourPoolShare: 'Tu Participación en la Piscina',
      yourLpTokens: 'Tus Tokens LP',
      feesEarned: 'Comisiones Ganadas',
      addTab: 'Añadir Liquidez',
      removeTab: 'Quitar Liquidez',
      liptAmount: 'Cantidad de LIPT',
      usdtAmount: 'Cantidad de USDT',
      balance: 'Saldo',
      addButton: 'Añadir Liquidez',
      removeLpAmount: 'Cantidad de Tokens LP a Quitar',
      removeButton: 'Quitar',
      toast: {
        added: {
          title: 'Liquidez Añadida',
          description: 'Se añadieron {lipt} LIPT y {usdt} USDT.',
        },
        removed: {
          title: 'Liquidez Retirada',
          description: 'Has retirado {amount} tokens LP.',
        },
        invalidAmount: {
          title: 'Cantidad Inválida',
          description: 'Por favor, revisa tus saldos e inténtalo de nuevo.',
        },
      },
    },
    tokenPurchase: {
      title: 'Comprar Token LIPT',
      description: 'Compra tokens LIPT usando USDT.',
      tooltip: 'Esta es la forma más fácil de obtener tokens LIPT. Simplemente ingresa la cantidad de USDT que deseas gastar y calcularemos cuántos tokens LIPT recibirás al precio de mercado actual.',
      youPay: 'Tú pagas (USDT)',
      youReceive: 'Tú recibes (LIPT)',
      purchaseButton: 'Comprar LIPT',
      toast: {
        success: {
          title: '¡Compra Exitosa!',
          description: 'Has comprado {amount} LIPT.',
        },
        invalid: {
          title: 'Cantidad Inválida',
          description: 'Por favor, revisa tu saldo de USDT e inténtalo de nuevo.',
        },
      },
    },
    referralProgram: {
      title: 'Programa de Referidos Uninivel',
      description: 'Invita a amigos y gana recompensas de sus actividades en múltiples niveles.',
      tooltip: 'Comparte tu enlace único con amigos. Cuando se unen y participan en el staking o la minería, ganas una comisión. ¡Cuantas más personas en tu red, más puedes ganar!',
      yourLink: 'Tu Enlace de Referido Único',
      copied: '¡Copiado al portapapeles!',
      copiedDesc: 'Ahora puedes compartir tu enlace de referido.',
      totalReferrals: 'Total de Referidos',
      totalRewards: 'Recompensas Totales por Referidos',
      totalTeam: 'Miembros Totales del Equipo',
      networkTitle: 'Tu Red Uninivel',
      networkDescription: 'Ve los miembros y comisiones ganadas de cada nivel de tu red.',
      level: 'Nivel',
      members: 'Miembros',
      commission: 'Comisión',
    },
    wallet: {
      connect: 'Conectar Billetera',
      disconnect: 'Billetera Desconectada',
      connected: '¡Billetera Conectada Exitosamente!',
      metaMaskNotFound: 'MetaMask No Encontrado',
      installMetaMask: 'Por favor, instala la extensión de navegador MetaMask.',
    },
    miningPool: {
      title: 'Sala de Minería',
      description: 'Activa mineros para generar tokens LIPT con el tiempo.',
      tooltip: 'Activa un "minero" pagando un costo único en LIPT. El minero generará LIPT para ti durante un período determinado. Los mineros de nivel superior cuestan más pero generan recompensas más rápido. ¡Es como tener una máquina que imprime dinero!',
      totalPower: 'Poder de Minería Total',
      unclaimedRewards: 'Recompensas Minadas',
      activateTab: 'Activar Minero',
      activeTab: 'Mineros Activos',
      selectMiner: 'Selecciona un Minero',
      hour: 'h',
      cost: 'Costo',
      activateButton: 'Activar',
      yourActiveMiners: 'Tus Mineros Activos',
      noActiveMiners: 'No tienes mineros activos.',
      mined: 'Minado',
      completed: 'Completado',
      claimRewardsButton: 'Reclamar Recompensas Minadas',
      toast: {
        activated: {
          title: '¡Minero Activado!',
          description: 'Tu minero {name} ahora está activo.',
        },
        insufficientFunds: {
          title: 'LIPT Insuficiente',
          description: 'No tienes suficiente LIPT para activar este minero.',
        },
        rewardsClaimed: {
          title: 'Recompensas Minadas Reclamadas',
          description: 'Has reclamado {amount} LIPT de la minería.',
        },
      },
    },
    leaderboard: {
      title: 'Campeones de Referidos',
      description: 'Top 10 usuarios por comisión de referidos ganada.',
      tooltip: '¡Mira quién lidera el grupo! Este marcador muestra a los que más ganan con el programa de referidos. Una pequeña competencia amistosa para ver quién puede construir la red más grande.',
      rank: 'Pos.',
      user: 'Usuario',
      commission: 'Comisión (LIPT)',
    },
    gameZone: {
      title: 'Zona de Juegos',
      description: '¡Juega para ganar premios en LIPT!',
      tooltip: '¿Te sientes con suerte? Haz tus apuestas y juega a emocionantes juegos para multiplicar tus LIPT. ¡Recuerda jugar de forma responsable!',
      wheelOfFortune: {
        title: 'Rueda de la Fortuna',
        betAmount: 'Cantidad de la Apuesta',
        spinButton: '¡Girar la Rueda!',
        spinning: 'Girando...',
        toast: {
          win: {
            title: '¡Has Ganado!',
            description: '¡Has ganado {amount} LIPT!',
          },
          lose: {
            title: 'Has Perdido',
            description: '¡Mejor suerte la próxima vez!',
          },
          invalidBet: {
            title: 'Apuesta Inválida',
            description: 'Por favor, revisa tu saldo y la cantidad de la apuesta.',
          },
        },
      },
      report: {
        title: 'Informe',
        totalPlays: 'Total de Jugadas',
        totalWagered: 'Total Apostado',
        netBalance: 'Balance Neto (G/P)',
        last5Plays: 'Últimas 5 Jugadas',
        last5PlaysDesc: 'Aquí están los resultados de tus últimos cinco giros.',
        bet: 'Apuesta',
        multiplier: 'Multiplicador',
        result: 'Resultado',
        noPlays: 'Aún no se han registrado jugadas. ¡Gira la rueda para empezar!',
      },
      rocket: {
        title: 'Cohete LIPT',
      },
      lottery: {
        title: 'Lotería Diaria',
      },
    },
  },
  it: {
    toggleLanguage: 'Cambia lingua',
    header: {
      resetLayout: 'Reimposta Layout',
    },
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
      },
      usdtBalance: {
        title: 'Il Tuo Saldo USDT',
      },
      totalInvested: {
        title: 'Totale Investito',
        description: 'Il tuo capitale totale sulla piattaforma',
      },
      totalReturns: {
        title: 'Ritorno Totale',
        description: 'Valore totale restituito dagli investimenti',
      },
    },
    stakingPool: {
      title: 'Pool di Staking LIPT',
      description: 'Metti in stake i tuoi token LIPT per guadagnare ricompense maggiori con periodi di blocco più lunghi.',
      tooltip: 'Qui "blocchi" i tuoi token LIPT per un periodo definito per guadagnare ricompense. Più a lungo li blocchi, maggiore è il rendimento percentuale annuo (APY). Pensalo come un conto di risparmio a tempo determinato, ma con le criptovalute!',
      totalStaked: 'Saldo Totale in Stake',
      unclaimedRewards: 'Ricompense Non Riscattate',
      stakeTab: 'Stake',
      manageTab: 'Gestisci Stake',
      selectPlan: 'Seleziona Piano di Staking',
      days: 'Giorni',
      apy: 'APY',
      amountToStake: 'Importo da Mettere in Stake',
      walletBalance: 'Saldo nel tuo portafoglio',
      stakeButton: 'Metti in Stake',
      yourActiveStakes: 'I Tuoi Stake Attivi',
      noActiveStakes: 'Non hai stake attivi.',
      unstakeButton: 'Ritira',
      complete: 'completato',
      remaining: 'rimanenti',
      mature: 'Maturato',
      claimRewardsButton: 'Riscatta Tutte le Ricompense',
      unstakeModal: {
        title: 'Sei sicuro di voler ritirare lo stake?',
        descriptionMature: 'I tuoi fondi verranno restituiti al tuo portafoglio.',
        descriptionPenalty: 'Questo stake non è ancora maturato. Verrà applicata una penale del 10% sull\'importo principale.',
        cancel: 'Annulla',
        confirm: 'Sì, Ritira',
      },
      toast: {
        staked: {
          title: 'Stake Eseguito con Successo',
          description: 'Hai messo in stake {amount} LIPT per {duration} giorni.',
        },
        invalidAmount: {
          title: 'Importo Non Valido',
          description: 'Per favore, controlla il tuo saldo e riprova.',
        },
        unstaked: {
          title: 'Ritiro Eseguito con Successo',
          description: 'I tuoi fondi sono stati restituiti al tuo portafoglio.',
          descriptionPenalty: 'Hai ritirato lo stake. È stata applicata una penale di {penalty} LIPT.',
        },
        rewardsClaimed: {
          title: 'Ricompense Riscattate',
          description: 'Hai riscattato {amount} LIPT.',
        },
        noRewards: {
          title: 'Nessuna Ricompensa',
          description: 'Non hai ricompense da riscattare.',
        },
      },
    },
    liquidityPool: {
      title: 'Pool di Liquidità (LIPT/USDT)',
      description: 'Fornisci liquidità per guadagnare commissioni di trading dalla coppia LIPT/USDT.',
      tooltip: 'Qui fornisci sia token LIPT che USDT per facilitare gli scambi sulla piattaforma. In cambio, guadagni una quota delle commissioni di trading. I tuoi guadagni dipendono da quanto possiedi della pool.',
      yourPoolShare: 'La Tua Quota nella Pool',
      yourLpTokens: 'I Tuoi Token LP',
      feesEarned: 'Commissioni Guadagnate',
      addTab: 'Aggiungi Liquidità',
      removeTab: 'Rimuovi Liquidità',
      liptAmount: 'Importo di LIPT',
      usdtAmount: 'Importo di USDT',
      balance: 'Saldo',
      addButton: 'Aggiungi Liquidità',
      removeLpAmount: 'Importo di Token LP da Rimuovere',
      removeButton: 'Rimuovi',
      toast: {
        added: {
          title: 'Liquidità Aggiunta',
          description: 'Aggiunti {lipt} LIPT e {usdt} USDT.',
        },
        removed: {
          title: 'Liquidità Rimossa',
          description: 'Hai rimosso {amount} token LP.',
        },
        invalidAmount: {
          title: 'Importo Non Valido',
          description: 'Per favore, controlla i tuoi saldi e riprova.',
        },
      },
    },
    tokenPurchase: {
      title: 'Acquista Token LIPT',
      description: 'Acquista token LIPT usando USDT.',
      tooltip: 'Questo è il modo più semplice per ottenere token LIPT. Inserisci semplicemente l\'importo di USDT che desideri spendere e calcoleremo quanti token LIPT riceverai al prezzo di mercato attuale.',
      youPay: 'Paghi (USDT)',
      youReceive: 'Ricevi (LIPT)',
      purchaseButton: 'Acquista LIPT',
      toast: {
        success: {
          title: 'Acquisto Riuscito!',
          description: 'Hai acquistato {amount} LIPT.',
        },
        invalid: {
          title: 'Importo Non Valido',
          description: 'Per favore, controlla il tuo saldo USDT e riprova.',
        },
      },
    },
    referralProgram: {
      title: 'Programma di Referral Unilevel',
      description: 'Invita amici e guadagna ricompense dalle loro attività su più livelli.',
      tooltip: 'Condividi il tuo link unico con gli amici. Quando si uniscono e partecipano allo staking o al mining, guadagni una commissione. Più persone nella tua rete, più puoi guadagnare!',
      yourLink: 'Il Tuo Link di Referral Unico',
      copied: 'Copiato negli appunti!',
      copiedDesc: 'Ora puoi condividere il tuo link di referral.',
      totalReferrals: 'Referral Totali',
      totalRewards: 'Ricompense Totali da Referral',
      totalTeam: 'Membri Totali del Team',
      networkTitle: 'La Tua Rete Unilevel',
      networkDescription: 'Visualizza i membri e le commissioni guadagnate da ogni livello della tua rete.',
      level: 'Livello',
      members: 'Membri',
      commission: 'Commissione',
    },
    wallet: {
      connect: 'Connetti Portafoglio',
      disconnect: 'Portafoglio Disconnesso',
      connected: 'Portafoglio Connesso Correttamente!',
      metaMaskNotFound: 'MetaMask Non Trovato',
      installMetaMask: 'Per favore, installa l\'estensione per browser MetaMask.',
    },
    miningPool: {
      title: 'Sala di Estrazione',
      description: 'Attiva gli estrattori per generare token LIPT nel tempo.',
      tooltip: 'Attiva un "estrattore" pagando un costo una tantum in LIPT. L\'estrattore genererà quindi LIPT per te per un periodo di tempo prestabilito. Gli estrattori di livello superiore costano di più ma generano ricompense più velocemente. È come avere una macchina che stampa soldi!',
      totalPower: 'Potenza di Estrazione Totale',
      unclaimedRewards: 'Ricompense Estratte',
      activateTab: 'Attiva Estrattore',
      activeTab: 'Estrattori Attivi',
      selectMiner: 'Seleziona un Estrattore',
      hour: 'ora',
      cost: 'Costo',
      activateButton: 'Attiva',
      yourActiveMiners: 'I Tuoi Estrattori Attivi',
      noActiveMiners: 'Non hai estrattori attivi.',
      mined: 'Estratto',
      completed: 'Completato',
      claimRewardsButton: 'Riscatta Ricompense Estratte',
      toast: {
        activated: {
          title: 'Estrattore Attivato!',
          description: 'Il tuo estrattore {name} è ora attivo.',
        },
        insufficientFunds: {
          title: 'LIPT Insufficienti',
          description: 'Non hai abbastanza LIPT per attivare questo estrattore.',
        },
        rewardsClaimed: {
          title: 'Ricompense Estratte Riscattate',
          description: 'Hai riscattato {amount} LIPT dall\'estrazione.',
        },
      },
    },
    leaderboard: {
      title: 'Campioni di Referral',
      description: 'Top 10 utenti per commissione di referral guadagnata.',
      tooltip: 'Guarda chi è in testa! Questa classifica mostra i migliori guadagni del programma di referral. Una piccola competizione amichevole per vedere chi riesce a costruire la rete più grande.',
      rank: 'Pos.',
      user: 'Utente',
      commission: 'Commissione (LIPT)',
    },
    gameZone: {
      title: 'Area Giochi',
      description: 'Gioca per vincere premi in LIPT!',
      tooltip: 'Ti senti fortunato? Fai le tue scommesse e gioca a giochi entusiasmanti per moltiplicare i tuoi LIPT. Ricorda di giocare responsabilmente!',
      wheelOfFortune: {
        title: 'Ruota della Fortuna',
        betAmount: 'Importo Scommessa',
        spinButton: 'Gira la Ruota!',
        spinning: 'Girando...',
        toast: {
          win: {
            title: 'Hai Vinto!',
            description: 'Hai vinto {amount} LIPT!',
          },
          lose: {
            title: 'Hai Perso',
            description: 'Meglio fortuna la prossima volta!',
          },
          invalidBet: {
            title: 'Scommessa non valida',
            description: 'Controlla il tuo saldo e l\'importo della scommessa.',
          },
        },
      },
      report: {
        title: 'Rapporto',
        totalPlays: 'Giocate Totali',
        totalWagered: 'Totale Scommesso',
        netBalance: 'Saldo Netto (V/P)',
        last5Plays: 'Ultime 5 Giocate',
        last5PlaysDesc: 'Ecco i risultati delle tue ultime cinque giocate.',
        bet: 'Scommessa',
        multiplier: 'Moltiplicatore',
        result: 'Risultato',
        noPlays: 'Nessuna giocata ancora registrata. Gira la ruota per iniziare!',
      },
      rocket: {
        title: 'Razzo LIPT',
      },
      lottery: {
        title: 'Lotteria Giornaliera',
      },
    },
  },
};

interface I18nContextData {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: { [key: string]: string | number }) => string;
}

const I18nContext = createContext<I18nContextData | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('pt-BR');

  const t = (key: string, vars?: { [key: string]: string | number }) => {
    let translation = get(translations[locale], key, key) as string;
    if (vars) {
      for (const [varKey, varValue] of Object.entries(vars)) {
        // Use a regex to replace all occurrences of the placeholder
        const regex = new RegExp(`\\{${varKey}\\}`, 'g');
        translation = translation.replace(regex, String(varValue));
      }
    }
    return translation;
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
