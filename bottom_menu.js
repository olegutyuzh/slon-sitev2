// ====================================================
// bottom_menu.js — логіка нижньої мобільної навігації
// ====================================================
//
// Працює на будь-якій сторінці, де є <nav class="bottom-nav">.
//
// Що робить:
//  1. "Залипаюча" підсвітка активного пункту при скролі —
//     активним стає останній пункт, секцію якого користувач
//     уже проминув. Якщо ще не дійшов до жодної секції —
//     активний перший пункт. У самому низу сторінки —
//     активний останній.
//  2. Підсвічення пунктів, що ведуть на інші сторінки
//     (наприклад "Життєпис" на biography.html).
//  3. Якщо у меню є кнопка #bottomNavCandle і на сторінці
//     існує #lightCandleBtn — клік по кнопці в меню
//     викликає клік по основній кнопці запалювання свічки.
//
// На сторінках, де немає .bottom-nav, скрипт нічого не робить.
// ====================================================

(function () {
  const bottomNav = document.querySelector(".bottom-nav");
  if (!bottomNav) return;

  // Скидаємо всі активні стани — клас має проставлятися тільки скриптом
  bottomNav.querySelectorAll('.bottom-nav-item.is-active').forEach(el => {
    el.classList.remove('is-active');
  });

  // --- Підсвічення пунктів, що ведуть на інші сторінки ---
  // (наприклад "Життєпис" на biography.html, "Спогади" на memories.html)
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  bottomNav.querySelectorAll('a.bottom-nav-item').forEach(link => {
    const href = link.getAttribute('href') || '';
    // Пропускаємо якоря — їх обробляє основна логіка нижче
    if (href.startsWith('#')) return;
    // Виділяємо саме файл, ігноруючи якір (на випадок biography.html#top тощо)
    const linkPage = href.split('#')[0];
    if (linkPage === currentPage) {
      link.classList.add('is-active');
    }
  });

  // --- Залипаюча підсвітка під час скролу (для якорів на index.html) ---
  const navLinks = Array.from(
    bottomNav.querySelectorAll('a.bottom-nav-item[href^="#"]')
  );

  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === "#" + id);
    });
  }

  function updateActiveByScroll() {
    if (!sections.length) return;

    const offset = 120;
    let activeId = null;

    for (const section of sections) {
      const top = section.getBoundingClientRect().top;
      if (top - offset <= 0) {
        activeId = section.id;
      } else {
        break;
      }
    }

    if (!activeId) {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;
      activeId = nearBottom
        ? sections[sections.length - 1].id
        : sections[0].id;
    }

    if (activeId) setActive(activeId);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActiveByScroll();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateActiveByScroll);
  updateActiveByScroll();

  // --- Кнопка свічки в нижньому меню ---
  const bottomCandleBtn = document.getElementById("bottomNavCandle");
  const mainCandleBtn = document.getElementById("lightCandleBtn");
  if (bottomCandleBtn && mainCandleBtn) {
    bottomCandleBtn.addEventListener("click", () => {
      mainCandleBtn.click();
      mainCandleBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();