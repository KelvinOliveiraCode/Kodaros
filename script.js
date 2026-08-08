// KODAROS — Premium Landing Page JavaScript v2.2
// Correções: Page Visibility API, HiDPI Canvas, Shadowing, Modularização

document.addEventListener('DOMContentLoaded', function() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    let isTabActive = true;

    // ========================================
    // PAGE VISIBILITY API — Controle global de rAF
    // ========================================
    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    // ========================================
    // MÓDULO: PARTICLE CANVAS (com HiDPI)
    // ========================================
    (function initParticles() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = 0, mouseY = 0;
        let dpr = window.devicePixelRatio || 1;
        let animId = null;

        function resizeCanvas() {
            dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.3 + 0.1;
                this.pulse = Math.random() * Math.PI * 2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.pulse += 0.02;

                if (!isTouch) {
                    const dx = mouseX - this.x;
                    const dy = mouseY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const force = (150 - dist) / 150;
                        this.x -= dx * force * 0.01;
                        this.y -= dy * force * 0.01;
                    }
                }

                if (this.x < 0 || this.x > window.innerWidth || this.y < 0 || this.y > window.innerHeight) {
                    this.reset();
                }
            }
            draw() {
                const pulseOpacity = this.opacity + Math.sin(this.pulse) * 0.1;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, pulseOpacity)})`;
                ctx.fill();
            }
        }

        const particleCount = isTouch ? 30 : 60;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const opacity = (1 - dist / 120) * 0.06;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            if (!isTabActive) {
                animId = requestAnimationFrame(animateParticles);
                return;
            }
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            animId = requestAnimationFrame(animateParticles);
        }

        animateParticles();

        if (!isTouch) {
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
        }
    })();

    // ========================================
    // MÓDULO: NAVBAR
    // ========================================
    (function initNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        let lastScrollY = window.pageYOffset;
        let ticking = false;
        let scrollTimeout;

        function handleNavbarScroll() {
            const currentScrollY = window.pageYOffset;
            const scrollDelta = currentScrollY - lastScrollY;
            const scrollDirection = scrollDelta > 0 ? 'down' : 'up';
            const scrollSpeed = Math.abs(scrollDelta);

            if (currentScrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            if (scrollDirection === 'down' && currentScrollY > 80 && scrollSpeed > 2) {
                navbar.classList.add('hidden');
                navbar.classList.remove('visible');
            } else if (scrollDirection === 'up') {
                navbar.classList.remove('hidden');
                navbar.classList.add('visible');
            }

            lastScrollY = currentScrollY;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            if (!ticking) {
                requestAnimationFrame(handleNavbarScroll);
                ticking = true;
            }
            scrollTimeout = setTimeout(() => {
                navbar.classList.remove('hidden');
                navbar.classList.add('visible');
            }, 150);
        }, { passive: true });

        handleNavbarScroll();

        // Mobile menu
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                const spans = navToggle.querySelectorAll('span');
                if (navMenu.classList.contains('active')) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
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
    })();

    // ========================================
    // MÓDULO: SMOOTH SCROLL
    // ========================================
    (function initSmoothScroll() {
        const navbar = document.getElementById('navbar');
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const navHeight = navbar ? navbar.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });
    })();

    // ========================================
    // MÓDULO: SCROLL REVEAL
    // ========================================
    (function initScrollReveal() {
        const revealElements = document.querySelectorAll(
            '.section-header, .pillar, .why-card, ' +
            '.testimonial-card, .contact-channel, .em-breve-banner, .ebooks-cta, .legal-section'
        );

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const parent = entry.target.parentElement;
                    if (parent) {
                        const siblings = Array.from(parent.children).filter(
                            child => child.classList.contains('pillar') ||
                                     child.classList.contains('why-card') ||
                                     child.classList.contains('testimonial-card') ||
                                     child.classList.contains('contact-channel') ||
                                     child.classList.contains('legal-section') ||
                                     child.classList.contains('em-breve-banner') ||
                                     child.classList.contains('ebooks-cta')
                        );
                        const index = siblings.indexOf(entry.target);
                        entry.target.style.transitionDelay = `${index * 0.08}s`;
                    }
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            el.classList.add('reveal');
            revealObserver.observe(el);
        });
    })();

    // ========================================
    // MÓDULO: PARALLAX HERO (com rAF controlado)
    // ========================================
    (function initHeroParallax() {
        const heroVisual = document.querySelector('.hero-visual');
        if (!heroVisual || isTouch) return;

        let heroScrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!heroScrollTicking) {
                requestAnimationFrame(() => {
                    if (!isTabActive) return;
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.1;
                    heroVisual.style.transform = `translateY(${rate}px)`;
                    heroScrollTicking = false;
                });
                heroScrollTicking = true;
            }
        }, { passive: true });
    })();

    // ========================================
    // MÓDULO: MOUSE PARALLAX HERO (shadowing corrigido)
    // ========================================
    (function initHeroMouseParallax() {
        const heroAbstract = document.querySelector('.hero-abstract');
        if (!heroAbstract || isTouch) return;

        let heroMouseX = 0, heroMouseY = 0;
        let currentX = 0, currentY = 0;
        let mouseActive = false;
        let mouseTimeout;
        let animId = null;

        document.addEventListener('mousemove', (e) => {
            heroMouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            heroMouseY = (e.clientY / window.innerHeight - 0.5) * 20;
            mouseActive = true;
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => { mouseActive = false; }, 100);
        });

        function animateHeroParallax() {
            if (isTabActive && mouseActive) {
                currentX += (heroMouseX - currentX) * 0.05;
                currentY += (heroMouseY - currentY) * 0.05;
                heroAbstract.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
            animId = requestAnimationFrame(animateHeroParallax);
        }
        animateHeroParallax();
    })();

    // ========================================
    // MÓDULO: 3D TILT EFFECT
    // ========================================
    (function initTilt() {
        if (isTouch) return;
        const tiltElements = document.querySelectorAll('[data-tilt]');

        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / centerY * -8;
                const rotateY = (x - centerX) / centerX * 8;

                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
                el.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
            });

            el.addEventListener('mouseenter', () => {
                el.style.transition = 'transform 0.1s ease';
            });
        });
    })();

    // ========================================
    // MÓDULO: NAVBAR ACTIVE LINKS
    // ========================================
    (function initActiveLinks() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        function setActiveLink() {
            const scrollPos = window.pageYOffset + 250;
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
    })();

    // ========================================
    // MÓDULO: MAGNETIC BUTTONS
    // ========================================
    (function initMagnetic() {
        if (isTouch) return;
        const magneticBtns = document.querySelectorAll('.btn, .nav-cta');

        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
                btn.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease, box-shadow 0.3s ease';
            });

            btn.addEventListener('mouseenter', () => {
                btn.style.transition = 'transform 0.1s ease, background 0.3s ease, box-shadow 0.3s ease';
            });
        });
    })();

    // ========================================
    // MÓDULO: CURSOR GLOW (com visibility control)
    // ========================================
    (function initCursorGlow() {
        if (isTouch) return;

        const cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        cursorGlow.style.cssText = `
            position: fixed;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.015), transparent 70%);
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s ease;
            opacity: 0;
        `;
        document.body.appendChild(cursorGlow);

        let glowX = 0, glowY = 0;
        let currentGlowX = 0, currentGlowY = 0;
        let mouseInWindow = false;
        let animId = null;

        document.addEventListener('mousemove', (e) => {
            glowX = e.clientX;
            glowY = e.clientY;
            mouseInWindow = true;
            cursorGlow.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            mouseInWindow = false;
            cursorGlow.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            mouseInWindow = true;
        });

        function animateGlow() {
            if (isTabActive && mouseInWindow) {
                currentGlowX += (glowX - currentGlowX) * 0.08;
                currentGlowY += (glowY - currentGlowY) * 0.08;
                cursorGlow.style.left = currentGlowX + 'px';
                cursorGlow.style.top = currentGlowY + 'px';
            }
            animId = requestAnimationFrame(animateGlow);
        }
        animateGlow();
    })();
});
