// ====================================================
// candle.js — версія 3
// ====================================================
// Зміни проти попередньої:
//  - Кнопка "Запалити свічку" ХОВАЄТЬСЯ повністю після кліку,
//    замість зблідлого вигляду.
//  - Картка отримує клас .is-done, коли в стані "вже підписано",
//    щоб CSS зробив її меншою.
//  - У стані done також показуємо "Залишити більше слів →"
//    для тих, хто вже підписав свічку.
// ====================================================

(function () {

  const button     = document.getElementById("lightCandleBtn");
  const counterEl  = document.getElementById("candlesCount");
  const counterLine = document.querySelector(".candle-counter-line");

  const card       = document.getElementById("candleCard");
  const stateLit   = document.getElementById("candleStateLit");
  const stateDone  = document.getElementById("candleStateDone");

  const nameInput  = document.getElementById("candleName");
  const signBtn    = document.getElementById("signCandleBtn");
  const skipBtn    = document.getElementById("skipCandleBtn");
  const doneNameEl = document.getElementById("candleDoneName");

  if (!button || !counterEl) return;

  // localStorage
  const LS_KEY = "slon.candle.lit";
  function alreadyLit() { return localStorage.getItem(LS_KEY) !== null; }
  function markLit(name) { localStorage.setItem(LS_KEY, name || ""); }
  function getLitName()  { return localStorage.getItem(LS_KEY) || ""; }

  // IP
  async function fetchClientIP() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const data = await res.json();
      return data.ip || null;
    } catch (err) {
      console.warn("[candle] IP fetch failed:", err.message);
      return null;
    }
  }

  // Запит лічильника
  async function loadCount() {
    if (!window.supabaseClient) return null;
    try {
      const { count, error } = await window.supabaseClient
        .from("candles_public")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error("[candle] count failed:", err);
      return null;
    }
  }

  // Інсерт нової свічки
  async function lightCandle() {
    if (!window.supabaseClient) throw new Error("supabase not initialised");
    const ip = await fetchClientIP();

    const { error } = await window.supabaseClient
      .from("candles")
      .insert({ name: null, ip, user_agent: navigator.userAgent });

    if (error) {
      if (error.code === "23505") return { duplicate: true };
      throw error;
    }
    return { duplicate: false };
  }

  // UI helpers
  function setCounter(n) {
    if (n === null || n === undefined) return;
    counterEl.textContent = String(n);
  }

  function hideButton() {
    // Прибираємо саму кнопку повністю — лишається лише картка свічки.
    if (button) button.style.display = "none";
  }

  function showCard(state) {
    if (!card) return;
    card.hidden = false;
    [stateLit, stateDone].forEach(el => { if (el) el.hidden = true; });

    if (state === "lit"  && stateLit) {
      stateLit.hidden  = false;
      card.classList.remove("is-done");
    }
    if (state === "done" && stateDone) {
      stateDone.hidden = false;
      card.classList.add("is-done");
    }
  }

  function showDone(name) {
    showCard("done");
    if (doneNameEl) {
      doneNameEl.textContent = name ? `— ${name}` : "";
      doneNameEl.hidden = !name;
    }
    if (counterLine) counterLine.classList.add("is-active");
    hideButton();
  }

  // Обробники
  async function onMainButtonClick() {
    button.disabled = true;
    const result = await lightCandle().catch(err => {
      console.error("[candle] light failed:", err);
      return null;
    });

    if (result === null) {
      button.disabled = false;
      return;
    }

    markLit("");
    const newCount = await loadCount();
    setCounter(newCount);

    if (result.duplicate) {
      showDone("");
    } else {
      hideButton();
      showCard("lit");
      if (nameInput) {
        nameInput.value = "";
        nameInput.focus();
      }
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async function onSignCandle() {
    const name = (nameInput && nameInput.value || "").trim().slice(0, 80);
    if (!name) {
      onSkipCandle();
      return;
    }

    signBtn.disabled = true;

    try {
      const { error } = await window.supabaseClient.rpc("set_my_candle_name", {
        candle_name: name
      });
      if (error) throw error;
    } catch (err) {
      console.warn("[candle] could not save name:", err);
    }

    markLit(name);
    showDone(name);
  }

  function onSkipCandle() {
    showDone("");
  }

  // Старт
  async function init() {
    const count = await loadCount();
    setCounter(count);

    if (alreadyLit()) {
      showDone(getLitName());
    } else {
      button.addEventListener("click", onMainButtonClick);
    }

    if (signBtn) signBtn.addEventListener("click", onSignCandle);
    if (skipBtn) skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      onSkipCandle();
    });

    // Realtime
    if (window.supabaseClient) {
      window.supabaseClient
        .channel("candles-realtime")
        .on("postgres_changes",
            { event: "INSERT", schema: "public", table: "candles" },
            async () => {
              const fresh = await loadCount();
              setCounter(fresh);
            })
        .subscribe();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
