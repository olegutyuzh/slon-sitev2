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
//  2. Якщо у меню є кнопка #bottomNavCandle і на сторінці
//     існує #lightCandleBtn — клік по кнопці в меню
//     викликає клік по основній кнопці запалювання свічки.
//
// На сторінках, де немає .bottom-nav, скрипт нічого не робить.
// ====================================================

(function () {
  const bottomNav = document.querySelector(".bottom-nav");
  if (!bottomNav) return;

  // Беремо лише пункти-посилання з якорями на цій же сторінці
  const navLinks = Array.from(
    bottomNav.querySelectorAll('a.bottom-nav-item[href^="#"]')
  );

  // Порядок секцій по сторінці (зверху вниз)
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === "#" + id);
    });
  }

  // "Залипаюча" логіка — підсвічуємо останню секцію,
  // верх якої користувач уже проминув (з невеликим зсувом).
  function updateActiveByScroll() {
    const offset = 120; // приблизна висота хедера + трохи запасу
    let activeId = null;

    for (const section of sections) {
      const top = section.getBoundingClientRect().top;
      if (top - offset <= 0) {
        activeId = section.id;
      } else {
        break;
      }
    }

    // Якщо ще не дійшли до жодної секції — активуємо перший пункт.
    // Якщо доскролили до самого низу сторінки — підсвічуємо останній.
    if (!activeId && sections.length) {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;
      activeId = nearBottom
        ? sections[sections.length - 1].id
        : sections[0].id;
    }

    if (activeId) setActive(activeId);
  }

  // Throttle через requestAnimationFrame
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
  // Запускаємо одразу — щоб активний пункт був видимий уже на завантаженні
  updateActiveByScroll();

  // Кнопка свічки в нижній навігації — викликає ту саму логіку,
  // що й основна кнопка запалювання свічки на сторінці
  const bottomCandleBtn = document.getElementById("bottomNavCandle");
  const mainCandleBtn = document.getElementById("lightCandleBtn");
  if (bottomCandleBtn && mainCandleBtn) {
    bottomCandleBtn.addEventListener("click", () => {
      mainCandleBtn.click();
      mainCandleBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
