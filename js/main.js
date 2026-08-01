/* =============================================================
   Whitepace — interactions
   ============================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Header shadow on scroll ---- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
    menu.classList.toggle("open", !open);
  });
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      menu.classList.remove("open");
    })
  );

  /* ---- Pricing toggle (monthly / yearly) ---- */
  const toggleBtns = document.querySelectorAll(".toggle button");
  const priceEls = document.querySelectorAll("[data-price]");
  toggleBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      toggleBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      const period = btn.dataset.period; // "monthly" | "yearly"
      priceEls.forEach((el) => {
        const target = Number(el.dataset[period]);
        animateNumber(el, Number(el.textContent) || 0, target);
      });
    })
  );

  function animateNumber(el, from, to) {
    if (prefersReduced || from === to) { el.textContent = to; return; }
    const start = performance.now(), dur = 450;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---- Testimonial carousel ---- */
  const testimonials = [
    { quote: "Whitepace replaced three tools for us. Our team finally has one place to plan, track and ship — and we've cut status meetings in half.", name: "Gladys Gonzalez", role: "Head of Product, Northwind", initials: "GG" },
    { quote: "Onboarding a new project used to take a week of setup. With Whitepace templates we're running in an afternoon, and everyone stays aligned.", name: "Marcus Bell", role: "Engineering Lead, Flinkerk", initials: "MB" },
    { quote: "The board view gives leadership a real-time picture without a single spreadsheet. It's the most honest dashboard we've ever had.", name: "Priya Nair", role: "COO, Source DS", initials: "PN" },
  ];
  let ti = 0;
  const q = document.getElementById("testiQuote");
  const nm = document.getElementById("testiName");
  const rl = document.getElementById("testiRole");
  const ini = document.getElementById("testiInitials");
  const fig = q ? q.closest(".testi-quote") : null;

  function renderTestimonial(dir) {
    const t = testimonials[ti];
    const apply = () => {
      q.textContent = t.quote; nm.textContent = t.name; rl.textContent = t.role; ini.textContent = t.initials;
    };
    if (prefersReduced || !window.gsap) { apply(); return; }
    gsap.to(fig, { opacity: 0, x: dir * -20, duration: 0.2, onComplete: () => {
      apply();
      gsap.fromTo(fig, { opacity: 0, x: dir * 20 }, { opacity: 1, x: 0, duration: 0.35 });
    }});
  }
  document.getElementById("testiNext")?.addEventListener("click", () => { ti = (ti + 1) % testimonials.length; renderTestimonial(1); });
  document.getElementById("testiPrev")?.addEventListener("click", () => { ti = (ti - 1 + testimonials.length) % testimonials.length; renderTestimonial(-1); });

  /* ---- Newsletter (client-side only) ---- */
  const form = document.getElementById("newsForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("newsEmail");
    const msg = document.getElementById("newsMsg");
    if (email.checkValidity()) {
      msg.textContent = "Thanks! Check your inbox to confirm. ✳︎";
      form.reset();
    } else {
      msg.textContent = "Please enter a valid email address.";
      email.focus();
    }
  });

  /* ---- GSAP reveal animations ---- */
  if (window.gsap && window.ScrollTrigger && !prefersReduced) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero: reveal immediately on load
    gsap.to(".hero [data-reveal]", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.1 });

    // Scroll-triggered single reveals
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      if (el.closest(".hero")) return;
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    // Staggered groups
    gsap.utils.toArray("[data-stagger]").forEach((group) => {
      gsap.to(group.children, {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: group, start: "top 82%" },
      });
    });
  } else {
    // No GSAP or reduced motion → show everything
    document.querySelectorAll("[data-reveal], [data-stagger] > *").forEach((el) => {
      el.style.opacity = 1; el.style.transform = "none";
    });
  }
})();
