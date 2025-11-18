document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');

    if (header) {
        const toggleHeaderState = () => {
            if (window.scrollY > 10) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        };

        toggleHeaderState();
        window.addEventListener('scroll', toggleHeaderState, { passive: true });
    }

    // ============================================
    // Mobile Menu Functionality
    // ============================================
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const body = document.body;

    if (mobileMenuToggle && mobileMenuOverlay) {
        // Function to close menu
        const closeMenu = () => {
            mobileMenuToggle.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            body.classList.remove('menu-open');
        };

        // Function to open menu
        const openMenu = () => {
            mobileMenuToggle.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            body.classList.add('menu-open');
        };

        // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (mobileMenuOverlay.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close button inside menu
        const closeButton = mobileMenuOverlay.querySelector('.mobile-menu-close');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
            });
        }

        // Close menu when clicking on overlay (outside menu)
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                closeMenu();
            }
        });

        // Close menu when clicking on a menu link
        const mobileMenuLinks = mobileMenuOverlay.querySelectorAll('.mobile-menu-link');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Close menu on window resize (if resizing to desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 480) {
                closeMenu();
            }
        });

        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenuOverlay.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    const container = document.querySelector('.projects-container');

    if (!container) {
        return;
    }

    const cards = Array.from(container.querySelectorAll('.project-card'));

    if (cards.length <= 1) {
        return;
    }

    const computedStyles = getComputedStyle(container);

    // Tweak the CSS variables on `.projects-container` to adjust spacing, duration, and easing.
    const gap = parseFloat(computedStyles.getPropertyValue('--stack-gap')) || 80;
    const scaleStep = parseFloat(computedStyles.getPropertyValue('--card-scale-step')) || 0.05;
    const durationValue = computedStyles.getPropertyValue('--card-transition-duration') || '0.6s';
    const durationMs = durationValue.includes('ms')
        ? parseFloat(durationValue)
        : parseFloat(durationValue) * 1000;

    let isAnimating = false;
    let touchStartY = null;

    container.tabIndex = 0;

    const applyStack = () => {
        cards.forEach((card, index) => {
            const translateY = index * gap;
            const scale = Math.max(1 - index * scaleStep, 0.85);
            const opacity = Math.max(1 - index * 0.15, 0.25);

            card.style.transform = `translateX(-50%) translateY(${translateY}px) scale(${scale})`;
            card.style.zIndex = String(cards.length - index);
            card.style.opacity = opacity.toString();
            card.style.pointerEvents = index === 0 ? 'auto' : 'none';
            card.dataset.stackIndex = String(index);
        });
    };

    const cycle = (direction) => {
        if (isAnimating) {
            return;
        }

        isAnimating = true;

        if (direction === 'forward') {
            const first = cards.shift();
            if (!first) {
                isAnimating = false;
                return;
            }
            cards.push(first);
            container.appendChild(first);
        } else {
            const last = cards.pop();
            if (!last) {
                isAnimating = false;
                return;
            }
            cards.unshift(last);
            container.insertBefore(last, container.firstElementChild);
        }

        requestAnimationFrame(() => {
            applyStack();
            setTimeout(() => {
                isAnimating = false;
            }, durationMs);
        });
    };

    const handleWheel = (event) => {
        event.preventDefault();
        const direction = event.deltaY > 0 ? 'forward' : 'backward';
        cycle(direction);
    };

    const handleKey = (event) => {
        if (event.key === 'ArrowDown' || event.key === 'PageDown') {
            cycle('forward');
        }

        if (event.key === 'ArrowUp' || event.key === 'PageUp') {
            cycle('backward');
        }
    };

    const handleTouchStart = (event) => {
        touchStartY = event.touches[0].clientY;
    };

    const handleTouchMove = (event) => {
        if (touchStartY === null) {
            return;
        }

        const deltaY = touchStartY - event.touches[0].clientY;

        if (Math.abs(deltaY) < 30) {
            return;
        }

        cycle(deltaY > 0 ? 'forward' : 'backward');
        touchStartY = null;
        event.preventDefault();
    };

    applyStack();

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('keydown', handleKey);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
});

