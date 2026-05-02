    // ============================================
    // Конфіг EmailJS
    // ============================================
    const EMAILJS_PUBLIC_KEY  = "8yPj0R0j8kKZJis61";
    const EMAILJS_SERVICE_ID  = "service_m7gn0er";
    const EMAILJS_TEMPLATE_ID = "template_xsxh01p";
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

    const form    = document.getElementById("contactForm");
    const success = document.getElementById("contactSuccess");
    const errorEl = document.getElementById("formError");

    function t(key, fallback) {
      try {
        const lang = document.documentElement.getAttribute("lang") || "uk";
        const dict = (window.translationsCache && window.translationsCache[lang]) || {};
        return dict[key] || fallback;
      } catch (e) { return fallback; }
    }

    // Безпечне зчитування значення поля. Не падає, якщо
    // елемента раптом немає в DOM.
    function fieldValue(formEl, name) {
      const el = formEl.querySelector(`[name="${name}"]`);
      return el ? (el.value || "").trim() : "";
    }

    // ============================================
    // Отримання IP клієнта через зовнішній сервіс
    // ============================================
    async function fetchClientIP() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch("https://ipapi.co/json/", {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) return null;

        const data = await res.json();
        return data.ip || null;

      } catch (err) {
        console.warn("[IP] could not fetch client IP:", err.message);
        return null;
      }
    }

    async function sendToSupabase(record) {
      if (!window.supabaseClient) {
        throw new Error("Supabase client not initialised");
      }
      const { error } = await window.supabaseClient
        .from("memories")
        .insert(record);
      if (error) throw error;
      return "supabase-ok";
    }

    async function sendToEmailJS(formValues) {
      const templateParams = {
        name:     formValues.name,
        category: formValues.category || "—",
        email:    formValues.email    || "—",
        message:  formValues.message,
        ip:       formValues.ip       || "—"
      };
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      return "emailjs-ok";
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Honeypot
        const botField = form.querySelector('[name="bot-field"]');
        if (botField && botField.value) {
          form.style.display = "none";
          success.classList.add("is-visible");
          return;
        }

        const submitBtn    = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.disabled    = true;
        submitBtn.textContent = t("contact_sending", "Надсилаємо...");
        errorEl.textContent   = "";
        errorEl.classList.remove("is-visible");

        // Збираємо значення через querySelector замість form.X.value —
        // не залежить від колізій імен (наприклад, якщо EmailJS чи інший
        // скрипт додасть на сторінку прихований інпут з name="email").
        const formValues = {
          name:     fieldValue(form, "name"),
          category: fieldValue(form, "category") || "other",
          email:    fieldValue(form, "email"),
          message:  fieldValue(form, "message")
        };

        // IP — не критичний, не блокує відправку
        const clientIP = await fetchClientIP();
        formValues.ip = clientIP;

        const author_uk = formValues.relation
          ? `${formValues.name}, ${formValues.relation}`
          : formValues.name;

        const supabaseRecord = {
          author_uk,
          text_uk:    formValues.message,
          category:   formValues.category,
          email:      formValues.email || null,
          ip:         clientIP,
          user_agent: navigator.userAgent
        };

        const results = await Promise.allSettled([
          sendToSupabase(supabaseRecord),
          sendToEmailJS(formValues)
        ]);

        results.forEach((r, i) => {
          const channel = i === 0 ? "Supabase" : "EmailJS";
          if (r.status === "fulfilled") {
            console.log(`[${channel}] OK`);
          } else {
            console.error(`[${channel}] FAILED:`, r.reason);
          }
        });

        const anySucceeded = results.some(r => r.status === "fulfilled");

        if (anySucceeded) {
          form.style.display = "none";
          success.classList.add("is-visible");
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          errorEl.textContent = t(
            "contact_error",
            "Не вдалося надіслати повідомлення. Перевірте з'єднання та спробуйте ще раз."
          );
          errorEl.classList.add("is-visible");

          submitBtn.disabled    = false;
          submitBtn.textContent = originalText;
        }
      });
    }
