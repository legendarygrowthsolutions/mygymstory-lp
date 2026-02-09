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

    // 2. Form Handling
    const form = document.getElementById('leadForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // In a real scenario, we would send data to a backend here.
            // For now, we simulate success and redirect.
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            // Collect form data for console log (Debugging/Verification)
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            console.log('Form Submission:', data);

            // Simulate network request delay
            setTimeout(() => {
                // Redirect to Thank You page
                window.location.href = 'thankyou.html';
            }, 1500);
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
});
