// Casper mobile navigation burger toggle
(function () {
    const navigation = document.body;
    const burger = navigation.querySelector('.gh-burger');
    if (!burger) return;

    burger.setAttribute('aria-expanded', 'false');

    const mobile = window.matchMedia('(max-width: 767px)');
    const root = document.documentElement;
    let scrollPosition = 0;

    function closeMenu() {
        if (!navigation.classList.contains('gh-head-open')) return;

        navigation.classList.remove('gh-head-open');
        burger.setAttribute('aria-expanded', 'false');
        root.classList.remove('gh-navigation-open');
        root.style.removeProperty('--gh-navigation-scroll-top');
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
