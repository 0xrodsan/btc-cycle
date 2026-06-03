// aiAnalysis.js
// Calls Anthropic API with current metric values and renders a plain-language analysis.

function buildAnalysisPrompt(data) {
  var score = data.score;
  var values = data.metricValues;

  return [
    "You are a Bitcoin on-chain analyst writing for a mixed audience of technical and non-technical long-term investors.",
    "",
    "Write a single cohesive paragraph (4-6 sentences) analyzing the current Bitcoin market cycle based on the following on-chain metrics:",
    "",
    "- Realized Price: BTC is " + (values.realizedPremium || "—") + "% above the average holder cost basis → Zone: " + (values.realizedZone || "—"),
    "- MVRV Z-Score: " + (values.mvrvValue || "—") + " → Zone: " + (values.mvrvZone || "—"),
    "- LTH Net Position Change (30d): " + (values.lthValue || "—") + " BTC → Zone: " + (values.lthZone || "—"),
    "- Supply in Cold Storage (30d change): " + (values.coldStorageChange || "—") + "% → Zone: " + (values.coldStorageZone || "—"),
    "- Puell Multiple: " + (values.puellValue || "—") + " → Zone: " + (values.puellZone || "—"),
    "- Whale Balance (>10k BTC, 1d change): " + (values.whaleChange || "—") + " → Zone: " + (values.whaleZone || "—"),
    "",
    "Aggregate cycle reading: " + (score ? score.label + " (" + score.favorable + " of " + score.count + " signals favorable)" : "—"),
    "",
    "Guidelines:",
    "- Start with the aggregate reading, then explain what the signals collectively mean",
    "- Mention 2-3 specific metrics with their values",
    "- Use plain language first, add technical context in parentheses where useful",
    "- Be honest about uncertainty — on-chain data is descriptive, not predictive",
    "- Do not give specific price targets",
    "- End with what this configuration has historically implied for patient long-term investors",
    "- Maximum 120 words"
  ].join("\n");
}

async function generateAnalysis() {
  var btn = document.getElementById('ai-analysis-btn');
  var output = document.getElementById('ai-analysis-output');
  if (!btn || !output) return;

  // Analysis is pre-generated daily by GitHub Action
  // Just show/hide the static text
  if (output.classList.contains('visible')) {
    output.classList.remove('visible');
    btn.textContent = 'Show cycle analysis';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Loading...';

  try {
    var response = await fetch('data/analysis.json', { cache: 'no-store' });
    var data = await response.json();
    output.textContent = data.analysis || 'Analysis unavailable.';
    output.classList.add('visible');
    btn.textContent = 'Hide analysis';
  } catch (err) {
    output.textContent = 'Analysis unavailable.';
    output.classList.add('visible');
    btn.textContent = 'Hide analysis';
  } finally {
    btn.disabled = false;
  }
}
