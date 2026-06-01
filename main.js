(function () {
  "use strict";

  /* ============================================================
     Populate hrefs from SITE config
     ============================================================ */
  if (typeof SITE !== "undefined") {
    document.querySelectorAll("[data-link]").forEach(function (el) {
      var key = el.getAttribute("data-link");
      if (SITE[key]) el.setAttribute("href", SITE[key]);
    });
  }

  /* ============================================================
     Theme toggle (dark/light)
     ============================================================ */
  var themeToggle = document.querySelector(".theme-toggle");
  var root = document.documentElement;

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  /* ============================================================
     Mobile menu
     ============================================================ */
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  function closeMenu() {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  }

  function openMenu() {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", "true");
    mobileNav.hidden = false;
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      var expanded = menuToggle.getAttribute("aria-expanded") === "true";
      if (expanded) { closeMenu(); } else { openMenu(); }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 720) closeMenu();
    });
  }

  /* ============================================================
     Reveal-on-scroll
     ============================================================ */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ============================================================
     Dynamic year in footer
     ============================================================ */
  var yearEl = document.querySelector(".footer-year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ============================================================
     Data extraction — resilient against multiple API shapes
     Tries: .value → .v → array[last].value → array[last].v → root number
     ============================================================ */
  function extractNumeric(raw) {
    if (raw === null || raw === undefined) return null;

    // Unwrap common envelope fields
    var data = raw;
    if (data.data !== undefined) data = data.data;
    if (data.result !== undefined) data = data.result;

    // Array → take last element (most recent)
    if (Array.isArray(data)) {
      if (data.length === 0) return null;
      data = data[data.length - 1];
    }

    // Direct numeric
    if (typeof data === "number" && isFinite(data)) return data;

    // Named fields (try in priority order)
    var fields = [
      "value", "v", "realized_price", "realizedPrice",
      "mvrv_zscore", "mvrvZscore", "z_score", "zScore",
      "price", "usd"
    ];
    for (var i = 0; i < fields.length; i++) {
      var candidate = data[fields[i]];
      if (typeof candidate === "number" && isFinite(candidate)) return candidate;
    }

    return null;
  }

  function extractBtcPrice(raw) {
    // CoinGecko: {"bitcoin": {"usd": 77503}}
    if (raw && raw.bitcoin && typeof raw.bitcoin.usd === "number") {
      return raw.bitcoin.usd;
    }
    return extractNumeric(raw);
  }

  function extractLthValue(json) {
    if (Array.isArray(json) && json.length > 0) {
      var last = json[json.length - 1];
      if (last.lthNetPositionChange30dBtc !== undefined) {
        return parseFloat(last.lthNetPositionChange30dBtc);
      }
      if (Array.isArray(last)) return parseFloat(last[2]);
      return parseFloat(last.v || last.value || 0);
    }
    return null;
  }

  function extractColdStorage(json) {
    if (Array.isArray(json) && json.length > 30) {
      var last = json[json.length - 1];
      var prev = json[json.length - 31];
      var getVal = function(entry) {
        if (Array.isArray(entry)) return parseFloat(entry[2]);
        if (entry.illiquidSupply !== undefined) return parseFloat(entry.illiquidSupply);
        return parseFloat(entry.v || entry.value || 0);
      };
      var current = getVal(last);
      var previous = getVal(prev);
      var changePct = ((current - previous) / previous) * 100;
      return { current: current, changePct: changePct };
    }
    return null;
  }

  /* ============================================================
     Formatting helpers
     ============================================================ */
  function formatUSD(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function formatPct(n) {
    var sign = n >= 0 ? "+" : "";
    return sign + n.toFixed(1) + "%";
  }

  /* ============================================================
     Zone logic — Realized Price
     ============================================================ */
  var RP_ZONES = [
    {
      test: function (prem) { return prem < 0; },
      label: "Deep Accumulation",
      color: "green",
      copy: "BTC is trading below the average cost basis of all holders — historically, a rare and significant accumulation zone."
    },
    {
      test: function (prem) { return prem >= 0 && prem < 25; },
      label: "Accumulation",
      color: "blue",
      copy: "BTC is slightly above aggregate cost basis. Long-term holders are generally in modest profit."
    },
    {
      test: function (prem) { return prem >= 25 && prem < 75; },
      label: "Fair Value",
      color: "neutral",
      copy: "BTC trades in line with historical cost basis norms. No extreme signal in either direction."
    },
    {
      test: function (prem) { return prem >= 75 && prem < 150; },
      label: "Caution",
      color: "amber",
      copy: "The market is running significantly above aggregate cost basis. Historically, a zone for patience."
    },
    {
      test: function (prem) { return prem >= 150; },
      label: "Distribution",
      color: "red",
      copy: "BTC is far above aggregate cost basis. Past cycles show this as a distribution zone for patient capital."
    }
  ];

  function getRealizedPriceZone(premiumPct) {
    for (var i = 0; i < RP_ZONES.length; i++) {
      if (RP_ZONES[i].test(premiumPct)) return RP_ZONES[i];
    }
    return RP_ZONES[2]; // fallback: Fair Value
  }

  /* ============================================================
     Zone logic — MVRV Z-Score
     ============================================================ */
  var MVRV_ZONES = [
    {
      test: function (z) { return z < 0.5; },
      label: "Deep Accumulation",
      color: "green",
      copy: "Z-Score in historically rare undervaluation territory. Major cycle lows have occurred in this zone."
    },
    {
      test: function (z) { return z >= 0.5 && z < 1.5; },
      label: "Accumulation",
      color: "blue",
      copy: "Z-Score above deep undervaluation but still below historical norms. A historically favorable zone before broader price discovery."
    },
    {
      test: function (z) { return z >= 1.5 && z < 3.0; },
      label: "Fair Value",
      color: "neutral",
      copy: "Z-Score within normal historical range. Market is not at a statistically extreme level."
    },
    {
      test: function (z) { return z >= 3.0 && z < 6.0; },
      label: "Caution",
      color: "amber",
      copy: "Z-Score is stretching above historical norms. Elevated unrealized profit across the market."
    },
    {
      test: function (z) { return z >= 6.0; },
      label: "Distribution",
      color: "red",
      copy: "Z-Score at historically extreme levels. Each prior cycle peak occurred in or near this zone."
    }
  ];

  function getMvrvZone(z) {
    for (var i = 0; i < MVRV_ZONES.length; i++) {
      if (MVRV_ZONES[i].test(z)) return MVRV_ZONES[i];
    }
    return MVRV_ZONES[2]; // fallback: Fair Value
  }

  /* ============================================================
     Zone logic — LTH Net Position Change 30d (BTC)
     ============================================================ */
  var LTH_ZONES = [
    {
      test: function (v) { return v > 300000; },
      label: "Strong Accumulation",
      color: "green",
      copy: "LTH Supply growing rapidly. Smart money is accumulating heavily."
    },
    {
      test: function (v) { return v > 50000; },
      label: "Accumulation",
      color: "blue",
      copy: "Long-term holders are accumulating. A historically favorable signal."
    },
    {
      test: function (v) { return v >= -50000; },
      label: "Neutral",
      color: "neutral",
      copy: "No strong directional signal from long-term holders."
    },
    {
      test: function (v) { return v >= -300000; },
      label: "Distribution",
      color: "amber",
      copy: "Long-term holders are reducing exposure. Watch for further distribution."
    },
    {
      test: function (v) { return v < -300000; },
      label: "Strong Distribution",
      color: "red",
      copy: "Heavy distribution from long-term holders. Historically a caution zone."
    }
  ];

  function getLthZone(value) {
    for (var i = 0; i < LTH_ZONES.length; i++) {
      if (LTH_ZONES[i].test(value)) return LTH_ZONES[i];
    }
    return LTH_ZONES[2]; // fallback: Neutral
  }

  /* ============================================================
     Zone logic — Supply in Cold Storage (30d % change)
     ============================================================ */
  var COLD_STORAGE_ZONES = [
    {
      test: function(pct) { return pct > 1.0; },
      label: "Strong Accumulation", color: "green",
      copy: "Cold storage growing rapidly. Large amounts of BTC leaving active circulation."
    },
    {
      test: function(pct) { return pct > 0.2; },
      label: "Accumulation", color: "blue",
      copy: "Cold storage rising steadily. Bitcoin moving away from active markets."
    },
    {
      test: function(pct) { return pct >= -0.2; },
      label: "Neutral", color: "neutral",
      copy: "Cold storage stable. No strong directional signal."
    },
    {
      test: function(pct) { return pct >= -1.0; },
      label: "Distribution", color: "amber",
      copy: "Cold storage falling. Previously illiquid coins returning to active markets."
    },
    {
      test: function(pct) { return pct < -1.0; },
      label: "Strong Distribution", color: "red",
      copy: "Cold storage falling rapidly. Significant coins returning to circulation."
    }
  ];

  function getColdStorageZone(pct) {
    for (var i = 0; i < COLD_STORAGE_ZONES.length; i++) {
      if (COLD_STORAGE_ZONES[i].test(pct)) return COLD_STORAGE_ZONES[i];
    }
    return COLD_STORAGE_ZONES[2];
  }

  /* ============================================================
     Premium/Discount label builder
     ============================================================ */
  function premiumLabel(premiumPct) {
    if (premiumPct >= 0) {
      return Math.abs(premiumPct).toFixed(1) + "% above cost basis";
    }
    return Math.abs(premiumPct).toFixed(1) + "% below cost basis";
  }

  /* ============================================================
     DOM rendering helpers
     ============================================================ */
  function setTextSafe(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setClassSafe(id, className) {
    var el = document.getElementById(id);
    if (el) el.className = className;
  }

  function showError(msg) {
    var errEl = document.getElementById("data-error");
    if (errEl) {
      errEl.textContent = msg || "Data unavailable — will retry on next update.";
      errEl.hidden = false;
    }
    // Hide metric blocks so we don't show partial/broken state
    document.querySelectorAll(".metric-block").forEach(function (b) {
      b.style.display = "none";
    });
  }

  /* ============================================================
     Freshness line
     ============================================================ */
  function renderFreshness(rpDate, mvrvDate, isLive) {
    var date = rpDate || mvrvDate;
    var freshnessEl = document.querySelector(".data-freshness");

    var dateStr = "";
    if (date) {
      // Append T00:00:00Z to force UTC parsing — avoids timezone off-by-one
      var d = new Date(date + "T00:00:00Z");
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
        });
      }
    }
    if (!dateStr) {
      dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });
    }

    if (freshnessEl) {
      var liveSuffix = isLive ? " · BTC price: live" : "";
      freshnessEl.innerHTML = "On-chain data updated daily · Last update: <span id=\"last-update\">"
        + dateStr + "</span>" + liveSuffix;
    } else {
      var el = document.getElementById("last-update");
      if (el) el.textContent = dateStr;
    }
  }

  /* ============================================================
     Render — Realized Price block
     ============================================================ */
  function renderRealizedPrice(rpValue, btcPrice) {
    setTextSafe("rp-value", formatUSD(rpValue));
    setTextSafe("btc-price-display", formatUSD(btcPrice));

    var premiumPct = ((btcPrice - rpValue) / rpValue) * 100;
    var zone = getRealizedPriceZone(premiumPct);

    var premEl = document.getElementById("rp-premium");
    if (premEl) {
      premEl.textContent = premiumLabel(premiumPct);
      premEl.className = "metric-premium color-" + zone.color;
    }

    var badgeEl = document.getElementById("rp-zone-badge");
    if (badgeEl) {
      badgeEl.textContent = zone.label;
      badgeEl.className = "zone-badge zone-badge--" + zone.color;
    }

    // Interpretation: use TOOLTIPS if available, fall back to zone.copy
    var rpInterp = (typeof TOOLTIPS !== "undefined" &&
                    TOOLTIPS.realizedPriceInterpretation &&
                    TOOLTIPS.realizedPriceInterpretation[zone.label])
      ? TOOLTIPS.realizedPriceInterpretation[zone.label]
      : zone.copy;
    setTextSafe("rp-interpretation", rpInterp);
  }

  /* ============================================================
     Render — MVRV Z-Score block
     ============================================================ */
  function renderMvrv(zScore) {
    setTextSafe("mvrv-value", zScore.toFixed(2));

    var zone = getMvrvZone(zScore);

    var badgeEl = document.getElementById("mvrv-zone-badge");
    if (badgeEl) {
      badgeEl.textContent = zone.label;
      badgeEl.className = "zone-badge zone-badge--" + zone.color;
    }

    // Interpretation: use TOOLTIPS if available, fall back to zone.copy
    var mvrvInterp = (typeof TOOLTIPS !== "undefined" &&
                      TOOLTIPS.mvrvInterpretation &&
                      TOOLTIPS.mvrvInterpretation[zone.label])
      ? TOOLTIPS.mvrvInterpretation[zone.label]
      : zone.copy;
    setTextSafe("mvrv-interpretation", mvrvInterp);
  }

  /* ============================================================
     Render — LTH Net Position Change block
     ============================================================ */
  function renderLth(value) {
    var zone = getLthZone(value);
    var sign = value >= 0 ? "+" : "";
    var formatted = sign + Math.round(value).toLocaleString("en-US") + " BTC";
    setTextSafe("lth-value", formatted);

    var badge = document.getElementById("lth-zone-badge");
    if (badge) {
      badge.textContent = zone.label;
      badge.className = "zone-badge zone-badge--" + zone.color;
    }

    var interp = (typeof TOOLTIPS !== "undefined" &&
                  TOOLTIPS.lthInterpretation &&
                  TOOLTIPS.lthInterpretation[zone.label])
      ? TOOLTIPS.lthInterpretation[zone.label]
      : zone.copy;
    setTextSafe("lth-interpretation", interp);
  }

  /* ============================================================
     Render — Supply in Cold Storage block
     ============================================================ */
  function renderColdStorage(data) {
    var zone = getColdStorageZone(data.changePct);
    var sign = data.changePct >= 0 ? '+' : '';
    setTextSafe('cold-storage-value', Math.round(data.current).toLocaleString('en-US') + ' BTC');
    setTextSafe('cold-storage-change', sign + data.changePct.toFixed(2) + '% (30d)');
    var badge = document.getElementById('cold-storage-zone-badge');
    if (badge) {
      badge.textContent = zone.label;
      badge.className = 'zone-badge zone-badge--' + zone.color;
    }
    var interp = (typeof TOOLTIPS !== 'undefined' &&
                  TOOLTIPS.coldStorageInterpretation &&
                  TOOLTIPS.coldStorageInterpretation[zone.label])
      ? TOOLTIPS.coldStorageInterpretation[zone.label]
      : zone.copy;
    setTextSafe('cold-storage-interpretation', interp);
  }

  /* ============================================================
     Tooltip system — single instance, mobile-safe
     ============================================================ */
  var tooltipEl = document.createElement("div");
  tooltipEl.className = "tooltip-box";
  tooltipEl.setAttribute("role", "tooltip");
  document.body.appendChild(tooltipEl);

  var currentTrigger = null;

  function renderTooltipContent(content) {
    tooltipEl.innerHTML = "";
    if (typeof content === "string") {
      var p = document.createElement("p");
      p.textContent = content;
      tooltipEl.appendChild(p);
    } else if (Array.isArray(content)) {
      content.forEach(function (zone) {
        var row = document.createElement("div");
        row.className = "tooltip-zone-row";
        row.innerHTML = '<span class="tooltip-zone-dot zone-dot-' + zone.color + '"></span>'
          + "<div><strong>" + zone.name + "</strong><p>" + zone.description + "</p></div>";
        tooltipEl.appendChild(row);
      });
    }
  }

  function positionTooltip(triggerEl) {
    var rect = triggerEl.getBoundingClientRect();
    var tipWidth = 300;
    var left = rect.left + window.scrollX;
    var top  = rect.bottom + window.scrollY + 8;

    if (left + tipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tipWidth - 16;
    }
    if (left < 8) left = 8;

    tooltipEl.style.top  = top  + "px";
    tooltipEl.style.left = left + "px";
  }

  function showTooltip(triggerEl, content) {
    if (currentTrigger === triggerEl) return;
    currentTrigger = triggerEl;
    renderTooltipContent(content);
    positionTooltip(triggerEl);
    tooltipEl.classList.add("visible");
  }

  function hideTooltip() {
    currentTrigger = null;
    tooltipEl.classList.remove("visible");
  }

  function attachTooltip(triggerEl, content) {
    triggerEl.classList.add("tooltip-trigger");
    triggerEl.setAttribute("tabindex", "0");

    triggerEl.addEventListener("mouseenter", function () { showTooltip(triggerEl, content); });
    triggerEl.addEventListener("mouseleave", hideTooltip);
    triggerEl.addEventListener("focus",      function () { showTooltip(triggerEl, content); });
    triggerEl.addEventListener("blur",       hideTooltip);

    // Mobile tap toggle
    triggerEl.addEventListener("click", function (e) {
      e.stopPropagation();
      if (currentTrigger === triggerEl) { hideTooltip(); }
      else                              { showTooltip(triggerEl, content); }
    });
  }

  // Close on outside click, scroll, or resize
  document.addEventListener("click",  hideTooltip);
  document.addEventListener("scroll", hideTooltip, { passive: true });
  window.addEventListener("resize",   hideTooltip);

  function attachAllTooltips(zScore) {
    if (typeof TOOLTIPS === "undefined") return;

    // Title links — navigation + tooltip on hover
    var rpTitle = document.querySelector("#rp-label .metric-title-link");
    if (rpTitle) attachTooltip(rpTitle, TOOLTIPS.realizedPriceTitle.text);

    var mvrvTitle = document.querySelector("#mvrv-label .metric-title-link");
    if (mvrvTitle) attachTooltip(mvrvTitle, TOOLTIPS.mvrvZScoreTitle.text);

    // Realized Price data points
    var rpValueEl  = document.getElementById("rp-value");
    if (rpValueEl)  attachTooltip(rpValueEl,  TOOLTIPS.realizedPriceValue.text);

    var btcPriceEl = document.getElementById("btc-price-display");
    if (btcPriceEl) attachTooltip(btcPriceEl, TOOLTIPS.btcSpotPrice.text);

    var rpPremEl   = document.getElementById("rp-premium");
    if (rpPremEl)   attachTooltip(rpPremEl,   TOOLTIPS.premiumDiscount.text);

    // MVRV Z-Score value — dynamic text based on live value
    var mvrvValueEl = document.getElementById("mvrv-value");
    if (mvrvValueEl) {
      var mvrvZoneLabel = getMvrvZone(zScore).label;
      var mvrvValueText = "A Z-Score of " + zScore.toFixed(2)
        + " places the market in the " + mvrvZoneLabel
        + " zone. Values above 5 have historically coincided with cycle tops;"
        + " below 0.1 with generational lows.";
      attachTooltip(mvrvValueEl, mvrvValueText);
    }

    // Zone badges — per-metric glossaries
    var rpBadgeEl   = document.getElementById("rp-zone-badge");
    if (rpBadgeEl)   attachTooltip(rpBadgeEl,   TOOLTIPS.realizedPriceZoneBadge.zones);

    var mvrvBadgeEl = document.getElementById("mvrv-zone-badge");
    if (mvrvBadgeEl) attachTooltip(mvrvBadgeEl, TOOLTIPS.mvrvZoneBadge.zones);

    // LTH Net Position Change tooltips
    var lthTitle = document.querySelector("#lth-label .metric-title-link");
    if (lthTitle) attachTooltip(lthTitle, TOOLTIPS.lthTitle.text);

    var lthValueEl = document.getElementById("lth-value");
    if (lthValueEl) attachTooltip(lthValueEl, TOOLTIPS.lthValue.text);

    var lthBadgeEl = document.getElementById("lth-zone-badge");
    if (lthBadgeEl) attachTooltip(lthBadgeEl, TOOLTIPS.lthZoneBadge.zones);

    // Cold Storage tooltips
    var coldStorageTitle = document.querySelector("#cold-storage-block .metric-title-link");
    if (coldStorageTitle) attachTooltip(coldStorageTitle, TOOLTIPS.coldStorageTitle.text);

    var coldStorageValueEl = document.getElementById("cold-storage-value");
    if (coldStorageValueEl) attachTooltip(coldStorageValueEl, TOOLTIPS.coldStorageValue.text);

    var coldStorageChangeEl = document.getElementById("cold-storage-change");
    if (coldStorageChangeEl) attachTooltip(coldStorageChangeEl, TOOLTIPS.coldStorageChange.text);

    var coldStorageBadgeEl = document.getElementById("cold-storage-zone-badge");
    if (coldStorageBadgeEl) attachTooltip(coldStorageBadgeEl, TOOLTIPS.coldStorageZoneBadge.zones);
  }

  /* ============================================================
     Live BTC price — fetched from CoinGecko on page load.
     Falls back to null on any error; caller uses static data.
     ============================================================ */
  async function fetchLiveBtcPrice() {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("CoinGecko fetch failed");
      const data = await res.json();
      return data.bitcoin.usd;
    } catch (err) {
      console.warn("Live BTC price unavailable, falling back to static data:", err);
      return null;
    }
  }

  /* ============================================================
     Fetch helper (returns a Promise)
     ============================================================ */
  function fetchJSON(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status + " for " + path);
      return res.json();
    });
  }

  /* ============================================================
     Main data load
     ============================================================ */
  var RP_PATH   = "data/realized-price.json";
  var MVRV_PATH = "data/mvrv-zscore.json";
  var BTC_PATH  = "data/btc-price.json";

  Promise.all([
    fetchJSON(RP_PATH),
    fetchJSON(MVRV_PATH),
    fetchJSON(BTC_PATH)
  ]).then(function (results) {
    var rpRaw   = results[0];
    var mvrvRaw = results[1];
    var btcRaw  = results[2];   // static fallback only

    var rpValue = extractNumeric(rpRaw);
    var zScore  = extractNumeric(mvrvRaw);

    if (rpValue === null || zScore === null) {
      showError("Data unavailable — will retry on next update.");
      return;
    }

    // Freshness — handle BGeometrics array format (last entry has "d" field)
    // Also handles flat CoinGecko object with injected fetched_at field
    function extractDate(raw) {
      if (Array.isArray(raw) && raw.length > 0) {
        var last = raw[raw.length - 1];
        return last.d || last.date || last.timestamp || null;
      }
      if (raw && raw.fetched_at) return raw.fetched_at;
      return null;
    }

    // Try live BTC price; fall back to static btc-price.json on failure
    return fetchLiveBtcPrice().then(function (livePrice) {
      var btcPrice = livePrice !== null ? livePrice : extractBtcPrice(btcRaw);
      var isLive   = livePrice !== null;

      if (btcPrice === null) {
        showError("Data unavailable — will retry on next update.");
        return;
      }

      renderRealizedPrice(rpValue, btcPrice);
      renderMvrv(zScore);
      renderFreshness(extractDate(rpRaw), extractDate(mvrvRaw), isLive);

      // Attach tooltips after data has rendered
      attachAllTooltips(zScore);
    });

  }).catch(function (err) {
    console.error("[btc-cycle] failed to load metrics:", err);
    showError("Data unavailable — will retry on next update.");
  });

  // LTH and exchange fetches are independent — failures don't affect existing metrics
  fetch("data/lth-position-change.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var value = extractLthValue(data);
      if (value !== null) renderLth(value);
    })
    .catch(function () { setTextSafe("lth-value", "Data unavailable"); });

  fetch('data/illiquid-supply.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var result = extractColdStorage(data);
      if (result) renderColdStorage(result);
      else setTextSafe('cold-storage-value', 'Data unavailable');
    })
    .catch(function() { setTextSafe('cold-storage-value', 'Data unavailable'); });

})();
