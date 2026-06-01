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
    text: "How far the current market price is above the average holder's cost basis. Zones: below 0% = Deep Accumulation · 0–25% = Accumulation · 25–75% = Fair Value · 75–150% = Caution · above 150% = Distribution."
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
        name: "Deep Accumulation",
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
        name: "Deep Accumulation",
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
    "Deep Accumulation": "Historically, this is where patient capital accumulates. Major cycle lows have occurred at this level.",
    "Accumulation":      "Market is modestly above average cost basis. A historically favorable zone for long-term entry.",
    "Fair Value":        "No extreme signal. The market is near its historical equilibrium — neither cheap nor expensive.",
    "Caution":           "The market is running above historical norms. Long-term holders are in significant profit — watch for distribution.",
    "Distribution":      "Historically, this zone has marked cycle peaks. Patient capital tends to reduce exposure here."
  },

  // MVRV Z-Score interpretations
  mvrvInterpretation: {
    "Deep Accumulation": "Z-Score in historically rare territory. Every major cycle low has occurred at this level.",
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

  // --- Exchange Reserve ---
  exchangeTitle: {
    label: "Exchange Reserve",
    text: "Total Bitcoin held on centralized exchanges. Falling reserves mean coins are moving to cold storage — reducing available sell-side supply. Rising reserves mean more BTC available for sale."
  },

  exchangeReserveValue: {
    label: "Exchange reserve",
    text: "The total amount of Bitcoin currently held on exchanges. Lower is historically more bullish — it means less BTC is available to be sold immediately."
  },

  exchangeChangeValue: {
    label: "30d change",
    text: "How much the exchange reserve changed over the last 30 days, as a percentage. Negative = outflows (bullish). Positive = inflows (bearish)."
  },

  exchangeZoneBadge: {
    label: "Exchange flow zone",
    zones: [
      { name: "Strong Outflow", color: "green",   description: "Reserves falling more than 2% in 30 days. Bitcoin moving rapidly to cold storage — strong bullish signal." },
      { name: "Outflow",        color: "blue",    description: "Reserves falling 0.5% to 2% in 30 days. Net outflow — holders moving coins to self-custody." },
      { name: "Neutral",        color: "neutral", description: "Reserves stable within ±0.5%. No meaningful directional flow signal." },
      { name: "Inflow",         color: "amber",   description: "Reserves rising 0.5% to 2% in 30 days. More BTC moving to exchanges — potential selling pressure ahead." },
      { name: "Strong Inflow",  color: "red",     description: "Reserves rising more than 2% in 30 days. Heavy inflow — historically a distribution signal." }
    ]
  },

  exchangeInterpretation: {
    "Strong Outflow": "Bitcoin leaving exchanges rapidly. Coins moving to cold storage — historically a bullish signal for long-term holders.",
    "Outflow":        "Net outflow from exchanges. Holders moving coins to self-custody — reducing available sell-side supply.",
    "Neutral":        "Exchange reserves stable. No strong directional signal from exchange flows.",
    "Inflow":         "Net inflow to exchanges. More BTC available for sale — watch for increased selling pressure.",
    "Strong Inflow":  "Bitcoin flowing heavily into exchanges. Historically a distribution signal — patient capital tends to reduce exposure here."
  }

};
