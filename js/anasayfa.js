
document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     MOTIVATION QUOTES
  ====================================================== */

  const quotes = [
    "Küçük adımlar büyük başarılar getirir.",
    "Bugün yaptığın çalışma, yarının başarısına dönüşür.",
    "Odaklan, çalış ve ilerlemeye devam et.",
    "Başlamak için mükemmel zamanı bekleme.",
    "Her Pomodoro seni hedeflerine biraz daha yaklaştırır.",
    "Zamanını yönet, hedeflerine yaklaş.",
    "Bugün dünden daha iyi olmak için güzel bir gün.",
    "Disiplin, motivasyonun olmadığı günlerde devam edebilmektir.",
    "Bir seferde yalnızca bir işe odaklan.",
    "Çalışmaya başlamak, başarmanın ilk adımıdır."
  ];


  const quoteBlock = document.getElementById("quote-block");


  if (quoteBlock) {

    const randomIndex = Math.floor(
      Math.random() * quotes.length
    );

    quoteBlock.textContent = quotes[randomIndex];

  }


  /* =====================================================
     SMOOTH SCROLL
  ====================================================== */

  const scrollLinks = document.querySelectorAll(
    'a[href^="#"]'
  );


  scrollLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });


  /* =====================================================
     HERO TIMER PREVIEW
     Sadece görsel önizleme içindir.
  ====================================================== */

  const playButton = document.querySelector(
    ".timer-control.primary"
  );

  const timerStatus = document.querySelector(
    ".timer-status"
  );

  if (playButton && timerStatus) {

    let running = false;

    playButton.addEventListener("click", () => {

      running = !running;

      if (running) {

        playButton.innerHTML =
          '<i class="bi bi-pause-fill"></i>';

        timerStatus.innerHTML =
          '<span></span> Çalışıyor';

      } else {

        playButton.innerHTML =
          '<i class="bi bi-play-fill"></i>';

        timerStatus.innerHTML =
          '<span></span> Hazır';

      }

    });

  }


  /* =====================================================
     RESET BUTTON
  ====================================================== */

  const resetButton = document.querySelector(
    ".timer-control.secondary"
  );

  if (resetButton) {

    resetButton.addEventListener("click", () => {

      const timer = document.querySelector(
        ".timer-circle strong"
      );

      if (timer) {
        timer.textContent = "25:00";
      }

    });

  }


  /* =====================================================
     CARD REVEAL ANIMATION
  ====================================================== */

  const animatedElements = document.querySelectorAll(
    ".feature-card, .step, .timer-preview"
  );


  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("visible");

          observerInstance.unobserve(entry.target);

        });

      },
      {
        threshold: 0.12
      }
    );


    animatedElements.forEach((element) => {

      element.classList.add("reveal");

      observer.observe(element);

    });

  }

});

