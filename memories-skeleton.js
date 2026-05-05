// Прибирає скелетон, як тільки в #memoriesList з'являється перша справжня картка.
// Працює незалежно від логіки memories.js — просто стежить за DOM.

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

  // Стежимо за появою дочірніх елементів у списку
  const observer = new MutationObserver(() => {
    if (list.children.length > 0) {
      hideSkeleton();
      observer.disconnect();
    }
  });
  observer.observe(list, { childList: true });

  // Запобіжник: якщо за 12 секунд нічого не завантажилось —
  // ховаємо скелетон, щоб не лишався "висіти" нескінченно
  setTimeout(() => {
    if (!removed) {
      hideSkeleton();
      observer.disconnect();
    }
  }, 12000);
})();