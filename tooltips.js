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
    text: "Current Bitcoin market price, updated daily. Comparing this to Realized Price shows whether the average holder is currently in profit or loss."
  },

  premiumDiscount: {
    label: "Premium / Discount",
    text: "How far the current market price is from the average holder's cost basis. Above 150% has historically marked distribution zones. Negative values have marked generational lows."
  },

  // --- MVRV Z-Score data points ---
  mvrvZScoreValue: {
    label: "Z-Score value",
    text: "A Z-Score of 0 to 2.5 means the market is within normal historical range. No cycle peak has ever occurred at this level. Values above 5 have historically coincided with cycle tops."
  },

  // --- Zone badge (shared glossary for both metrics) ---
  zoneBadge: {
    label: "Current zone",
    zones: [
      {
        name: "Deep Accumulation",
        color: "green",
        description: "Price is below the average holder cost basis. Historically, the rarest zone — major cycle lows have occurred here."
      },
      {
        name: "Accumulation",
        color: "soft-green",
        description: "Market is modestly above average cost basis. A historically favorable zone for long-term entry."
      },
      {
        name: "Fair Value",
        color: "neutral",
        description: "No extreme signal. The market is near its historical equilibrium — neither cheap nor expensive."
      },
      {
        name: "Caution",
        color: "amber",
        description: "The market is running above historical norms. Long-term holders are in significant profit — watch for distribution."
      },
      {
        name: "Distribution",
        color: "red",
        description: "Historically, this zone has marked cycle peaks. Patient capital tends to reduce exposure here."
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
    "Deep Accumulation": "Historically, this is where patient capital accumulates. Major cycle lows have occurred at this level.",
    "Fair Value":        "No extreme signal. The market is near its historical equilibrium — neither cheap nor expensive.",
    "Caution":           "The market is running above historical norms. Long-term holders are in significant profit — watch for distribution.",
    "Distribution":      "Historically, this zone has marked cycle peaks. Patient capital tends to reduce exposure here."
  }

};
