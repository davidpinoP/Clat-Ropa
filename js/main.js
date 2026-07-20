/* CLAT — main.js: menú móvil, envío de formularios por WhatsApp, revelado en scroll */
(function () {
  'use strict';

  // TODO(dueño): sustituir por el número real de WhatsApp en formato internacional sin '+' ni espacios.
  var WHATSAPP_NUMBER = '34600000000';

  /* ---------------- Header scroll state ---------------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuToggle && mobileMenu) {
    var iconOpen = menuToggle.querySelector('.icon-open');
    var iconClose = menuToggle.querySelector('.icon-close');
    var setMenu = function (open) {
      mobileMenu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      if (iconOpen) iconOpen.style.display = open ? 'none' : 'block';
      if (iconClose) iconClose.style.display = open ? 'block' : 'none';
    };
    menuToggle.addEventListener('click', function () {
      setMenu(!mobileMenu.classList.contains('is-open'));
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------------- Sector explorer (tabbed solutions-by-industry) ---------------- */
  var sectorExplorer = document.querySelector('[data-sector-explorer]');
  if (sectorExplorer) {
    var sectorIndicator = sectorExplorer.querySelector('[data-sector-indicator]');
    var sectorTabButtons = Array.prototype.slice.call(sectorExplorer.querySelectorAll('[data-sector-tab]'));
    var sectorPanels = Array.prototype.slice.call(sectorExplorer.querySelectorAll('.sector-panel-item'));

    function moveSectorIndicator(activeTab) {
      if (!sectorIndicator || !activeTab) return;
      // Only meaningful in the desktop vertical layout; harmless no-op otherwise.
      if (window.innerWidth < 1024) { sectorIndicator.classList.remove('is-ready'); return; }
      sectorIndicator.style.width = activeTab.offsetWidth + 'px';
      sectorIndicator.style.height = activeTab.offsetHeight + 'px';
      sectorIndicator.style.transform = 'translate(' + activeTab.offsetLeft + 'px,' + activeTab.offsetTop + 'px)';
      sectorIndicator.classList.add('is-ready');
    }

    function activateSector(name, options) {
      var moveFocus = options && options.moveFocus;
      var activeTab = null;
      sectorTabButtons.forEach(function (btn) {
        var isMatch = btn.getAttribute('data-sector-tab') === name;
        btn.classList.toggle('is-active', isMatch);
        btn.setAttribute('aria-selected', String(isMatch));
        btn.setAttribute('tabindex', isMatch ? '0' : '-1');
        if (isMatch) {
          activeTab = btn;
          if (moveFocus) btn.focus();
        }
      });
      sectorPanels.forEach(function (panel) {
        panel.classList.toggle('is-active', panel.id === 'panel-' + name);
      });
      moveSectorIndicator(activeTab);
      if (activeTab && window.innerWidth < 1024 && activeTab.scrollIntoView) {
        activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    sectorTabButtons.forEach(function (btn, index) {
      btn.addEventListener('click', function () {
        activateSector(btn.getAttribute('data-sector-tab'));
      });
      btn.addEventListener('keydown', function (e) {
        var dir = 0;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') dir = 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') dir = -1;
        else if (e.key === 'Home') dir = 'home';
        else if (e.key === 'End') dir = 'end';
        else return;
        e.preventDefault();
        var nextIndex;
        if (dir === 'home') nextIndex = 0;
        else if (dir === 'end') nextIndex = sectorTabButtons.length - 1;
        else nextIndex = (index + dir + sectorTabButtons.length) % sectorTabButtons.length;
        activateSector(sectorTabButtons[nextIndex].getAttribute('data-sector-tab'), { moveFocus: true });
      });
    });

    // Keep the sliding indicator aligned with the active tab across resizes
    // (e.g. rotating a tablet, or the desktop/mobile layout breakpoint).
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var current = sectorExplorer.querySelector('.sector-tab.is-active');
        moveSectorIndicator(current);
      }, 120);
    });

    // Position the indicator once layout has settled (fonts/icons affect width).
    window.requestAnimationFrame(function () {
      moveSectorIndicator(sectorExplorer.querySelector('.sector-tab.is-active'));
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Stat counters ---------------- */
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var statEls = document.querySelectorAll('.stat-number[data-count]');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (prefersReducedMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var duration = 1100;
    var start = null;
    function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var value = Math.round(target * easeOutQuad(progress));
      el.textContent = prefix + value + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && statEls.length) {
    var statIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach(function (el) { statIo.observe(el); });
  } else {
    statEls.forEach(animateCount);
  }

  /* ---------------- WhatsApp lead form ---------------- */
  function buildMensaje(datos) {
    var lineas = [
      'Hola, soy ' + datos.nombreEmpresa + '.',
      'Teléfono: ' + datos.telefono,
      'Estoy interesado en: ' + datos.servicio
    ];
    if (datos.mensaje) lineas.push('Mensaje: ' + datos.mensaje);
    lineas.push('');
    lineas.push('(Enviado desde la web de CLAT)');
    return lineas.join('\n');
  }

  function enviarFormularioPorWhatsApp(datos) {
    var mensaje = buildMensaje(datos);
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(mensaje);
    window.open(url, '_blank', 'noopener');
  }

  function setFieldError(row, hasError) {
    if (!row) return;
    row.classList.toggle('has-error', hasError);
  }

  function initForm(form) {
    var nombreInput = form.querySelector('[data-field="nombre"]');
    var telefonoInput = form.querySelector('[data-field="telefono"]');
    var servicioInput = form.querySelector('[data-field="servicio"]');
    var mensajeInput = form.querySelector('[data-field="mensaje"]');
    var consentInput = form.querySelector('[data-field="consent"]');
    var successBox = form.querySelector('.form-success');
    var submitBtn = form.querySelector('[type="submit"]');

    // Each field validates only itself on blur/change — validating the whole
    // form here would also toggle the consent row's error class, mutating its
    // container mid-click and causing the browser to drop the checkbox's
    // native toggle when a user clicks the checkbox right after another field.
    function validateNombre() {
      var ok = nombreInput.value.trim().length > 1;
      setFieldError(nombreInput.closest('.form-row'), !ok);
      return ok;
    }
    function validateTelefono() {
      var ok = /^[0-9()+\-\s]{6,20}$/.test(telefonoInput.value.trim());
      setFieldError(telefonoInput.closest('.form-row'), !ok);
      return ok;
    }
    function validateServicio() {
      var ok = !!servicioInput.value;
      setFieldError(servicioInput.closest('.form-row'), !ok);
      return ok;
    }
    function validateConsent() {
      if (!consentInput) return true;
      var ok = consentInput.checked;
      setFieldError(consentInput.closest('.form-row'), !ok);
      return ok;
    }
    function validate() {
      var nombreOk = validateNombre();
      var telOk = validateTelefono();
      var servicioOk = validateServicio();
      var consentOk = validateConsent();
      return nombreOk && telOk && servicioOk && consentOk;
    }

    if (nombreInput) nombreInput.addEventListener('blur', validateNombre);
    if (telefonoInput) telefonoInput.addEventListener('blur', validateTelefono);
    if (servicioInput) servicioInput.addEventListener('blur', validateServicio);
    if (consentInput) consentInput.addEventListener('change', validateConsent);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        var firstError = form.querySelector('.has-error input, .has-error select');
        if (firstError) firstError.focus();
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      var servicioTextoMap = {
        lavanderia: 'Lavandería industrial',
        renting: 'Renting textil',
        ambos: 'Ambos / no lo tengo claro'
      };

      enviarFormularioPorWhatsApp({
        nombreEmpresa: nombreInput.value.trim(),
        telefono: telefonoInput.value.trim(),
        servicio: servicioTextoMap[servicioInput.value] || servicioInput.value,
        mensaje: mensajeInput ? mensajeInput.value.trim() : ''
      });

      if (successBox) successBox.classList.add('is-visible');

      window.setTimeout(function () {
        if (submitBtn) submitBtn.disabled = false;
      }, 1200);
    });
  }

  document.querySelectorAll('form[data-whatsapp-form]').forEach(initForm);

  /* Expose for floating WhatsApp button / quick-contact links */
  window.CLAT_WHATSAPP_NUMBER = WHATSAPP_NUMBER;
})();
