(function () {
  "use strict";

  /* ============================================================
     Data path base — resolved from this script's own URL, not the
     page URL. main.js is shared between / and /pt/ (loaded via
     "../main.js" from the PT page), so page-relative fetches like
     "data/x.json" would 404 once loaded from /pt/. Anchoring to
     document.currentScript.src keeps every fetch pointed at the
     one shared data/ directory regardless of which page loaded it.
     ============================================================ */
  var DATA_BASE = (function () {
    var src = document.currentScript ? document.currentScript.src : "main.js";
    return src.replace(/main\.js(\?.*)?(#.*)?$/, "") + "data/";
  })();

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
     Simple / Detailed view toggle
     ============================================================ */
  var btnDetailed = document.getElementById('btn-detailed');
  var btnSimple = document.getElementById('btn-simple');

  if (btnDetailed && btnSimple) {
    btnDetailed.addEventListener('click', function() {
      document.body.classList.remove('simple-mode');
      btnDetailed.classList.add('view-toggle-btn--active');
      btnSimple.classList.remove('view-toggle-btn--active');
    });
    btnSimple.addEventListener('click', function() {
      document.body.classList.add('simple-mode');
      btnSimple.classList.add('view-toggle-btn--active');
      btnDetailed.classList.remove('view-toggle-btn--active');
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

  function extractPuell(json) {
    if (Array.isArray(json) && json.length > 0) {
      var last = json[json.length - 1];
      if (Array.isArray(last)) return parseFloat(last[2]);
      return parseFloat(last.puellMultiple || last.v || last.value || 0);
    }
    return null;
  }

  function extractWhaleBalance(json) {
    if (Array.isArray(json) && json.length > 30) {
      var last = json[json.length - 1];
      var prev = json[json.length - 31];
      var getVal = function(entry) {
        if (Array.isArray(entry)) return parseInt(entry[2]);
        return parseInt(entry.v || entry.value || 0);
      };
      var current = getVal(last);
      var previous = getVal(prev);
      var change = current - previous;
      return { current: current, change: change };
    }
    return null;
  }

  function extractSopr(json) {
    if (Array.isArray(json) && json.length > 0) {
      var last = json[json.length - 1];
      if (Array.isArray(last)) return parseFloat(last[2]);
      return parseFloat(last.sopr || last.v || last.value || 0);
    }
    return null;
  }

  function extractNupl(json) {
    if (Array.isArray(json) && json.length > 0) {
      var last = json[json.length - 1];
      if (Array.isArray(last)) return parseFloat(last[2]);
      return parseFloat(last.nupl || last.v || last.value || 0);
    }
    return null;
  }

  /* ============================================================
     Formatting helpers — numbers always render in EN format
     (1,234.56), regardless of page language.
     ============================================================ */
  function formatUSD(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function formatPct(n) {
    var sign = n >= 0 ? "+" : "";
    return sign + n.toFixed(1) + "%";
  }

  /* ============================================================
     i18n helpers
     Each zone carries a stable `key` (language-agnostic identity)
     used to look up its display label and interpretation copy.
     Only `zone.color` drives CSS classes — never translated text.
     ============================================================ */
  function zoneLabel(zone) {
    return I18N.t("zones." + zone.key);
  }

  function metricInterpretation(metricKey, zone) {
    return I18N.t("metrics." + metricKey + ".interpretation." + zone.key);
  }

  /* ============================================================
     Zone logic — Realized Price
     ============================================================ */
  var RP_ZONES = [
    { key: "strongAccumulation", test: function (prem) { return prem < 0; },                     color: "green"   },
    { key: "accumulation",       test: function (prem) { return prem >= 0 && prem < 25; },        color: "blue"    },
    { key: "fairValue",          test: function (prem) { return prem >= 25 && prem < 75; },       color: "neutral" },
    { key: "caution",            test: function (prem) { return prem >= 75 && prem < 150; },      color: "amber"   },
    { key: "distribution",       test: function (prem) { return prem >= 150; },                   color: "red"     }
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
    { key: "strongAccumulation", test: function (z) { return z < 0.5; },                  color: "green"   },
    { key: "accumulation",       test: function (z) { return z >= 0.5 && z < 1.5; },       color: "blue"    },
    { key: "fairValue",          test: function (z) { return z >= 1.5 && z < 3.0; },       color: "neutral" },
    { key: "caution",            test: function (z) { return z >= 3.0 && z < 6.0; },       color: "amber"   },
    { key: "distribution",       test: function (z) { return z >= 6.0; },                  color: "red"     }
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
    { key: "strongAccumulation", test: function (v) { return v > 300000; },     color: "green"   },
    { key: "accumulation",       test: function (v) { return v > 50000; },      color: "blue"    },
    { key: "neutral",            test: function (v) { return v >= -50000; },    color: "neutral" },
    { key: "distribution",       test: function (v) { return v >= -300000; },   color: "amber"   },
    { key: "strongDistribution", test: function (v) { return v < -300000; },    color: "red"     }
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
    { key: "strongAccumulation", test: function(pct) { return pct > 1.0; },     color: "green"   },
    { key: "accumulation",       test: function(pct) { return pct > 0.2; },     color: "blue"    },
    { key: "neutral",            test: function(pct) { return pct >= -0.2; },   color: "neutral" },
    { key: "distribution",       test: function(pct) { return pct >= -1.0; },   color: "amber"   },
    { key: "strongDistribution", test: function(pct) { return pct < -1.0; },    color: "red"     }
  ];

  function getColdStorageZone(pct) {
    for (var i = 0; i < COLD_STORAGE_ZONES.length; i++) {
      if (COLD_STORAGE_ZONES[i].test(pct)) return COLD_STORAGE_ZONES[i];
    }
    return COLD_STORAGE_ZONES[2];
  }

  /* ============================================================
     Zone logic — Puell Multiple
     ============================================================ */
  var PUELL_ZONES = [
    { key: "capitulation", test: function(v) { return v < 0.5; },  color: "green"   },
    { key: "pressure",     test: function(v) { return v < 1.0; },  color: "blue"    },
    { key: "neutral",      test: function(v) { return v < 1.5; },  color: "neutral" },
    { key: "healthy",      test: function(v) { return v < 3.0; },  color: "amber"   },
    { key: "euphoria",     test: function(v) { return v >= 3.0; }, color: "red"     }
  ];

  function getPuellZone(value) {
    for (var i = 0; i < PUELL_ZONES.length; i++) {
      if (PUELL_ZONES[i].test(value)) return PUELL_ZONES[i];
    }
    return PUELL_ZONES[2];
  }

  /* ============================================================
     Zone logic — Whale Balance (>10k BTC, 30d change)
     ============================================================ */
  var WHALE_ZONES = [
    { key: "strongAccumulation", test: function(change) { return change > 5; },    color: "green"   },
    { key: "accumulation",       test: function(change) { return change > 0; },    color: "blue"    },
    { key: "neutral",            test: function(change) { return change === 0; },  color: "neutral" },
    { key: "distribution",       test: function(change) { return change >= -5; },  color: "amber"   },
    { key: "strongDistribution", test: function(change) { return change < -5; },   color: "red"     }
  ];

  function getWhaleZone(change) {
    for (var i = 0; i < WHALE_ZONES.length; i++) {
      if (WHALE_ZONES[i].test(change)) return WHALE_ZONES[i];
    }
    return WHALE_ZONES[2];
  }

  /* ============================================================
     Zone logic — SOPR (Spent Output Profit Ratio)
     ============================================================ */
  var SOPR_ZONES = [
    { key: "strongAccumulation", test: function(v) { return v < 0.85; }, color: "green"   },
    { key: "accumulation",       test: function(v) { return v < 1.0; },  color: "blue"    },
    { key: "neutral",            test: function(v) { return v < 1.1; },  color: "neutral" },
    { key: "distribution",       test: function(v) { return v < 1.3; },  color: "amber"   },
    { key: "strongDistribution", test: function(v) { return v >= 1.3; }, color: "red"     }
  ];

  function getSoprZone(value) {
    for (var i = 0; i < SOPR_ZONES.length; i++) {
      if (SOPR_ZONES[i].test(value)) return SOPR_ZONES[i];
    }
    return SOPR_ZONES[2];
  }

  /* ============================================================
     Zone logic — NUPL (Net Unrealized Profit/Loss)
     ============================================================ */
  var NUPL_ZONES = [
    { key: "capitulation",        test: function(v) { return v < 0; },     color: "green"   },
    { key: "accumulation",        test: function(v) { return v < 0.25; },  color: "blue"    },
    { key: "neutral",             test: function(v) { return v < 0.5; },   color: "neutral" },
    { key: "distribution",        test: function(v) { return v < 0.75; },  color: "amber"   },
    { key: "strongDistribution",  test: function(v) { return v >= 0.75; }, color: "red"     }
  ];

  function getNuplZone(value) {
    for (var i = 0; i < NUPL_ZONES.length; i++) {
      if (NUPL_ZONES[i].test(value)) return NUPL_ZONES[i];
    }
    return NUPL_ZONES[2];
  }

  /* ============================================================
     Cycle score — shared state, populated by each render function
     ============================================================ */
  var _cycleZones = {};
  var _cycleValues = {};

  // Stable zone key -> icon dot color. Mirrors the historical mapping
  // (e.g. "distribution" reads amber here even though the RP/MVRV
  // "Distribution" badge itself renders red via zone.color).
  var ZONE_TO_ICON_COLOR = {
    strongAccumulation: "green",
    capitulation:       "green",
    accumulation:       "blue",
    pressure:           "blue",
    fairValue:          "neutral",
    neutral:            "neutral",
    caution:            "amber",
    healthy:            "amber",
    distribution:       "amber",
    strongDistribution: "red",
    euphoria:           "red"
  };

  var METRIC_TITLE_KEYS = {
    realized:       "rp",
    mvrv:           "mvrv",
    lth:            "lth",
    "cold-storage": "coldStorage",
    puell:          "puell",
    whale:          "whale",
    sopr:           "sopr",
    nupl:           "nupl"
  };

  function updateScoreIcons(metricZoneKeyMap) {
    Object.keys(metricZoneKeyMap).forEach(function(metric) {
      var iconEl = document.querySelector('.score-icon[data-metric="' + metric + '"] .score-icon-dot');
      if (!iconEl) return;
      var color = ZONE_TO_ICON_COLOR[metricZoneKeyMap[metric]] || 'neutral';
      iconEl.className = 'score-icon-dot score-icon-dot--' + color;
    });
  }

  function attachIconTooltips(metricZoneKeyMap) {
    Object.keys(metricZoneKeyMap).forEach(function(metric) {
      var iconEl = document.querySelector('.score-icon[data-metric="' + metric + '"]');
      if (!iconEl) return;
      var metricName = I18N.t("metrics." + METRIC_TITLE_KEYS[metric] + ".title");
      var zoneText = I18N.t("zones." + metricZoneKeyMap[metric]);
      Tooltips.attach(iconEl, metricName + ': ' + zoneText);
    });
  }

  function tryUpdateCycleScore() {
    if (typeof updateCycleScore !== 'function') return;
    var z = _cycleZones;
    if (z.realized && z.mvrv && z.lth && z.coldStorage && z.puell && z.whale && z.sopr && z.nupl) {
      updateCycleScore(
        [z.realized, z.mvrv, z.lth, z.coldStorage, z.puell, z.whale, z.sopr, z.nupl],
        _cycleValues
      );
      var iconZoneKeyMap = {
        realized:       z.realized,
        mvrv:           z.mvrv,
        lth:            z.lth,
        'cold-storage': z.coldStorage,
        puell:          z.puell,
        whale:          z.whale,
        sopr:           z.sopr,
        nupl:           z.nupl
      };
      updateScoreIcons(iconZoneKeyMap);
      attachIconTooltips(iconZoneKeyMap);
    }
  }

  /* ============================================================
     Premium/Discount label builder
     ============================================================ */
  function premiumLabel(premiumPct) {
    var suffix = premiumPct >= 0
      ? I18N.t("units.aboveCostBasis")
      : I18N.t("units.belowCostBasis");
    return Math.abs(premiumPct).toFixed(1) + suffix;
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
      errEl.textContent = msg || I18N.t("errors.dataUnavailableRetry");
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
    var locale = I18N.getLang() === "pt" ? "pt-BR" : "en-US";

    var dateStr = "";
    if (date) {
      // Append T00:00:00Z to force UTC parsing — avoids timezone off-by-one
      var d = new Date(date + "T00:00:00Z");
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString(locale, {
          year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
        });
      }
    }
    if (!dateStr) {
      dateStr = new Date().toLocaleDateString(locale, {
        year: "numeric", month: "long", day: "numeric"
      });
    }

    setTextSafe("last-update", dateStr);
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
      badgeEl.textContent = zoneLabel(zone);
      badgeEl.className = "zone-badge zone-badge--" + zone.color;
    }

    setTextSafe("rp-interpretation", metricInterpretation("rp", zone));

    _cycleZones.realized = zone.key;
    _cycleValues.realizedZone = zone.key;
    _cycleValues.realizedPremium = premiumPct.toFixed(1);
    tryUpdateCycleScore();
  }

  /* ============================================================
     Render — MVRV Z-Score block
     ============================================================ */
  function renderMvrv(zScore) {
    setTextSafe("mvrv-value", zScore.toFixed(2));

    var zone = getMvrvZone(zScore);

    var badgeEl = document.getElementById("mvrv-zone-badge");
    if (badgeEl) {
      badgeEl.textContent = zoneLabel(zone);
      badgeEl.className = "zone-badge zone-badge--" + zone.color;
    }

    setTextSafe("mvrv-interpretation", metricInterpretation("mvrv", zone));

    _cycleZones.mvrv = zone.key;
    _cycleValues.mvrvZone = zone.key;
    _cycleValues.mvrvValue = zScore.toFixed(2);
    tryUpdateCycleScore();
  }

  /* ============================================================
     Render — LTH Net Position Change block
     ============================================================ */
  function renderLth(value) {
    var zone = getLthZone(value);
    var sign = value >= 0 ? "↑ +" : "↓ ";
    var formatted = sign + Math.round(value).toLocaleString("en-US") + " BTC";
    setTextSafe("lth-value", formatted);
    var lthEl = document.getElementById('lth-value');
    if (lthEl) lthEl.style.color = value >= 0 ? '#1a9e5c' : '#9e2a2a';

    var badge = document.getElementById("lth-zone-badge");
    if (badge) {
      badge.textContent = zoneLabel(zone);
      badge.className = "zone-badge zone-badge--" + zone.color;
    }

    setTextSafe("lth-interpretation", metricInterpretation("lth", zone));

    _cycleZones.lth = zone.key;
    _cycleValues.lthZone = zone.key;
    _cycleValues.lthValue = formatted;
    tryUpdateCycleScore();
  }

  /* ============================================================
     Render — Supply in Cold Storage block
     ============================================================ */
  function renderColdStorage(data) {
    var zone = getColdStorageZone(data.changePct);
    var sign = data.changePct >= 0 ? '↑ +' : '↓ ';
    setTextSafe('cold-storage-value', Math.round(data.current).toLocaleString('en-US') + ' BTC');
    setTextSafe('cold-storage-change', sign + data.changePct.toFixed(2) + '% ' + I18N.t("units.day30"));
    var changeEl = document.getElementById('cold-storage-change');
    if (changeEl) changeEl.className = 'metric-secondary ' + (data.changePct >= 0 ? 'direction-up' : 'direction-down');
    var badge = document.getElementById('cold-storage-zone-badge');
    if (badge) {
      badge.textContent = zoneLabel(zone);
      badge.className = 'zone-badge zone-badge--' + zone.color;
    }
    setTextSafe('cold-storage-interpretation', metricInterpretation("coldStorage", zone));

    _cycleZones.coldStorage = zone.key;
    _cycleValues.coldStorageZone = zone.key;
    _cycleValues.coldStorageChange = data.changePct.toFixed(2);
    tryUpdateCycleScore();
  }

  /* ============================================================
     Render — Puell Multiple block
     ============================================================ */
  function renderPuell(value) {
    var zone = getPuellZone(value);
    setTextSafe('puell-value', value.toFixed(2));
    var badge = document.getElementById('puell-zone-badge');
    if (badge) {
      badge.textContent = zoneLabel(zone);
      badge.className = 'zone-badge zone-badge--' + zone.color;
    }
    setTextSafe('puell-interpretation', metricInterpretation("puell", zone));

    _cycleZones.puell = zone.key;
    _cycleValues.puellZone = zone.key;
    _cycleValues.puellValue = value.toFixed(2);
    tryUpdateCycleScore();
  }

  /* ============================================================
     Render — Whale Balance block
     ============================================================ */
  function renderWhaleBalance(data) {
    var zone = getWhaleZone(data.change);
    var sign = data.change > 0 ? '↑ +' : (data.change < 0 ? '↓ ' : '');
    setTextSafe('whale-value', data.current.toLocaleString('en-US') + ' ' + I18N.t("units.addresses"));
    setTextSafe('whale-change', sign + data.change + ' ' + I18N.t("units.day30"));
    var whaleChangeEl = document.getElementById('whale-change');
    if (whaleChangeEl) whaleChangeEl.className = 'metric-secondary ' + (data.change > 0 ? 'direction-up' : data.change < 0 ? 'direction-down' : 'direction-flat');
    var badge = document.getElementById('whale-zone-badge');
    if (badge) {
      badge.textContent = zoneLabel(zone);
      badge.className = 'zone-badge zone-badge--' + zone.color;
    }
    setTextSafe('whale-interpretation', metricInterpretation("whale", zone));

    _cycleZones.whale = zone.key;
    _cycleValues.whaleZone = zone.key;
    _cycleValues.whaleChange = data.change;
    tryUpdateCycleScore();
  }

  /* ============================================================
     Render — SOPR block
     ============================================================ */
  function renderSopr(value) {
    var zone = getSoprZone(value);
    setTextSafe('sopr-value', value.toFixed(3));
    var badge = document.getElementById('sopr-zone-badge');
    if (badge) {
      badge.textContent = zoneLabel(zone);
      badge.className = 'zone-badge zone-badge--' + zone.color;
    }
    setTextSafe('sopr-interpretation', metricInterpretation("sopr", zone));

    _cycleZones.sopr = zone.key;
    _cycleValues.soprZone = zone.key;
    _cycleValues.soprValue = value.toFixed(3);
    tryUpdateCycleScore();
  }

  /* ============================================================
     Render — NUPL block
     ============================================================ */
  function renderNupl(value) {
    var zone = getNuplZone(value);
    setTextSafe('nupl-value', value.toFixed(3));
    var badge = document.getElementById('nupl-zone-badge');
    if (badge) {
      badge.textContent = zoneLabel(zone);
      badge.className = 'zone-badge zone-badge--' + zone.color;
    }
    setTextSafe('nupl-interpretation', metricInterpretation("nupl", zone));

    _cycleZones.nupl = zone.key;
    _cycleValues.nuplZone = zone.key;
    _cycleValues.nuplValue = value.toFixed(3);
    tryUpdateCycleScore();
  }

  /* ============================================================
     Tooltip content — builds zone-badge glossary arrays from I18N
     (name comes from the shared `zones` table, description from the
     metric-specific `tooltips.<metric>.zoneBadge` table).
     ============================================================ */
  var ZONE_ORDER_5 = ["strongAccumulation", "accumulation", "fairValue", "caution", "distribution"];
  var ZONE_ORDER_NEUTRAL = ["strongAccumulation", "accumulation", "neutral", "distribution", "strongDistribution"];
  var ZONE_ORDER_PUELL = ["capitulation", "pressure", "neutral", "healthy", "euphoria"];
  var ZONE_ORDER_NUPL = ["capitulation", "accumulation", "neutral", "distribution", "strongDistribution"];
  var ZONE_COLORS_5 = ["green", "blue", "neutral", "amber", "red"];

  function buildZoneGlossary(metricKey, order) {
    return order.map(function (key, i) {
      return {
        name: I18N.t("zones." + key),
        color: ZONE_COLORS_5[i],
        description: I18N.t("tooltips." + metricKey + ".zoneBadge." + key)
      };
    });
  }

  function attachAllTooltips(zScore) {
    // Title links — navigation + tooltip on hover
    var rpTitle = document.querySelector("#rp-label .metric-title-link");
    if (rpTitle) Tooltips.attach(rpTitle, I18N.t("tooltips.rp.title"));

    var mvrvTitle = document.querySelector("#mvrv-label .metric-title-link");
    if (mvrvTitle) Tooltips.attach(mvrvTitle, I18N.t("tooltips.mvrv.title"));

    // Realized Price data points
    var rpValueEl  = document.getElementById("rp-value");
    if (rpValueEl)  Tooltips.attach(rpValueEl,  I18N.t("tooltips.rp.value"));

    var btcPriceEl = document.getElementById("btc-price-display");
    if (btcPriceEl) Tooltips.attach(btcPriceEl, I18N.t("tooltips.rp.btcSpotPrice"));

    var rpPremEl   = document.getElementById("rp-premium");
    if (rpPremEl)   Tooltips.attach(rpPremEl,   I18N.t("tooltips.rp.premiumDiscount"));

    // MVRV Z-Score value — dynamic text based on live value
    var mvrvValueEl = document.getElementById("mvrv-value");
    if (mvrvValueEl) {
      var mvrvZone = getMvrvZone(zScore);
      var mvrvValueText = I18N.t("tooltips.mvrv.dynamicValue", {
        value: zScore.toFixed(2),
        zone: zoneLabel(mvrvZone)
      });
      Tooltips.attach(mvrvValueEl, mvrvValueText);
    }

    // Zone badges — per-metric glossaries
    var rpBadgeEl   = document.getElementById("rp-zone-badge");
    if (rpBadgeEl)   Tooltips.attach(rpBadgeEl,   buildZoneGlossary("rp", ZONE_ORDER_5));

    var mvrvBadgeEl = document.getElementById("mvrv-zone-badge");
    if (mvrvBadgeEl) Tooltips.attach(mvrvBadgeEl, buildZoneGlossary("mvrv", ZONE_ORDER_5));

    // LTH Net Position Change tooltips
    var lthTitle = document.querySelector("#lth-label .metric-title-link");
    if (lthTitle) Tooltips.attach(lthTitle, I18N.t("tooltips.lth.title"));

    var lthValueEl = document.getElementById("lth-value");
    if (lthValueEl) Tooltips.attach(lthValueEl, I18N.t("tooltips.lth.value"));

    var lthBadgeEl = document.getElementById("lth-zone-badge");
    if (lthBadgeEl) Tooltips.attach(lthBadgeEl, buildZoneGlossary("lth", ZONE_ORDER_NEUTRAL));

    // Cold Storage tooltips
    var coldStorageTitle = document.querySelector("#cold-storage-block .metric-title-link");
    if (coldStorageTitle) Tooltips.attach(coldStorageTitle, I18N.t("tooltips.coldStorage.title"));

    var coldStorageValueEl = document.getElementById("cold-storage-value");
    if (coldStorageValueEl) Tooltips.attach(coldStorageValueEl, I18N.t("tooltips.coldStorage.value"));

    var coldStorageChangeEl = document.getElementById("cold-storage-change");
    if (coldStorageChangeEl) Tooltips.attach(coldStorageChangeEl, I18N.t("tooltips.coldStorage.change"));

    var coldStorageBadgeEl = document.getElementById("cold-storage-zone-badge");
    if (coldStorageBadgeEl) Tooltips.attach(coldStorageBadgeEl, buildZoneGlossary("coldStorage", ZONE_ORDER_NEUTRAL));

    // Puell Multiple tooltips
    var puellTitle = document.querySelector("#puell-label .metric-title-link");
    if (puellTitle) Tooltips.attach(puellTitle, I18N.t("tooltips.puell.title"));

    var puellValueEl = document.getElementById("puell-value");
    if (puellValueEl) Tooltips.attach(puellValueEl, I18N.t("tooltips.puell.value"));

    var puellBadgeEl = document.getElementById("puell-zone-badge");
    if (puellBadgeEl) Tooltips.attach(puellBadgeEl, buildZoneGlossary("puell", ZONE_ORDER_PUELL));

    // Whale Balance tooltips
    var whaleTitle = document.querySelector("#whale-label .metric-title-link");
    if (whaleTitle) Tooltips.attach(whaleTitle, I18N.t("tooltips.whale.title"));

    var whaleValueEl = document.getElementById("whale-value");
    if (whaleValueEl) Tooltips.attach(whaleValueEl, I18N.t("tooltips.whale.value"));

    var whaleChangeEl = document.getElementById("whale-change");
    if (whaleChangeEl) Tooltips.attach(whaleChangeEl, I18N.t("tooltips.whale.change"));

    var whaleBadgeEl = document.getElementById("whale-zone-badge");
    if (whaleBadgeEl) Tooltips.attach(whaleBadgeEl, buildZoneGlossary("whale", ZONE_ORDER_NEUTRAL));

    // SOPR tooltips
    var soprTitle = document.querySelector("#sopr-label .metric-title-link");
    if (soprTitle) Tooltips.attach(soprTitle, I18N.t("tooltips.sopr.title"));

    var soprValueEl = document.getElementById("sopr-value");
    if (soprValueEl) Tooltips.attach(soprValueEl, I18N.t("tooltips.sopr.value"));

    var soprBadgeEl = document.getElementById("sopr-zone-badge");
    if (soprBadgeEl) Tooltips.attach(soprBadgeEl, buildZoneGlossary("sopr", ZONE_ORDER_NEUTRAL));

    // NUPL tooltips
    var nuplTitle = document.querySelector("#nupl-label .metric-title-link");
    if (nuplTitle) Tooltips.attach(nuplTitle, I18N.t("tooltips.nupl.title"));

    var nuplValueEl = document.getElementById("nupl-value");
    if (nuplValueEl) Tooltips.attach(nuplValueEl, I18N.t("tooltips.nupl.value"));

    var nuplBadgeEl = document.getElementById("nupl-zone-badge");
    if (nuplBadgeEl) Tooltips.attach(nuplBadgeEl, buildZoneGlossary("nupl", ZONE_ORDER_NUPL));
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
  var RP_PATH   = DATA_BASE + "realized-price.json";
  var MVRV_PATH = DATA_BASE + "mvrv-zscore.json";
  var BTC_PATH  = DATA_BASE + "btc-price.json";

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
      showError();
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
        showError();
        return;
      }

      renderRealizedPrice(rpValue, btcPrice);
      renderMvrv(zScore);
      renderFreshness(extractDate(rpRaw), extractDate(mvrvRaw));

      // Attach tooltips after data has rendered
      attachAllTooltips(zScore);
    });

  }).catch(function (err) {
    console.error("[btc-cycle] failed to load metrics:", err);
    showError();
  });

  // LTH and exchange fetches are independent — failures don't affect existing metrics
  fetch(DATA_BASE + "lth-position-change.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var value = extractLthValue(data);
      if (value !== null) renderLth(value);
    })
    .catch(function () { setTextSafe("lth-value", I18N.t("errors.dataUnavailable")); });

  fetch(DATA_BASE + 'illiquid-supply.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var result = extractColdStorage(data);
      if (result) renderColdStorage(result);
      else setTextSafe('cold-storage-value', I18N.t("errors.dataUnavailable"));
    })
    .catch(function() { setTextSafe('cold-storage-value', I18N.t("errors.dataUnavailable")); });

  fetch(DATA_BASE + 'puell-multiple.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var value = extractPuell(data);
      if (value !== null) renderPuell(value);
      else setTextSafe('puell-value', I18N.t("errors.dataUnavailable"));
    })
    .catch(function() { setTextSafe('puell-value', I18N.t("errors.dataUnavailable")); });

  fetch(DATA_BASE + 'whale-balance.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var result = extractWhaleBalance(data);
      if (result) renderWhaleBalance(result);
      else setTextSafe('whale-value', I18N.t("errors.dataUnavailable"));
    })
    .catch(function() { setTextSafe('whale-value', I18N.t("errors.dataUnavailable")); });

  fetch(DATA_BASE + 'sopr.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var value = extractSopr(data);
      if (value !== null) renderSopr(value);
      else setTextSafe('sopr-value', I18N.t("errors.dataUnavailable"));
    })
    .catch(function() { setTextSafe('sopr-value', I18N.t("errors.dataUnavailable")); });

  fetch(DATA_BASE + 'nupl.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var value = extractNupl(data);
      if (value !== null) renderNupl(value);
      else setTextSafe('nupl-value', I18N.t("errors.dataUnavailable"));
    })
    .catch(function() { setTextSafe('nupl-value', I18N.t("errors.dataUnavailable")); });

})();
