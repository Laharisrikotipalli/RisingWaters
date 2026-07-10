document.addEventListener("DOMContentLoaded", function () {
  console.log("Flood Prediction System Loaded Successfully");

  initTheme();
  initRain();
  initLightning();
  initGauge();
});

/* =========================================================
   Light / dark theme toggle
   ========================================================= */
function initTheme() {
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var stored = localStorage.getItem("flood-theme");
  var preferred = stored || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  applyTheme(preferred);

  if (!toggle) return;

  toggle.addEventListener("click", function () {
    var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    var next = current === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem("flood-theme", next);
  });

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var icon = toggle ? toggle.querySelector(".theme-toggle-icon") : null;
    if (icon) icon.textContent = theme === "light" ? "☀️" : "🌙";
  }
}

/* =========================================================
   Ambient rain canvas
   Intensity can be tuned per-page via body[data-rain="heavy|normal|light"]
   ========================================================= */
function initRain() {
  var canvas = document.getElementById("rain-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var intensity = document.body.getAttribute("data-rain") || "normal";
  var countMap = { light: 60, normal: 120, heavy: 220 };
  var speedMap = { light: 4, normal: 7, heavy: 11 };
  var dropCount = countMap[intensity] || 120;
  var baseSpeed = speedMap[intensity] || 7;

  var width, height, drops;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function makeDrop() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      len: 10 + Math.random() * 18,
      speed: baseSpeed + Math.random() * 6,
      drift: 1.2 + Math.random() * 0.8,
      opacity: 0.12 + Math.random() * 0.25
    };
  }

  function init() {
    resize();
    drops = [];
    for (var i = 0; i < dropCount; i++) drops.push(makeDrop());
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(180, 210, 230, 1)";
    ctx.lineCap = "round";

    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      ctx.globalAlpha = d.opacity;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.drift * 2, d.y + d.len);
      ctx.stroke();

      d.x -= d.drift;
      d.y += d.speed;

      if (d.y > height || d.x < 0) {
        d.x = Math.random() * width;
        d.y = -20;
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  init();
  requestAnimationFrame(tick);
}

/* =========================================================
   Occasional lightning flash
   ========================================================= */
function initLightning() {
  var flash = document.querySelector(".lightning-flash");
  if (!flash) return;

  var enabled = document.body.getAttribute("data-lightning") !== "off";
  if (!enabled) return;

  function scheduleFlash() {
    var delay = 6000 + Math.random() * 10000;
    setTimeout(function () {
      flash.classList.add("flash");
      setTimeout(function () {
        flash.classList.remove("flash");
        scheduleFlash();
      }, 600);
    }, delay);
  }
  scheduleFlash();
}

/* =========================================================
   Risk gauge — animates needle + arc fill on result pages
   Reads data-risk="high|low" and data-value="0-100" from the gauge element
   ========================================================= */
function initGauge() {
  var gauge = document.querySelector("[data-gauge]");
  if (!gauge) return;

  var value = parseFloat(gauge.getAttribute("data-value")) || 0;
  var risk = gauge.getAttribute("data-risk") || "low";
  var fill = gauge.querySelector(".gauge-fill");
  var needle = gauge.querySelector(".gauge-needle");

  var color = risk === "high" ? "#F5A623" : "#34D399";
  var offset = 251.2 - (251.2 * value) / 100;
  var angle = -90 + (value / 100) * 180;

  requestAnimationFrame(function () {
    setTimeout(function () {
      if (fill) {
        fill.style.stroke = color;
        fill.style.strokeDashoffset = offset;
      }
      if (needle) {
        needle.style.transform = "rotate(" + angle + "deg)";
      }
    }, 150);
  });
}