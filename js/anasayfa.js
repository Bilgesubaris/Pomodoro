document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById('lucky-button');
    const effect = document.getElementById('cursor-effect');

    if (effect) {
        // Şekil türleri
        const shapes = ['star', 'heart', 'triangle', 'diamond', 'circle'];
        const colors = [
            "#ff69b4", "#ffb347", "#7ec8e3", "#77dd77", "#f49ac2",
            "#fdfd96", "#b39eb5", "#ff6961", "#aec6cf", "#cfcfc4",
            "#c23b22", "#03c03c", "#779ecb", "#966fd6", "#fcb900",
            "#fd5e53", "#b19cd9", "#ffb347", "#e0bbff", "#baffc9"
        ];
        
        // 3 sıra için farklı radius'lar
        const circles = [
            { radius: 150, count: 8, speed: 0.001 },
            { radius: 200, count: 12, speed: 0.0015 },
            { radius: 250, count: 16, speed: 0.002 }
        ];
        
        let particles = [];

        // Her sıra için parçacıkları oluştur
        circles.forEach((circle, circleIndex) => {
            for (let i = 0; i < circle.count; i++) {
                const particle = document.createElement('div');
                particle.className = 'shape-particle';
                particle.dataset.shape = shapes[i % shapes.length];
                particle.dataset.circle = circleIndex;
                particle.dataset.index = i;
                particle.style.background = colors[i % colors.length];
                effect.appendChild(particle);
                particles.push(particle);
            }
        });

        let animationId;
        function animateParticles() {
            const now = Date.now();
            particles.forEach((particle) => {
                const circleIndex = parseInt(particle.dataset.circle);
                const index = parseInt(particle.dataset.index);
                const circle = circles[circleIndex];
                
                // Her sıra için farklı hız ve açı
                const baseAngle = (index / circle.count) * 2 * Math.PI;
                const angle = baseAngle + now * circle.speed;
                const x = Math.cos(angle) * circle.radius;
                const y = Math.sin(angle) * circle.radius;
                
                particle.style.transform = `translate(${x}px, ${y}px) rotate(${now * 0.002}deg)`;
            });
            animationId = requestAnimationFrame(animateParticles);
        }

        // Hover başlat
        button.addEventListener('mouseenter', () => {
            particles.forEach(particle => {
                particle.style.opacity = '1';
            });
            animateParticles();
        });

        // Hover çıkınca temizle
        button.addEventListener('mouseleave', () => {
            particles.forEach(particle => {
                particle.style.opacity = '0';
            });
            cancelAnimationFrame(animationId);
        });

        // Tıklama fonksiyonu
        button.addEventListener('click', () => {
            // Tıklama animasyonu
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);

            // Mesaj göster
            const message = document.createElement('div');
            message.className = 'click-message';
            message.textContent = 'Sayfaya yönlendiriliyorsunuz...';
            document.body.appendChild(message);

            // Mesajı 1 saniye sonra kaldır ve yönlendir
            setTimeout(() => {
                message.remove();
                window.location.href = 'giris.html';
            }, 1000);

            // Ekstra parçacık efekti
            createClickEffect();
        });

        // Tıklama efekti
        function createClickEffect() {
            for (let i = 0; i < 8; i++) {
                const clickParticle = document.createElement('div');
                clickParticle.className = 'click-particle';
                clickParticle.style.background = colors[Math.floor(Math.random() * colors.length)];
                clickParticle.style.left = '50%';
                clickParticle.style.top = '50%';
                effect.appendChild(clickParticle);

                // Rastgele yöne fırlat
                const angle = (Math.PI * 2 * i) / 8;
                const distance = 100 + Math.random() * 50;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                setTimeout(() => {
                    clickParticle.style.transform = `translate(${x}px, ${y}px)`;
                    clickParticle.style.opacity = '0';
                }, 10);

                // Parçacığı temizle
                setTimeout(() => {
                    clickParticle.remove();
                }, 1000);
            }
        }

        // Motive cümleler
        const fortunes = [
          "Başlamak için mükemmel olmanı bekleme, mükemmel olmak için başla.",
          "Her gün bir adım daha ileri!",
          "Odaklan, nefes al, devam et.",
          "Başarı, küçük adımların toplamıdır.",
          "Bugün, yeni bir başlangıç için harika bir gün.",
          "Kendine inan, yapabilirsin!",
          "Zorluklar, büyümenin anahtarıdır.",
          "Her Pomodoro seni hedefe yaklaştırır.",
          "Vazgeçme, mola ver ve tekrar dene.",
          "Sen harikasın, devam et!"
        ];

        const emojis = ["🥠", "🌟", "💡", "🍀", "🔥", "🚀", "🎯", "🌈", "✨", "🧠"];

        const motivationBtn = document.getElementById('motivation-btn');
        const fortuneCard = document.getElementById('fortune-card');

        // Modal açıldığında fortune-card'a motivasyon mesajı ekle
        const motivationModal = document.getElementById('motivationModal');
        if (motivationModal) {
          motivationModal.addEventListener('show.bs.modal', () => {
            if (fortuneCard) {
              const random = Math.floor(Math.random() * fortunes.length);
              const emoji = emojis[random % emojis.length];
              fortuneCard.innerHTML = `<span class="fortune-card-emoji">${emoji}</span><span class="fortune-card-text">${fortunes[random]}</span>`;
              fortuneCard.classList.remove('fortune-pop');
              void fortuneCard.offsetWidth;
              fortuneCard.classList.add('fortune-pop');
            }
          });
        }
        // motivationBtn click eventinden fortuneCard güncellemesini kaldır
        if (motivationBtn) {
          motivationBtn.replaceWith(motivationBtn.cloneNode(true));
        }

        // İlham verici sözler için
        const quotes = [
          '"Odaklanmak, başarının anahtarıdır."',
          '"Başlamak için mükemmel olmanı bekleme, mükemmel olmak için başla."',
          '"Her gün bir adım daha ileri!"',
          '"Küçük adımlar büyük başarılar getirir."',
          '"Zamanını iyi yönet, hayatını iyi yönet."',
          '"Bugün, yeni bir başlangıç için harika bir gün."',
          '"Kendine inan, yapabilirsin!"',
          '"Her Pomodoro seni hedefe yaklaştırır."',
          '"Vazgeçme, mola ver ve tekrar dene."',
          '"Sen harikasın, devam et!"'
        ];
        const quoteBlock = document.getElementById('quote-block');
        if (quoteBlock) {
          const random = Math.floor(Math.random() * quotes.length);
          quoteBlock.innerHTML = quotes[random];
        }
    }
});

// Welcome animation splash screen kaldırma
window.addEventListener('DOMContentLoaded', function() {
  const welcome = document.getElementById('welcomeAnimation');
  const btn = document.getElementById('getStartedBtn');
  if (welcome) {
    setTimeout(() => {
      welcome.style.display = 'none';
      document.body.style.overflow = '';
    }, 7000); // animasyon + fadeout için 7sn
    if (btn) {
      btn.addEventListener('click', function() {
        welcome.style.display = 'none';
        document.body.style.overflow = '';
      });
    }
  }
});