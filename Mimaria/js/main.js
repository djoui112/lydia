
  const menuBtn = document.querySelector(".menu")
  const landingText =document.querySelector(".landing-text");
  const landingPic = document.querySelector(".landing-pic");
  const menu = document.querySelector(".main-menu")
  
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle("cancel");
    landingText.classList.toggle('active');
    landingPic.classList.toggle('active');
    menu.classList.toggle('active');
  });
;

        const slider = document.getElementById('slider');
        const cards = Array.from(document.querySelectorAll('.port-card'));
        const originalCards = cards.map(card => card.cloneNode(true));
        const totalCards = cards.length;
        
        let currentIndex = 0;
        let isAnimating = false;

        function setupInfiniteLoop() {
            for (let i = totalCards - 1; i >= 0; i--) {
                const clone = originalCards[i].cloneNode(true);
                slider.insertBefore(clone, slider.firstChild);
            }
            
            for (let i = 0; i < totalCards; i++) {
                const clone = originalCards[i].cloneNode(true);
                slider.appendChild(clone);
            }
            
            // Start at the first real card (after clones)
            currentIndex = totalCards;
        }

        // Update current card styling
        function updateCurrentCard() {
            const allCards = document.querySelectorAll('.port-card');
            const allUserNames = document.querySelectorAll('.user-name');
            const allNumbs = document.querySelectorAll('.numb');
            const allSeeMoreBtns = document.querySelectorAll('.see-more');

            allCards.forEach((card, index) => {
                if (index === currentIndex) {
                    card.classList.add('current');
                    allUserNames[index].classList.add('current');
                    allNumbs[index].classList.add('current');
                    allSeeMoreBtns[index].classList.add('current');
                } else {
                    card.classList.remove('current');
                    allUserNames[index].classList.remove('current');
                    allNumbs[index].classList.remove('current');
                    allSeeMoreBtns[index].classList.remove('current');
                }
            });
        }

        function updateSliderPosition(instant = false) {
            const allCards = document.querySelectorAll('.port-card');
            const wrapper = document.querySelector('.portfolio-slider-wrapper');
            const cardWidth = allCards[0].offsetWidth;
            
            // Get the actual gap from computed style
            const sliderStyle = window.getComputedStyle(slider);
            const gap = parseFloat(sliderStyle.gap) || 32;
            
            // Get the center of the viewport
            const viewportCenter = wrapper.offsetWidth / 2;
            
            // Calculate how much space the current card and all previous cards take
            const totalOffsetToCurrent = currentIndex * (cardWidth + gap);
            
            // Calculate the offset needed to center the current card
            // We want: viewportCenter = totalOffsetToCurrent + (cardWidth / 2)
            const offset = viewportCenter - totalOffsetToCurrent - (cardWidth / 2);
            
            if (instant) {
                slider.style.transition = 'none';
            }
            slider.style.transform = `translateX(${offset}px)`;
            
            if (instant) {
                setTimeout(() => {
                    slider.style.transition = 'transform 0.6s ease';
                }, 50);
            }
        }
        // Handle infinite loop jump
        function checkLoopPosition() {
            if (currentIndex >= totalCards * 2) {
                // Jump back to the first set
                currentIndex = totalCards;
                updateSliderPosition(true);
            } else if (currentIndex < totalCards) {
                // Jump forward to the second set
                currentIndex = totalCards * 2 - 1;
                updateSliderPosition(true);
            }
        }

        // Navigate to next card
        function nextCard() {
            if (isAnimating) return;
            isAnimating = true;
            
            currentIndex++;
            updateCurrentCard();
            updateSliderPosition();
            
            setTimeout(() => {
                checkLoopPosition();
                isAnimating = false;
            }, 600);
        }

        // Navigate to previous card
        function prevCard() {
            if (isAnimating) return;
            isAnimating = true;
            
            currentIndex--;
            updateCurrentCard();
            updateSliderPosition();
            
            setTimeout(() => {
                checkLoopPosition();
                isAnimating = false;
            }, 600);
        }

        // Initialize
        setupInfiniteLoop();
        updateCurrentCard();
        updateSliderPosition(true);

        // Event listeners
        document.getElementById('nextBtn').addEventListener('click', nextCard);
        document.getElementById('prevBtn').addEventListener('click', prevCard);

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateSliderPosition(true);
            }, 200);
        });

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                nextCard();
            } else if (touchEndX - touchStartX > swipeThreshold) {
                prevCard();
            }
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextCard();
            if (e.key === 'ArrowLeft') prevCard();
        });


//main page tracker
        const sections = document.querySelectorAll('section');
        const trackerDots = document.querySelectorAll('.tracker-dot');

        function updateProgressTracker() {
            const scrollPosition = window.scrollY + window.innerHeight / 2;

            sections.forEach((section, index) => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    trackerDots.forEach(dot => dot.classList.remove('active'));
                    trackerDots[index].classList.add('active');
                }
            });
        }

        // Click tracker dots to navigate
        trackerDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                sections[index].scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Update on scroll
        window.addEventListener('scroll', updateProgressTracker);
        updateProgressTracker();