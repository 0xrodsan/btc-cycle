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

---

### HODL Waves

**Plain language**: A visualization that shows what percentage of Bitcoin's total supply was last moved in each time band (1 day ago, 1 week ago, 1 month ago, 6 months ago, 1 year ago, etc.). When the "old" bands (1+ years) grow wider, long-term holding is increasing. When the "young" bands dominate, coins are changing hands frequently.

**Technical**: Each UTXO is assigned to an age band based on its last move. The supply is then distributed across these bands and shown as a stacked area chart over time.

**Why it matters**: HODL Waves make LTH behavior visible at a macro level. The growth of the 1-year+ bands in a bear market is the visual representation of accumulation — coins being absorbed by holders who intend to wait for the next cycle.

🚧 *Visual metric — more useful as context for LTH Supply than as a standalone signal in `btc-cycle`.*

---

## Iteration 3 — Miner & whale activity

*To be filled when Iteration 3 begins. Planned entries: Puell Multiple, Hash Ribbons, Accumulation Trend Score, entity clustering.*

---

## Iteration 4 — Profit/loss behavior

*To be filled when Iteration 4 begins. Planned entries: SOPR, aSOPR, LTH-SOPR, NUPL.*

---

## Iteration 5 — Synthesis

*Will not introduce new terms, but will document how all previous entries combine into the aggregate cycle reading.*

---

## Open questions

*Things I'm not yet sure about — to revisit as understanding grows.*

- [ ] How exactly is the StdDev window calculated in MVRV Z-Score? Full history or rolling?
- [ ] Does BGeometrics expose entity-adjusted metrics, or only raw address-level data?
- [x] At what age threshold does a UTXO transition from "Short-Term Holder" to "Long-Term Holder"? → **155 days** (confirmed in Iteration 2)
