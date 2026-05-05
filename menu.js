(function () {
  const links = document.querySelectorAll('.header-nav a');
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  // Збираємо мапу: id секції → відповідне посилання в меню
  const sectionToLink = new Map();
  links.forEach(link => {
    const href = link.getAttribute('href');
    const [linkPage, linkHash] = href.split('#');
    const page = linkPage || 'index.html';
    if (page === currentPage && linkHash) {
      const section = document.getElementById(linkHash);
      if (section) sectionToLink.set(section, link);
    }
  });

  function clearActive() {
    links.forEach(l => l.classList.remove('is-active'));
  }

  function setActiveLink(link) {
    if (!link) return;
    clearActive();
    link.classList.add('is-active');
  }

  // --- Випадок 1: сторінка БЕЗ секцій (biography.html, memories.html) ---
  if (sectionToLink.size === 0) {
    links.forEach(link => {
      const href = link.getAttribute('href').split('#')[0] || 'index.html';
      if (href === currentPage) link.classList.add('is-active');
    });
    return;
  }

  // --- Випадок 2: сторінка з секціями (index.html) ---
  // Спочатку активуємо перший пункт за замовчуванням
  const firstLink = sectionToLink.values().next().value;
  setActiveLink(firstLink);

  // Стежимо, яка секція зараз найближча до верху екрана
  let visibleSections = new Set();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibleSections.add(entry.target);
      else visibleSections.delete(entry.target);
    });

    if (visibleSections.size === 0) return;

    // Серед видимих секцій — беремо ту, що вище за всіх на сторінці
    const topSection = [...visibleSections].sort(
      (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
    )[0];

    setActiveLink(sectionToLink.get(topSection));
  }, {
    // Активуємо, коли секція в середній частині екрана
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  });

  sectionToLink.forEach((_, section) => observer.observe(section));
})();