(function () {
  const pages = window.SCIENCE_CRISPR_PAGES || [];
  const glossary = window.SCIENCE_CRISPR_GLOSSARY || [];
  const app = document.querySelector("#app");
  const pageNav = document.querySelector(".page-links");
  const nav = document.querySelector(".nav-links");
  const toggle = document.querySelector(".nav-toggle");
  const progressBar = document.querySelector(".page-progress-bar");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const storedLanguage = localStorage.getItem("scienceCrisprLanguage");
  const storedTheme = localStorage.getItem("scienceCrisprTheme");
  let currentLang = storedLanguage === "zh" ? "zh" : "en";
  let currentTheme = storedTheme === "dark" ? "dark" : "light";
  let themeAnimationTimer = 0;
  let touchStartY = 0;

  const uiText = {
    en: {
      appearanceKicker: "Mode",
      contactTitle: "Contact Information",
      contactNote: "I am a student who is interested in technologies such as CRISPR. If there is anything I could add or improve, please email me and let me know.",
      closeExpandedImage: "Close expanded image",
      closeNav: "Close navigation",
      darkMode: "Dark",
      emptyGlossary: "No matching keyword found.",
      expandedImage: "Expanded image",
      glossaryEyebrow: "Glossary",
      glossaryTitle: "Keyword Dictionary",
      languageButton: "中文",
      languageKicker: "Language",
      lightMode: "Light",
      menu: "Menu",
      openNav: "Open navigation",
      displayOptions: "Display options",
      search: "Search",
      searchPlaceholder: "CRISPR / gene / RNA",
      sitePages: "Site pages",
      switchLanguage: "Switch to Chinese",
      switchToDark: "Switch to dark mode",
      switchToLight: "Switch to light mode"
    },
    zh: {
      appearanceKicker: "模式",
      contactTitle: "聯絡資訊",
      contactNote: "我是一位學生，對 CRISPR 這樣的技術很感興趣。如果有什麼可以多做補充的地方，歡迎寄信給我讓我知道。",
      closeExpandedImage: "關閉放大圖片",
      closeNav: "關閉選單",
      darkMode: "深色",
      emptyGlossary: "找不到符合的關鍵字。",
      expandedImage: "放大圖片",
      glossaryEyebrow: "Glossary",
      glossaryTitle: "關鍵字辭典",
      languageButton: "EN",
      languageKicker: "語言",
      lightMode: "淺色",
      menu: "選單",
      openNav: "開啟選單",
      displayOptions: "顯示設定",
      search: "搜尋",
      searchPlaceholder: "CRISPR / 基因 / RNA",
      sitePages: "網站頁面",
      switchLanguage: "切換成英文",
      switchToDark: "切換成深色模式",
      switchToLight: "切換成淺色模式"
    }
  };

  function t(key) {
    return uiText[currentLang][key] || uiText.en[key] || "";
  }

  function localize(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[currentLang] || value.en || value.zh || "";
  }

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function applyTheme() {
    document.documentElement.dataset.theme = currentTheme;
    if (themeMeta) {
      themeMeta.setAttribute("content", currentTheme === "dark" ? "#07111f" : "#142235");
    }
  }

  function currentThemeLabel() {
    return currentTheme === "dark" ? t("darkMode") : t("lightMode");
  }

  function currentThemeAction() {
    return currentTheme === "dark" ? t("switchToLight") : t("switchToDark");
  }

  function updateThemeToggle() {
    const themeToggle = nav.querySelector("[data-theme-toggle]");
    if (!themeToggle) return;

    const label = themeToggle.querySelector(".theme-toggle-label strong");
    themeToggle.setAttribute("aria-pressed", String(currentTheme === "dark"));
    themeToggle.setAttribute("aria-label", currentThemeAction());
    if (label) label.textContent = currentThemeLabel();
  }

  function pageByHash() {
    const id = (location.hash || "#home").replace("#", "");
    return pages.find((page) => page.id === id) || pages[0];
  }

  function renderNav(activeId) {
    const links = pages
      .map((page) => {
        const active = page.id === activeId ? " is-active" : "";
        const current = page.id === activeId ? ' aria-current="page"' : "";
        return `<a class="nav-link${active}" href="#${page.id}"${current}>${localize(page.label)}</a>`;
      })
      .join("");

    pageNav.setAttribute("aria-label", t("sitePages"));
    pageNav.innerHTML = links;

    nav.setAttribute("aria-label", t("displayOptions"));
    nav.innerHTML = `
      <div class="nav-menu-label">${t("menu")}</div>
      <button class="language-toggle" type="button" data-language-toggle aria-label="${t("switchLanguage")}">
        <span>${t("languageKicker")}</span>
        <strong>${t("languageButton")}</strong>
      </button>
      <button class="theme-toggle" type="button" data-theme-toggle aria-pressed="${currentTheme === "dark"}" aria-label="${currentThemeAction()}">
        <span class="theme-toggle-label">
          <span>${t("appearanceKicker")}</span>
          <strong>${currentThemeLabel()}</strong>
        </span>
        <span class="theme-switch" aria-hidden="true">
          <span class="theme-symbol theme-symbol-sun"></span>
          <span class="theme-symbol theme-symbol-moon"></span>
          <span class="theme-switch-thumb"></span>
        </span>
      </button>
    `;
  }

  function render(options = {}) {
    const page = pageByHash();
    if (!page) return;
    const pageTitle = localize(page.title);
    const previousScroll = window.scrollY;

    document.documentElement.lang = currentLang === "zh" ? "zh-Hant" : "en";
    document.documentElement.dataset.language = currentLang;
    applyTheme();
    document.title = `${pageTitle} | Science_CRISPR`;
    renderNav(page.id);
    setNavOpen(false);

    app.innerHTML = `
      <section class="hero">
        <div class="hero-inner">
          <p class="eyebrow">Science_CRISPR</p>
          <h1>${pageTitle}</h1>
          <p>${localize(page.subtitle)}</p>
        </div>
      </section>
      ${localize(page.content)}
      ${renderGlossary()}
      <footer class="contact">
        <div class="section-inner">
          <div class="contact-copy">
            <h2>${t("contactTitle")}</h2>
            <p>${t("contactNote")}</p>
          </div>
          <a href="mailto:Wengjinghao505@gmail.com">Wengjinghao505@gmail.com</a>
        </div>
      </footer>
    `;

    window.scrollTo(0, options.preserveScroll ? previousScroll : 0);
    app.focus({ preventScroll: true });
    setupGlossaryInteractions();
    setupMouseInteractions();
    updatePageProgress();
  }

  function renderGlossary() {
    if (!glossary.length) return "";

    const cards = glossary
      .map((item) => {
        const keywords = `${item.term} ${item.zh} ${item.definition} ${item.zhDefinition}`.toLowerCase();
        const primaryTerm = currentLang === "zh" ? item.zh : item.term;
        const secondaryTerm = currentLang === "zh" ? item.term : item.zh;
        const definition = currentLang === "zh" ? item.zhDefinition : item.definition;
        const primaryLang = currentLang === "zh" ? "zh-Hant" : "en";
        const secondaryLang = currentLang === "zh" ? "en" : "zh-Hant";
        const definitionLang = currentLang === "zh" ? "zh-Hant" : "en";
        return `
          <article class="glossary-card" data-glossary-item data-keywords="${escapeAttribute(keywords)}">
            <button class="glossary-term" type="button" aria-expanded="false">
              <span>
                <span class="glossary-term-primary" lang="${primaryLang}">${primaryTerm}</span>
                <span class="glossary-term-secondary" lang="${secondaryLang}">${secondaryTerm}</span>
              </span>
            </button>
            <div class="glossary-definition" hidden>
              <p lang="${definitionLang}">${definition}</p>
            </div>
          </article>
        `;
      })
      .join("");

    return `
      <section class="band is-soft glossary-section" id="glossary">
        <div class="section-inner">
          <div class="glossary-header">
            <div>
              <p class="eyebrow">${t("glossaryEyebrow")}</p>
              <h2 class="section-title">${t("glossaryTitle")}</h2>
            </div>
            <label class="glossary-search-label">
              <span>${t("search")}</span>
              <input class="glossary-search" type="search" placeholder="${t("searchPlaceholder")}">
            </label>
          </div>
          <div class="glossary-grid">
            ${cards}
          </div>
          <p class="glossary-empty" hidden>${t("emptyGlossary")}</p>
        </div>
      </section>
    `;
  }

  function updatePageProgress() {
    if (!progressBar) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll <= 0 ? 0 : Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100));
    progressBar.style.width = `${progress}%`;
  }

  function shouldAnimatePointers() {
    return (
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function setupMouseInteractions() {
    if (!shouldAnimatePointers()) return;
    setupHeroTracking();
    setupTiltTargets();
  }

  function setupGlossaryInteractions() {
    const search = app.querySelector(".glossary-search");
    const items = [...app.querySelectorAll("[data-glossary-item]")];
    const empty = app.querySelector(".glossary-empty");

    app.querySelectorAll(".glossary-term").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".glossary-card");
        const definition = card.querySelector(".glossary-definition");
        const open = definition.hasAttribute("hidden");

        definition.toggleAttribute("hidden", !open);
        button.setAttribute("aria-expanded", String(open));
        card.classList.toggle("is-open", open);
      });
    });

    if (!search) return;

    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let visibleCount = 0;

      items.forEach((item) => {
        const visible = !query || item.dataset.keywords.includes(query);
        item.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (empty) empty.hidden = visibleCount !== 0;
    });
  }

  function setupHeroTracking() {
    const hero = app.querySelector(".hero");
    if (!hero) return;

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xRatio = x / rect.width - 0.5;
      const yRatio = y / rect.height - 0.5;

      hero.classList.add("is-tracking");
      hero.style.setProperty("--cursor-x", `${x}px`);
      hero.style.setProperty("--cursor-y", `${y}px`);
      hero.style.setProperty("--hero-shift-x", String(xRatio * 12));
      hero.style.setProperty("--hero-shift-y", String(yRatio * 8));
    });

    hero.addEventListener("pointerleave", () => {
      hero.classList.remove("is-tracking");
      hero.style.setProperty("--cursor-x", "50%");
      hero.style.setProperty("--cursor-y", "50%");
      hero.style.setProperty("--hero-shift-x", "0");
      hero.style.setProperty("--hero-shift-y", "0");
    });
  }

  function setupTiltTargets() {
    const targets = app.querySelectorAll(".person-card, .timeline-card, .callout-list li, .media-frame");

    targets.forEach((target) => {
      target.addEventListener("pointermove", (event) => {
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateY = (x / rect.width - 0.5) * 7;
        const rotateX = (0.5 - y / rect.height) * 7;
        const lift = target.classList.contains("media-frame") ? 4 : 6;

        target.classList.add("is-tilting");
        target.style.setProperty("--shine-x", `${x}px`);
        target.style.setProperty("--shine-y", `${y}px`);
        target.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-${lift}px)`;
      });

      target.addEventListener("pointerleave", () => {
        target.classList.remove("is-tilting");
        target.style.setProperty("--shine-x", "50%");
        target.style.setProperty("--shine-y", "50%");
        target.style.transform = "";
      });
    });
  }

  function ensureLightbox() {
    let lightbox = document.querySelector(".lightbox");
    if (lightbox) return lightbox;

    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.innerHTML = `
      <button class="lightbox-close" type="button" data-lightbox-close>&times;</button>
      <img src="" alt="">
    `;
    document.body.appendChild(lightbox);
    return lightbox;
  }

  function openLightbox(src, alt) {
    const lightbox = ensureLightbox();
    const image = lightbox.querySelector("img");
    const closeButton = lightbox.querySelector("[data-lightbox-close]");
    lightbox.setAttribute("aria-label", t("expandedImage"));
    closeButton.setAttribute("aria-label", t("closeExpandedImage"));
    image.src = src;
    image.alt = alt || "";
    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  }

  function closeLightbox() {
    const lightbox = document.querySelector(".lightbox");
    if (!lightbox) return;

    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    const image = lightbox.querySelector("img");
    image.src = "";
    image.alt = "";
  }

  function setNavOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? t("closeNav") : t("openNav"));
  }

  function switchLanguage() {
    currentLang = currentLang === "en" ? "zh" : "en";
    localStorage.setItem("scienceCrisprLanguage", currentLang);
    render({ preserveScroll: true });
  }

  function switchTheme() {
    document.documentElement.classList.add("theme-changing");
    window.clearTimeout(themeAnimationTimer);
    currentTheme = currentTheme === "light" ? "dark" : "light";
    localStorage.setItem("scienceCrisprTheme", currentTheme);
    applyTheme();
    updateThemeToggle();
    setNavOpen(true);
    themeAnimationTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("theme-changing");
    }, 760);
  }

  toggle.addEventListener("click", () => {
    setNavOpen(!nav.classList.contains("is-open"));
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const themeToggle = event.target.closest("[data-theme-toggle]");
    if (themeToggle) {
      switchTheme();
      return;
    }

    const languageToggle = event.target.closest("[data-language-toggle]");
    if (languageToggle) {
      switchLanguage();
      return;
    }

    const lightboxTrigger = event.target.closest("[data-lightbox-src]");
    if (lightboxTrigger) {
      openLightbox(lightboxTrigger.dataset.lightboxSrc, lightboxTrigger.dataset.lightboxAlt);
      return;
    }

    if (event.target.closest("[data-lightbox-close]") || event.target.classList.contains("lightbox")) {
      closeLightbox();
      return;
    }

    const link = event.target.closest("a[href^='#']");
    if (link) setNavOpen(false);

    if (!event.target.closest(".topbar")) setNavOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
      setNavOpen(false);
    }
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("scroll", updatePageProgress, { passive: true });
  window.addEventListener("resize", updatePageProgress);

  document.addEventListener(
    "touchstart",
    (event) => {
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (event) => {
      const currentY = event.touches[0].clientY;
      const deltaY = currentY - touchStartY;
      const atTop = window.scrollY <= 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;

      if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  if (!location.hash) {
    history.replaceState(null, "", "#home");
  }

  render();
})();
