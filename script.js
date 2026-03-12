/* ============================================================
   GV Web Solutions – script.js
   Author: Gaurav Verma | GV Web Solutions
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     PRELOADER
     ============================================================ */
  window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      setTimeout(function () {
        preloader.classList.add("hide");
      }, 1800);
    }
  });

  /* ============================================================
     AOS INIT
     ============================================================ */
  AOS.init({
    duration: 750,
    easing: "ease-out-cubic",
    once: true,
    offset: 60,
  });

  /* ============================================================
     SWIPER TESTIMONIALS
     ============================================================ */
  new Swiper(".testimonial-swiper", {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
    pagination: { el: ".swiper-pagination", clickable: true, dynamicBullets: true },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    a11y: {
      prevSlideMessage: "Previous testimonial",
      nextSlideMessage: "Next testimonial",
    },
    breakpoints: {
      640: { slidesPerView: 1, spaceBetween: 20 },
      900: { slidesPerView: 2, spaceBetween: 24 },
      1200: { slidesPerView: 3, spaceBetween: 24 },
    },
  });

  /* ============================================================
     NAVBAR: SCROLL EFFECT + ACTIVE LINK
     ============================================================ */
  const navbar = document.getElementById("mainNav");

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(function (section) {
      if (
        scrollPos >= section.offsetTop &&
        scrollPos < section.offsetTop + section.offsetHeight
      ) {
        navLinks.forEach(function (link) {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#" + section.id) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", function () {
    updateNavbar();
    updateActiveLink();
    updateScrollTopBtn();
  });

  updateNavbar();

  /* ============================================================
     SMOOTH SCROLL + CLOSE MOBILE MENU
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: "smooth" });

        // Close mobile menu
        const navCollapse = document.getElementById("navbarNav");
        if (navCollapse && navCollapse.classList.contains("show")) {
          const bsCollapse = new bootstrap.Collapse(navCollapse, { toggle: false });
          bsCollapse.hide();
        }
      }
    });
  });

  /* ============================================================
     DARK / LIGHT MODE TOGGLE
     ============================================================ */
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeToggleMobile = document.getElementById("themeToggleMobile");
  const themeIcon = document.getElementById("themeIcon");
  const themeIconMobile = document.getElementById("themeIconMobile");

  // Load saved theme
  const savedTheme = localStorage.getItem("gv-theme") || "dark";
  html.setAttribute("data-theme", savedTheme);
  updateThemeIcons(savedTheme);

  function updateThemeIcons(theme) {
    const icon = theme === "dark" ? "fa-moon" : "fa-sun";
    if (themeIcon) themeIcon.className = "fa-solid " + icon;
    if (themeIconMobile) themeIconMobile.className = "fa-solid " + icon;
  }

  function toggleTheme() {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("gv-theme", next);
    updateThemeIcons(next);
  }

  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener("click", toggleTheme);

  /* ============================================================
     COLOR THEME SWITCHER
     ============================================================ */
  const colorSwitcherBtn = document.getElementById("colorSwitcherBtn");
  const colorOptions = document.getElementById("colorOptions");
  const colorDots = document.querySelectorAll(".color-dot");

  if (colorSwitcherBtn) {
    colorSwitcherBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      colorOptions.classList.toggle("open");
    });
  }

  document.addEventListener("click", function () {
    if (colorOptions) colorOptions.classList.remove("open");
  });

  // Load saved color
  const savedColor = localStorage.getItem("gv-accent") || "#00f5c8";
  applyColor(savedColor);
  colorDots.forEach(function (dot) {
    if (dot.dataset.color === savedColor) dot.classList.add("active");
  });

  colorDots.forEach(function (dot) {
    dot.addEventListener("click", function (e) {
      e.stopPropagation();
      const color = this.dataset.color;
      applyColor(color);
      localStorage.setItem("gv-accent", color);
      colorDots.forEach(function (d) { d.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  function applyColor(hex) {
    const rgb = hexToRgb(hex);
    document.documentElement.style.setProperty("--accent", hex);
    if (rgb) {
      document.documentElement.style.setProperty(
        "--accent-rgb",
        rgb.r + "," + rgb.g + "," + rgb.b
      );
    }
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /* ============================================================
     PORTFOLIO FILTER
     ============================================================ */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");

      const filter = this.dataset.filter;

      portfolioItems.forEach(function (item) {
        if (filter === "all" || item.dataset.category === filter) {
          item.classList.remove("hide");
          item.style.animation = "fadeInItem 0.4s ease forwards";
        } else {
          item.classList.add("hide");
        }
      });
    });
  });

  // Add fadeIn keyframe
  const style = document.createElement("style");
  style.textContent = "@keyframes fadeInItem { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }";
  document.head.appendChild(style);

  /* ============================================================
     SKILL BARS ANIMATION (IntersectionObserver)
     ============================================================ */
  const skillFills = document.querySelectorAll(".skill-fill");

  const skillObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const width = entry.target.dataset.width;
          entry.target.style.width = width + "%";
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  skillFills.forEach(function (fill) { skillObserver.observe(fill); });

  /* ============================================================
     SCROLL TO TOP BUTTON
     ============================================================ */
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  function updateScrollTopBtn() {
    if (scrollTopBtn) {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add("show");
      } else {
        scrollTopBtn.classList.remove("show");
      }
    }
  }

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ============================================================
     CONTACT FORM SUBMIT
     ============================================================ */
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const inputs = contactForm.querySelectorAll("[required]");
      let valid = true;

      inputs.forEach(function (input) {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = "#ff6b6b";
          setTimeout(function () {
            input.style.borderColor = "";
          }, 2500);
        }
      });

      if (!valid) return;

      // Simulate form submission
      const submitBtn = contactForm.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Sending...';

      setTimeout(function () {
        contactForm.style.display = "none";
        if (formSuccess) formSuccess.style.display = "block";
      }, 1500);
    });
  }

  /* ============================================================
     NEWSLETTER FORM (simple)
     ============================================================ */
  const newsletterForms = document.querySelectorAll(".newsletter-form");
  newsletterForms.forEach(function (form) {
    const btn = form.querySelector("button");
    const input = form.querySelector("input");
    if (btn) {
      btn.addEventListener("click", function () {
        if (input && input.value.includes("@")) {
          btn.textContent = "Subscribed!";
          btn.style.background = "#25d366";
          btn.disabled = true;
          input.value = "";
        }
      });
    }
  });

  /* ============================================================
     TYPING EFFECT (Hero headline accent) – no layout shift
     ============================================================ */
  const heroAccent = document.querySelector(".hero-headline .text-accent");
  if (heroAccent) {
    const words = ["Website Development", "Digital Presence", "Online Growth", "Web Solutions"];
    let wordIndex = 0;
    let charIndex = words[0].length; // start fully typed
    let isDeleting = false;
    const typingSpeed = 85;
    const deletingSpeed = 45;
    const pauseDuration = 2600;

    // Add blinking cursor via CSS
    heroAccent.style.borderRight = "3px solid var(--accent)";
    heroAccent.style.paddingRight = "2px";
    heroAccent.style.animation = "cursorBlink 0.8s step-end infinite";

    // Inject cursor keyframe
    const cursorStyle = document.createElement("style");
    cursorStyle.textContent = `
      @keyframes cursorBlink {
        0%,100% { border-right-color: var(--accent); }
        50%      { border-right-color: transparent; }
      }
    `;
    document.head.appendChild(cursorStyle);

    function typeEffect() {
      const currentWord = words[wordIndex];
      if (!isDeleting) {
        heroAccent.textContent = currentWord.slice(0, ++charIndex);
        if (charIndex === currentWord.length) {
          isDeleting = true;
          setTimeout(typeEffect, pauseDuration);
          return;
        }
      } else {
        heroAccent.textContent = currentWord.slice(0, --charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
      setTimeout(typeEffect, isDeleting ? deletingSpeed : typingSpeed);
    }

    // Start from already-typed first word
    heroAccent.textContent = words[0];
    setTimeout(typeEffect, pauseDuration);
  }

  /* ============================================================
     COUNTER ANIMATION (Stats)
     ============================================================ */
  const astatNums = document.querySelectorAll(".astat-num");

  function animateCounter(el, target) {
    const suffix = target.replace(/[0-9]/g, "");
    const num = parseInt(target);
    let current = 0;
    const step = Math.ceil(num / 40);
    const interval = setInterval(function () {
      current += step;
      if (current >= num) {
        current = num;
        clearInterval(interval);
      }
      el.textContent = current + suffix;
    }, 40);
  }

  const counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.textContent;
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  astatNums.forEach(function (el) { counterObserver.observe(el); });

  /* ============================================================
     CURSOR GLOW (Desktop only)
     ============================================================ */
  if (window.matchMedia("(pointer: fine)").matches) {
    const glow = document.createElement("div");
    glow.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9998;
      width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(var(--accent-rgb, 0,245,200), 0.04), transparent 60%);
      transform: translate(-50%, -50%);
      transition: left 0.12s ease, top 0.12s ease;
    `;
    document.body.appendChild(glow);

    document.addEventListener("mousemove", function (e) {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    });
  }

  /* ============================================================
     NAVBAR LINK UNDERLINE HOVER (desktop)
     ============================================================ */
  navLinks.forEach(function (link) {
    link.addEventListener("mouseenter", function () {
      this.style.transition = "all 0.25s ease";
    });
  });

  /* ============================================================
     PROCESS STEPS: SEQUENTIAL HIGHLIGHT
     ============================================================ */
  const steps = document.querySelectorAll(".process-step");
  let currentStep = 0;

  function highlightStep() {
    steps.forEach(function (s) { s.classList.remove("active"); });
    if (steps[currentStep]) steps[currentStep].classList.add("active");
    currentStep = (currentStep + 1) % steps.length;
  }

  if (steps.length > 0) {
    setInterval(highlightStep, 2500);
  }

  console.log(
    "%cGV Web Solutions 🚀",
    "font-size:20px;font-weight:bold;color:#00f5c8;"
  );
  console.log(
    "%cBuilt with ❤️ by Gaurav Verma",
    "font-size:12px;color:#7a8fa6;"
  );
})();
