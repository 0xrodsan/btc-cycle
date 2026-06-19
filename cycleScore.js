// cycleScore.js
// Computes an aggregate cycle score from all active metric zones.

var ZONE_SCORES = {
  // Strongly bullish
  "Strong Accumulation": 5,
  "Capitulation":       5,
  // Bullish
  "Accumulation":       4,
  "Pressure":           4,
  "Strong Outflow":     4,
  "Outflow":            4,
  // Neutral
  "Fair Value":         3,
  "Neutral":            3,
  // Bearish
  "Caution":            2,
  "Healthy":            2,
  "Inflow":             2,
  "Distribution":       2,
  // Strongly bearish
  "Strong Distribution": 1,
  "Euphoria":           1,
  "Strong Inflow":      1
};

var SCORE_LABELS = [
  { min: 4.0, label: "Strong Accumulation", color: "green"   },
  { min: 3.3, label: "Accumulation",        color: "blue"    },
  { min: 2.7, label: "Fair Value",          color: "neutral" },
  { min: 1.7, label: "Caution",             color: "amber"   },
  { min: 0.0, label: "Distribution",        color: "red"     }
];

function computeCycleScore(zoneLabels) {
  // zoneLabels: array of zone label strings from each active metric
  var total = 0;
  var count = 0;
  zoneLabels.forEach(function(label) {
    if (ZONE_SCORES[label] !== undefined) {
      total += ZONE_SCORES[label];
      count++;
    }
  });
  if (count === 0) return null;
  var avg = total / count;
  for (var i = 0; i < SCORE_LABELS.length; i++) {
    if (avg >= SCORE_LABELS[i].min) {
      return {
        avg: avg,
        label: SCORE_LABELS[i].label,
        color: SCORE_LABELS[i].color,
        count: count,
        favorable: zoneLabels.filter(function(z) {
          return ZONE_SCORES[z] >= 4;
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
    badge.textContent = score.label;
    badge.className = 'zone-badge zone-badge--' + score.color;
  }

  // Signal count
  var count = document.getElementById('cycle-score-count');
  if (count) {
    count.textContent = score.favorable + ' of ' + score.count + ' signals favorable';
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

// Store current zone labels for AI analysis access
var _currentZoneLabels = [];
var _currentMetricValues = {};

function updateCycleScore(zoneLabels, metricValues) {
  _currentZoneLabels = zoneLabels;
  _currentMetricValues = metricValues;
  var score = computeCycleScore(zoneLabels);
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
