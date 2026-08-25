// KODAROS — Premium Landing Page JavaScript v3.2
// Efeito: Waves infinitas | Scroll contínuo | Bordas sempre fora da tela

document.addEventListener('DOMContentLoaded', function() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    let isTabActive = true;

    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    // ========================================
    // MÓDULO: FUNDO SUTIL — empresarial (substitui galáxia neon)
    // Apenas estrelas fixas muito sutis + 1 nebulosa atrás do hero
    // ========================================
    (function initGalaxy() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (document.body.dataset.noGalaxy === '1') return;
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        canvas.style.opacity = '0.22';
        const isHighDprMobile = window.matchMedia('(pointer: coarse)').matches && (window.devicePixelRatio || 1) > 1.5;
        if (isHighDprMobile && window.innerWidth < 768) {
            canvas.style.opacity = '0.12';
        }

        const ctx = canvas.getContext('2d');
        let dpr = window.devicePixelRatio || 1;
        let width = 0;
        let height = 0;
        let stars = [];
        let nebulas = [];
        let shootingStars = [];
        let time = 0;
        let nextShootingStar = 99999;
        let animId = null;

        const galaxyCenter = { x: 0.72, y: 0.30 };
        const mouse = { x: 0, y: 0, tx: 0, ty: 0, cx: 0, cy: 0 };
        const palette = ['#E6E8EE', '#9AA3B8', '#C5A46A'];

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
                { color: '59, 91, 254', alpha: 0.05 },
                { color: '197, 164, 106', alpha: 0.03 },
                { color: '59, 91, 254', alpha: 0.04 }
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
            const sx = rand(0, width);
            const sy = rand(0, height);
            const dir = Math.random() * Math.PI * 2;
            const spd = rand(5, 9);
            shootingStars.push({
                x: sx,
                y: sy,
                vx: Math.cos(dir) * spd,
                vy: Math.sin(dir) * spd,
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
            function syncToggle(expanded){
                navToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                navToggle.setAttribute('aria-label', expanded ? 'Fechar menu' : 'Abrir menu');
                const spans = navToggle.querySelectorAll('span');
                if (expanded) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
                } else {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
            navToggle.addEventListener('click', function() {
                const willOpen = !navMenu.classList.contains('active');
                navMenu.classList.toggle('active');
                syncToggle(willOpen);
            });
            navMenu.querySelectorAll('.nav-link, .nav-link-btn').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    syncToggle(false);
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

    // 3D tilt removido — empresarial não usa inclinação 3D (gatilho IA)

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

    // magnetic buttons removido — mantém botão estático empresarial

    // cursor glow removido — gatilho IA, sem valor empresarial
});

/* ===== FILTRO DE CLASSES — CATÁLOGO DE E-BOOKS ===== */
const ebookFilter = document.getElementById('ebook-filter');
const ebookCards = document.querySelectorAll('#ebooks-modal .ebook-card');

function aplicarFiltroEbooks(f) {
    ebookCards.forEach(card => {
        const match = (f === 'all') || (card.dataset.class === f);
        card.classList.toggle('hide', !match);
        card.setAttribute('aria-hidden', match ? 'false' : 'true');
    });
}

if (ebookFilter) {
    ebookFilter.setAttribute('role','group');
    ebookFilter.setAttribute('aria-label','Filtrar e-books por nível');
    ebookFilter.querySelectorAll('.ebook-filter-btn').forEach(btn => {
        btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
        btn.addEventListener('click', () => {
            ebookFilter.querySelectorAll('.ebook-filter-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed','true');
            aplicarFiltroEbooks(btn.dataset.filter);
            try{ localStorage.setItem('kodaros_ebook_filter', btn.dataset.filter); } catch(e){}
        });
    });
    try{
        const saved = localStorage.getItem('kodaros_ebook_filter');
        if(saved && ebookFilter.querySelector('[data-filter="'+saved+'"]')){
            ebookFilter.querySelectorAll('.ebook-filter-btn').forEach(b=>b.classList.remove('active'));
            const t=ebookFilter.querySelector('[data-filter="'+saved+'"]');
            t.classList.add('active'); t.setAttribute('aria-pressed','true');
            aplicarFiltroEbooks(saved);
        }
    } catch(e){}
}

/* ===== MODAL CATÁLOGO DE E-BOOKS (abre so ao clicar) ===== */
const ebooksModal = document.getElementById('ebooks-modal');
let lastEbooksTrigger = null;
let savedScrollY = 0;
function openEbooks() {
    if (!ebooksModal) return;
    lastEbooksTrigger = document.activeElement;
    savedScrollY = window.pageYOffset;
    ebooksModal.classList.add('open');
    ebooksModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
    const allBtn = ebooksModal.querySelector('.ebook-filter-btn[data-filter="all"]');
    // keep saved filter if exists, else all
    const panel = ebooksModal.querySelector('.ebooks-modal-panel');
    if (panel) panel.scrollTop = 0;
    const closeBtn = ebooksModal.querySelector('.ebooks-modal-close');
    if(closeBtn) closeBtn.focus();
    document.addEventListener('keydown', trapEbooksFocus);
    if(location.hash !== '#ebooks') history.pushState({ebooks:true}, '', '#ebooks');
}
function closeEbooks() {
    if (!ebooksModal) return;
    ebooksModal.classList.remove('open');
    ebooksModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);
    document.removeEventListener('keydown', trapEbooksFocus);
    if(location.hash === '#ebooks') history.pushState(null,'', location.pathname + location.search);
    if(lastEbooksTrigger && lastEbooksTrigger.focus) lastEbooksTrigger.focus();
}
function trapEbooksFocus(e){
    if(e.key === 'Escape'){ closeEbooks(); return; }
    if(e.key !== 'Tab' || !ebooksModal.classList.contains('open')) return;
    const focusable = ebooksModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if(!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}
document.querySelectorAll('[data-ebooks-open]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); openEbooks(); });
});
if (ebooksModal) {
    ebooksModal.querySelectorAll('[data-ebooks-close]').forEach(el => {
        el.addEventListener('click', closeEbooks);
    });
}
// deep-link #ebooks
if(location.hash === '#ebooks'){
    document.addEventListener('DOMContentLoaded', ()=> setTimeout(openEbooks, 300));
}
window.addEventListener('popstate', ()=>{
    if(location.hash === '#ebooks' && !ebooksModal.classList.contains('open')) openEbooks();
    else if(location.hash !== '#ebooks' && ebooksModal.classList.contains('open')) closeEbooks();
});

/* ===== NOTIFY + CONTACT HANDLERS ===== */
function handleNotify(e){
    e.preventDefault();
    const form = e.target;
    if(form.querySelector('[name="hp"]')?.value) return false;
    const email = form.querySelector('input[type="email"]')?.value.trim();
    const topic = form.dataset.notify || 'geral';
    const msg = form.querySelector('.notify-msg');
    if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
        if(msg) msg.textContent = 'Informe um e-mail válido.';
        return false;
    }
    try{
        const key='kodaros_notify_'+topic;
        const arr=JSON.parse(localStorage.getItem(key)||'[]');
        if(!arr.includes(email)){ arr.push(email); localStorage.setItem(key, JSON.stringify(arr)); }
    } catch(_){}
    if(msg) msg.textContent = 'Obrigado! Avisaremos em '+email+'.';
    form.reset();
    // fallback mailto
    setTimeout(()=>{ window.location.href = 'mailto:kodaros01@gmail.com?subject=Avise-me '+topic+'&body=Quero ser avisado em '+encodeURIComponent(email); }, 800);
    return false;
}
function handleContact(e){
    e.preventDefault();
    const form = e.target;
    if(form.querySelector('[name="hp"]')?.value) return false;
    const name=document.getElementById('cf-name')?.value.trim();
    const email=document.getElementById('cf-email')?.value.trim();
    const m=document.getElementById('cf-msg')?.value.trim();
    const status=document.getElementById('cf-msg-status');
    if(!name || !email || !m){ if(status) status.textContent='Preencha todos os campos.'; return false; }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ if(status) status.textContent='E-mail inválido.'; return false; }
    const subject=encodeURIComponent('Contato site — '+name);
    const body=encodeURIComponent('Nome: '+name+'\nE-mail: '+email+'\n\nMensagem:\n'+m);
    window.location.href='mailto:kodaros01@gmail.com?subject='+subject+'&body='+body;
    if(status) status.textContent='Abrindo seu e-mail... Se não abrir, escreva para kodaros01@gmail.com';
    form.reset();
    return false;
}
// footer year
document.addEventListener('DOMContentLoaded', ()=>{
    const y=document.getElementById('footer-year');
    if(y) y.textContent = new Date().getFullYear();
});