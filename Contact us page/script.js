/**
 * Contact Us Page - JavaScript
 * Handles scroll animations, header effects, and button interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // Header Scroll Effect
    // ============================================
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

    // ============================================
    // Scroll Animation for Elements
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe contact header
    const contactHeader = document.querySelector('.contact-header');
    if (contactHeader) {
        observer.observe(contactHeader);
    }

    // Observe contact cards with staggered delay
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach((card, index) => {
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe right side image
    const contactRight = document.querySelector('.contact-right');
    if (contactRight) {
        contactRight.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(contactRight);
    }

    // ============================================
    // Button Click Handlers
    // ============================================
    const contactButtons = document.querySelectorAll('.contact-card-btn');
    
    contactButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const card = button.closest('.contact-card');
            const title = card.querySelector('.contact-card-title').textContent;
            const subtitle = card.querySelector('.contact-card-subtitle').textContent;
            
            // Handle different contact methods
            switch(title) {
                case 'Instagram':
                    window.open(`https://instagram.com/${subtitle}`, '_blank');
                    break;
                case 'Email':
                    window.location.href = `mailto:${subtitle}`;
                    break;
                case 'LinkedIn':
                    window.open(`https://linkedin.com/company/${subtitle}`, '_blank');
                    break;
                case 'WhatsApp':
                    window.open(`https://wa.me/${subtitle.replace(/[^0-9]/g, '')}`, '_blank');
                    break;
                default:
                    console.log(`Contact: ${title} - ${subtitle}`);
            }
        });
    });

    // ============================================
    // Card Hover Effects Enhancement
    // ============================================
    contactCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'all 0.3s ease';
        });
    });
});

