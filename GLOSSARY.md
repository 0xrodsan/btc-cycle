# Glossary — Bitcoin On-Chain Terminology

> A working glossary written from RodSan's own understanding as the `btc-cycle` tool evolves.
> Each term is defined in plain language first, with technical precision second.
> This file grows iteration by iteration — only terms internalized are added.

---

## How to use this glossary

- **Plain language first**: each entry starts with how I'd explain it to someone who doesn't follow Bitcoin
- **Then the technical layer**: the formal definition, with formula when relevant
- **Why it matters**: a sentence on what this concept unlocks for cycle analysis
- **Reference**: external link to dig deeper

Entries marked 🚧 are still being absorbed and should be reviewed.

---

## Iteration 1 — Foundation

### UTXO (Unspent Transaction Output)

**Plain language**: Bitcoin has no concept of "account balance". Instead, every coin exists as a chunk of unspent output from a past transaction — like a physical banknote waiting in a drawer. A wallet's "balance" is just the sum of all UTXOs it controls.

**Technical**: A UTXO is the output of a Bitcoin transaction that has not yet been used as input to another transaction. Each UTXO has:
- A value (amount of BTC)
- A locking script (defines who can spend it)
- A creation timestamp (the block it was minted in)
- An implicit price tag (BTC market price at the time of creation)

**Why it matters**: UTXOs carry **age** and **cost basis**. This makes on-chain analysis possible — every metric below ultimately derives from inspecting the age and price-at-creation of UTXOs.

**Reference**: https://www.bitcoinmagazinepro.com/learning/25/utxo-explained/

---

### Coin Age

**Plain language**: How long a specific UTXO has been sitting still without being moved. A UTXO created today has 0 coin age; one untouched since 2015 has years of coin age.

**Technical**: Time elapsed since the UTXO was created, measured in days. When a UTXO is spent, its coin age "resets" (the new UTXO created has coin age 0).

**Why it matters**: Coin age is the raw input for measuring market patience. When old UTXOs start moving, it signals long-term holders are acting.

---

### Coin Days Destroyed (CDD)

**Plain language**: When a 1 BTC UTXO that sat still for 100 days is finally spent, it "destroys" 100 coin-days. CDD aggregates this destruction across the whole network. High CDD = old hands are moving. Low CDD = nobody patient is selling.

**Technical**: For every UTXO spent in a given period, multiply its BTC amount by its age in days. Sum across all spends in the period.

**Why it matters**: Filters out spam transactions — moving a small new UTXO doesn't move CDD much. Big movements of old coins move it a lot.

🚧 *Will be expanded in Iteration 2 alongside HODL Waves.*

---

### Market Cap

**Plain language**: Current BTC price multiplied by total coins in circulation. What the market *thinks* Bitcoin is worth right now.

**Technical**: `Market Cap = Spot Price × Circulating Supply`

**Why it matters**: Standard valuation metric, but volatile and sentiment-driven. Useful only when compared against more stable measures (like Realized Cap).

---

### Realized Cap

**Plain language**: Take every UTXO. Multiply each one by the BTC price at the moment it was created (not now). Sum it all. This is the "real money" that flowed into Bitcoin to acquire the coins currently in circulation.

**Technical**: `Realized Cap = Σ (UTXO_value × BTC_price_at_UTXO_creation)` for all unspent UTXOs.

**Why it matters**: Strips out market sentiment. Represents the aggregate cost basis of all holders. Much more stable than Market Cap, behaves like a "fair value" floor in bear markets.

---

### Realized Price

**Plain language**: The average price at which all bitcoins in circulation were last bought. If BTC market price drops below Realized Price, it means the average holder is sitting on a paper loss.

**Technical**: `Realized Price = Realized Cap ÷ Circulating Supply`

**Why it matters**:
- Market price **above** Realized Price → aggregate holders in profit
- Market price **below** Realized Price → aggregate holders in paper loss
- Historically, market price crossing **below** Realized Price has marked cycle bottoms (2015, 2018-19, March 2020, late 2022)

**Reference**: https://www.bitcoinmagazinepro.com/charts/realized-price/

---

### MVRV Ratio (Market Value to Realized Value)

**Plain language**: How many times above the average cost basis the market is currently priced. MVRV of 2 means the market price is 2x the average price people paid.

**Technical**: `MVRV = Market Cap ÷ Realized Cap` (equivalently: `Spot Price ÷ Realized Price`)

**Why it matters**: A simple, intuitive valuation oscillator. Average unrealized profit/loss = MVRV − 1. MVRV below 1 = aggregate loss territory.

---

### MVRV Z-Score

**Plain language**: Same idea as MVRV, but normalized in standard deviations. Tells you not just "how much above cost basis" but "how *unusual* this is by historical standards". A Z-Score of 7 is rare and historically marks tops; below 0 is rare and historically marks bottoms.

**Technical**: `MVRV Z-Score = (Market Cap − Realized Cap) ÷ StdDev(Market Cap over full history)`

**Why it matters**: Normalizes across cycles of different magnitudes. A Z-Score in the green zone in 2015 ($300 BTC) and a Z-Score in the green zone in 2022 ($16k BTC) carry the same meaning: extreme undervaluation.

**Historical zones (approximate):**
- Z < 0.1 → green zone, generational accumulation
- 0.1 to 2.5 → fair value range
- 2.5 to 5 → caution zone, market stretching
- Z > 5 → red zone, historical cycle tops

**Reference**: https://www.bitcoinmagazinepro.com/charts/mvrv-zscore/

---

### Cycle Zone

**Plain language**: A qualitative label describing where Bitcoin currently sits in its long-term market cycle, derived from on-chain metrics rather than price alone.

**Working framework for `btc-cycle`:**
- **Deep Accumulation**: multiple metrics in extreme undervaluation zones simultaneously
- **Accumulation**: at least one metric signaling undervaluation
- **Fair Value**: metrics clustered around historical averages
- **Caution**: metrics drifting into overheated territory
- **Distribution**: multiple metrics in extreme overvaluation zones

**Why it matters**: Translates raw numbers into a one-glance answer to the question "where are we?". Avoids false precision of price targets while remaining actionable.

---

## Iteration 2 — Cohort dynamics

### Long-Term Holder (LTH)

**Plain language**: Any Bitcoin owner whose coins have not moved for 155 days or more. This threshold is not arbitrary — statistically, after 155 days without moving, the probability of a coin being spent drops sharply. Holding that long signals intentional accumulation, not speculation.

**Technical**: A UTXO is classified as LTH when its age crosses 155 days. The counterpart is STH (Short-Term Holder) — any UTXO younger than 155 days.

**Why it matters**: LTHs are the "smart money" in on-chain analysis. They tend to accumulate during bear markets and distribute during bull markets. Tracking their behavior is the closest thing on-chain analysis has to following institutional intent.

---

### LTH Supply (Long-Term Holder Supply)

**Plain language**: The total amount of Bitcoin held by Long-Term Holders at any given moment. When this number rises, patient capital is accumulating. When it falls, those same holders are selling into strength.

**Technical**: Sum of all UTXOs with age ≥ 155 days, expressed in BTC.

**Why it matters**:
- LTH Supply rising during a price downtrend → weak hands selling to strong hands → accumulation signal
- LTH Supply falling during a price uptrend → LTHs distributing into demand → distribution signal
- LTH Supply at all-time highs while price is depressed → historically one of the strongest accumulation signals in Bitcoin

**The pattern to look for**: price down + LTH Supply up = smart money buying what scared money is selling.

**Data source note**: LTH Supply total (in BTC) is not available on BGeometrics free tier. The metric used in `btc-cycle` Iteration 2 is **LTH Position Change 30d** — the net change in LTH supply over 30 days. This is more actionable (shows current accumulation/distribution direction) but does not show the absolute total. If the full supply metric is needed in the future, Glassnode (paid) or CoinMetrics (free tier) are the available sources.

---

### LTH Position Change 30d

**Plain language**: How much Bitcoin moved into or out of Long-Term Holder wallets in the last 30 days. A positive number means more BTC crossed the 155-day threshold (accumulation). A negative number means LTHs are spending and distributing.

**Technical**: Net change in LTH Supply over a rolling 30-day window, expressed in BTC.
- Positive → LTH Supply growing → accumulation in progress
- Negative → LTH Supply shrinking → distribution in progress
- Near zero → neutral, no strong directional signal

**Why it matters**: More dynamic than the static supply total — shows whether accumulation is happening *right now*, not just the historical stock. A sustained positive reading while price is low is one of the clearest smart-money signals available on-chain.

**Used in `btc-cycle`**: Yes — Iteration 2. Replaces LTH Supply total due to data availability constraints on BGeometrics free tier.

---

### Short-Term Holder (STH)

**Plain language**: Any Bitcoin owner whose coins have moved within the last 155 days. STHs are more reactive to price — they tend to sell during downturns and buy during uptrends, often at the wrong time.

**Technical**: A UTXO is classified as STH when its age is below 155 days.

**Why it matters**: STH behavior is the "noise" that LTH analysis filters out. When STHs capitulate (sell at a loss during bear markets), they transfer coins to LTHs — this is exactly the dynamic that drives LTH Supply higher at cycle bottoms.

---

### Exchange Net Position Change

**Plain language**: A measure of how much Bitcoin is flowing into or out of exchanges over a given period (typically 30 days). Coins entering exchanges are likely being prepared for sale. Coins leaving exchanges are going to cold storage — a sign of conviction holding.

**Technical**: `Exchange Net Position Change = BTC inflows to exchanges − BTC outflows from exchanges` over a rolling window (30 days standard).
- Positive value → net inflow → more BTC available for sale → bearish pressure
- Negative value → net outflow → BTC leaving exchanges → bullish pressure

**Why it matters**: Exchange reserves represent the immediately available supply for selling. When reserves fall consistently while price is low, it means large players are accumulating and moving coins off exchanges — reducing future sell pressure before any price recovery is visible.

**The pattern to look for**: sustained net outflows + low price + LTH Supply rising = three-signal confluence that historically precedes major recoveries.

**How exchanges are identified on-chain**: blockchain analytics firms (Glassnode, Arkham, Nansen) use address clustering — grouping addresses that transact together and matching deposit/withdrawal patterns to known exchange addresses. This is why entity-adjusted data is more reliable than raw address data.

**Data availability note**: The BGeometrics endpoint `exchange-netflow-btc` requires a paid plan and is not available on the free tier. In `btc-cycle` Iteration 2, this metric was replaced by **Illiquid Supply** (endpoint: `illiquid-supply`), which serves as a strong proxy — coins leaving exchanges typically move to illiquid wallets, so both metrics capture the same underlying behavior of patient capital reducing sell-side exposure.

---

### HODL Waves

**Plain language**: A visualization that shows what percentage of Bitcoin's total supply was last moved in each time band (1 day ago, 1 week ago, 1 month ago, 6 months ago, 1 year ago, etc.). When the "old" bands (1+ years) grow wider, long-term holding is increasing. When the "young" bands dominate, coins are changing hands frequently.

**Technical**: Each UTXO is assigned to an age band based on its last move. The supply is then distributed across these bands and shown as a stacked area chart over time.

**Why it matters**: HODL Waves make LTH behavior visible at a macro level. The growth of the 1-year+ bands in a bear market is the visual representation of accumulation — coins being absorbed by holders who intend to wait for the next cycle.

🚧 *Visual metric — more useful as context for LTH Supply than as a standalone signal in `btc-cycle`.*

---

### Supply in Cold Storage (Illiquid Supply)

**Plain language**: The total amount of Bitcoin held by wallets that rarely or never spend. Think of it as BTC that has effectively left active markets and gone into long-term storage — cold wallets, hardware wallets, deep conviction holders. When this number rises, more BTC is leaving circulation. When it falls, previously stored coins are returning to active markets.

**Technical**: BGeometrics defines an entity as "illiquid" when its ratio of cumulative outflows to cumulative inflows (lifetime liquidity L) is below 0.25. Illiquid Supply = sum of all BTC held by entities with L ≲ 0.25.

**User-facing name in `btc-cycle`**: "Supply in Cold Storage" — chosen over "Illiquid Supply" for accessibility. Both refer to the same metric.

**Why it matters**:
- Rising illiquid supply = more BTC leaving active circulation = tightening available sell-side supply
- Falling illiquid supply = previously stored coins returning to markets = increased sell-side pressure
- Strongly correlated with exchange reserve trends (coins leaving exchanges go to illiquid wallets)

**Zone thresholds (30d % change)**:
- Strong Accumulation: > +1%
- Accumulation: +0.2% to +1%
- Neutral: -0.2% to +0.2%
- Distribution: -1% to -0.2%
- Strong Distribution: < -1%

**Endpoint**: `https://api.bgeometrics.com/v1/illiquid-supply`
**Data format**: Array of daily entries — [date, timestamp, illiquid_value, liquid_value]
**Reference chart**: https://www.bitcoinmagazinepro.com/charts/long-term-holder-supply/ (LTH Supply — closest free public proxy)

**Relationship to Exchange Reserve**: Exchange Reserve measures BTC on exchanges directly. Illiquid Supply measures the destination — where coins go after leaving exchanges. Both signal the same smart-money behavior from different angles.

**Used in `btc-cycle`**: Yes — Iteration 2. Replaces Exchange Reserve/Netflow (both require paid BGeometrics plan).

---

## Iteration 3 — Miner & whale activity

### Puell Multiple

**Plain language**: Compares what Bitcoin miners are earning today (in USD) to what they earned on average over the past year. A value below 1 means miners are earning less than their historical average — they are under financial pressure. A value above 3 means they are earning far more than usual.

**Technical**: `Puell Multiple = Daily miner issuance value (USD) / 365-day moving average of daily issuance value (USD)`. Created by analyst David Puell.

**Why it matters**: Miners are structural sellers — they must sell BTC to pay for electricity and hardware. When the Puell Multiple is very low, the least efficient miners shut down or sell reserves at a loss, removing sell pressure from the market. When it is very high, miners are incentivized to sell more, adding sell pressure.

**Historical context**:
- Capitulation zone (< 0.5): reached at cycle lows in 2011, 2015, 2018, and 2022 — each time preceded significant recoveries
- Euphoria zone (> 3.0): the 2013, 2017, and 2021 cycle tops all saw the Puell Multiple spike into this territory before major corrections

**Zone thresholds in `btc-cycle`**:
- Strong Accumulation / Capitulation: < 0.5
- Pressure (Accumulation): 0.5 to 1.0
- Neutral: 1.0 to 1.5
- Healthy (Caution): 1.5 to 3.0
- Euphoria (Distribution): > 3.0

**Note on calibration**: the Pressure zone was expanded from `< 0.8` to `< 1.0` after observing that values between 0.8 and 1.0 still represent miners earning below their historical average — classifying this as "Neutral" was misleading.

**Endpoint**: `https://api.bgeometrics.com/v1/puell-multiple`
**Reference chart**: https://www.bitcoinmagazinepro.com/charts/puell-multiple/

---

### Whale Balance (>10k BTC)

**Plain language**: The number of Bitcoin addresses that currently hold more than 10,000 BTC. These are the largest holders — institutions, funds, and long-term strategic investors. When this number rises, the biggest players are accumulating. When it falls, they are distributing.

**Technical**: Count of unique addresses with a balance ≥ 10,000 BTC at the last daily snapshot. The signal used in `btc-cycle` is the 30-day change in this count — not the absolute number.

**Why it matters**: Even a change of 1-2 addresses in this cohort represents hundreds of millions of dollars moving between holding and active positions. It is one of the most direct proxies for institutional accumulation or distribution behavior.

**Why 30d change (not 1d)**: Daily change in whale count is extremely noisy — a single large wallet splitting or merging can show ±5 on any given day. The 30-day trend filters this noise and reveals the directional behavior of the cohort.

**Zone thresholds in `btc-cycle`** (30d change):
- Strong Accumulation: > +5 addresses
- Accumulation: 0 to +5 addresses
- Neutral: 0
- Distribution: -5 to 0 addresses
- Strong Distribution: < -5 addresses

**Data note**: Uses append strategy in GitHub Action — new daily entry appended to historical file rather than overwriting. Minimum 31 entries required to calculate 30d change. File capped at 60 entries.

**Accumulation Trend Score note**: Originally planned for Iteration 3. The BGeometrics endpoint `accumulation-trend-score` returns HTTP 500 (persistent server error). Whale Balance is used as a direct proxy — it captures the same underlying behavior (institutional accumulation/distribution) from a different angle.

**Endpoint**: `https://api.bgeometrics.com/v1/balance-addr-10K-BTC`
**Reference chart**: https://charts.bgeometrics.com/distribution_coin_humpback_dark.html

---

## Iteration 4 — Profit/loss behavior

*To be filled when Iteration 4 begins. Planned entries: SOPR, aSOPR, LTH-SOPR, NUPL.*

---

## Iteration 5 — Synthesis

*Will not introduce new terms, but will document how all previous entries combine into the aggregate cycle reading.*

---

## Open questions

*Things I'm not yet sure about — to revisit as understanding grows.*

- [x] How exactly is the StdDev window calculated in MVRV Z-Score? → Uses full historical data, not rolling window
- [x] Does BGeometrics expose entity-adjusted metrics? → Yes, but some require paid plan (exchange flows, accumulation trend score)
- [x] At what age threshold does a UTXO transition from STH to LTH? → 155 days (confirmed)
- [ ] Accumulation Trend Score (`accumulation-trend-score`) returns HTTP 500 on BGeometrics — monitor for fix in future iterations
