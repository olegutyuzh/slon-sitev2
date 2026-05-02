async function loadMemoriesCount() {
  const counterEl = document.querySelector('.quotes-counter-text');
  if (!counterEl) return;

  try {
    const { count, error } = await supabaseClient
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('approved', true);

    if (error) throw error;

    const n = count ?? 0;

    // Якщо спогадів ще немає — ховаємо лічильник
    if (n === 0) {
      const wrapper = document.querySelector('.quotes-counter');
      if (wrapper) wrapper.style.display = 'none';
      return;
    }

    counterEl.textContent = `${n} ${pluralize(n)}`;
  } catch (err) {
    console.error('Не вдалося завантажити кількість спогадів:', err);
    const wrapper = document.querySelector('.quotes-counter');
    if (wrapper) wrapper.style.display = 'none';
  }
}

// Українська плюралізація: 1 спогад / 2-4 спогади / 5+ спогадів
function pluralize(n) {
  const lang = document.documentElement.lang || 'uk';

  if (lang === 'en') {
    return n === 1 ? 'memory' : 'memories';
  }

  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod100 >= 11 && mod100 <= 14) return 'спогадів';
  if (mod10 === 1) return 'спогад';
  if (mod10 >= 2 && mod10 <= 4) return 'спогади';
  return 'спогадів';
}

document.addEventListener('DOMContentLoaded', loadMemoriesCount);