/**
 * No Cost Nurse - Main JavaScript
 * Handles interactivity for navigation, accordions, forms, and accessibility
 */

(function () {
  'use strict';

  // ===========================================
  // Language Selector
  // ===========================================
  const localeCookie = 'NCN_LOCALE';
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const isSpanishPage = pathSegments[0] === 'es';
  const currentLocale = isSpanishPage ? 'es' : 'en';
  const interfaceText = currentLocale === 'es'
    ? {
        language: 'Idioma',
        currentLanguage: 'Idioma actual',
        openMenu: 'Abrir menú',
        closeMenu: 'Cerrar menú',
        submitError: 'No se pudo enviar el formulario. Inténtelo de nuevo.',
        required: 'Este campo es obligatorio',
        sending: 'Enviando...',
        thankYou: '¡Gracias!',
        submitted: 'Su solicitud se envió correctamente. Nuestro equipo se comunicará con usted dentro de 24 a 48 horas.',
        whatsNext: '¿Qué sigue?',
        nextStep: 'Un miembro de nuestro equipo de admisiones lo llamará para hablar sobre sus necesidades y responder cualquier pregunta.',
        newTab: ' (se abre en una pestaña nueva)'
      }
    : {
        language: 'Language',
        currentLanguage: 'Current language',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        submitError: 'Unable to submit the form. Please try again.',
        required: 'This field is required',
        sending: 'Sending...',
        thankYou: 'Thank You!',
        submitted: 'Your request has been submitted successfully. Our team will contact you within 24-48 hours.',
        whatsNext: "What's next?",
        nextStep: 'A member of our intake team will call you to discuss your needs and answer any questions.',
        newTab: ' (opens in new tab)'
      };

  window.ncnI18n = interfaceText;

  function getLocaleCookie() {
    const cookie = document.cookie.split('; ').find(function (item) {
      return item.indexOf(localeCookie + '=') === 0;
    });
    return cookie ? cookie.split('=')[1] : '';
  }

  function setLocaleCookie(locale) {
    document.cookie = localeCookie + '=' + locale + '; path=/; max-age=31536000; samesite=lax';
  }

  function localizedPageUrl(locale) {
    const lastSegment = pathSegments[pathSegments.length - 1];
    const fileName = !lastSegment || lastSegment === 'es' ? 'index.html' : lastSegment;
    const suffix = window.location.search + window.location.hash;
    return locale === 'es' ? '/es/' + fileName + suffix : '/' + fileName + suffix;
  }

  // Match the Top Fund behavior: an explicit saved choice takes precedence
  // when a visitor returns through an English URL.
  if (!isSpanishPage && getLocaleCookie() === 'es') {
    window.location.replace(localizedPageUrl('es'));
    return;
  }

  const headerContainer = document.querySelector('.header-main .container');
  const headerCta = headerContainer ? headerContainer.querySelector('.header-cta') : null;

  if (headerContainer) {
    const selector = document.createElement('div');
    const listboxId = 'language-selector-listbox';
    const copy = { label: interfaceText.language, current: interfaceText.currentLanguage };

    selector.className = 'language-selector';
    selector.innerHTML =
      '<button class="language-selector-toggle" type="button" aria-haspopup="listbox" aria-expanded="false" ' +
        'aria-controls="' + listboxId + '" aria-label="' + copy.label + ': ' + (currentLocale === 'es' ? 'Español' : 'English') + '">' +
        '<svg class="language-selector-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="9"></circle><path d="M3.5 12h17M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18"></path>' +
        '</svg>' +
        '<span>' + currentLocale + '</span>' +
        '<svg class="language-selector-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
          '<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd"></path>' +
        '</svg>' +
      '</button>' +
      '<ul id="' + listboxId + '" class="language-selector-menu" role="listbox" aria-label="' + copy.label + '" hidden>' +
        '<li class="language-selector-label" role="presentation">' + copy.label + '</li>' +
        '<li role="presentation"><button class="language-selector-option" type="button" role="option" data-locale="en" lang="en" aria-selected="' + (currentLocale === 'en') + '">' +
          '<span class="language-selector-code">EN</span><span>English</span>' +
          (currentLocale === 'en' ? '<svg class="language-selector-check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.8a1 1 0 0 1 1.4 0Z" clip-rule="evenodd"></path></svg>' : '') +
        '</button></li>' +
        '<li role="presentation"><button class="language-selector-option" type="button" role="option" data-locale="es" lang="es" aria-selected="' + (currentLocale === 'es') + '">' +
          '<span class="language-selector-code">ES</span><span>Español</span>' +
          (currentLocale === 'es' ? '<svg class="language-selector-check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.8a1 1 0 0 1 1.4 0Z" clip-rule="evenodd"></path></svg>' : '') +
        '</button></li>' +
      '</ul>';

    headerContainer.insertBefore(selector, headerCta || headerContainer.querySelector('.nav-toggle'));

    const toggle = selector.querySelector('.language-selector-toggle');
    const menu = selector.querySelector('.language-selector-menu');
    const options = Array.prototype.slice.call(selector.querySelectorAll('.language-selector-option'));
    let activeIndex = currentLocale === 'es' ? 1 : 0;

    function setActiveOption(index) {
      activeIndex = Math.max(0, Math.min(index, options.length - 1));
      options.forEach(function (option, optionIndex) {
        option.classList.toggle('is-active', optionIndex === activeIndex);
        option.tabIndex = optionIndex === activeIndex ? 0 : -1;
      });
    }

    function openMenu() {
      selector.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
      setActiveOption(currentLocale === 'es' ? 1 : 0);
      options[activeIndex].focus();
    }

    function closeMenu(returnFocus) {
      selector.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
      if (returnFocus) toggle.focus();
    }

    function selectLocale(locale) {
      closeMenu(false);
      setLocaleCookie(locale);
      if (locale === currentLocale) {
        toggle.focus();
        return;
      }
      window.location.assign(localizedPageUrl(locale));
    }

    toggle.addEventListener('click', function () {
      if (menu.hidden) openMenu();
      else closeMenu(false);
    });

    toggle.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMenu();
      }
    });

    options.forEach(function (option, index) {
      option.addEventListener('mouseenter', function () { setActiveOption(index); });
      option.addEventListener('click', function () { selectLocale(option.dataset.locale); });
    });

    menu.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        event.preventDefault();
        closeMenu(true);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveOption(activeIndex + 1);
        options[activeIndex].focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveOption(activeIndex - 1);
        options[activeIndex].focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        setActiveOption(0);
        options[activeIndex].focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        setActiveOption(options.length - 1);
        options[activeIndex].focus();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectLocale(options[activeIndex].dataset.locale);
      }
    });

    document.addEventListener('pointerdown', function (event) {
      if (!menu.hidden && !selector.contains(event.target)) closeMenu(false);
    });
  }

  // ===========================================
  // Mobile Navigation Toggle
  // ===========================================
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', !isExpanded);
      mobileNav.classList.toggle('is-open');

      // Prevent body scroll when menu is open
      document.body.style.overflow = mobileNav.classList.contains('is-open') ? 'hidden' : '';

      // Update aria-label for screen readers
      this.setAttribute('aria-label', isExpanded ? interfaceText.openMenu : interfaceText.closeMenu);
    });

    // Close mobile nav when clicking on a link
    const mobileNavLinks = mobileNav.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });

    // Close mobile nav when pressing Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
        document.body.style.overflow = '';
        navToggle.focus();
      }
    });
  }

  // ===========================================
  // FAQ Accordion
  // ===========================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      // Generate unique ID for answer if not present
      if (!answer.id) {
        answer.id = 'faq-answer-' + Math.random().toString(36).substr(2, 9);
      }

      // Set up ARIA attributes
      question.setAttribute('aria-controls', answer.id);

      question.addEventListener('click', function () {
        const isOpen = item.classList.contains('is-open');

        // Close all other items (optional - remove for independent accordions)
        // faqItems.forEach(function(otherItem) {
        //   if (otherItem !== item) {
        //     otherItem.classList.remove('is-open');
        //     otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        //   }
        // });

        // Toggle current item
        item.classList.toggle('is-open');
        this.setAttribute('aria-expanded', !isOpen);
      });

      // Handle keyboard navigation
      question.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    }
  });

  // ===========================================
  // Smooth Scroll for Anchor Links
  // ===========================================
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Skip if it's just "#" or empty
      if (href === '#' || !href) return;

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        // Calculate offset for sticky header
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Set focus to target for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  // ===========================================
  // Shared Form Submission Helper
  // ===========================================
  function serializeFormData(form) {
    const data = {};
    const formData = new FormData(form);

    formData.forEach(function (value, key) {
      let normalizedKey = key;
      let isArray = false;

      if (key.endsWith('[]')) {
        normalizedKey = key.slice(0, -2);
        isArray = true;
      }

      if (isArray) {
        if (!data[normalizedKey]) {
          data[normalizedKey] = [];
        }
        data[normalizedKey].push(value);
        return;
      }

      if (Object.prototype.hasOwnProperty.call(data, normalizedKey)) {
        if (!Array.isArray(data[normalizedKey])) {
          data[normalizedKey] = [data[normalizedKey]];
        }
        data[normalizedKey].push(value);
        return;
      }

      data[normalizedKey] = value;
    });

    return data;
  }

  async function submitFormData(form, options) {
    const payload = {
      formId: options.formId,
      page: window.location.pathname,
      fields: serializeFormData(form)
    };

    const response = await fetch(form.action || '/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = interfaceText.submitError;
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.error) {
          errorMessage = errorBody.error;
        }
      } catch (err) {
        // Keep default error message.
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  window.ncnSubmitForm = submitFormData;

  // Record when a form is first rendered so the API can reject instant bot submits.
  const formStartedAtInputs = document.querySelectorAll('input[name="form_started_at"]');
  formStartedAtInputs.forEach(function (input) {
    if (!input.value) {
      input.value = String(Date.now());
    }
  });

  // ===========================================
  // Contact Form - Conditional Fields
  // ===========================================
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const inquiryRadios = contactForm.querySelectorAll('input[name="inquiry_type"]');
    const careFields = document.getElementById('care-fields');
    const careerFields = document.getElementById('career-fields');

    function updateFormFields() {
      const selectedValue = contactForm.querySelector('input[name="inquiry_type"]:checked');

      if (selectedValue) {
        const value = selectedValue.value;

        if (careFields) {
          careFields.style.display = (value === 'care_services' || value === 'gapp_program') ? 'block' : 'none';
        }

        if (careerFields) {
          careerFields.style.display = value === 'career' ? 'block' : 'none';
        }
      }
    }

    inquiryRadios.forEach(function (radio) {
      radio.addEventListener('change', updateFormFields);
    });

    // Initialize on page load
    updateFormFields();

    // Check URL parameters for pre-selection
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('position')) {
      const careerRadio = contactForm.querySelector('input[name="inquiry_type"][value="career"]');
      if (careerRadio) {
        careerRadio.checked = true;
        updateFormFields();

        const positionSelect = document.getElementById('position');
        if (positionSelect) {
          positionSelect.value = urlParams.get('position');
        }
      }
    }

    if (urlParams.has('careers')) {
      const careerRadio = contactForm.querySelector('input[name="inquiry_type"][value="career"]');
      if (careerRadio) {
        careerRadio.checked = true;
        updateFormFields();
      }
    }

    // Form validation and submission
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Basic validation
      const requiredFields = contactForm.querySelectorAll('[required]');
      let isValid = true;
      let firstError = null;

      requiredFields.forEach(function (field) {
        // Remove previous error states
        field.classList.remove('error');
        const errorMsg = field.parentNode.querySelector('.form-error');
        if (errorMsg) errorMsg.remove();

        // Check validity
        if (!field.checkValidity()) {
          isValid = false;
          field.classList.add('error');

          // Create error message
          const error = document.createElement('span');
          error.className = 'form-error';
          error.textContent = currentLocale === 'es' ? interfaceText.required : (field.validationMessage || interfaceText.required);
          error.setAttribute('role', 'alert');
          field.parentNode.appendChild(error);

          if (!firstError) firstError = field;
        }
      });

      if (!isValid) {
        firstError.focus();
        return;
      }

      // If valid, submit form data to the server
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      let statusMsg = contactForm.querySelector('.form-status');

      if (!statusMsg) {
        statusMsg = document.createElement('div');
        statusMsg.className = 'form-status';
        contactForm.appendChild(statusMsg);
      }

      submitBtn.textContent = interfaceText.sending;
      submitBtn.disabled = true;
      statusMsg.textContent = '';
      statusMsg.removeAttribute('role');

      try {
        await submitFormData(contactForm, { formId: 'contact' });
        // Create success message
        const successMsg = document.createElement('div');
        successMsg.className = 'cta-box';
        successMsg.innerHTML = `
          <h3 style="color: var(--color-success);">${interfaceText.thankYou}</h3>
          <p>${interfaceText.submitted}</p>
          <p><strong>${interfaceText.whatsNext}</strong> ${interfaceText.nextStep}</p>
        `;
        successMsg.setAttribute('role', 'alert');
        successMsg.setAttribute('aria-live', 'polite');

        contactForm.innerHTML = '';
        contactForm.appendChild(successMsg);

        // Scroll to success message
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        statusMsg.textContent = err.message;
        statusMsg.className = 'form-status form-error';
        statusMsg.setAttribute('role', 'alert');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ===========================================
  // Phone Number Formatting
  // ===========================================
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  phoneInputs.forEach(function (input) {
    input.addEventListener('input', function (e) {
      // Remove all non-digit characters
      let value = this.value.replace(/\D/g, '');

      // Limit to 10 digits
      value = value.substring(0, 10);

      // Format as (XXX) XXX-XXXX
      if (value.length > 6) {
        value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6);
      } else if (value.length > 3) {
        value = '(' + value.substring(0, 3) + ') ' + value.substring(3);
      } else if (value.length > 0) {
        value = '(' + value;
      }

      this.value = value;
    });
  });

  // ===========================================
  // Scroll-based Header Shadow
  // ===========================================
  const header = document.querySelector('.site-header');

  if (header) {
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 10) {
        header.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
      } else {
        header.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ===========================================
  // Intersection Observer for Animations
  // ===========================================
  if ('IntersectionObserver' in window) {
    const animatedElements = document.querySelectorAll('.card, .feature-card, .process-step, .testimonial');

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

  // ===========================================
  // Skip Link Focus Management
  // ===========================================
  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.getElementById('main-content');

  if (skipLink && mainContent) {
    skipLink.addEventListener('click', function (e) {
      e.preventDefault();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.scrollIntoView();
    });
  }

  // ===========================================
  // Print Styles - Add print button functionality
  // ===========================================
  const printButtons = document.querySelectorAll('[data-print]');

  printButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.print();
    });
  });

  // ===========================================
  // External Link Handler
  // ===========================================
  const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');

  externalLinks.forEach(function (link) {
    // Add external link indicator for accessibility
    if (!link.querySelector('.visually-hidden')) {
      const srText = document.createElement('span');
      srText.className = 'visually-hidden';
      srText.textContent = interfaceText.newTab;
      link.appendChild(srText);
    }

    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  // ===========================================
  // Service Worker Registration (for PWA - optional)
  // ===========================================
  // if ('serviceWorker' in navigator) {
  //   window.addEventListener('load', function() {
  //     navigator.serviceWorker.register('/sw.js').then(function(registration) {
  //       console.log('SW registered:', registration);
  //     }).catch(function(error) {
  //       console.log('SW registration failed:', error);
  //     });
  //   });
  // }

  // ===========================================
  // Utility: Debounce function
  // ===========================================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = function () {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ===========================================
  // Console welcome message
  // ===========================================
  console.log('%cNo Cost Nurse', 'color: #154DA9; font-size: 24px; font-weight: bold;');
  console.log('%cProviding compassionate care for Georgia\'s children', 'color: #64748B; font-size: 14px;');
  console.log('%cInterested in working with us? Visit /careers.html', 'color: #46BF4F; font-size: 12px;');

  // ===========================================
  // Dynamic Copyright Year
  // ===========================================
  const copyrightYear = document.getElementById('copyright-year');
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }

})();
