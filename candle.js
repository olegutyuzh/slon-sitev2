  function lightCandle() {
    document.querySelector('.scene').classList.add('lit');
  }


  const btn = document.getElementById("lightCandleBtn");
  const candle = document.getElementById("candleContainer");

  if (btn && candle) {
    btn.addEventListener("click", () => {

      // показати свічку
      candle.classList.add("is-visible");

      // активувати слона
      const scene = document.querySelector('.memory-scene');

      btn.addEventListener("click", () => {
        candle.classList.add("is-visible");
        scene.classList.add("is-lit");
      });

      // ефект натиснутої кнопки
      btn.style.opacity = "0.5";

      // плавний скрол
      candle.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }    