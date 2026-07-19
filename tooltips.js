// tooltips.js
// Tooltip UI mechanism only — positioning, show/hide, hover/focus/tap wiring.
// No hardcoded text lives here; all copy comes from I18N (see i18n.js) and
// is passed in by callers (see main.js). Content is rendered via
// createElement + textContent, never innerHTML, since the dictionary is
// developer-authored and never receives external/user input.

var Tooltips = (function () {
  "use strict";

  var tooltipEl = document.createElement("div");
  tooltipEl.className = "tooltip-box";
  tooltipEl.setAttribute("role", "tooltip");
  document.body.appendChild(tooltipEl);

  var currentTrigger = null;

  function renderContent(content) {
    tooltipEl.innerHTML = "";
    if (typeof content === "string") {
      var p = document.createElement("p");
      p.textContent = content;
      tooltipEl.appendChild(p);
    } else if (Array.isArray(content)) {
      content.forEach(function (zone) {
        var row = document.createElement("div");
        row.className = "tooltip-zone-row";

        var dot = document.createElement("span");
        dot.className = "tooltip-zone-dot zone-dot-" + zone.color;

        var textWrap = document.createElement("div");
        var strong = document.createElement("strong");
        strong.textContent = zone.name;
        var desc = document.createElement("p");
        desc.textContent = zone.description;
        textWrap.appendChild(strong);
        textWrap.appendChild(desc);

        row.appendChild(dot);
        row.appendChild(textWrap);
        tooltipEl.appendChild(row);
      });
    }
  }

  function position(triggerEl) {
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

  function show(triggerEl, content) {
    if (currentTrigger === triggerEl) return;
    currentTrigger = triggerEl;
    renderContent(content);
    position(triggerEl);
    tooltipEl.classList.add("visible");
  }

  function hide() {
    currentTrigger = null;
    tooltipEl.classList.remove("visible");
  }

  function attach(triggerEl, content) {
    triggerEl.classList.add("tooltip-trigger");
    triggerEl.setAttribute("tabindex", "0");

    triggerEl.addEventListener("mouseenter", function () { show(triggerEl, content); });
    triggerEl.addEventListener("mouseleave", hide);
    triggerEl.addEventListener("focus",      function () { show(triggerEl, content); });
    triggerEl.addEventListener("blur",       hide);

    // Mobile tap toggle
    triggerEl.addEventListener("click", function (e) {
      e.stopPropagation();
      if (currentTrigger === triggerEl) { hide(); }
      else                              { show(triggerEl, content); }
    });
  }

  // Close on outside click, scroll, or resize
  document.addEventListener("click",  hide);
  document.addEventListener("scroll", hide, { passive: true });
  window.addEventListener("resize",   hide);

  return { attach: attach };
})();
