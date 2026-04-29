    const btn = document.getElementById("lightCandleBtn");
    const candle = document.getElementById("candleContainer");

    if (btn && candle) {
      btn.addEventListener("click", () => {
        btn.style.opacity = "0.5";
        candle.classList.add("is-visible");

        // плавний скрол до свічки
        candle.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    function lightCandle() {
      document.querySelector('.scene').classList.add('lit');
    }