document.addEventListener('DOMContentLoaded', () => {
    // Jony Ive: The Digital Craftsman - Elevated

    // --- SECTION 1: ELEMENT REFERENCES ---
    const unveiling = document.getElementById('unveiling');
    const sarangiNote = document.getElementById('sarangi-note');
    const maruCanvas = document.getElementById('maru-canvas');
    const container = document.getElementById('chapters-container');
    const chapters = gsap.utils.toArray('.chapter');
    const detailView = document.getElementById('detail-view');
    const detailEmoji = document.getElementById('detail-emoji');
    const detailTitle = document.getElementById('detail-title');
    const detailDescription = document.getElementById('detail-description');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const landmarks = document.querySelectorAll('.landmark');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    const numChapters = chapters.length;
    container.style.width = `${numChapters * 100}%`;
    let currentChapter = 0;
    let isScrolling = false;

    // --- SECTION 1.2: TEXT SPLITTING UTILITY ---
    function splitText(element, type = 'words') {
        if (!element) return;
        const text = element.innerText;
        const words = text.split(' ');

        element.innerHTML = words.map(word => {
            if(word.includes('\n')) {
                const parts = word.split('\n');
                 return parts.map((part, i) => {
                    const content = type === 'chars'
                        ? part.split('').map(char => `<span class="char" style="display:inline-block;">${char}</span>`).join('')
                        : part;
                    return `<span class="word" style="display:inline-block;">${content}</span>${i < parts.length - 1 ? '<br>' : ''}`;
                }).join('');
            }
            const content = type === 'chars'
                ? word.split('').map(char => `<span class="char" style="display:inline-block;">${char}</span>`).join('')
                : word;
            return `<span class="word" style="display:inline-block;">${content}</span>`;
        }).join(' ');

        return type === 'chars' ? element.querySelectorAll('.char') : element.querySelectorAll('.word');
    }

    chapters.forEach(chapter => {
        splitText(chapter.querySelector('.chapter-title'), 'chars');
        splitText(chapter.querySelector('.chapter-description'), 'words');
    });

    // --- SECTION 1.5: CURSOR & INTERACTION LOGIC ---
    let mouseX = 0;
    let mouseY = 0;

    gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });
    gsap.set(cursorOutline, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(cursorOutline, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursorOutline, "y", { duration: 0.2, ease: "power3" });

    const displacementMap = document.querySelector('#distortionFilter feDisplacementMap');

    window.addEventListener("mousemove", (e) => {
        const velocity = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2));
        mouseX = e.clientX;
        mouseY = e.clientY;

        gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0.01 });
        xTo(mouseX);
        yTo(mouseY);

        // Liquid Distortion
        const agitation = Math.min(velocity * 1.5, 60);
        gsap.to(displacementMap, {
            attr: { scale: agitation },
            duration: 0.8,
            ease: 'power2.out',
            overwrite: 'auto'
        });
        gsap.to(displacementMap, {
            attr: { scale: 0 },
            duration: 1.5,
            delay: 0.1,
            ease: 'power2.out',
            overwrite: 'auto'
        });

        // Parallax & 3D Tilt
        if (!isScrolling && chapters[currentChapter]) {
            const chapter = chapters[currentChapter];
            const content = chapter.querySelector('.chapter-content');
            const glassCard = chapter.querySelector('.glass-card');
            const bg = chapter.querySelector('.bg-image');

            const xPct = (mouseX / window.innerWidth - 0.5);
            const yPct = (mouseY / window.innerHeight - 0.5);

            if(bg) {
                gsap.to(bg, { x: xPct * 30, y: yPct * 30, duration: 1, ease: 'power2.out' });
            }

            // 3D Tilt for Glass Card
            if (glassCard) {
                 const rect = glassCard.getBoundingClientRect();
                 const cardX = rect.left + rect.width / 2;
                 const cardY = rect.top + rect.height / 2;
                 // Calculate distance from center of card
                 const distX = mouseX - cardX;
                 const distY = mouseY - cardY;

                 const rotateY = distX / 60;
                 const rotateX = -distY / 60;

                 gsap.to(glassCard, {
                     rotateX: rotateX,
                     rotateY: rotateY,
                     transformPerspective: 1000,
                     duration: 1,
                     ease: 'power2.out'
                 });

                 // Shimmer update (handled via CSS opacity on hover, but we can enhance position)
                 // Setting a CSS var for mouse position could be cool too
            }
        }
    });

    // Hover States
    const interactiveElements = document.querySelectorAll('button, a, .landmark, .artisan-hand, .pullable-element');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
    });

    // Magnetic Effect
    function magneticEffect(element) {
        if (!element) return;
        const xTo = gsap.quickTo(element, "x", { duration: 1, ease: "elastic.out(1, 0.4)" });
        const yTo = gsap.quickTo(element, "y", { duration: 1, ease: "elastic.out(1, 0.4)" });

        element.addEventListener("mousemove", (e) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = element.getBoundingClientRect();
            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);
            xTo(x * 0.4);
            yTo(y * 0.4);
        });
        element.addEventListener("mouseleave", () => {
            xTo(0);
            yTo(0);
        });
    }

    magneticEffect(document.querySelector('.artisan-hand'));
    magneticEffect(document.getElementById('sound-toggle'));
    landmarks.forEach(l => magneticEffect(l));

    // --- SECTION 2: UNVEILING ---
    let unveilingAnimation;
        let noteTimeout;
        let fadeTimeout;

    function skipUnveiling() {
        clearTimeout(unveilingAnimation);
            clearTimeout(noteTimeout);
            clearTimeout(fadeTimeout);

        unveiling.classList.add('hidden');
        maruCanvas.classList.add('visible');
        chapters[0].classList.add('active');
        unveiling.removeEventListener('click', skipUnveiling);

        // Trigger initial entry for first chapter
        const titleChars = chapters[0].querySelectorAll('.chapter-title .char');
        const descWords = chapters[0].querySelectorAll('.chapter-description .word');

        gsap.fromTo(titleChars,
            { y: 100, opacity: 0, rotateZ: 10 },
            { y: 0, opacity: 1, rotateZ: 0, duration: 1, stagger: 0.05, ease: 'back.out(1.7)' }
        );
        gsap.fromTo(descWords,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 0.8, duration: 1, stagger: 0.02, delay: 0.5, ease: 'power2.out' }
        );
    }

    unveiling.addEventListener('click', skipUnveiling);
    unveilingAnimation = setTimeout(() => {
            const word = unveiling.querySelector('.word');
            if(word) word.style.animationPlayState = 'running';

            noteTimeout = setTimeout(() => {
            sarangiNote.volume = 0.5;
            sarangiNote.play().catch(() => {});
                fadeTimeout = setTimeout(skipUnveiling, 3500);
        }, 2000);
    }, 500);

    // --- SECTION 3: SCROLLING ---
    let lastScrollTime = 0;
    const scrollCooldown = 2000; // Slightly longer than transition to prevent accidental double-skips

    window.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (isScrolling || now - lastScrollTime < scrollCooldown) return;

        if (e.deltaY > 50 && currentChapter < numChapters - 1) {
            goToChapter(currentChapter + 1);
            lastScrollTime = now;
        } else if (e.deltaY < -50 && currentChapter > 0) {
            goToChapter(currentChapter - 1);
            lastScrollTime = now;
        }
    });

    window.addEventListener('keydown', (e) => {
        if (isScrolling) return;
        if (e.key === 'ArrowRight' && currentChapter < numChapters - 1) goToChapter(currentChapter + 1);
        else if (e.key === 'ArrowLeft' && currentChapter > 0) goToChapter(currentChapter - 1);
    });

    // --- SECTION 4: DETAIL VIEW (FLIP ANIMATION) ---
    function openDetailView(title, description, emoji, triggerElement) {
        detailEmoji.textContent = emoji;
        detailTitle.textContent = title;
        detailDescription.textContent = description;

        detailView.classList.add('visible');

        const content = detailView.querySelector('.detail-content');

        // Simple FLIP-like scaling from center for now, or from trigger if present
        if (triggerElement) {
            const rect = triggerElement.getBoundingClientRect();
            // We could do a complex FLIP here, but a clean scale in is often smoother/less buggy
            // Let's stick to a premium scale-in with a slight rotation
            gsap.fromTo(content,
                { scale: 0.5, opacity: 0, rotateX: 20 },
                { scale: 1, opacity: 1, rotateX: 0, duration: 0.6, ease: 'back.out(1.5)' }
            );
        } else {
             gsap.fromTo(content,
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
            );
        }

        closeDetailBtn.focus();
    }

    function closeDetailView() {
        const content = detailView.querySelector('.detail-content');
        gsap.to(content, {
            scale: 0.9,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.in',
            onComplete: () => {
                detailView.classList.remove('visible');
                gsap.set(content, { clearProps: "all" }); // Reset for next open
            }
        });
        if (document.activeElement) document.activeElement.blur();
    }

    landmarks.forEach(landmark => {
        landmark.setAttribute('tabindex', '0');
        landmark.addEventListener('click', (e) => {
            e.preventDefault();
            openDetailView(landmark.dataset.title, landmark.dataset.description, landmark.dataset.emoji, landmark);
        });
        landmark.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                openDetailView(landmark.dataset.title, landmark.dataset.description, landmark.dataset.emoji, landmark);
            }
        });
    });

    closeDetailBtn.addEventListener('click', closeDetailView);
    detailView.addEventListener('click', (e) => { if (e.target === detailView) closeDetailView(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && detailView.classList.contains('visible')) closeDetailView(); });

    // --- SECTION 5: SOUND ---
    const soundToggle = document.getElementById('sound-toggle');
    const soundIconOn = document.getElementById('sound-icon-on');
    const soundIconOff = document.getElementById('sound-icon-off');
    let isSoundOn = false;
    const ambientSounds = chapters.map(chapter => {
        const src = chapter.dataset.ambientSoundSrc;
        return src ? new Audio(src) : null;
    });

    function playCurrentAmbientSound() {
        if (isSoundOn) {
            ambientSounds.forEach((sound, index) => {
                if (sound) {
                    if (index === currentChapter) {
                        sound.loop = true;
                        sound.play().catch(()=>{});
                    } else {
                        sound.pause();
                    }
                }
            });
        }
    }

    function stopAllAmbientSounds() {
        ambientSounds.forEach(sound => { if (sound) sound.pause(); });
    }

    soundToggle.addEventListener('click', () => {
        isSoundOn = !isSoundOn;
        soundToggle.setAttribute('aria-pressed', isSoundOn);
        if(isSoundOn) {
            soundIconOn.style.display = 'block';
            soundIconOff.style.display = 'none';
            soundToggle.title = 'Mute';
            playCurrentAmbientSound();
        } else {
            soundIconOn.style.display = 'none';
            soundIconOff.style.display = 'block';
            soundToggle.title = 'Listen';
            stopAllAmbientSounds();
        }
    });

    // --- SECTION 5.5: TIMELINE ---
    const timeline = document.getElementById('thread-timeline');
    timeline.addEventListener('click', (e) => {
        const rect = timeline.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const targetIndex = Math.round(pct * (numChapters - 1));
        if (targetIndex !== currentChapter) goToChapter(targetIndex);
    });

    function goToChapter(index) {
        if (isScrolling) return;
        isScrolling = true;
        chapters.forEach(ch => ch.classList.remove('active'));

        const nextChapter = chapters[index];
        const titleChars = nextChapter.querySelectorAll('.chapter-title .char');
        const descWords = nextChapter.querySelectorAll('.chapter-description .word');

        gsap.set(titleChars, { y: 100, opacity: 0, rotateZ: 10, skewX: 20, filter: 'blur(10px)' });
        gsap.set(descWords, { y: 20, opacity: 0 });

        // Transition: Silky Distortion
        const displacement = document.querySelector('#distortionFilter feDisplacementMap');
        gsap.to(displacement, {
            attr: { scale: 300 }, // Higher scale for more drama
            duration: 1.0,
            ease: 'power2.inOut',
            onComplete: () => {
                gsap.to(displacement, {
                    attr: { scale: 0 },
                    duration: 1.2,
                    ease: 'power2.out'
                });
            }
        });

        gsap.to(container, {
            x: -index * window.innerWidth,
            duration: 1.8, // Slower, more majestic
            ease: 'power4.inOut',
            onComplete: () => {
                isScrolling = false;
                currentChapter = index;
                chapters[currentChapter].classList.add('active');

                // Cinematic Text Entry
                gsap.to(titleChars, {
                    y: 0,
                    opacity: 1,
                    rotateZ: 0,
                    skewX: 0,
                    filter: 'blur(0px)',
                    duration: 1.2,
                    stagger: 0.03,
                    ease: 'back.out(1.2)'
                });

                gsap.to(descWords, {
                    y: 0,
                    opacity: 0.8,
                    duration: 1,
                    stagger: 0.01,
                    delay: 0.3,
                    ease: 'power2.out'
                });
                playCurrentAmbientSound();
            }
        });

        const newColor = chapters[index].dataset.accentColor;
        gsap.to(':root', { '--accent-color': newColor, duration: 1.5, ease: 'power2.out' });

        const progress = (index / (numChapters - 1)) * 100;
        gsap.to('#thread-progress', { width: `${progress}%`, duration: 1.8, ease: 'power4.inOut' });
    }

    // --- SECTION 6: CONSTELLATION DUST SYSTEM ---
    class DustSystem {
        constructor() {
            this.canvas = document.getElementById('dust-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.numParticles = 60; // Fewer but smarter particles
                this.isActive = true;
            this.resize();

            window.addEventListener('resize', () => this.resize());
                document.addEventListener('visibilitychange', () => {
                    this.isActive = !document.hidden;
                    if (this.isActive) this.animate();
                });

            for(let i = 0; i < this.numParticles; i++) this.particles.push(this.createParticle());
            this.animate();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        createParticle() {
            return {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.2
            };
        }

        animate() {
                if (!this.isActive) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const wind = (mouseX - window.innerWidth / 2) * 0.00005;

            this.particles.forEach((p, i) => {
                p.x += p.vx + wind;
                p.y += p.vy;

                // Mouse Interaction (Repulsion)
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const angle = Math.atan2(dy, dx);
                    const force = (200 - dist) / 200;
                    p.vx -= Math.cos(angle) * force * 0.02;
                    p.vy -= Math.sin(angle) * force * 0.02;
                }

                // Friction
                p.vx *= 0.99;
                p.vy *= 0.99;

                // Boundaries
                if (p.x < 0) p.x = this.canvas.width;
                if (p.x > this.canvas.width) p.x = 0;
                if (p.y < 0) p.y = this.canvas.height;
                if (p.y > this.canvas.height) p.y = 0;

                // Draw Particle
                this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw Connections
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    if (dist2 < 120) {
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - dist2 / 120)})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(() => this.animate());
        }
    }
    new DustSystem();
});
