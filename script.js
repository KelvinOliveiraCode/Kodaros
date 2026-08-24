// KODAROS — Premium Landing Page JavaScript v3.2
// Efeito: Waves infinitas | Scroll contínuo | Bordas sempre fora da tela

document.addEventListener('DOMContentLoaded', function() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    let isTabActive = true;

    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    // ========================================
    // MÓDULO: GALÁXIA — FUNDO ANIMADO
    // Estrelas com brilho pulsante, nebulosas coloridas,
    // espiral galáctica girando lentamente e estrelas cadentes.
    // ========================================
    (function initGalaxy() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let dpr = window.devicePixelRatio || 1;
        let width = 0;
        let height = 0;
        let stars = [];
        let nebulas = [];
        let shootingStars = [];
        let planets = [];
        let time = 0;
        let nextShootingStar = 400;
        let animId = null;

        const galaxyCenter = { x: 0.72, y: 0.30 };
        const mouse = { x: 0, y: 0, tx: 0, ty: 0, cx: 0, cy: 0 };
        const palette = ['#ffffff', '#c7d2fe', '#a5b4fc', '#bfdbfe', '#f0abfc', '#fde68a'];

        function rand(min, max) {
            return min + Math.random() * (max - min);
        }

        function createStars() {
            stars = [];
            const cx = width * galaxyCenter.x;
            const cy = height * galaxyCenter.y;

            // Estrelas de fundo espalhadas por toda a tela
            const bgCount = Math.round((width * height) / 8500);
            for (let i = 0; i < bgCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: rand(0.3, 1.4),
                    twinkle: rand(0.4, 2.0),
                    phase: rand(0, Math.PI * 2),
                    color: palette[(Math.random() * palette.length) | 0],
                    galaxy: false
                });
            }

            // Estrelas concentradas na espiral da galáxia
            const spiralCount = Math.round((width * height) / 15000);
            const arms = 2;
            const maxR = Math.min(width, height) * 0.42;
            for (let i = 0; i < spiralCount; i++) {
                const arm = i % arms;
                const angle = arm * Math.PI + i * 0.22;
                const radius = Math.pow(Math.random(), 0.6) * maxR;
                const a = angle + radius * 0.006;
                const spread = rand(0.4, 1.6) * maxR * 0.06;
                const r = radius + (Math.random() - 0.5) * spread;
                stars.push({
                    x: cx + Math.cos(a) * r,
                    y: cy + Math.sin(a) * r * 0.62,
                    size: rand(0.5, 2.1),
                    twinkle: rand(0.3, 1.6),
                    phase: rand(0, Math.PI * 2),
                    color: palette[(Math.random() * palette.length) | 0],
                    galaxy: true,
                    arm
                });
            }
        }

        function createNebulas() {
            nebulas = [];
            const defs = [
                { color: '124, 58, 237', alpha: 0.15 },
                { color: '34, 211, 238', alpha: 0.10 },
                { color: '236, 72, 153', alpha: 0.10 },
                { color: '99, 102, 241', alpha: 0.11 }
            ];
            const count = 6;
            for (let i = 0; i < count; i++) {
                const def = defs[i % defs.length];
                nebulas.push({
                    x: rand(0, width),
                    y: rand(0, height),
                    radius: rand(Math.min(width, height) * 0.28, Math.min(width, height) * 0.55),
                    color: def.color,
                    alpha: def.alpha,
                    pulse: rand(0.10, 0.30),
                    phase: rand(0, Math.PI * 2)
                });
            }
        }

        function drawNebulas() {
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < nebulas.length; i++) {
                const n = nebulas[i];
                const pulse = 0.72 + 0.28 * Math.sin(time * n.pulse * 0.02 + n.phase);
                const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
                grad.addColorStop(0, `rgba(${n.color}, ${(n.alpha * pulse).toFixed(3)})`);
                grad.addColorStop(1, `rgba(${n.color}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawStars() {
            const cx = width * galaxyCenter.x;
            const cy = height * galaxyCenter.y;
            const offX = mouse.x * 0.35;
            const offY = mouse.y * 0.35;
            const rotation = time * 0.00011;
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                const twinkle = 0.55 + 0.45 * Math.sin(time * 0.03 * s.twinkle + s.phase);

                let x = s.x;
                let y = s.y;
                if (s.galaxy) {
                    const dx = s.x - cx;
                    const dy = s.y - cy;
                    x = cx + dx * cos - dy * sin;
                    y = cy + dx * sin + dy * cos;
                }

                ctx.globalAlpha = Math.min(1, twinkle * 0.85 + 0.15);
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(x + offX, y + offY, s.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        function spawnShootingStar() {
            shootingStars.push({
                x: rand(width * 0.1, width * 0.9),
                y: rand(0, height * 0.35),
                vx: rand(3.5, 6.5),
                vy: rand(2.4, 4.2),
                life: 1,
                decay: rand(0.008, 0.016),
                length: rand(60, 130)
            });
        }

        function drawShootingStars() {
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const s = shootingStars[i];
                s.x += s.vx;
                s.y += s.vy;
                s.life -= s.decay;
                if (s.life <= 0) {
                    shootingStars.splice(i, 1);
                    continue;
                }
                const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 5, s.y - s.vy * 5);
                grad.addColorStop(0, `rgba(255, 255, 255, ${(s.life * 0.9).toFixed(3)})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.vx * 5, s.y - s.vy * 5);
                ctx.stroke();
            }
        }

        function createPlanets() {
            planets = [];
            const defs = [
                { color: '#8B5CF6', light: '#C4B5FD', ring: 'rgba(139,92,246,0.55)', dist: 220, size: 24, speed: 0.0007 },
                { color: '#22D3EE', light: '#A5F3FC', ring: 'rgba(34,211,238,0.55)', dist: 330, size: 16, speed: -0.0005 },
                { color: '#F472B6', light: '#FBCFE8', ring: 'rgba(236,72,153,0.55)', dist: 150, size: 30, speed: 0.0010 },
                { color: '#FFFFFF', light: '#FFFFFF', ring: 'rgba(255,255,255,0.40)', dist: 450, size: 12, speed: 0.00035 }
            ];
            for (const d of defs) {
                planets.push({ angle: Math.random() * Math.PI * 2, dist: d.dist, size: d.size, speed: d.speed, color: d.color, light: d.light, ring: d.ring, near: 0 });
            }
        }

        function drawPlanets() {
            const cx = width * galaxyCenter.x;
            const cy = height * galaxyCenter.y;
            for (const p of planets) {
                p.angle += p.speed;
                const ox = cx + Math.cos(p.angle) * p.dist;
                const oy = cy + Math.sin(p.angle) * p.dist * 0.62;
                let ix = ox, iy = oy, near = 0;
                if (mouse.cx) {
                    const dx = mouse.cx - ox, dy = mouse.cy - oy;
                    const d = Math.hypot(dx, dy);
                    const inf = Math.max(0, 1 - d / 340);
                    ix = ox + dx * inf * 0.4; iy = oy + dy * inf * 0.4; near = inf;
                }
                if (near > 0.03) {
                    ctx.strokeStyle = `rgba(255,255,255,${(near * 0.35).toFixed(3)})`;
                    ctx.lineWidth = 1; ctx.beginPath();
                    ctx.moveTo(ix, iy); ctx.lineTo(mouse.cx, mouse.cy); ctx.stroke();
                }
                const g = ctx.createRadialGradient(ix - p.size * 0.3, iy - p.size * 0.3, p.size * 0.1, ix, iy, p.size);
                g.addColorStop(0, p.light); g.addColorStop(1, p.color);
                ctx.globalAlpha = 0.95; ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(ix, iy, p.size, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 0.5; ctx.strokeStyle = p.ring; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.ellipse(ix, iy, p.size * 1.5, p.size * 0.5, p.angle, 0, Math.PI * 2); ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }

        function resize() {
            dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            createStars();
            createNebulas();
            createPlanets();
        }

        function updateMouse(e) {
            mouse.tx = (e.clientX / window.innerWidth - 0.5) * 60;
            mouse.ty = (e.clientY / window.innerHeight - 0.5) * 60;
            mouse.cx = e.clientX;
            mouse.cy = e.clientY;
        }

        function animate() {
            if (isTabActive) {
                time += 1;
                mouse.x += (mouse.tx - mouse.x) * 0.05;
                mouse.y += (mouse.ty - mouse.y) * 0.05;

                if (time > nextShootingStar) {
                    spawnShootingStar();
                    if (Math.random() < 0.4) spawnShootingStar();
                    nextShootingStar = time + rand(120, 340);
                }

                ctx.clearRect(0, 0, width, height);
                drawNebulas();
                drawShootingStars();
                drawStars();
                drawPlanets();
            }
            animId = requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);

        if (!isTouch) {
            document.addEventListener('mousemove', updateMouse);
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
        // Os cards do carrossel de produtos ficam fora da tela (translateX)
        // e nunca intersectariam — por isso ficam de fora do reveal.
        const revealElements = document.querySelectorAll(
            '.section-header, .pillar, .why-card, ' +
            '.testimonial-card, .contact-channel, .legal-section, ' +
            '.quiz-benefit, .quiz-promo-visual'
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
                                     child.classList.contains('quiz-benefit')
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
            background: radial-gradient(circle, rgba(139, 92, 246, 0.07), transparent 70%);
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

/* ===== FILTRO DE CLASSES — CATÁLOGO DE E-BOOKS ===== */
const ebookFilter = document.getElementById('ebook-filter');
const ebookCards = document.querySelectorAll('#ebooks-modal .ebook-card');

function aplicarFiltroEbooks(f) {
    ebookCards.forEach(card => {
        const match = (f === 'all') || (card.dataset.class === f);
        card.classList.toggle('hide', !match);
    });
}

if (ebookFilter) {
    ebookFilter.querySelectorAll('.ebook-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            ebookFilter.querySelectorAll('.ebook-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aplicarFiltroEbooks(btn.dataset.filter);
        });
    });
}

/* ===== MODAL CATÁLOGO DE E-BOOKS (abre so ao clicar) ===== */
const ebooksModal = document.getElementById('ebooks-modal');
function openEbooks() {
    if (!ebooksModal) return;
    ebooksModal.classList.add('open');
    ebooksModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const allBtn = ebooksModal.querySelector('.ebook-filter-btn[data-filter="all"]');
    if (allBtn) { allBtn.classList.add('active'); aplicarFiltroEbooks('all'); }
    const panel = ebooksModal.querySelector('.ebooks-modal-panel');
    if (panel) panel.scrollTop = 0;
}
function closeEbooks() {
    if (!ebooksModal) return;
    ebooksModal.classList.remove('open');
    ebooksModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}
document.querySelectorAll('[data-ebooks-open]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); openEbooks(); });
});
if (ebooksModal) {
    ebooksModal.querySelectorAll('[data-ebooks-close]').forEach(el => {
        el.addEventListener('click', closeEbooks);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeEbooks(); });
}