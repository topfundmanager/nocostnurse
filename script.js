/**
 * No Cost Nurse - Interactive Features
 * Multi-step form, FAQ accordion, smooth scrolling, and more
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initHeader();
    initMobileNav();
    initSmoothScroll();
    initMultiStepForm();
    initFAQAccordion();
    initConditionalFields();
});

/**
 * Header scroll effect
 */
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        const scrollY = window.scrollY;

        if (scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

/**
 * Mobile navigation toggle
 */
function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
        toggle.classList.toggle('active');
        menu.classList.toggle('mobile-active');

        // Update ARIA
        const isExpanded = menu.classList.contains('mobile-active');
        toggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking a link
    menu.querySelectorAll('.nav__link').forEach(function (link) {
        link.addEventListener('click', function () {
            toggle.classList.remove('active');
            menu.classList.remove('mobile-active');
        });
    });

    // Close menu on escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('mobile-active')) {
            toggle.classList.remove('active');
            menu.classList.remove('mobile-active');
        }
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const headerHeight = document.getElementById('header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL without jumping
            history.pushState(null, null, href);
        });
    });
}

/**
 * Multi-step form functionality
 */
function initMultiStepForm() {
    const form = document.getElementById('questionnaire-form');
    if (!form) return;

    // Bot protection: Set timestamp when form loads
    const timestampField = document.getElementById('form_timestamp');
    if (timestampField) {
        timestampField.value = Date.now().toString();
    }

    const steps = form.querySelectorAll('.form-step');
    const progressSteps = form.querySelectorAll('.progress-step');
    const progressFill = document.getElementById('progress-fill');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');
    const formSuccess = document.getElementById('form-success');

    let currentStep = 1;
    const totalSteps = steps.length;

    // Initialize
    updateProgress();
    updateButtons();

    // Progress step clicks (allow navigation to completed steps)
    progressSteps.forEach(function (stepBtn) {
        stepBtn.addEventListener('click', function () {
            const targetStep = parseInt(this.dataset.step);

            // Only allow going back or to current step
            if (targetStep < currentStep) {
                goToStep(targetStep);
            }
        });
    });

    // Next button
    btnNext.addEventListener('click', function () {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                goToStep(currentStep + 1);
            }
        }
    });

    // Previous button
    btnPrev.addEventListener('click', function () {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    });

    // Form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (validateStep(currentStep)) {
            // Simulate form submission
            submitForm();
        }
    });

    function goToStep(step) {
        const currentStepEl = steps[currentStep - 1];
        const nextStepEl = steps[step - 1];

        // Fade out current step
        currentStepEl.style.opacity = '0';
        currentStepEl.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            // Hide current step
            currentStepEl.classList.remove('active');
            progressSteps[currentStep - 1].classList.remove('active');
            progressSteps[currentStep - 1].classList.add('completed');

            // Show new step
            currentStep = step;
            nextStepEl.classList.add('active');
            progressSteps[currentStep - 1].classList.add('active');

            // Fade in new step
            nextStepEl.style.opacity = '0';
            nextStepEl.style.transform = 'translateY(10px)';
            nextStepEl.style.transition = 'all 0.4s ease';

            // Force reflow
            nextStepEl.offsetHeight;

            nextStepEl.style.opacity = '1';
            nextStepEl.style.transform = 'translateY(0)';

            // Update UI
            updateProgress();
            updateButtons();

            // Scroll to form
            const formContainer = document.querySelector('.form-container');
            if (formContainer) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = formContainer.getBoundingClientRect().top + window.pageYOffset - headerHeight - 40;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 300);
    }


    function updateProgress() {
        const progress = (currentStep / totalSteps) * 100;
        progressFill.style.width = progress + '%';

        // Update step states
        progressSteps.forEach(function (step, index) {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNum < currentStep) {
                step.classList.add('completed');
            } else if (stepNum === currentStep) {
                step.classList.add('active');
            }
        });
    }

    function updateButtons() {
        // Previous button visibility
        btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

        // Next vs Submit button
        if (currentStep === totalSteps) {
            btnNext.style.display = 'none';
            btnSubmit.style.display = 'inline-flex';
        } else {
            btnNext.style.display = 'inline-flex';
            btnSubmit.style.display = 'none';
        }
    }

    function validateStep(step) {
        const currentStepEl = steps[step - 1];
        const requiredFields = currentStepEl.querySelectorAll('[required]');
        let isValid = true;

        // Clear previous errors
        currentStepEl.querySelectorAll('.form-error').forEach(function (error) {
            error.textContent = '';
        });
        currentStepEl.querySelectorAll('.error').forEach(function (field) {
            field.classList.remove('error');
        });

        requiredFields.forEach(function (field) {
            const fieldName = field.name;
            const fieldType = field.type;
            let fieldValid = true;
            let errorMessage = '';

            if (fieldType === 'radio') {
                // Check if any radio in this group is selected
                const radioGroup = currentStepEl.querySelectorAll('input[name="' + fieldName + '"]');
                const isChecked = Array.from(radioGroup).some(function (radio) {
                    return radio.checked;
                });

                if (!isChecked) {
                    fieldValid = false;
                    errorMessage = 'Please select an option';
                }
            } else if (fieldType === 'checkbox' && (field.name === 'consent' || field.name === 'referral_consent')) {
                if (!field.checked) {
                    fieldValid = false;
                    errorMessage = field.name === 'referral_consent' ? 'You must confirm permission to share' : 'You must agree to be contacted';
                }
            } else if (fieldType === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!field.value.trim()) {
                    fieldValid = false;
                    errorMessage = 'Email is required';
                } else if (!emailRegex.test(field.value.trim())) {
                    fieldValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
            } else if (fieldType === 'tel') {
                const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
                if (!field.value.trim()) {
                    fieldValid = false;
                    errorMessage = 'Phone number is required';
                } else if (!phoneRegex.test(field.value.trim())) {
                    fieldValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
            } else if (field.tagName === 'SELECT') {
                if (!field.value) {
                    fieldValid = false;
                    errorMessage = 'Please select an option';
                    field.classList.add('error');
                }
            } else {
                if (!field.value.trim()) {
                    fieldValid = false;
                    errorMessage = 'This field is required';
                    field.classList.add('error');
                }
            }

            if (!fieldValid) {
                isValid = false;
                const errorEl = document.getElementById('error-' + fieldName);
                if (errorEl) {
                    errorEl.textContent = errorMessage;
                }
            }
        });

        return isValid;
    }

    function submitForm() {
        // Show loading state
        btnSubmit.disabled = true;
        const originalBtnContent = btnSubmit.innerHTML;
        btnSubmit.innerHTML = `
            <svg class="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-dasharray="40" stroke-dashoffset="10"/>
            </svg>
            Submitting...
        `;

        // Collect all form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Call our serverless function
        fetch('/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(result => {
                // Hide form, show success
                form.style.display = 'none';
                formSuccess.style.display = 'block';

                // Scroll to success message
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = formSuccess.getBoundingClientRect().top + window.pageYOffset - headerHeight - 40;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            })
            .catch(error => {
                console.error('Submission error:', error);
                alert('Oops! Something went wrong while submitting your referral. Please try again or contact us directly.');

                // Restore button state
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalBtnContent;
            });
    }

    // Add real-time validation feedback
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
        field.addEventListener('blur', function () {
            if (field.hasAttribute('required')) {
                validateField(field);
            }
        });

        field.addEventListener('input', function () {
            // Clear error on input
            const errorEl = document.getElementById('error-' + field.name);
            if (errorEl) {
                errorEl.textContent = '';
            }
            field.classList.remove('error');
        });
    });

    function validateField(field) {
        const fieldName = field.name;
        const fieldType = field.type;
        let errorMessage = '';

        if (fieldType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (field.value.trim() && !emailRegex.test(field.value.trim())) {
                errorMessage = 'Please enter a valid email address';
            }
        } else if (fieldType === 'tel') {
            const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
            if (field.value.trim() && !phoneRegex.test(field.value.trim())) {
                errorMessage = 'Please enter a valid phone number';
            }
        }

        const errorEl = document.getElementById('error-' + fieldName);
        if (errorEl && errorMessage) {
            errorEl.textContent = errorMessage;
            field.classList.add('error');
        }
    }
}

/**
 * FAQ Accordion
 */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
        const question = item.querySelector('.faq-item__question');
        const answer = item.querySelector('.faq-item__answer');

        question.addEventListener('click', function () {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(function (otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            question.setAttribute('aria-expanded', !isActive);
        });

        // Keyboard support
        question.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
}

/**
 * Conditional fields (show/hide based on selections)
 */
function initConditionalFields() {
    // Note: The previous medical experience conditional logic has been removed 
    // in favor of the specialized 4-step referral flow.
}

/**
 * Phone number formatting
 */
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = '(' + value;
            } else if (value.length <= 6) {
                value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
            } else {
                value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6, 10);
            }
        }
        e.target.value = value;
    });
});


/**
 * Intersection Observer for animations
 */
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    // Target elements to reveal
    const revealElements = document.querySelectorAll('.process-card, .eligibility-card, .faq-item, .section-header, .partner-logo, .trust-item, .hero__trust');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // If it's a child of a grid, we might want to stagger it
                const parentGrid = entry.target.parentElement;
                if (parentGrid && (parentGrid.classList.contains('process-grid') || parentGrid.classList.contains('eligibility__grid'))) {
                    const index = Array.from(parentGrid.children).indexOf(entry.target);
                    entry.target.style.transitionDelay = (index * 0.1) + 's';
                }

                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach((el) => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });
}

// Initialize scroll animations after DOM is ready
document.addEventListener('DOMContentLoaded', initScrollAnimations);

