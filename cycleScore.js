// cycleScore.js
// Computes an aggregate cycle score from all active metric zones.
// Zones are identified by their stable, language-agnostic key (see
// main.js) — display text is looked up from I18N at render time.

var ZONE_SCORES = {
  // Strongly bullish
  strongAccumulation: 5,
  capitulation:        5,
  // Bullish
  accumulation:        4,
  pressure:             4,
  strongOutflow:        4,
  outflow:              4,
  // Neutral
  fairValue:            3,
  neutral:              3,
  // Bearish
  caution:              2,
  healthy:              2,
  inflow:               2,
  distribution:         2,
  // Strongly bearish
  strongDistribution:   1,
  euphoria:             1,
  strongInflow:         1
};

var SCORE_LABELS = [
  { min: 4.0, key: "strongAccumulation", color: "green"   },
  { min: 3.3, key: "accumulation",       color: "blue"    },
  { min: 2.7, key: "fairValue",          color: "neutral" },
  { min: 1.7, key: "caution",            color: "amber"   },
  { min: 0.0, key: "distribution",       color: "red"     }
];

function computeCycleScore(zoneKeys) {
  // zoneKeys: array of stable zone key strings from each active metric
  var total = 0;
  var count = 0;
  zoneKeys.forEach(function(key) {
    if (ZONE_SCORES[key] !== undefined) {
      total += ZONE_SCORES[key];
      count++;
    }
  });
  if (count === 0) return null;
  var avg = total / count;
  for (var i = 0; i < SCORE_LABELS.length; i++) {
    if (avg >= SCORE_LABELS[i].min) {
      return {
        avg: avg,
        key: SCORE_LABELS[i].key,
        color: SCORE_LABELS[i].color,
        count: count,
        favorable: zoneKeys.filter(function(k) {
          return ZONE_SCORES[k] >= 4;
        }).length
      };
    }
  }
  return null;
}

function renderCycleScore(score) {
  if (!score) return;

  var container = document.getElementById('cycle-score-container');
  if (!container) return;

  // Badge
  var badge = document.getElementById('cycle-score-badge');
  if (badge) {
    badge.textContent = I18N.t('zones.' + score.key);
    badge.className = 'zone-badge zone-badge--' + score.color;
  }

  // Signal count
  var count = document.getElementById('cycle-score-count');
  if (count) {
    count.textContent = I18N.t('cycleScore.signalsFavorable', {
      favorable: score.favorable,
      count: score.count
    });
  }

  // Progress bar — 5 segments
  var bar = document.getElementById('cycle-score-bar');
  if (bar) {
    var filled = Math.round((score.avg - 1) / 4 * 5);
    filled = Math.max(1, Math.min(5, filled));
    var segments = bar.querySelectorAll('.score-segment');
    segments.forEach(function(seg, i) {
      seg.className = 'score-segment ' + (i < filled ? 'score-segment--' + score.color : 'score-segment--empty');
    });
  }
}

// Store current zone keys for AI analysis access
var _currentZoneLabels = [];
var _currentMetricValues = {};

function updateCycleScore(zoneKeys, metricValues) {
  _currentZoneLabels = zoneKeys;
  _currentMetricValues = metricValues;
  var score = computeCycleScore(zoneKeys);
  renderCycleScore(score);
  return score;
}

function getCurrentCycleData() {
  return {
    zoneLabels: _currentZoneLabels,
    metricValues: _currentMetricValues,
    score: computeCycleScore(_currentZoneLabels)
  };
}
