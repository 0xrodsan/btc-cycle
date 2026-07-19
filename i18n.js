// i18n.js
// Single-source dictionary for all JS-injected, user-facing strings.
// Static markup text (header/nav/footer/hero/accordion) lives directly in
// each language's HTML file and is NOT part of this dictionary.
//
// Language is detected ONLY from document.documentElement.lang
// ("pt-BR" -> pt, everything else -> en). No URL params, no localStorage.
//
// I18N.t(path) looks up a dot-separated path in the active language table,
// falling back to the English table if the pt value is missing, and
// finally to the path itself (never renders "undefined").

var I18N = (function () {
  "use strict";

  var dict = {
    en: {
      zones: {
        strongAccumulation: "Strong Accumulation",
        accumulation: "Accumulation",
        fairValue: "Fair Value",
        neutral: "Neutral",
        caution: "Caution",
        healthy: "Healthy",
        distribution: "Distribution",
        strongDistribution: "Strong Distribution",
        capitulation: "Capitulation",
        pressure: "Pressure",
        euphoria: "Euphoria"
      },

      units: {
        addresses: "addresses",
        day30: "(30d)",
        aboveCostBasis: "% above cost basis",
        belowCostBasis: "% below cost basis"
      },

      errors: {
        dataUnavailableRetry: "Data unavailable — will retry on next update.",
        dataUnavailable: "Data unavailable"
      },

      cycleScore: {
        signalsFavorable: "{favorable} of {count} signals favorable"
      },

      metrics: {
        rp: {
          title: "Realized Price",
          interpretation: {
            strongAccumulation: "Historically, this is where patient capital accumulates. Major cycle lows have occurred at this level.",
            accumulation: "Market is modestly above average cost basis. A historically favorable zone for long-term entry.",
            fairValue: "No extreme signal. The market is near its historical equilibrium — neither cheap nor expensive.",
            caution: "The market is running above historical norms. Long-term holders are in significant profit — watch for distribution.",
            distribution: "Historically, this zone has marked cycle peaks. Patient capital tends to reduce exposure here."
          }
        },
        mvrv: {
          title: "MVRV Z-Score",
          interpretation: {
            strongAccumulation: "Z-Score in historically rare territory. Every major cycle low has occurred at this level.",
            accumulation: "Z-Score below the historical average. A historically favorable zone for long-term entry.",
            fairValue: "Z-Score near the historical mean. No extreme signal in either direction.",
            caution: "Z-Score stretching above historical norms. Elevated unrealized profit across the market.",
            distribution: "Z-Score at historically extreme levels. Every prior cycle peak occurred in or near this zone."
          }
        },
        lth: {
          title: "LTH Net Position Change",
          interpretation: {
            strongAccumulation: "LTH supply growing rapidly. Patient capital is accumulating heavily — historically a strong bullish signal.",
            accumulation: "Long-term holders are accumulating. A historically favorable zone for long-term entry.",
            neutral: "No strong directional signal from long-term holders. Neither accumulating nor distributing significantly.",
            distribution: "Long-term holders are reducing exposure. Watch for increased selling pressure.",
            strongDistribution: "Heavy distribution from long-term holders. This level of selling has historically coincided with cycle tops."
          }
        },
        coldStorage: {
          title: "Supply in Cold Storage",
          interpretation: {
            strongAccumulation: "Cold storage growing rapidly. Large amounts of BTC moving to long-term custody — a historically strong bullish signal.",
            accumulation: "Cold storage rising. Bitcoin steadily leaving active circulation — holders accumulating with conviction.",
            neutral: "Cold storage stable. No strong directional signal from long-term holder behavior.",
            distribution: "Cold storage falling. Previously illiquid coins returning to active markets — watch for increased sell pressure.",
            strongDistribution: "Cold storage falling rapidly. Significant coins returning to circulation — historically a bearish signal near cycle tops."
          }
        },
        puell: {
          title: "Puell Multiple",
          interpretation: {
            capitulation: "Miners earning far below average — historically, major cycle lows have occurred at this level. A rare and significant accumulation signal.",
            pressure: "Miners below average revenue. Weak miners exit the market, reducing sell pressure. A historically favorable zone for long-term entry.",
            neutral: "Miner revenue near historical average. No extreme signal from the mining side of the market.",
            healthy: "Miners earning above average. Market is heating up — long-term holders tend to reduce exposure gradually in this zone.",
            euphoria: "Miners earning far above average. Every prior cycle peak has occurred near this level. Patient capital tends to reduce exposure here."
          }
        },
        whale: {
          title: "Whale Balance (>10k BTC)",
          interpretation: {
            strongAccumulation: "Whale count rising fast. Large holders are actively accumulating — a historically strong bullish signal.",
            accumulation: "Whale count rising. Large holders adding to positions — a positive directional signal.",
            neutral: "Whale count unchanged. No directional signal from the largest holder cohort today.",
            distribution: "Whale count falling. Large holders reducing positions — watch for increased sell pressure.",
            strongDistribution: "Whale count falling fast. Large holders exiting significantly — historically a bearish signal near cycle tops."
          }
        },
        sopr: {
          title: "SOPR",
          interpretation: {
            strongAccumulation: "SOPR deep below 1 — coins are being spent at a significant loss. Historically, this level of capitulation marks major cycle lows.",
            accumulation: "SOPR below 1 — average spent coin is sold at a loss. Historically a favorable signal before market recoveries.",
            neutral: "SOPR near 1 — coins moving near cost basis. No strong directional signal from on-chain spending behavior.",
            distribution: "SOPR above 1 — profit-taking underway. Market participants are realizing gains; watch for distribution pressure.",
            strongDistribution: "SOPR significantly above 1 — heavy profit-taking. This level has historically coincided with late-cycle distribution and tops."
          }
        },
        nupl: {
          title: "NUPL",
          interpretation: {
            capitulation: "NUPL negative — the market is in aggregate unrealized loss. Historically the strongest long-term accumulation signal available on-chain.",
            accumulation: "NUPL in low positive territory — modest unrealized profit across the market. A historically favorable zone before broader price discovery.",
            neutral: "NUPL at moderate levels — the market carries reasonable unrealized profit. No extreme signal in either direction.",
            distribution: "NUPL elevated — significant unrealized profit across the market. Distribution historically begins at this level.",
            strongDistribution: "NUPL near maximum — near-peak euphoria. Every prior cycle top occurred at or near this level. Patient capital tends to reduce exposure here."
          }
        }
      },

      tooltips: {
        rp: {
          title: "The average price at which all Bitcoin in circulation was last bought on-chain. Think of it as the market's aggregate cost basis — what the average holder paid for their coins.",
          value: "This is the average purchase price across all Bitcoin holders today. When market price is above this number, most holders are in profit. When below, most are sitting on a paper loss.",
          btcSpotPrice: "Current Bitcoin market price, fetched live on page load from CoinGecko. Refreshes every time you reload the page.",
          premiumDiscount: "How far the current market price is above the average holder's cost basis. Zones: below 0% = Strong Accumulation · 0–25% = Accumulation · 25–75% = Fair Value · 75–150% = Caution · above 150% = Distribution.",
          zoneBadge: {
            strongAccumulation: "Market price is below the average cost basis (negative premium). Historically the rarest zone — cycle lows occurred here in Jan 2015 (~$150), Dec 2018 (~$3,200), and Nov 2022 (~$15,500).",
            accumulation: "Market price is 0% to 25% above the average cost basis. A historically favorable zone for long-term entry.",
            fairValue: "Market price is 25% to 75% above the average cost basis. No extreme signal — a neutral historical zone.",
            caution: "Market price is 75% to 150% above the average cost basis. Long-term holders in significant profit — watch for distribution behavior.",
            distribution: "Market price is more than 150% above the average cost basis. Every prior cycle peak occurred in or near this zone — Dec 2017 (~$20k), Nov 2021 (~$69k)."
          }
        },
        mvrv: {
          title: "Measures how far Bitcoin's price is from fair value in statistical terms. Near 0 is normal. Above 5 has historically marked cycle tops. Below 0.1 has marked generational lows.",
          value: "A Z-Score of 0 to 2.5 means the market is within normal historical range. No cycle peak has ever occurred at this level. Values above 5 have historically coincided with cycle tops.",
          dynamicValue: "A Z-Score of {value} places the market in the {zone} zone. Values above 5 have historically coincided with cycle tops; below 0.1 with generational lows.",
          zoneBadge: {
            strongAccumulation: "Z-Score below 0.5 — statistically rare. Cycle lows occurred at this level in May 2015, Dec 2018, and Nov 2022. Buying during these periods has historically produced outsized returns.",
            accumulation: "Z-Score between 0.5 and 1.5 — below the historical average. A historically favorable zone for long-term entry.",
            fairValue: "Z-Score between 1.5 and 3.0 — near the historical mean. No extreme signal in either direction.",
            caution: "Z-Score between 3.0 and 6.0 — above historical norms. Elevated unrealized profit across the market.",
            distribution: "Z-Score above 6.0 — historically extreme. Z-Score exceeded 7 at the 2017 (~$20k) and 2021 (~$69k) cycle tops, signaling overvaluation before major corrections."
          }
        },
        lth: {
          title: "Tracks how much Bitcoin moved into or out of Long-Term Holder wallets (coins unmoved for 155+ days) over the last 30 days. Positive = accumulation. Negative = distribution.",
          value: "The net amount of Bitcoin that crossed the 155-day threshold in the last 30 days. Large positive values mean patient capital is growing — a historically bullish signal.",
          zoneBadge: {
            strongAccumulation: "LTH supply growing by more than 300,000 BTC in 30 days. Smart money accumulating heavily — historically a strong bullish signal.",
            accumulation: "LTH supply growing by 50,000 to 300,000 BTC in 30 days. Long-term holders adding to positions.",
            neutral: "LTH supply change between -50,000 and +50,000 BTC. No clear directional signal from patient capital.",
            distribution: "LTH supply falling by 50,000 to 300,000 BTC in 30 days. Long-term holders reducing exposure.",
            strongDistribution: "LTH supply falling by more than 300,000 BTC in 30 days. Heavy distribution — historically occurs near cycle tops."
          }
        },
        coldStorage: {
          title: "Bitcoin held by entities with little or no history of spending — long-term holders, cold storage, and deep conviction investors. Rising values mean more BTC is leaving active circulation. Reference chart shows LTH Supply as a close proxy.",
          value: "Total Bitcoin currently held by illiquid entities. Higher values mean less BTC is available for immediate sale — historically associated with tightening supply and upward price pressure.",
          change: "How much cold storage supply changed over the last 30 days. Positive = more BTC moving to long-term storage (bullish). Negative = illiquid coins returning to active markets (bearish).",
          zoneBadge: {
            strongAccumulation: "Cold storage growing more than 1% in 30 days. Large amounts of BTC leaving active circulation — strong bullish signal.",
            accumulation: "Cold storage growing 0.2% to 1% in 30 days. Bitcoin steadily moving to long-term custody.",
            neutral: "Cold storage stable within ±0.2%. No meaningful directional signal.",
            distribution: "Cold storage falling 0.2% to 1% in 30 days. Previously illiquid coins returning to active markets.",
            strongDistribution: "Cold storage falling more than 1% in 30 days. Significant coins returning to circulation — historically a bearish signal."
          }
        },
        puell: {
          title: "Compares today's miner revenue (in USD) to the 365-day average. Below 1 means miners are earning less than usual — a historically favorable signal. Above 3 has coincided with cycle tops.",
          value: "Values below 0.5 have historically marked major cycle lows. Values above 3 have marked cycle tops. Current value reflects miner revenue relative to annual average.",
          zoneBadge: {
            capitulation: "Puell below 0.5 — miners earning far below average. This level was reached at the cycle lows of 2011, 2015, 2018, and 2022, each time preceding significant recoveries.",
            pressure: "Puell between 0.5 and 1.0 — miners below average revenue. Below the break-even historical mean — a favorable zone for long-term accumulation.",
            neutral: "Puell between 1.0 and 1.5 — miner revenue near historical average. No extreme signal in either direction.",
            healthy: "Puell between 1.5 and 3.0 — miners earning above average. Market heating up; patience warranted.",
            euphoria: "Puell above 3.0 — miners earning far above average. The 2013, 2017, and 2021 cycle tops all saw the Puell Multiple spike into this zone before major corrections."
          }
        },
        whale: {
          title: "Tracks the number of Bitcoin addresses holding more than 10,000 BTC — the largest holder cohort, typically institutions and long-term strategic investors. Rising count = whales accumulating. Falling count = whales distributing.",
          value: "The total number of addresses currently holding more than 10,000 BTC (~$700M+ at current prices). This cohort moves markets — their accumulation or distribution is one of the clearest smart-money signals available on-chain.",
          change: "How many whale addresses (>10k BTC) were added or removed over the last 30 days. Even a change of 1-2 addresses represents hundreds of millions of dollars in BTC.",
          zoneBadge: {
            strongAccumulation: "Whale count rising by more than 5 addresses over 30 days. Large holders actively adding to positions — a strong bullish signal.",
            accumulation: "Whale count rising over 30 days. Large holders adding to positions — a positive directional signal.",
            neutral: "Whale count unchanged over 30 days. No directional signal from the largest holder cohort.",
            distribution: "Whale count falling over 30 days. Large holders reducing positions — watch for increased sell pressure.",
            strongDistribution: "Whale count falling by more than 5 addresses over 30 days. Large holders exiting significantly — historically a bearish signal."
          }
        },
        sopr: {
          title: "Spent Output Profit Ratio — measures whether coins being moved today are, on average, in profit or in loss. A value below 1 means the average spent coin was sold at a loss (capitulation). Above 1 means profit-taking.",
          value: "Values consistently below 1 have historically marked cycle lows — holders are selling at a loss, signaling capitulation. Values persistently above 1.2 have coincided with distribution phases near cycle tops.",
          zoneBadge: {
            strongAccumulation: "SOPR below 0.85 — coins are being spent at a significant loss. Deep capitulation. This level has historically marked major cycle lows (2015, 2018, 2022).",
            accumulation: "SOPR between 0.85 and 1.0 — average spent coin is sold at a loss. Historically a favorable zone for patient accumulation before recovery.",
            neutral: "SOPR between 1.0 and 1.1 — coins moving near cost basis. Market in equilibrium with no strong directional signal.",
            distribution: "SOPR between 1.1 and 1.3 — coins moving at a profit. Market participants taking gains; watch for increased sell pressure.",
            strongDistribution: "SOPR above 1.3 — heavy profit-taking. Historically coincides with late-cycle distribution phases and cycle tops."
          }
        },
        nupl: {
          title: "Net Unrealized Profit/Loss — the total unrealized profit minus unrealized loss across all Bitcoin holders, expressed as a fraction of market cap. Ranges from -1 (everyone underwater) to +1 (everyone in profit). A powerful macro sentiment gauge.",
          value: "Negative NUPL means the market is in aggregate unrealized loss — historically a rare and strong accumulation signal. Values above 0.75 have coincided with euphoric cycle tops.",
          zoneBadge: {
            capitulation: "NUPL below 0 — the market is in aggregate unrealized loss. This has historically been the most reliable long-term accumulation signal, occurring at the lows of 2015, 2018–19, and late 2022.",
            accumulation: "NUPL between 0 and 0.25 — low unrealized profit. Early recovery phase. A historically favorable zone for long-term entry before broader price discovery.",
            neutral: "NUPL between 0.25 and 0.5 — moderate unrealized profit. Market in mid-cycle territory with no extreme signal in either direction.",
            distribution: "NUPL between 0.5 and 0.75 — elevated unrealized profit. Historically, the zone where distribution begins as holders take gains.",
            strongDistribution: "NUPL above 0.75 — near-peak euphoria. Every prior cycle top has reached or approached this zone, including Dec 2017 and Nov 2021."
          }
        }
      }
    },

    pt: {
      zones: {
        strongAccumulation: "Forte Acumulação",
        accumulation: "Acumulação",
        fairValue: "Valor Justo",
        neutral: "Neutro",
        caution: "Atenção",
        healthy: "Saudável",
        distribution: "Distribuição",
        strongDistribution: "Forte Distribuição",
        capitulation: "Capitulação",
        pressure: "Pressão",
        euphoria: "Euforia"
      },

      units: {
        addresses: "endereços",
        day30: "(30d)",
        aboveCostBasis: "% acima do preço médio",
        belowCostBasis: "% abaixo do preço médio"
      },

      errors: {
        dataUnavailableRetry: "Dados indisponíveis — nova tentativa na próxima atualização.",
        dataUnavailable: "Dados indisponíveis"
      },

      cycleScore: {
        signalsFavorable: "{favorable} de {count} sinais favoráveis"
      },

      metrics: {
        rp: {
          title: "Preço Realizado",
          interpretation: {
            strongAccumulation: "Historicamente, é aqui que o capital paciente acumula. As principais mínimas de ciclo aconteceram nesse patamar.",
            accumulation: "O mercado está levemente acima do preço médio agregado. Uma zona historicamente favorável para entrada de longo prazo.",
            fairValue: "Nenhum sinal extremo. O mercado está próximo do seu equilíbrio histórico — nem barato, nem caro.",
            caution: "O mercado está rodando acima da média histórica. Holders de longo prazo estão com lucro relevante — fique de olho em distribuição.",
            distribution: "Historicamente, essa zona marcou topos de ciclo. O capital paciente tende a reduzir exposição por aqui."
          }
        },
        mvrv: {
          title: "MVRV Z-Score",
          interpretation: {
            strongAccumulation: "Z-Score em território historicamente raro. Todas as principais mínimas de ciclo aconteceram nesse nível.",
            accumulation: "Z-Score abaixo da média histórica. Uma zona historicamente favorável para entrada de longo prazo.",
            fairValue: "Z-Score próximo da média histórica. Nenhum sinal extremo em nenhuma direção.",
            caution: "Z-Score esticando acima da média histórica. Lucro não realizado elevado em todo o mercado.",
            distribution: "Z-Score em níveis historicamente extremos. Todo topo de ciclo anterior aconteceu dentro ou perto dessa zona."
          }
        },
        lth: {
          title: "Variação Líquida de Posição (LTH)",
          interpretation: {
            strongAccumulation: "Oferta em mãos de LTH crescendo rápido. Capital paciente acumulando forte — historicamente um sinal de alta relevante.",
            accumulation: "Holders de longo prazo estão acumulando. Uma zona historicamente favorável para entrada de longo prazo.",
            neutral: "Nenhum sinal direcional forte vindo dos holders de longo prazo. Sem acumulação nem distribuição relevante.",
            distribution: "Holders de longo prazo estão reduzindo exposição. Fique de olho em pressão de venda crescente.",
            strongDistribution: "Distribuição pesada por parte dos holders de longo prazo. Esse nível de venda historicamente coincidiu com topos de ciclo."
          }
        },
        coldStorage: {
          title: "Oferta em Cold Storage",
          interpretation: {
            strongAccumulation: "Cold storage crescendo rápido. Grandes volumes de BTC migrando para custódia de longo prazo — historicamente um sinal de alta forte.",
            accumulation: "Cold storage em alta. Bitcoin saindo de forma consistente da circulação ativa — holders acumulando com convicção.",
            neutral: "Cold storage estável. Nenhum sinal direcional forte no comportamento dos holders de longo prazo.",
            distribution: "Cold storage em queda. Moedas antes ilíquidas voltando aos mercados ativos — fique de olho em pressão de venda crescente.",
            strongDistribution: "Cold storage caindo rápido. Volume relevante de moedas voltando à circulação — historicamente um sinal de baixa perto de topos de ciclo."
          }
        },
        puell: {
          title: "Puell Multiple",
          interpretation: {
            capitulation: "Mineradores ganhando bem abaixo da média — historicamente, as principais mínimas de ciclo aconteceram nesse patamar. Um sinal de acumulação raro e relevante.",
            pressure: "Mineradores com receita abaixo da média. Mineradores mais fracos saem do mercado, reduzindo a pressão de venda. Uma zona historicamente favorável para entrada de longo prazo.",
            neutral: "Receita dos mineradores próxima da média histórica. Nenhum sinal extremo do lado da mineração.",
            healthy: "Mineradores ganhando acima da média. O mercado está esquentando — holders de longo prazo tendem a reduzir exposição aos poucos nessa zona.",
            euphoria: "Mineradores ganhando muito acima da média. Todo topo de ciclo anterior aconteceu perto desse nível. O capital paciente tende a reduzir exposição por aqui."
          }
        },
        whale: {
          title: "Saldo das Baleias (>10k BTC)",
          interpretation: {
            strongAccumulation: "Número de baleias subindo rápido. Grandes holders acumulando ativamente — historicamente um sinal de alta forte.",
            accumulation: "Número de baleias em alta. Grandes holders reforçando posições — um sinal direcional positivo.",
            neutral: "Número de baleias estável. Nenhum sinal direcional vindo dos maiores holders hoje.",
            distribution: "Número de baleias em queda. Grandes holders reduzindo posições — fique de olho em pressão de venda crescente.",
            strongDistribution: "Número de baleias caindo rápido. Grandes holders saindo de forma relevante — historicamente um sinal de baixa perto de topos de ciclo."
          }
        },
        sopr: {
          title: "SOPR",
          interpretation: {
            strongAccumulation: "SOPR bem abaixo de 1 — moedas sendo movimentadas com prejuízo relevante. Historicamente, esse nível de capitulação marca as principais mínimas de ciclo.",
            accumulation: "SOPR abaixo de 1 — em média, as moedas movimentadas estão sendo vendidas com prejuízo. Historicamente um sinal favorável antes de recuperações de mercado.",
            neutral: "SOPR próximo de 1 — moedas sendo movimentadas perto do preço médio. Nenhum sinal direcional forte no comportamento on-chain.",
            distribution: "SOPR acima de 1 — realização de lucro em andamento. Participantes do mercado estão realizando ganhos; fique de olho em pressão de distribuição.",
            strongDistribution: "SOPR bem acima de 1 — realização de lucro pesada. Esse nível historicamente coincidiu com distribuição de fim de ciclo e topos."
          }
        },
        nupl: {
          title: "NUPL",
          interpretation: {
            capitulation: "NUPL negativo — o mercado está, em conjunto, com prejuízo não realizado. Historicamente o sinal de acumulação de longo prazo mais forte disponível on-chain.",
            accumulation: "NUPL em território levemente positivo — lucro não realizado modesto em todo o mercado. Uma zona historicamente favorável antes de uma descoberta de preço mais ampla.",
            neutral: "NUPL em níveis moderados — o mercado carrega um lucro não realizado razoável. Nenhum sinal extremo em nenhuma direção.",
            distribution: "NUPL elevado — lucro não realizado relevante em todo o mercado. Historicamente, a distribuição começa nesse patamar.",
            strongDistribution: "NUPL perto do máximo — euforia próxima do pico. Todo topo de ciclo anterior chegou perto ou atingiu essa zona. O capital paciente tende a reduzir exposição por aqui."
          }
        }
      },

      tooltips: {
        rp: {
          title: "O preço médio pelo qual todo o Bitcoin em circulação foi comprado on-chain pela última vez. Pense nisso como o preço médio agregado do mercado — o que o holder médio pagou pelas suas moedas.",
          value: "Esse é o preço médio de compra entre todos os holders de Bitcoin hoje. Quando o preço de mercado está acima desse número, a maioria dos holders está no lucro. Quando está abaixo, a maioria está com prejuízo não realizado.",
          btcSpotPrice: "Preço atual do Bitcoin no mercado, obtido em tempo real ao carregar a página, via CoinGecko. Atualiza a cada vez que a página é recarregada.",
          premiumDiscount: "O quanto o preço atual de mercado está acima do preço médio dos holders. Zonas: abaixo de 0% = Forte Acumulação · 0–25% = Acumulação · 25–75% = Valor Justo · 75–150% = Atenção · acima de 150% = Distribuição.",
          zoneBadge: {
            strongAccumulation: "O preço de mercado está abaixo do preço médio dos holders (prêmio negativo). Historicamente a zona mais rara — mínimas de ciclo aconteceram aqui em jan/2015 (~$150), dez/2018 (~$3.200) e nov/2022 (~$15.500).",
            accumulation: "O preço de mercado está entre 0% e 25% acima do preço médio. Uma zona historicamente favorável para entrada de longo prazo.",
            fairValue: "O preço de mercado está entre 25% e 75% acima do preço médio. Nenhum sinal extremo — uma zona historicamente neutra.",
            caution: "O preço de mercado está entre 75% e 150% acima do preço médio. Holders de longo prazo com lucro relevante — fique de olho em comportamento de distribuição.",
            distribution: "O preço de mercado está mais de 150% acima do preço médio. Todo topo de ciclo anterior aconteceu dentro ou perto dessa zona — dez/2017 (~$20 mil), nov/2021 (~$69 mil)."
          }
        },
        mvrv: {
          title: "Mede, em termos estatísticos, o quão longe o preço do Bitcoin está do valor justo. Perto de 0 é normal. Acima de 5 historicamente marcou topos de ciclo. Abaixo de 0.1 marcou mínimas geracionais.",
          value: "Um Z-Score entre 0 e 2,5 significa que o mercado está dentro da faixa histórica normal. Nenhum topo de ciclo já ocorreu nesse nível. Valores acima de 5 historicamente coincidiram com topos de ciclo.",
          dynamicValue: "Um Z-Score de {value} coloca o mercado na zona de {zone}. Valores acima de 5 historicamente coincidiram com topos de ciclo; abaixo de 0.1, com mínimas geracionais.",
          zoneBadge: {
            strongAccumulation: "Z-Score abaixo de 0,5 — estatisticamente raro. Mínimas de ciclo aconteceram nesse nível em mai/2015, dez/2018 e nov/2022. Comprar nesses períodos historicamente gerou retornos fora da curva.",
            accumulation: "Z-Score entre 0,5 e 1,5 — abaixo da média histórica. Uma zona historicamente favorável para entrada de longo prazo.",
            fairValue: "Z-Score entre 1,5 e 3,0 — perto da média histórica. Nenhum sinal extremo em nenhuma direção.",
            caution: "Z-Score entre 3,0 e 6,0 — acima da média histórica. Lucro não realizado elevado em todo o mercado.",
            distribution: "Z-Score acima de 6,0 — historicamente extremo. O Z-Score passou de 7 nos topos de 2017 (~$20 mil) e 2021 (~$69 mil), sinalizando sobrevalorização antes de correções importantes."
          }
        },
        lth: {
          title: "Acompanha quanto Bitcoin entrou ou saiu de carteiras de Long-Term Holder (moedas paradas há 155+ dias) nos últimos 30 dias. Positivo = acumulação. Negativo = distribuição.",
          value: "O saldo líquido de Bitcoin que cruzou o limite de 155 dias nos últimos 30 dias. Valores positivos grandes indicam que o capital paciente está crescendo — historicamente um sinal de alta.",
          zoneBadge: {
            strongAccumulation: "Oferta em mãos de LTH crescendo mais de 300.000 BTC em 30 dias. Dinheiro inteligente acumulando forte — historicamente um sinal de alta relevante.",
            accumulation: "Oferta em mãos de LTH crescendo entre 50.000 e 300.000 BTC em 30 dias. Holders de longo prazo reforçando posições.",
            neutral: "Variação da oferta em mãos de LTH entre -50.000 e +50.000 BTC. Nenhum sinal direcional claro do capital paciente.",
            distribution: "Oferta em mãos de LTH caindo entre 50.000 e 300.000 BTC em 30 dias. Holders de longo prazo reduzindo exposição.",
            strongDistribution: "Oferta em mãos de LTH caindo mais de 300.000 BTC em 30 dias. Distribuição pesada — historicamente ocorre perto de topos de ciclo."
          }
        },
        coldStorage: {
          title: "Bitcoin em posse de entidades com pouco ou nenhum histórico de movimentação — holders de longo prazo, cold storage e investidores de convicção profunda. Valores em alta indicam mais BTC saindo da circulação ativa. O gráfico de referência usa LTH Supply como proxy próximo.",
          value: "Total de Bitcoin atualmente em posse de entidades ilíquidas. Valores mais altos indicam menos BTC disponível para venda imediata — historicamente associado a aperto de oferta e pressão de alta no preço.",
          change: "O quanto a oferta em cold storage variou nos últimos 30 dias. Positivo = mais BTC migrando para custódia de longo prazo (altista). Negativo = moedas ilíquidas voltando aos mercados ativos (baixista).",
          zoneBadge: {
            strongAccumulation: "Cold storage crescendo mais de 1% em 30 dias. Grandes volumes de BTC saindo da circulação ativa — sinal de alta forte.",
            accumulation: "Cold storage crescendo entre 0,2% e 1% em 30 dias. Bitcoin migrando de forma consistente para custódia de longo prazo.",
            neutral: "Cold storage estável, dentro de ±0,2%. Nenhum sinal direcional relevante.",
            distribution: "Cold storage caindo entre 0,2% e 1% em 30 dias. Moedas antes ilíquidas voltando aos mercados ativos.",
            strongDistribution: "Cold storage caindo mais de 1% em 30 dias. Volume relevante de moedas voltando à circulação — historicamente um sinal de baixa."
          }
        },
        puell: {
          title: "Compara a receita diária dos mineradores (em USD) com a média dos últimos 365 dias. Abaixo de 1 significa que os mineradores estão ganhando menos que o normal — um sinal historicamente favorável. Acima de 3 já coincidiu com topos de ciclo.",
          value: "Valores abaixo de 0,5 historicamente marcaram as principais mínimas de ciclo. Valores acima de 3 marcaram topos de ciclo. O valor atual reflete a receita dos mineradores em relação à média anual.",
          zoneBadge: {
            capitulation: "Puell abaixo de 0,5 — mineradores ganhando bem abaixo da média. Esse nível foi atingido nas mínimas de ciclo de 2011, 2015, 2018 e 2022, cada vez antecedendo recuperações relevantes.",
            pressure: "Puell entre 0,5 e 1,0 — mineradores com receita abaixo da média. Abaixo da média histórica de equilíbrio — uma zona favorável para acumulação de longo prazo.",
            neutral: "Puell entre 1,0 e 1,5 — receita dos mineradores próxima da média histórica. Nenhum sinal extremo em nenhuma direção.",
            healthy: "Puell entre 1,5 e 3,0 — mineradores ganhando acima da média. Mercado esquentando; paciência recomendada.",
            euphoria: "Puell acima de 3,0 — mineradores ganhando muito acima da média. Os topos de 2013, 2017 e 2021 tiveram o Puell Multiple disparando para essa zona antes de correções importantes."
          }
        },
        whale: {
          title: "Acompanha o número de endereços de Bitcoin com mais de 10.000 BTC — o grupo dos maiores holders, geralmente instituições e investidores estratégicos de longo prazo. Número em alta = baleias acumulando. Número em queda = baleias distribuindo.",
          value: "O número total de endereços que atualmente possuem mais de 10.000 BTC (~$700M+ nos preços atuais). Esse grupo movimenta o mercado — sua acumulação ou distribuição é um dos sinais de dinheiro inteligente mais claros disponíveis on-chain.",
          change: "Quantos endereços de baleia (>10k BTC) foram adicionados ou removidos nos últimos 30 dias. Mesmo uma variação de 1 a 2 endereços representa centenas de milhões de dólares em BTC.",
          zoneBadge: {
            strongAccumulation: "Número de baleias subindo mais de 5 endereços em 30 dias. Grandes holders reforçando posições ativamente — um sinal de alta forte.",
            accumulation: "Número de baleias em alta em 30 dias. Grandes holders reforçando posições — um sinal direcional positivo.",
            neutral: "Número de baleias sem variação em 30 dias. Nenhum sinal direcional vindo do grupo de maiores holders.",
            distribution: "Número de baleias em queda em 30 dias. Grandes holders reduzindo posições — fique de olho em pressão de venda crescente.",
            strongDistribution: "Número de baleias caindo mais de 5 endereços em 30 dias. Grandes holders saindo de forma relevante — historicamente um sinal de baixa."
          }
        },
        sopr: {
          title: "Spent Output Profit Ratio — mede se as moedas movimentadas hoje estão, em média, no lucro ou no prejuízo. Um valor abaixo de 1 significa que a moeda média movimentada foi vendida com prejuízo (capitulação). Acima de 1 significa realização de lucro.",
          value: "Valores consistentemente abaixo de 1 historicamente marcaram mínimas de ciclo — holders vendendo com prejuízo, sinalizando capitulação. Valores persistentemente acima de 1,2 coincidiram com fases de distribuição perto de topos de ciclo.",
          zoneBadge: {
            strongAccumulation: "SOPR abaixo de 0,85 — moedas sendo movimentadas com prejuízo relevante. Capitulação profunda. Esse nível historicamente marcou as principais mínimas de ciclo (2015, 2018, 2022).",
            accumulation: "SOPR entre 0,85 e 1,0 — em média, a moeda movimentada está sendo vendida com prejuízo. Historicamente uma zona favorável para acumulação paciente antes da recuperação.",
            neutral: "SOPR entre 1,0 e 1,1 — moedas sendo movimentadas perto do preço médio. Mercado em equilíbrio, sem sinal direcional forte.",
            distribution: "SOPR entre 1,1 e 1,3 — moedas sendo movimentadas com lucro. Participantes do mercado realizando ganhos; fique de olho em pressão de venda crescente.",
            strongDistribution: "SOPR acima de 1,3 — realização de lucro pesada. Historicamente coincide com fases de distribuição de fim de ciclo e topos."
          }
        },
        nupl: {
          title: "Net Unrealized Profit/Loss — o lucro não realizado total menos o prejuízo não realizado entre todos os holders de Bitcoin, expresso como fração do market cap. Varia de -1 (todo mundo no prejuízo) a +1 (todo mundo no lucro). Um termômetro macro de sentimento poderoso.",
          value: "NUPL negativo significa que o mercado está, em conjunto, com prejuízo não realizado — historicamente um sinal de acumulação raro e forte. Valores acima de 0,75 coincidiram com topos de ciclo eufóricos.",
          zoneBadge: {
            capitulation: "NUPL abaixo de 0 — o mercado está, em conjunto, com prejuízo não realizado. Historicamente esse é o sinal de acumulação de longo prazo mais confiável, presente nas mínimas de 2015, 2018–19 e final de 2022.",
            accumulation: "NUPL entre 0 e 0,25 — lucro não realizado baixo. Fase inicial de recuperação. Uma zona historicamente favorável para entrada de longo prazo antes de uma descoberta de preço mais ampla.",
            neutral: "NUPL entre 0,25 e 0,5 — lucro não realizado moderado. Mercado em território de meio de ciclo, sem sinal extremo em nenhuma direção.",
            distribution: "NUPL entre 0,5 e 0,75 — lucro não realizado elevado. Historicamente, a zona onde a distribuição começa conforme os holders realizam ganhos.",
            strongDistribution: "NUPL acima de 0,75 — euforia próxima do pico. Todo topo de ciclo anterior atingiu ou chegou perto dessa zona, incluindo dez/2017 e nov/2021."
          }
        }
      }
    }
  };

  function getLang() {
    var htmlLang = document.documentElement.lang || "";
    return htmlLang.toLowerCase().indexOf("pt") === 0 ? "pt" : "en";
  }

  function resolve(table, path) {
    var parts = path.split(".");
    var node = table;
    for (var i = 0; i < parts.length; i++) {
      if (node === null || typeof node !== "object" || !(parts[i] in node)) return undefined;
      node = node[parts[i]];
    }
    return typeof node === "string" ? node : undefined;
  }

  // Never renders undefined: pt -> en -> the path itself.
  function t(path, vars) {
    var lang = getLang();
    var value = resolve(dict[lang], path);
    if (value === undefined && lang !== "en") value = resolve(dict.en, path);
    if (value === undefined) value = path;

    if (vars) {
      Object.keys(vars).forEach(function (key) {
        value = value.replace(new RegExp("\\{" + key + "\\}", "g"), vars[key]);
      });
    }
    return value;
  }

  return { t: t, getLang: getLang };
})();
