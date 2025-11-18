/**
 * About Us Page - JavaScript
 * Handles scroll progress timeline and section animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Header scroll effect
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
    
    // Get all sections and timeline dots
    const sections = document.querySelectorAll('section[id]');
    const timelineDots = document.querySelectorAll('.timeline-dot');
    
    /**
     * Update the active timeline dot based on scroll position
     */
    function updateTimeline() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            // Find corresponding timeline dot
            const dot = document.querySelector(`.timeline-dot[data-section="${sectionId}"]`);
            
            if (dot && scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                // Remove active class from all dots
                timelineDots.forEach(d => d.classList.remove('active'));
                // Add active class to current dot
                dot.classList.add('active');
            }
        });
        
        // Handle hero section (first section)
        if (window.scrollY < window.innerHeight / 2) {
            timelineDots.forEach(d => d.classList.remove('active'));
            const heroDot = document.querySelector('.timeline-dot[data-section="hero"]');
            if (heroDot) heroDot.classList.add('active');
        }
    }
    
    /**
     * Handle scroll animations for sections
     * Elements fade in when they come into view
     */
    function handleScrollAnimations() {
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
        
        // Observe about section
        const aboutSection = document.querySelector('.about-section');
        if (aboutSection) {
            observer.observe(aboutSection);
        }
        
        // Observe feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            observer.observe(card);
            // Add staggered delay for animation
            card.style.transitionDelay = `${index * 0.1}s`;
        });
        
        // Observe review cards
        const reviewCards = document.querySelectorAll('.review-card');
        reviewCards.forEach((card, index) => {
            observer.observe(card);
            // Add staggered delay for animation
            card.style.transitionDelay = `${index * 0.1}s`;
        });
        
        // Observe agencies section
        const agenciesSection = document.querySelector('.agencies-section');
        if (agenciesSection) {
            observer.observe(agenciesSection);
        }
        
        // Function to setup mobile animations for agency logos
        function setupMobileLogoAnimations() {
            const agencyLogos = document.querySelectorAll('.agency-logo');
            const isMobile = window.innerWidth <= 768;
            
            agencyLogos.forEach((logo, index) => {
                if (isMobile) {
                    // Clear visible class to reset animation state (allows re-animation)
                    const wasVisible = logo.classList.contains('visible');
                    logo.classList.remove('visible');
                    
                    // Set transition delay for staggered animation
                    logo.style.transitionDelay = `${index * 0.1}s`;
                    
                    // If it was already visible, trigger reflow to reset animation
                    if (wasVisible) {
                        void logo.offsetWidth; // Force reflow
                    }
                    
                    // Observe logo for intersection
                    observer.observe(logo);
                } else {
                    // Reset for desktop - remove mobile animation styles and classes
                    logo.classList.remove('visible');
                    logo.style.transitionDelay = '';
                    // Don't observe on desktop
                    try {
                        observer.unobserve(logo);
                    } catch (e) {
                        // Logo might not be observed yet, that's okay
                    }
                }
            });
        }
        
        // Initialize mobile logo animations
        setupMobileLogoAnimations();
        
        // Handle window resize to re-initialize animations if needed
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setupMobileLogoAnimations();
            }, 250);
        });
        
        // Observe portfolio cards
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        portfolioCards.forEach((card, index) => {
            card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(card);
            // Add staggered delay for animation
            card.style.transitionDelay = `${index * 0.15}s`;
        });
        
        // Observe portfolios section
        const portfoliosSection = document.querySelector('.portfolios-section');
        if (portfoliosSection) {
            observer.observe(portfoliosSection);
        }
    }
    
    /**
     * Smooth scroll to section when timeline dot is clicked
     */
    function setupTimelineNavigation() {
        timelineDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const sectionId = dot.getAttribute('data-section');
                const section = document.getElementById(sectionId);
                
                if (section) {
                    const offsetTop = section.offsetTop - 80; // Account for any header
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    /**
     * Add hover effect to timeline dots
     */
    function setupTimelineHover() {
        timelineDots.forEach(dot => {
            dot.addEventListener('mouseenter', () => {
                if (!dot.classList.contains('active')) {
                    dot.style.transform = 'scale(1.2)';
                    dot.style.borderColor = '#A00000';
                }
            });
            
            dot.addEventListener('mouseleave', () => {
                if (!dot.classList.contains('active')) {
                    dot.style.transform = 'scale(1)';
                    dot.style.borderColor = '#8B0000';
                }
            });
        });
    }
    
    /**
     * Initialize all functionality
     */
    function init() {
        // Set initial timeline state
        updateTimeline();
        
        // Setup scroll listeners
        window.addEventListener('scroll', () => {
            updateTimeline();
        }, { passive: true });
        
        // Setup scroll animations
        handleScrollAnimations();
        
        // Setup timeline navigation
        setupTimelineNavigation();
        
        // Setup timeline hover effects
        setupTimelineHover();
    }
    
    // Initialize when DOM is ready
    init();
    
    /**
     * Portfolio Carousel Functionality
     */
    function initPortfolioCarousel() {
        const carousel = document.getElementById('portfoliosCarousel');
        const slides = document.querySelectorAll('.portfolio-slide');
        const dots = document.querySelectorAll('.portfolio-scroll-indicator .scroll-dot');
        let currentSlide = 0;
        const totalSlides = slides.length;
        
        // Update active dot
        function updateDots(activeIndex) {
            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Go to specific slide
        function goToSlide(slideIndex) {
            if (slideIndex < 0) slideIndex = 0;
            if (slideIndex >= totalSlides) slideIndex = totalSlides - 1;
            
            currentSlide = slideIndex;
            const translateX = -currentSlide * 100;
            carousel.style.transform = `translateX(${translateX}%)`;
            updateDots(currentSlide);
        }
        
        // Setup dot click handlers
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
        });
        
        // Auto-play carousel (optional - can be disabled)
        let autoPlayInterval;
        function startAutoPlay() {
            autoPlayInterval = setInterval(() => {
                currentSlide = (currentSlide + 1) % totalSlides;
                goToSlide(currentSlide);
            }, 5000); // Change slide every 5 seconds
        }
        
        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
            }
        }
        
        // Pause autoplay on hover
        const carouselWrapper = document.querySelector('.portfolio-carousel-wrapper');
        if (carouselWrapper) {
            carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
            carouselWrapper.addEventListener('mouseleave', startAutoPlay);
        }
        
        // Initialize
        updateDots(0);
        // Uncomment the line below if you want auto-play
        // startAutoPlay();
    }
    
    // Initialize portfolio carousel
    initPortfolioCarousel();
});

