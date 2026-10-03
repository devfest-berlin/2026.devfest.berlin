// Casper mobile navigation burger toggle
(function () {
    const navigation = document.body;
    const burger = navigation.querySelector('.gh-burger');
    if (!burger) return;

    burger.setAttribute('aria-expanded', 'false');

    const mobile = window.matchMedia('(max-width: 767px)');
    const root = document.documentElement;
    let scrollPosition = 0;

    function scrollBehavior() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    }

    function closeMenu(targetHash) {
        if (!navigation.classList.contains('gh-head-open')) return;

        navigation.classList.remove('gh-head-open');
        burger.setAttribute('aria-expanded', 'false');
        root.classList.remove('gh-navigation-open');
        root.style.removeProperty('--gh-navigation-scroll-top');

        if (targetHash) {
            const target = document.querySelector(targetHash);
            if (target) {
                target.scrollIntoView({ behavior: scrollBehavior() });
                return;
            }
        }
        window.scrollTo({top: scrollPosition, behavior: 'instant'});
    }

    burger.addEventListener('click', function () {
        if (!navigation.classList.contains('gh-head-open')) {
            if (!mobile.matches) return;

            scrollPosition = window.scrollY;
            root.style.setProperty('--gh-navigation-scroll-top', `${-scrollPosition}px`);
            root.classList.add('gh-navigation-open');
            navigation.classList.add('gh-head-open');
            burger.setAttribute('aria-expanded', 'true');
        } else {
            closeMenu();
        }
    });

    // Close mobile drawer when clicking navigation links
    const menuLinks = document.querySelectorAll('.gh-head-menu a, .gh-head-actions a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = link.getAttribute('href');
            const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
            if (href === '/') {
                if (isHomePage) {
                    e.preventDefault();
                    closeMenu();
                    window.scrollTo({ top: 0, behavior: scrollBehavior() });
                } else {
                    closeMenu();
                }
            } else if (href && (href.startsWith('#') || (href.startsWith('/#') && isHomePage))) {
                const targetHash = href.startsWith('/#') ? href.substring(1) : href;
                if (!navigation.classList.contains('gh-head-open')) return;
                e.preventDefault();
                closeMenu(targetHash);
                history.pushState(null, '', targetHash);
            } else {
                closeMenu();
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navigation.classList.contains('gh-head-open')) {
            closeMenu();
        }
    });

    mobile.addEventListener('change', function () {
        if (!mobile.matches) closeMenu();
    });
})();

// Subscription Form Handler
(function () {
    const form = document.querySelector('#subscribe-form');
    if (!form) return;

    const feedback = document.querySelector('#subscribe-feedback');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function (e) {
        const action = form.getAttribute('action');
        if (!action || action === '#') {
            e.preventDefault();
            if (feedback) {
                feedback.textContent = "Thank you for your interest! Newsletter signup will be live soon.";
                feedback.classList.remove('feedback-error');
                feedback.classList.add('feedback-success');
            }
            return;
        }

        e.preventDefault();
        const formData = new FormData(form);
        const searchParams = new URLSearchParams(formData);
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';
        }

        try {
            await fetch(action, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: searchParams
            });

            form.reset();
            if (feedback) {
                feedback.textContent = "You're on the list! We'll keep you updated.";
                feedback.classList.remove('feedback-error');
                feedback.classList.add('feedback-success');
            }
        } catch (err) {
            if (feedback) {
                feedback.textContent = "Something went wrong. Please try again later.";
                feedback.classList.add('feedback-error');
                feedback.classList.remove('feedback-success');
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
})();

// Live Event Countdown Timer
(function () {
    const countdownEl = document.querySelector('#event-countdown');
    if (!countdownEl) return;

    const targetAttr = countdownEl.getAttribute('data-target');
    if (!targetAttr) return;

    const targetDate = new Date(targetAttr).getTime();
    if (isNaN(targetDate)) return;

    const daysEl = document.querySelector('#countdown-days');
    const hoursEl = document.querySelector('#countdown-hours');
    const minutesEl = document.querySelector('#countdown-minutes');
    const secondsEl = document.querySelector('#countdown-seconds');

    function updateCountdown() {
        const now = Date.now();
        const diff = targetDate - now;

        if (diff <= 0) {
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
})();

// Early Bird Modal Handler
(function () {
    const openBtn = document.querySelector('#open-earlybird-modal');
    const dialog = document.querySelector('#earlybird-modal');
    if (!openBtn || !dialog) return;

    const closeBtn = document.querySelector('#close-earlybird-modal');
    const form = document.querySelector('#earlybird-form');
    const feedback = document.querySelector('#earlybird-feedback');
    const input = document.querySelector('#earlybird-email-input');

    function openModal() {
        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
        }
        if (input) input.focus();
    }

    function closeModal() {
        if (typeof dialog.close === 'function') {
            dialog.close();
        } else {
            dialog.removeAttribute('open');
        }
        if (openBtn) openBtn.focus();
    }

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Close when clicking dialog backdrop
    dialog.addEventListener('click', function (e) {
        const card = dialog.querySelector('.earlybird-dialog-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const isInCard = rect.top <= e.clientY && e.clientY <= rect.bottom && rect.left <= e.clientX && e.clientX <= rect.right;
        if (!isInCard) closeModal();
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const action = form.getAttribute('action');
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
            }

            const formData = new FormData(form);
            const searchParams = new URLSearchParams(formData);

            try {
                if (action && action !== '#') {
                    await fetch(action, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: searchParams
                    });
                }
                form.reset();
                if (feedback) {
                    feedback.textContent = "You're on the priority Early Bird list! We'll notify you first.";
                    feedback.classList.remove('feedback-error');
                    feedback.classList.add('feedback-success');
                }
                setTimeout(() => {
                    closeModal();
                    if (feedback) {
                        feedback.textContent = '';
                        feedback.classList.remove('feedback-success');
                    }
                }, 2200);
            } catch (err) {
                if (feedback) {
                    feedback.textContent = "Something went wrong. Please try again.";
                    feedback.classList.add('feedback-error');
                    feedback.classList.remove('feedback-success');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }
})();

// Copy Venue Address Handler
(function () {
    const copyBtn = document.querySelector('#copy-venue-address');
    if (!copyBtn) return;

    const copyLabel = copyBtn.querySelector('.copy-label');
    const address = copyBtn.getAttribute('data-address');

    copyBtn.addEventListener('click', async function () {
        if (!address) return;
        try {
            await navigator.clipboard.writeText(address);
            if (copyLabel) copyLabel.textContent = 'Copied!';
            copyBtn.classList.add('is-copied');
            setTimeout(() => {
                if (copyLabel) copyLabel.textContent = 'Copy';
                copyBtn.classList.remove('is-copied');
            }, 2000);
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = address;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            if (copyLabel) copyLabel.textContent = 'Copied!';
            setTimeout(() => {
                if (copyLabel) copyLabel.textContent = 'Copy';
            }, 2000);
        }
    });
})();
