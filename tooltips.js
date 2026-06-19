// tooltips.js
// All user-facing tooltip text for btc-cycle.
// Keys are language-agnostic. Swap this object for PT translation.

const TOOLTIPS = {

  // --- Metric titles ---
  realizedPriceTitle: {
    label: "Realized Price",
    text: "The average price at which all Bitcoin in circulation was last bought on-chain. Think of it as the market's aggregate cost basis — what the average holder paid for their coins."
  },

  mvrvZScoreTitle: {
    label: "MVRV Z-Score",
    text: "Measures how far Bitcoin's price is from fair value in statistical terms. Near 0 is normal. Above 5 has historically marked cycle tops. Below 0.1 has marked generational lows."
  },

  // --- Realized Price data points ---
  realizedPriceValue: {
    label: "Realized Price value",
    text: "This is the average purchase price across all Bitcoin holders today. When market price is above this number, most holders are in profit. When below, most are sitting on a paper loss."
  },

  btcSpotPrice: {
    label: "Current BTC price",
    text: "Current Bitcoin market price, fetched live on page load from CoinGecko. Refreshes every time you reload the page."
  },

  premiumDiscount: {
    label: "Premium / Discount",
    text: "How far the current market price is above the average holder's cost basis. Zones: below 0% = Strong Accumulation · 0–25% = Accumulation · 25–75% = Fair Value · 75–150% = Caution · above 150% = Distribution."
  },

  // --- MVRV Z-Score data points ---
  mvrvZScoreValue: {
    label: "Z-Score value",
    text: "A Z-Score of 0 to 2.5 means the market is within normal historical range. No cycle peak has ever occurred at this level. Values above 5 have historically coincided with cycle tops."
  },

  // --- Zone badge glossaries (one per metric) ---
  realizedPriceZoneBadge: {
    label: "Current zone",
    zones: [
      {
        name: "Strong Accumulation",
        color: "green",
        description: "Market price is below the average cost basis (negative premium). Historically the rarest zone — every major cycle low has occurred here."
      },
      {
        name: "Accumulation",
        color: "blue",
        description: "Market price is 0% to 25% above the average cost basis. A historically favorable zone for long-term entry."
      },
      {
        name: "Fair Value",
        color: "neutral",
        description: "Market price is 25% to 75% above the average cost basis. No extreme signal — a neutral historical zone."
      },
      {
        name: "Caution",
        color: "amber",
        description: "Market price is 75% to 150% above the average cost basis. Long-term holders in significant profit — watch for distribution behavior."
      },
      {
        name: "Distribution",
        color: "red",
        description: "Market price is more than 150% above the average cost basis. Every prior cycle peak occurred in or near this zone."
      }
    ]
  },

  mvrvZoneBadge: {
    label: "Current zone",
    zones: [
      {
        name: "Strong Accumulation",
        color: "green",
        description: "Z-Score below 0.5 — statistically rare. Every major cycle low has occurred at or below this level."
      },
      {
        name: "Accumulation",
        color: "blue",
        description: "Z-Score between 0.5 and 1.5 — below the historical average. A historically favorable zone for long-term entry."
      },
      {
        name: "Fair Value",
        color: "neutral",
        description: "Z-Score between 1.5 and 3.0 — near the historical mean. No extreme signal in either direction."
      },
      {
        name: "Caution",
        color: "amber",
        description: "Z-Score between 3.0 and 6.0 — above historical norms. Elevated unrealized profit across the market."
      },
      {
        name: "Distribution",
        color: "red",
        description: "Z-Score above 6.0 — historically extreme. Every prior cycle peak occurred in or near this zone."
      }
    ]
  },

  // --- Interpretive sentences (one per zone, per metric) ---
  // Realized Price interpretations
  realizedPriceInterpretation: {
    "Strong Accumulation": "Historically, this is where patient capital accumulates. Major cycle lows have occurred at this level.",
    "Accumulation":      "Market is modestly above average cost basis. A historically favorable zone for long-term entry.",
    "Fair Value":        "No extreme signal. The market is near its historical equilibrium — neither cheap nor expensive.",
    "Caution":           "The market is running above historical norms. Long-term holders are in significant profit — watch for distribution.",
    "Distribution":      "Historically, this zone has marked cycle peaks. Patient capital tends to reduce exposure here."
  },

  // MVRV Z-Score interpretations
  mvrvInterpretation: {
    "Strong Accumulation": "Z-Score in historically rare territory. Every major cycle low has occurred at this level.",
    "Accumulation":      "Z-Score below the historical average. A historically favorable zone for long-term entry.",
    "Fair Value":        "Z-Score near the historical mean. No extreme signal in either direction.",
    "Caution":           "Z-Score stretching above historical norms. Elevated unrealized profit across the market.",
    "Distribution":      "Z-Score at historically extreme levels. Every prior cycle peak occurred in or near this zone."
  },

  // --- LTH Net Position Change ---
  lthTitle: {
    label: "LTH Net Position Change",
    text: "Tracks how much Bitcoin moved into or out of Long-Term Holder wallets (coins unmoved for 155+ days) over the last 30 days. Positive = accumulation. Negative = distribution."
  },

  lthValue: {
    label: "30d net change",
    text: "The net amount of Bitcoin that crossed the 155-day threshold in the last 30 days. Large positive values mean patient capital is growing — a historically bullish signal."
  },

  lthZoneBadge: {
    label: "LTH zone",
    zones: [
      { name: "Strong Accumulation", color: "green",   description: "LTH supply growing by more than 300,000 BTC in 30 days. Smart money accumulating heavily — historically a strong bullish signal." },
      { name: "Accumulation",        color: "blue",    description: "LTH supply growing by 50,000 to 300,000 BTC in 30 days. Long-term holders adding to positions." },
      { name: "Neutral",             color: "neutral", description: "LTH supply change between -50,000 and +50,000 BTC. No clear directional signal from patient capital." },
      { name: "Distribution",        color: "amber",   description: "LTH supply falling by 50,000 to 300,000 BTC in 30 days. Long-term holders reducing exposure." },
      { name: "Strong Distribution", color: "red",     description: "LTH supply falling by more than 300,000 BTC in 30 days. Heavy distribution — historically occurs near cycle tops." }
    ]
  },

  lthInterpretation: {
    "Strong Accumulation": "LTH supply growing rapidly. Patient capital is accumulating heavily — historically a strong bullish signal.",
    "Accumulation":        "Long-term holders are accumulating. A historically favorable zone for long-term entry.",
    "Neutral":             "No strong directional signal from long-term holders. Neither accumulating nor distributing significantly.",
    "Distribution":        "Long-term holders are reducing exposure. Watch for increased selling pressure.",
    "Strong Distribution": "Heavy distribution from long-term holders. This level of selling has historically coincided with cycle tops."
  },

  // --- Supply in Cold Storage ---
  coldStorageTitle: {
    label: "Supply in Cold Storage",
    text: "Bitcoin held by entities with little or no history of spending — long-term holders, cold storage, and deep conviction investors. Rising values mean more BTC is leaving active circulation. Reference chart shows LTH Supply as a close proxy."
  },

  coldStorageValue: {
    label: "Cold storage supply",
    text: "Total Bitcoin currently held by illiquid entities. Higher values mean less BTC is available for immediate sale — historically associated with tightening supply and upward price pressure."
  },

  coldStorageChange: {
    label: "30d change",
    text: "How much cold storage supply changed over the last 30 days. Positive = more BTC moving to long-term storage (bullish). Negative = illiquid coins returning to active markets (bearish)."
  },

  coldStorageZoneBadge: {
    label: "Cold storage zone",
    zones: [
      { name: "Strong Accumulation", color: "green",   description: "Cold storage growing more than 1% in 30 days. Large amounts of BTC leaving active circulation — strong bullish signal." },
      { name: "Accumulation",        color: "blue",    description: "Cold storage growing 0.2% to 1% in 30 days. Bitcoin steadily moving to long-term custody." },
      { name: "Neutral",             color: "neutral", description: "Cold storage stable within ±0.2%. No meaningful directional signal." },
      { name: "Distribution",        color: "amber",   description: "Cold storage falling 0.2% to 1% in 30 days. Previously illiquid coins returning to active markets." },
      { name: "Strong Distribution", color: "red",     description: "Cold storage falling more than 1% in 30 days. Significant coins returning to circulation — historically a bearish signal." }
    ]
  },

  coldStorageInterpretation: {
    "Strong Accumulation": "Cold storage growing rapidly. Large amounts of BTC moving to long-term custody — a historically strong bullish signal.",
    "Accumulation":        "Cold storage rising. Bitcoin steadily leaving active circulation — holders accumulating with conviction.",
    "Neutral":             "Cold storage stable. No strong directional signal from long-term holder behavior.",
    "Distribution":        "Cold storage falling. Previously illiquid coins returning to active markets — watch for increased sell pressure.",
    "Strong Distribution": "Cold storage falling rapidly. Significant coins returning to circulation — historically a bearish signal near cycle tops."
  },

  // --- Puell Multiple ---
  puellTitle: {
    label: "Puell Multiple",
    text: "Compares today's miner revenue (in USD) to the 365-day average. Below 1 means miners are earning less than usual — a historically favorable signal. Above 3 has coincided with cycle tops."
  },

  puellValue: {
    label: "Puell Multiple value",
    text: "Values below 0.5 have historically marked major cycle lows. Values above 3 have marked cycle tops. Current value reflects miner revenue relative to annual average."
  },

  puellZoneBadge: {
    label: "Puell zone",
    zones: [
      { name: "Capitulation", color: "green",   description: "Puell below 0.5 — miners earning far below average. Historically, major cycle lows have occurred in this zone." },
      { name: "Pressure",     color: "blue",    description: "Puell between 0.5 and 1.0 — miners below average revenue. Below the break-even historical mean — a favorable zone for long-term accumulation." },
      { name: "Neutral",      color: "neutral", description: "Puell between 1.0 and 1.5 — miner revenue near historical average. No extreme signal in either direction." },
      { name: "Healthy",      color: "amber",   description: "Puell between 1.5 and 3.0 — miners earning above average. Market heating up; patience warranted." },
      { name: "Euphoria",     color: "red",     description: "Puell above 3.0 — miners earning far above average. Every prior cycle top has occurred near this level." }
    ]
  },

  puellInterpretation: {
    "Capitulation": "Miners earning far below average — historically, major cycle lows have occurred at this level. A rare and significant accumulation signal.",
    "Pressure":     "Miners below average revenue. Weak miners exit the market, reducing sell pressure. A historically favorable zone for long-term entry.",
    "Neutral":      "Miner revenue near historical average. No extreme signal from the mining side of the market.",
    "Healthy":      "Miners earning above average. Market is heating up — long-term holders tend to reduce exposure gradually in this zone.",
    "Euphoria":     "Miners earning far above average. Every prior cycle peak has occurred near this level. Patient capital tends to reduce exposure here."
  },

  // --- Whale Balance ---
  whaleTitle: {
    label: "Whale Balance (>10k BTC)",
    text: "Tracks the number of Bitcoin addresses holding more than 10,000 BTC — the largest holder cohort, typically institutions and long-term strategic investors. Rising count = whales accumulating. Falling count = whales distributing."
  },

  whaleValue: {
    label: "Whale address count",
    text: "The total number of addresses currently holding more than 10,000 BTC (~$700M+ at current prices). This cohort moves markets — their accumulation or distribution is one of the clearest smart-money signals available on-chain."
  },

  whaleChange: {
    label: "30d change",
    text: "How many whale addresses (>10k BTC) were added or removed over the last 30 days. Even a change of 1-2 addresses represents hundreds of millions of dollars in BTC."
  },

  whaleZoneBadge: {
    label: "Whale activity zone",
    zones: [
      { name: "Strong Accumulation", color: "green",   description: "Whale count rising by more than 5 addresses over 30 days. Large holders actively adding to positions — a strong bullish signal." },
      { name: "Accumulation",        color: "blue",    description: "Whale count rising over 30 days. Large holders adding to positions — a positive directional signal." },
      { name: "Neutral",             color: "neutral", description: "Whale count unchanged over 30 days. No directional signal from the largest holder cohort." },
      { name: "Distribution",        color: "amber",   description: "Whale count falling over 30 days. Large holders reducing positions — watch for increased sell pressure." },
      { name: "Strong Distribution", color: "red",     description: "Whale count falling by more than 5 addresses over 30 days. Large holders exiting significantly — historically a bearish signal." }
    ]
  },

  whaleInterpretation: {
    "Strong Accumulation": "Whale count rising fast. Large holders are actively accumulating — a historically strong bullish signal.",
    "Accumulation":        "Whale count rising. Large holders adding to positions — a positive directional signal.",
    "Neutral":             "Whale count unchanged. No directional signal from the largest holder cohort today.",
    "Distribution":        "Whale count falling. Large holders reducing positions — watch for increased sell pressure.",
    "Strong Distribution": "Whale count falling fast. Large holders exiting significantly — historically a bearish signal near cycle tops."
  }

};
