// KODAROS — Premium Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // NAVBAR — RESPONSIVE HIDE/SHOW ON SCROLL
    // ========================================
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.pageYOffset;
    let ticking = false;
    let scrollTimeout;
    let isScrolling = false;

    function handleNavbarScroll() {
        const currentScrollY = window.pageYOffset;
        const scrollDelta = currentScrollY - lastScrollY;
        const scrollDirection = scrollDelta > 0 ? 'down' : 'up';
        const scrollSpeed = Math.abs(scrollDelta);

        // Add/remove scrolled background
        if (currentScrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Responsive hide/show based on scroll direction and speed
        if (scrollDirection === 'down' && currentScrollY > 80 && scrollSpeed > 2) {
            // Scrolling down fast — hide navbar
            navbar.classList.add('hidden');
            navbar.classList.remove('visible');
        } else if (scrollDirection === 'up') {
            // Scrolling up — show navbar immediately
            navbar.classList.remove('hidden');
            navbar.classList.add('visible');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    // Throttled scroll listener for performance
    window.addEventListener('scroll', () => {
        isScrolling = true;
        clearTimeout(scrollTimeout);

        if (!ticking) {
            requestAnimationFrame(handleNavbarScroll);
            ticking = true;
        }

        // Detect scroll stop — show navbar when user stops scrolling
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            navbar.classList.remove('hidden');
            navbar.classList.add('visible');
        }, 150);
    }, { passive: true });

    handleNavbarScroll();

    // ========================================
    // MOBILE MENU TOGGLE
    // ========================================
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');

            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // ========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // SCROLL REVEAL ANIMATION (RESPONSIVE)
    // ========================================
    const revealElements = document.querySelectorAll(
        '.section-header, .software-card, .course-card, .why-card, ' +
        '.testimonial-card, .pillar, .contact-channel, .em-breve-banner'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Staggered reveal based on element index within parent
                const parent = entry.target.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.transitionDelay = `${index * 0.06}s`;
                }
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // ========================================
    // PARALLAX EFFECT FOR HERO
    // ========================================
    const heroVisual = document.querySelector('.hero-visual');

    if (heroVisual && !window.matchMedia('(pointer: coarse)').matches) {
        let heroScrollTicking = false;

        window.addEventListener('scroll', () => {
            if (!heroScrollTicking) {
                requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.12;
                    heroVisual.style.transform = `translateY(${rate}px)`;
                    heroScrollTicking = false;
                });
                heroScrollTicking = true;
            }
        }, { passive: true });
    }

    // ========================================
    // MOUSE PARALLAX FOR HERO ABSTRACT
    // ========================================
    const heroAbstract = document.querySelector('.hero-abstract');

    if (heroAbstract && !window.matchMedia('(pointer: coarse)').matches) {
        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;
        let mouseActive = false;
        let mouseTimeout;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 16;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 16;
            mouseActive = true;

            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                mouseActive = false;
            }, 100);
        });

        function animateHeroParallax() {
            if (mouseActive) {
                currentX += (mouseX - currentX) * 0.06;
                currentY += (mouseY - currentY) * 0.06;
                heroAbstract.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
            requestAnimationFrame(animateHeroParallax);
        }

        animateHeroParallax();
    }

    // ========================================
    // NAVBAR LINK ACTIVE STATE
    // ========================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function setActiveLink() {
        const scrollPos = window.pageYOffset + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    let activeLinkTicking = false;
    window.addEventListener('scroll', () => {
        if (!activeLinkTicking) {
            requestAnimationFrame(() => {
                setActiveLink();
                activeLinkTicking = false;
            });
            activeLinkTicking = true;
        }
    }, { passive: true });

    setActiveLink();
});
