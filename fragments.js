(function () {
  const triggers = document.querySelectorAll('[data-lightbox]');
  const galleries = {};

  triggers.forEach(function (el) {
    const name = el.getAttribute('data-lightbox');
    if (!galleries[name]) galleries[name] = [];
    galleries[name].push({
      src: el.getAttribute('href'),
      caption: el.getAttribute('data-caption') || '',
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
    capEl.textContent = item.caption;

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