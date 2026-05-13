(function () {
  const triggers = document.querySelectorAll('[data-lightbox]');
  const galleries = {};

  triggers.forEach(function (el) {
    const name = el.getAttribute('data-lightbox');
    if (!galleries[name]) galleries[name] = [];
    galleries[name].push({
      src: el.getAttribute('href'),
      captionKey: el.getAttribute('data-caption-key') || '',
      alt: el.querySelector('img') ? el.querySelector('img').alt : ''
    });
  });

  const box     = document.getElementById('lightbox');
  const imgEl   = box.querySelector('.lightbox-image');
  const capEl   = box.querySelector('.lightbox-caption');
  const closeBt = box.querySelector('.lightbox-close');
  const prevBt  = box.querySelector('.lightbox-prev');
  const nextBt  = box.querySelector('.lightbox-next');

  let currentGallery = null;
  let currentIndex   = 0;

  function open(name, index) {
    currentGallery = galleries[name];
    currentIndex   = index;
    render();
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function render() {
    const item = currentGallery[currentIndex];
    imgEl.src = item.src;
    imgEl.alt = item.alt;

    if (item.captionKey) {
      // Ставимо data-i18n на елемент підпису — далі lang.js підхоплює сам
      capEl.setAttribute('data-i18n', item.captionKey);

      const lang = document.documentElement.getAttribute('lang') || 'uk';
      const dict = (window.translationsCache && window.translationsCache[lang]) || {};
      const translated = dict[item.captionKey];

      if (translated === undefined) {
        console.warn('[lightbox] No translation for key:', item.captionKey,
                     '| cache loaded:', !!window.translationsCache,
                     '| lang:', lang);
      }
      // Якщо перекладу нема — показуємо сам ключ як заглушку (видно проблему)
      capEl.textContent = translated || item.captionKey;
    } else {
      console.warn('[lightbox] No data-caption-key on this trigger');
      capEl.removeAttribute('data-i18n');
      capEl.textContent = '';
    }

    const single = currentGallery.length <= 1;
    prevBt.style.display = single ? 'none' : '';
    nextBt.style.display = single ? 'none' : '';
  }

  function next() {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    render();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    render();
  }

  triggers.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      const name = el.getAttribute('data-lightbox');
      const index = galleries[name].findIndex(function (item) {
        return item.src === el.getAttribute('href');
      });
      open(name, index);
    });
  });

  closeBt.addEventListener('click', close);
  prevBt.addEventListener('click', prev);
  nextBt.addEventListener('click', next);

  box.addEventListener('click', function (e) {
    if (e.target === box) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  let touchStartX = 0;
  box.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  box.addEventListener('touchend', function (e) {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) prev();
    else next();
  }, { passive: true });
})();

/* ===== Dots-індикатор для life-fragment-thumbs ===== */
(function () {
  function initDots(fragment) {
    const thumbs = fragment.querySelector('.life-fragment-thumbs');
    const dotsBox = fragment.querySelector('.life-fragment-dots');
    if (!thumbs || !dotsBox) return;

    const items = Array.from(thumbs.querySelectorAll('.life-fragment-thumb'));
    if (!items.length) return;

    // 1. Створюємо точки
    dotsBox.innerHTML = '';
    const dots = items.map(function (_, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'life-fragment-dot';
      dot.setAttribute('aria-label', 'Фото ' + (i + 1));
      dot.addEventListener('click', function () {
        items[i].scrollIntoView({
          behavior: 'smooth',
          inline: 'start',
          block: 'nearest'
        });
      });
      dotsBox.appendChild(dot);
      return dot;
    });

    dots[0].classList.add('is-active');

    // 2. Стежимо, яка мініатюра найбільш видима
    const observer = new IntersectionObserver(
      function (entries) {
        let best = null;
        entries.forEach(function (entry) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        });
        if (best && best.isIntersecting) {
          const idx = items.indexOf(best.target);
          if (idx >= 0) {
            dots.forEach(function (d, i) {
              d.classList.toggle('is-active', i === idx);
            });
          }
        }
      },
      {
        root: thumbs,
        threshold: [0.5, 0.75, 1]
      }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function init() {
    document.querySelectorAll('.life-fragment').forEach(initDots);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
