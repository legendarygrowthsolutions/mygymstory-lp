document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Fade-in Animations
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in');
    animatedElements.forEach(el => observer.observe(el));

    // 2. Form Handling with Loading State
    const form = document.getElementById('leadForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Set loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="btn-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="animation: spin 0.8s linear infinite; margin-right: 8px;">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity="0.3"/>
                    <path d="M12 2v4"/>
                </svg>
                Booking...
            `;

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    window.location.href = 'thankyou.html';
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                // Reset button on error
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                alert('Something went wrong. Please try again or contact us directly.');
            }
        });
    }

    // 3. Smooth Scrolling for Anchor Links (Optional polish)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Interactive Dashboard (Business in a Jiff)
    const dashTabs = document.querySelectorAll('.dash-tab');
    const dashContents = document.querySelectorAll('.dash-content');

    if (dashTabs.length > 0) {
        dashTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and contents
                dashTabs.forEach(t => t.classList.remove('active'));
                dashContents.forEach(c => c.classList.remove('active'));

                // Activate clicked tab
                tab.classList.add('active');

                // Activate corresponding content
                const targetId = `dash-${tab.getAttribute('data-tab')}`;
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // 5. Live App Demo Interactive Logic
    const appScreen = document.getElementById('app-screen');
    const gymNameInput = document.getElementById('gymNameInput');
    const gymNameDisplay = document.querySelector('.gym-name');

    if (appScreen) {
        // App Name Customization
        if (gymNameInput && gymNameDisplay) {
            gymNameInput.addEventListener('input', (e) => {
                const name = e.target.value.trim();
                gymNameDisplay.textContent = name || 'Fit Life Express';
            });
        }

        // Tab Switching (Home vs Stats)
        const screenToggles = document.querySelectorAll('.toggle-btn');
        const appViews = document.querySelectorAll('.app-view');
        const navItems = document.querySelectorAll('.nav-item');

        screenToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetScreen = toggle.getAttribute('data-screen');

                // Update Toggles
                screenToggles.forEach(t => {
                    t.classList.remove('active');
                    t.style.backgroundColor = ''; // Reset inline style
                    t.style.borderColor = '';
                });
                toggle.classList.add('active');

                // Set active color (hardcoded green as we removed color picker)
                const activeColor = '#00E676';
                toggle.style.backgroundColor = activeColor;
                toggle.style.borderColor = activeColor;

                // Switch View
                appViews.forEach(view => view.classList.remove('active'));
                const viewToShow = document.getElementById(`view-${targetScreen}`);
                if (viewToShow) viewToShow.classList.add('active');

                // Update Bottom Nav (Visual Sync)
                navItems.forEach(nav => nav.classList.remove('active'));
                // Map 'home' -> index 0
                if (targetScreen === 'home' && navItems[0]) navItems[0].classList.add('active');
                // Map 'workout' -> index 1
                if (targetScreen === 'workout' && navItems[1]) navItems[1].classList.add('active');
                // Map 'stats' -> index 2
                if (targetScreen === 'stats' && navItems[2]) navItems[2].classList.add('active');
                // Map 'feed' -> index 3
                if (targetScreen === 'feed' && navItems[3]) navItems[3].classList.add('active');
            });
        });

        // Bottom Nav Click Handling
        navItems.forEach((nav, index) => {
            nav.addEventListener('click', () => {
                // Determine screen based on index
                let targetScreen = 'home';
                if (index === 1) targetScreen = 'workout';
                if (index === 2) targetScreen = 'stats';
                if (index === 3) targetScreen = 'feed';

                // Trigger the corresponding top toggle if it exists
                const correspondingToggle = document.querySelector(`.toggle-btn[data-screen="${targetScreen}"]`);
                if (correspondingToggle) correspondingToggle.click();
            });
        });

        // Notification Trigger
        const notifyBtn = document.getElementById('btn-trigger-notification');
        const notification = document.getElementById('mock-notification');

        if (notifyBtn && notification) {
            notifyBtn.addEventListener('click', () => {
                // Reset animation
                notification.classList.remove('show');
                void notification.offsetWidth; // Trigger reflow

                // Show
                notification.classList.add('show');

                // Auto hide after 4 seconds
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 4000);
            });
        }
    }
});
