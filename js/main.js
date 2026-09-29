/* Adrian Piwin — portfolio interactions */
(function () {
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll ---------- */
  document.querySelectorAll(".reveal-group").forEach((group) => {
    group.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--d", i * 0.08 + "s"));
  });
  document.querySelectorAll(".hero .reveal").forEach((el, i) => {
    if (!el.closest(".reveal-group")) el.style.setProperty("--d", 0.25 + i * 0.1 + "s");
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  let pending = [...document.querySelectorAll(".reveal")];
  pending.forEach((el) => revealObserver.observe(el));
  // Fallback for fast scrolls/anchor jumps: reveal anything already above the fold line
  const sweepReveals = () => {
    if (!pending.length) return;
    const line = window.innerHeight * 0.95;
    pending = pending.filter((el) => {
      if (el.classList.contains("is-in")) return false;
      if (el.getBoundingClientRect().top < line) {
        el.classList.add("is-in");
        revealObserver.unobserve(el);
        return false;
      }
      return true;
    });
  };

  /* ---------- Typed words ---------- */
  const typed = document.querySelector(".typed");
  if (typed && !reduceMotion) {
    const words = typed.dataset.words.split("|");
    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;

    const tick = () => {
      const word = words[wordIndex];
      if (deleting) {
        charIndex--;
        typed.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          return setTimeout(tick, 320);
        }
        return setTimeout(tick, 45);
      }
      const next = words[wordIndex];
      charIndex++;
      typed.textContent = next.slice(0, charIndex);
      if (charIndex === next.length) {
        deleting = true;
        return setTimeout(tick, 2200);
      }
      setTimeout(tick, 85);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- Pixel sprites: step through frames while on screen ---------- */
  document.querySelectorAll(".sprite[data-sheet]").forEach((el) => {
    const frames = +el.dataset.frames || 1;
    const seq = (el.dataset.seq || "0").split(",").map(Number);
    const ms = +el.dataset.ms || 250;
    el.style.backgroundImage = `url("${el.dataset.sheet}")`;
    el.style.setProperty("--frames", frames);
    const show = (f) => { el.style.backgroundPosition = `${frames > 1 ? (f / (frames - 1)) * 100 : 0}% 0`; };
    show(seq[0]);
    if (reduceMotion || seq.length < 2) return;

    let i = 0;
    let timer = null;
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !timer) {
        timer = setInterval(() => show(seq[(i = (i + 1) % seq.length)]), ms);
      } else if (!entry.isIntersecting && timer) {
        clearInterval(timer);
        timer = null;
      }
    }).observe(el);
  });

  /* ---------- Nav: scrolled / hide on scroll down / active link ---------- */
  const nav = document.getElementById("nav");
  const menuBtn = nav.querySelector(".menu-btn");
  const progress = document.querySelector(".progress");
  let lastY = window.scrollY;

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".mobile-menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 12);
    if (!nav.classList.contains("is-open")) {
      nav.classList.toggle("is-hidden", y > lastY && y > 400);
    }
    lastY = y;
    sweepReveals();

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (!reduceMotion) {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const offset = ((r.top + r.height / 2 - vh / 2) / vh) * -36;
        el.querySelectorAll(".phone--c").forEach((p) => p.style.setProperty("--py", offset.toFixed(1) + "px"));
        el.querySelectorAll(".phone--l, .phone--r").forEach((p) => p.style.setProperty("--py", (offset * 1.6).toFixed(1) + "px"));
        if (el.classList.contains("terminal")) el.style.setProperty("--py", offset.toFixed(1) + "px");
      });
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["work", "about", "contact"].forEach((id) => sectionObserver.observe(document.getElementById(id)));

  /* ---------- Spotlight on feature cards ---------- */
  if (finePointer) {
    document.querySelectorAll(".feature").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ---------- Candlestick chart (illustrative, seeded) ---------- */
  const chart = document.querySelector(".chart");
  if (chart) {
    const NS = "http://www.w3.org/2000/svg";
    const W = 400, H = 220, N = 34, pad = 14;
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    const candles = [];
    let price = 100;
    for (let i = 0; i < N; i++) {
      const drift = i < 14 ? -0.35 : i < 20 ? 0.05 : 0.55;
      const open = price;
      const close = open + drift + (rand() - 0.5) * 3.2;
      const high = Math.max(open, close) + rand() * 1.6;
      const low = Math.min(open, close) - rand() * 1.6;
      candles.push({ open, close, high, low });
      price = close;
    }
    const lo = Math.min(...candles.map((c) => c.low));
    const hi = Math.max(...candles.map((c) => c.high));
    const yOf = (v) => pad + (1 - (v - lo) / (hi - lo)) * (H - pad * 2);
    const step = (W - pad * 2) / N;
    const el = (tag, attrs) => {
      const node = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
      return node;
    };

    for (let g = 1; g < 5; g++) chart.appendChild(el("line", { class: "grid-line", x1: 0, x2: W, y1: (H / 5) * g, y2: (H / 5) * g }));

    // Demand zone around the swing low
    const lowIdx = candles.reduce((m, c, i) => (c.low < candles[m].low ? i : m), 0);
    const zoneTop = yOf(candles[lowIdx].low + 2.2);
    const zoneX = pad + step * (lowIdx - 1);
    chart.appendChild(el("rect", { class: "zone", x: zoneX, y: zoneTop, width: W - zoneX - pad, height: yOf(candles[lowIdx].low) - zoneTop + 2, rx: 3 }));
    const label = el("text", { class: "zone-label", x: W - pad - 4, y: zoneTop - 6, "text-anchor": "end" });
    label.textContent = "RETEST ZONE";
    chart.appendChild(label);

    const candleGroup = el("g", {});
    candles.forEach((c, i) => {
      const x = pad + step * i + step / 2;
      const up = c.close >= c.open;
      const g = el("g", { class: "candle " + (up ? "up" : "down") });
      g.appendChild(el("line", { class: "wick", x1: x, x2: x, y1: yOf(c.high), y2: yOf(c.low) }));
      const top = yOf(Math.max(c.open, c.close));
      g.appendChild(el("rect", { x: x - step * 0.3, y: top, width: step * 0.6, height: Math.max(1.5, yOf(Math.min(c.open, c.close)) - top), rx: 1 }));
      candleGroup.appendChild(g);
    });
    chart.appendChild(candleGroup);

    // Moving average line
    const ma = candles.map((_, i) => {
      const slice = candles.slice(Math.max(0, i - 5), i + 1);
      return slice.reduce((s, c) => s + c.close, 0) / slice.length;
    });
    const d = ma.map((v, i) => `${i ? "L" : "M"}${(pad + step * i + step / 2).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");
    const path = el("path", { class: "ma", d });
    chart.appendChild(path);

    const animate = () => {
      if (reduceMotion || !candleGroup.animate) return;
      [...candleGroup.children].forEach((g, i) => {
        g.animate(
          [{ opacity: 0, transform: "scaleY(0.2)" }, { opacity: 1, transform: "scaleY(1)" }],
          { duration: 500, delay: i * 45, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }
        );
      });
      const len = path.getTotalLength();
      path.animate(
        [{ strokeDasharray: len, strokeDashoffset: len }, { strokeDasharray: len, strokeDashoffset: 0 }],
        { duration: 1800, delay: 300, easing: "ease-out", fill: "backwards" }
      );
    };
    const chartObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animate();
        chartObserver.disconnect();
      }
    }, { threshold: 0.4 });
    chartObserver.observe(chart);
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.querySelector(".copy-label");
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = "Copied ✓";
        btn.classList.add("is-copied");
      } catch {
        window.location.href = "mailto:" + btn.dataset.copy;
        return;
      }
      setTimeout(() => {
        label.textContent = "Copy email";
        btn.classList.remove("is-copied");
      }, 2000);
    });
  });
})();
