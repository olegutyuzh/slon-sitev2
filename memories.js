// ====================================================
// memories.js — рендер сторінки спогадів (Supabase)
// ====================================================
//
// Працює разом із:
//  - supabase-config.js (window.supabaseClient)
//  - lang.js (window.translationsCache)
//
// Дані беремо з таблиці public.memories у Supabase.
// Завдяки RLS на сайт потрапляють тільки записи з approved = true.
// ====================================================

(function () {
  const PAGE_SIZE = 6;

  let allMemories = [];
  let currentFilter = "all";
  let visibleCount = PAGE_SIZE;

  const listEl     = document.getElementById("memoriesList");
  const emptyEl    = document.getElementById("memoriesEmpty");
  const loadMoreEl = document.getElementById("memoriesLoadMore");
  const filterBtns = document.querySelectorAll(".memories-filter");

  // -----------------------------
  // Утиліти
  // -----------------------------

  function getLang() {
    return document.documentElement.getAttribute("lang") || "uk";
  }

  function t(key, fallback) {
    try {
      const dict = (window.translationsCache && window.translationsCache[getLang()]) || {};
      return dict[key] || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function formatDate(isoDate) {
    if (!isoDate) return "";
    try {
      const d = new Date(isoDate + (isoDate.length === 10 ? "T00:00:00" : ""));
      const lang = getLang();
      const locale = lang === "en" ? "en-US" : "uk-UA";
      return d.toLocaleDateString(locale, {
        year: "numeric", month: "long", day: "numeric"
      });
    } catch (e) {
      return isoDate;
    }
  }

  function escape(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // -----------------------------
  // Рендер
  // -----------------------------

  function getFilteredMemories() {
    if (currentFilter === "all") return allMemories;
    return allMemories.filter(m => m.category === currentFilter);
  }

  function renderMemories() {
    const filtered = getFilteredMemories();
    const lang = getLang();
    const toShow = filtered.slice(0, visibleCount);

    if (filtered.length === 0) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      loadMoreEl.hidden = true;
      return;
    }
    emptyEl.hidden = true;

    listEl.innerHTML = toShow.map(m => {
      // Якщо англійського перекладу немає, показуємо український —
      // щоб не було порожніх карток в EN-версії, поки переклад
      // ще не зроблено.
      const author = (lang === "en" && m.author_en) ? m.author_en : m.author_uk;
      const text   = (lang === "en" && m.text_en)   ? m.text_en   : m.text_uk;
      return `
        <article class="memory-card" data-category="${escape(m.category)}">
          <div class="memory-card-mark" aria-hidden="true">&ldquo;</div>
          <p class="memory-card-text">${escape(text)}</p>
          <div class="memory-card-meta">
            <span class="memory-card-author">— ${escape(author)}</span>
            <time class="memory-card-date" datetime="${escape(m.display_date)}">${escape(formatDate(m.display_date))}</time>
          </div>
        </article>
      `;
    }).join("");

    loadMoreEl.hidden = toShow.length >= filtered.length;
  }

  function updateCounts() {
    const counts = { all: allMemories.length, family: 0, comrades: 0, friends: 0, other: 0 };
    allMemories.forEach(m => {
      if (counts[m.category] !== undefined) counts[m.category]++;
      else counts.other++;
    });
    document.querySelectorAll(".memories-filter-count").forEach(el => {
      const key = el.getAttribute("data-count");
      el.textContent = counts[key] != null ? counts[key] : 0;
    });
  }

  // -----------------------------
  // Обробники
  // -----------------------------

  function onFilterClick(e) {
    const btn = e.currentTarget;
    const filter = btn.getAttribute("data-filter");
    if (filter === currentFilter) return;

    currentFilter = filter;
    visibleCount = PAGE_SIZE;

    filterBtns.forEach(b => {
      const isActive = b === btn;
      b.classList.toggle("is-active", isActive);
      b.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    renderMemories();
  }

  function onLoadMoreClick() {
    visibleCount += PAGE_SIZE;
    renderMemories();
  }

  function watchLanguageChange() {
    document.querySelectorAll("[data-lang]").forEach(el => {
      el.addEventListener("click", () => {
        setTimeout(renderMemories, 0);
      });
    });
  }

  // -----------------------------
  // Завантаження з Supabase
  // -----------------------------

  async function loadFromSupabase() {
    if (!window.supabaseClient) {
      throw new Error("Supabase client not initialised");
    }

    // RLS-політика автоматично відфільтрує тільки approved=true записи —
    // нам не треба додавати .eq("approved", true) явно.
    // Сортуємо за display_date спадно (новіші зверху).
    const { data, error } = await window.supabaseClient
      .from("memories")
      .select("id, category, display_date, author_uk, author_en, text_uk, text_en")
      .order("display_date", { ascending: false })
      .order("created_at",   { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // -----------------------------
  // Старт
  // -----------------------------

  async function init() {
    try {
      allMemories = await loadFromSupabase();
      updateCounts();
      renderMemories();
    } catch (err) {
      console.error("[memories]", err);
      listEl.innerHTML = `<p class="memories-error">${escape(t("memories_error", "Не вдалося завантажити спогади. Спробуйте оновити сторінку."))}</p>`;
      loadMoreEl.hidden = true;
    }

    filterBtns.forEach(btn => btn.addEventListener("click", onFilterClick));
    loadMoreEl.addEventListener("click", onLoadMoreClick);
    watchLanguageChange();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
