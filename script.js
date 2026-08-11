// KODAROS — Premium Landing Page JavaScript v3.2
// Efeito: Waves infinitas | Scroll contínuo | Bordas sempre fora da tela

document.addEventListener('DOMContentLoaded', function() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    let isTabActive = true;

    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    // ========================================
    // MÓDULO: WAVES CANVAS — VERSÃO FINAL
    // ========================================
    (function initWaves() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let dpr = window.devicePixelRatio || 1;
        let width, height;
        let lines = [];
        let time = 0;
        let animId = null;
        let scrollY = 0;
        let smoothScrollY = 0;

        const mouse = { x: -9999, y: -9999, set: false };

        const config = {
            lineColor: 'rgba(255, 255, 255, 0.10)',
            waveSpeedX: 0.012,
            waveSpeedY: 0.008,
            waveAmpX: 65,
            waveAmpY: 35,
            friction: 0.92,
            tension: 0.008,
            maxCursorMove: 120,
            xGap: 14,
            yGap: 32,
            extraMargin: 200,      // pixels extras fora da tela em cada direção
            scrollSmooth: 0.06     // fator de suavização do scroll
        };

        function resize() {
            dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            initLines();
        }

        function initLines() {
            lines = [];
            // Calcular quantas linhas são necessárias para cobrir a viewport + margens extras
            // As margens extras garantem que as bordas nunca apareçam
            const totalHeight = height + config.extraMargin * 2;
            const totalWidth = width + config.extraMargin * 2;
            const numLines = Math.ceil(totalHeight / config.yGap) + 4;
            const numPoints = Math.ceil(totalWidth / config.xGap) + 4;

            for (let i = 0; i < numLines; i++) {
                const line = [];
                // Posicionar linhas começando ANTES da tela (negativo)
                const baseY = -config.extraMargin + i * config.yGap;
                for (let j = 0; j < numPoints; j++) {
                    // Posicionar pontos começando ANTES da tela (negativo)
                    const baseX = -config.extraMargin + j * config.xGap;
                    line.push({
                        x: baseX,
                        y: baseY,
                        bx: baseX,
                        by: baseY,
                        vx: 0,
                        vy: 0
                    });
                }
                lines.push(line);
            }
        }

        function updateMouse(e) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.set = true;
        }

        function resetMouse() {
            mouse.x = -9999;
            mouse.y = -9999;
            mouse.set = false;
        }

        function animate() {
            if (!isTabActive) {
                animId = requestAnimationFrame(animate);
                return;
            }

            // Suavizar o scroll
            smoothScrollY += (scrollY - smoothScrollY) * config.scrollSmooth;

            time += 1;
            ctx.clearRect(0, 0, width, height);

            // Atualizar e desenhar pontos
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.length < 2) continue;

                ctx.beginPath();

                for (let j = 0; j < line.length; j++) {
                    const p = line[j];

                    // Ondas base
                    const waveX = Math.sin(p.by * 0.004 + time * config.waveSpeedX) * config.waveAmpX
                                  + Math.cos(p.by * 0.0025 + time * config.waveSpeedX * 0.6) * (config.waveAmpX * 0.4);
                    const waveY = Math.cos(p.bx * 0.004 + time * config.waveSpeedY) * config.waveAmpY
                                  + Math.sin(p.bx * 0.0025 + time * config.waveSpeedY * 0.6) * (config.waveAmpY * 0.4);

                    // Interação com mouse
                    let mouseForceX = 0;
                    let mouseForceY = 0;
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - (p.y - smoothScrollY);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < config.maxCursorMove && dist > 0) {
                        const force = (1 - dist / config.maxCursorMove);
                        const angle = Math.atan2(dy, dx);
                        mouseForceX = -Math.cos(angle) * force * config.maxCursorMove * 0.5;
                        mouseForceY = -Math.sin(angle) * force * config.maxCursorMove * 0.5;
                    }

                    // Posição alvo com scroll
                    const targetX = p.bx + waveX + mouseForceX;
                    const targetY = p.by + waveY + mouseForceY;

                    // Física de mola
                    const ax = (targetX - p.x) * config.tension;
                    const ay = (targetY - p.y) * config.tension;

                    p.vx += ax;
                    p.vy += ay;
                    p.vx *= config.friction;
                    p.vy *= config.friction;

                    p.x += p.vx;
                    p.y += p.vy;

                    // Desenhar ponto (aplicando o offset de scroll aqui)
                    const drawX = p.x;
                    const drawY = p.y - smoothScrollY;

                    if (j === 0) {
                        ctx.moveTo(drawX, drawY);
                    } else {
                        const prev = line[j - 1];
                        const prevX = prev.x;
                        const prevY = prev.y - smoothScrollY;
                        const cx = (prevX + drawX) / 2;
                        const cy = (prevY + drawY) / 2;
                        ctx.quadraticCurveTo(prevX, prevY, cx, cy);
                    }
                }

                // Fechar a linha até o último ponto
                const last = line[line.length - 1];
                ctx.lineTo(last.x, last.y - smoothScrollY);

                ctx.strokeStyle = config.lineColor;
                ctx.lineWidth = 1;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            }

            animId = requestAnimationFrame(animate);
        }

        // Scroll handler — atualiza o target do scroll
        window.addEventListener('scroll', () => {
            scrollY = window.pageYOffset;
        }, { passive: true });

        window.addEventListener('resize', resize);

        if (!isTouch) {
            document.addEventListener('mousemove', updateMouse);
            document.addEventListener('mouseleave', resetMouse);
        }

        resize();
        animate();
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
    // MÓDULO: PARALLAX HERO
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
    // MÓDULO: MOUSE PARALLAX HERO
    // ========================================
    (function initHeroMouseParallax() {
        const heroIcon = document.querySelector('.hero-icon-svg');
        if (!heroIcon || isTouch) return;

        let heroMouseX = 0, heroMouseY = 0;
        let currentX = 0, currentY = 0;
        let mouseActive = false;
        let mouseTimeout;

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
                heroIcon.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
            requestAnimationFrame(animateHeroParallax);
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
    // MÓDULO: CURSOR GLOW
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
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    })();
});