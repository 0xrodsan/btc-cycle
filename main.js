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
      color: "soft-green",
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
      test: function (z) { return z < 0.1; },
      label: "Deep Accumulation",
      color: "green",
      copy: "Z-Score in historically rare undervaluation territory. Major cycle lows have occurred in this zone."
    },
    {
      test: function (z) { return z >= 0.1 && z < 2.5; },
      label: "Fair Value",
      color: "neutral",
      copy: "Z-Score within normal historical range. Market is not at a statistically extreme level."
    },
    {
      test: function (z) { return z >= 2.5 && z < 5.0; },
      label: "Caution",
      color: "amber",
      copy: "Z-Score is stretching above historical norms. Elevated unrealized profit across the market."
    },
    {
      test: function (z) { return z >= 5.0; },
      label: "Distribution",
      color: "red",
      copy: "Z-Score at historically extreme levels. Each prior cycle peak occurred in or near this zone."
    }
  ];

  function getMvrvZone(z) {
    for (var i = 0; i < MVRV_ZONES.length; i++) {
      if (MVRV_ZONES[i].test(z)) return MVRV_ZONES[i];
    }
    return MVRV_ZONES[1]; // fallback: Fair Value
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
  function renderFreshness(rpDate, mvrvDate) {
    var date = rpDate || mvrvDate;
    var el = document.getElementById("last-update");
    if (!el) return;

    if (date) {
      // Accept ISO strings or just YYYY-MM-DD
      var d = new Date(date);
      if (!isNaN(d.getTime())) {
        el.textContent = d.toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric"
        });
        return;
      }
    }

    // Fallback: today
    el.textContent = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
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
    var btcRaw  = results[2];

    var rpValue  = extractNumeric(rpRaw);
    var zScore   = extractNumeric(mvrvRaw);
    var btcPrice = extractBtcPrice(btcRaw);

    if (rpValue === null || zScore === null || btcPrice === null) {
      showError("Data unavailable — will retry on next update.");
      return;
    }

    renderRealizedPrice(rpValue, btcPrice);
    renderMvrv(zScore);

    // Freshness — handle BGeometrics array format (last entry has "d" field)
    function extractDate(raw) {
      if (!raw) return null;
      // Array: take last element
      var obj = Array.isArray(raw) ? raw[raw.length - 1] : raw;
      if (!obj) return null;
      // Try "d" (BGeometrics), then "date", then nested data.date
      return obj.d || obj.date || (obj.data && (obj.data.d || obj.data.date)) || null;
    }

    renderFreshness(extractDate(rpRaw), extractDate(mvrvRaw));

    // Attach tooltips after data has rendered
    attachAllTooltips(zScore);

  }).catch(function (err) {
    console.error("[btc-cycle] failed to load metrics:", err);
    showError("Data unavailable — will retry on next update.");
  });

})();
