// Прибирає скелетон, як тільки в #memoriesList з'являється перша СПРАВЖНЯ картка спогаду.

console.log('Skeleton script:', { 
  skeleton: document.getElementById('memoriesSkeleton'),
  list: document.getElementById('memoriesList')
});

(function () {
  const skeleton = document.getElementById('memoriesSkeleton');
  const list = document.getElementById('memoriesList');
  if (!skeleton || !list) return;

  let removed = false;

  function hideSkeleton() {
    if (removed) return;
    removed = true;
    skeleton.classList.add('is-hiding');
    setTimeout(() => skeleton.remove(), 320);
  }

  // Перевіряємо: чи є в списку справжня картка спогаду?
  function hasRealCards() {
    return list.querySelector('.memory-card') !== null;
  }

  // Якщо картки вже встигли завантажитись до запуску цього скрипта
  if (hasRealCards()) {
    hideSkeleton();
    return;
  }

  // Стежимо за появою саме .memory-card
  const observer = new MutationObserver(() => {
    if (hasRealCards()) {
      hideSkeleton();
      observer.disconnect();
    }
  });
  observer.observe(list, { childList: true, subtree: true });

  // Запобіжник: 12 секунд
  setTimeout(() => {
    if (!removed) {
      hideSkeleton();
      observer.disconnect();
    }
  }, 12000);
})();