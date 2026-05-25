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

*To be filled when Iteration 2 begins. Planned entries: HODL Waves, LTH/STH supply, Liveliness, Exchange Net Position Change.*

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
- [ ] At what age threshold does a UTXO transition from "Short-Term Holder" to "Long-Term Holder"? (commonly cited as 155 days — to verify)
