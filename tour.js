document.addEventListener('DOMContentLoaded', () => {
    class TourSystem {
        constructor() {
            this.currentStep = 0;
            this.isActive = false;
            this.steps = [
                {
                    target: null, // Center
                    title: "Welcome to Maru",
                    text: "A digital journey through the soul of Rajasthan. This guided tour will help you navigate the experience with grace and ease.",
                    position: 'center'
                },
                {
                    target: '#maru-canvas',
                    title: "The Canvas",
                    text: "The interface is designed as a seamless, horizontal canvas. Use your mouse wheel, trackpad, or arrow keys to scroll between cities.",
                    position: 'center'
                },
                {
                    target: '.chapter.active .glass-card',
                    title: "The Stories",
                    text: "Each location is captured in a glass card, containing the essence of the city. Read the descriptions to immerse yourself in the narrative.",
                    position: 'right'
                },
                {
                    target: '.chapter.active .landmark',
                    title: "Discover Landmarks",
                    text: "Interact with these buttons to uncover hidden details, architectural marvels, and cultural insights specific to each location.",
                    position: 'right'
                },
                {
                    target: '#thread-timeline',
                    title: "Your Thread",
                    text: "The timeline at the bottom represents your journey. Click anywhere on it to swiftly travel between chapters.",
                    position: 'top'
                },
                {
                    target: '#sound-toggle',
                    title: "Immersive Audio",
                    text: "For the full experience, enable the sound. Each city has its own unique ambient soundscape.",
                    position: 'top-left'
                }
            ];

            this.initUI();
            this.bindEvents();
        }

        initUI() {
            // Create Overlay
            this.overlay = document.createElement('div');
            this.overlay.className = 'tour-overlay';
            document.body.appendChild(this.overlay);

            // Create Spotlight
            this.spotlight = document.createElement('div');
            this.spotlight.className = 'tour-spotlight';
            document.body.appendChild(this.spotlight);

            // Create Card
            this.card = document.createElement('div');
            this.card.className = 'tour-card';
            this.card.innerHTML = `
                <button class="tour-close" aria-label="Close Tour">×</button>
                <h3 id="tour-title"></h3>
                <p id="tour-text"></p>
                <div class="tour-controls">
                    <div class="tour-dots" id="tour-dots"></div>
                    <div class="tour-buttons">
                        <button class="tour-btn tour-btn-secondary" id="tour-prev">Prev</button>
                        <button class="tour-btn tour-btn-primary" id="tour-next">Next</button>
                    </div>
                </div>
            `;
            document.body.appendChild(this.card);

            // Elements references
            this.titleEl = this.card.querySelector('#tour-title');
            this.textEl = this.card.querySelector('#tour-text');
            this.dotsContainer = this.card.querySelector('#tour-dots');
            this.prevBtn = this.card.querySelector('#tour-prev');
            this.nextBtn = this.card.querySelector('#tour-next');
            this.closeBtn = this.card.querySelector('.tour-close');

            // Render Dots
            this.steps.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = 'tour-dot';
                this.dotsContainer.appendChild(dot);
            });
        }

        bindEvents() {
            // Start Button (will be in HTML)
            const startBtn = document.getElementById('start-tour-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => this.start());
            }

            // Controls
            this.prevBtn.addEventListener('click', () => this.prev());
            this.nextBtn.addEventListener('click', () => this.next());
            this.closeBtn.addEventListener('click', () => this.end());

            // Overlay click to close
            this.overlay.addEventListener('click', () => this.end());

            // Keyboard
            window.addEventListener('keydown', (e) => {
                if (!this.isActive) return;
                if (e.key === 'ArrowRight' || e.key === 'Enter') {
                    e.preventDefault(); // Prevent page scroll
                    this.next();
                }
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prev();
                }
                if (e.key === 'Escape') this.end();
            });

            // Handle Resize & Scroll
            const updateHandler = () => {
                if (this.isActive) this.updatePosition(this.currentStep);
            };

            window.addEventListener('resize', updateHandler);
            window.addEventListener('scroll', updateHandler, { capture: true, passive: true });
        }

        start() {
            this.isActive = true;
            this.currentStep = 0;
            this.overlay.classList.add('active');
            this.spotlight.classList.add('active');
            this.card.classList.add('active');
            this.updateState(0);
        }

        end() {
            this.isActive = false;
            this.overlay.classList.remove('active');
            this.spotlight.classList.remove('active');
            this.card.classList.remove('active');

            // Clear inline styles
            setTimeout(() => {
                this.spotlight.style.top = '';
                this.spotlight.style.left = '';
                this.spotlight.style.width = '';
                this.spotlight.style.height = '';
            }, 650);
        }

        next() {
            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.updateState(this.currentStep);
            } else {
                this.end();
            }
        }

        prev() {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.updateState(this.currentStep);
            }
        }

        updateState(index) {
            this.updateContent(index);
            this.updatePosition(index);
        }

        updateContent(index) {
            const step = this.steps[index];
            this.titleEl.textContent = step.title;
            this.textEl.textContent = step.text;

            this.prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
            this.nextBtn.textContent = index === this.steps.length - 1 ? 'Finish' : 'Next';

            const dots = this.dotsContainer.querySelectorAll('.tour-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        updatePosition(index) {
            const step = this.steps[index];
            let targetEl = null;
            if (step.target) {
                targetEl = document.querySelector(step.target);
            }

            if (!targetEl) {
                // Center Position (Welcome Step)
                this.spotlight.style.opacity = '0';

                const cardRect = this.card.getBoundingClientRect();
                this.card.style.top = `${window.innerHeight / 2 - cardRect.height / 2}px`;
                this.card.style.left = `${window.innerWidth / 2 - cardRect.width / 2}px`;

            } else {
                this.spotlight.style.opacity = '1';
                const rect = targetEl.getBoundingClientRect();
                const padding = 10;

                this.spotlight.style.top = `${rect.top - padding}px`;
                this.spotlight.style.left = `${rect.left - padding}px`;
                this.spotlight.style.width = `${rect.width + padding * 2}px`;
                this.spotlight.style.height = `${rect.height + padding * 2}px`;

                this.calculateCardPos(rect, step.position);
            }
        }

        calculateCardPos(targetRect, preference) {
            const cardRect = this.card.getBoundingClientRect();
            const gap = 20;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top, left;

            if (preference === 'right') {
                left = targetRect.right + gap;
                top = targetRect.top;
                if (left + cardRect.width > viewportWidth) left = targetRect.left - cardRect.width - gap;
            } else if (preference === 'left') {
                left = targetRect.left - cardRect.width - gap;
                top = targetRect.top;
            } else if (preference === 'top') {
                top = targetRect.top - cardRect.height - gap;
                left = targetRect.left + (targetRect.width / 2) - (cardRect.width / 2);
            } else if (preference === 'top-left') {
                 top = targetRect.top - cardRect.height - gap;
                 left = targetRect.left - cardRect.width + gap;
            } else if (preference === 'center') {
                 top = targetRect.top + (targetRect.height / 2) - (cardRect.height / 2);
                 left = targetRect.left + (targetRect.width / 2) - (cardRect.width / 2);
            } else {
                top = targetRect.bottom + gap;
                left = targetRect.left;
            }

            if (left < 20) left = 20;
            if (top < 20) top = 20;
            if (left + cardRect.width > viewportWidth - 20) left = viewportWidth - cardRect.width - 20;
            if (top + cardRect.height > viewportHeight - 20) top = viewportHeight - cardRect.height - 20;

            this.card.style.top = `${top}px`;
            this.card.style.left = `${left}px`;
        }
    }

    const tour = new TourSystem();
});
