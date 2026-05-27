/* global availabilityData */

(function () {
  /* ─── State ───────────────────────────────────────────────────────── */

  var state = {
    step: 1,
    partySize: 2,
    date: '',
    time: '',
    name: '',
    email: '',
    requests: '',
  };

  var PARTY_MIN = 1;
  var PARTY_MAX = 12;
  var ALL_SLOTS = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
  var TOTAL_STEPS = 5;

  /* ─── Availability helpers ────────────────────────────────────────── */

  function getSizeKey(n) {
    if (n <= 2) return 'small';
    if (n <= 4) return 'medium';
    if (n <= 8) return 'large';
    return 'private';
  }

  function getSlotsForDate(dateStr, partySize) {
    if (!availabilityData || !availabilityData[dateStr]) return null;
    var dayData = availabilityData[dateStr];
    var key = getSizeKey(partySize);
    return Array.isArray(dayData[key]) ? dayData[key] : [];
  }

  /* ─── DOM helpers ─────────────────────────────────────────────────── */

  function setFieldError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(errorId);
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message || '';
  }

  function clearFieldErrors() {
    ['res-date', 'res-name', 'res-email'].forEach(function (id) {
      var input = document.getElementById(id);
      var error = document.getElementById(id + '-error');
      if (input) input.removeAttribute('aria-invalid');
      if (error) error.textContent = '';
    });
  }

  /* ─── Progress indicator ──────────────────────────────────────────── */

  function updateProgress() {
    var steps = document.querySelectorAll('.progress-step');
    steps.forEach(function (step) {
      var n = parseInt(step.dataset.step, 10);
      step.removeAttribute('aria-current');
      step.removeAttribute('data-complete');

      if (n === state.step) {
        step.setAttribute('aria-current', 'step');
      } else if (n < state.step) {
        step.dataset.complete = 'true';
      }
    });
  }

  /* ─── Navigation ──────────────────────────────────────────────────── */

  function showStep(n) {
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var panel = document.getElementById('step-' + i);
      if (panel) {
        if (i === n) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      }
    }

    state.step = n;
    updateProgress();
    updateNavButtons();

    var firstFocusable = document.querySelector(
      '#step-' + n + ' button:not([disabled]), #step-' + n + ' input, #step-' + n + ' textarea'
    );
    if (firstFocusable) {
      setTimeout(function () {
        firstFocusable.focus({ preventScroll: false });
      }, 80);
    }
  }

  function updateNavButtons() {
    var btnBack = document.getElementById('btn-back');
    var btnNext = document.getElementById('btn-next');
    var stepNav = document.getElementById('step-nav');

    if (!btnBack || !btnNext || !stepNav) return;

    if (state.step === 1) {
      btnBack.setAttribute('hidden', '');
    } else {
      btnBack.removeAttribute('hidden');
    }

    if (state.step === TOTAL_STEPS) {
      stepNav.style.display = 'none';
    } else {
      stepNav.style.display = '';
    }

    if (state.step === 4) {
      btnNext.innerHTML =
        'Confirm Reservation <svg class="icon" aria-hidden="true"><use href="#arrow-right"></use></svg>';
    } else {
      btnNext.innerHTML =
        'Next <svg class="icon" aria-hidden="true"><use href="#arrow-right"></use></svg>';
    }
  }

  /* ─── Step 1: Party Size ──────────────────────────────────────────── */

  function initPartySize() {
    var dec = document.getElementById('party-dec');
    var inc = document.getElementById('party-inc');
    var output = document.getElementById('party-value');

    function renderStepper() {
      if (output) output.textContent = String(state.partySize);
      if (dec) dec.disabled = state.partySize <= PARTY_MIN;
      if (inc) inc.disabled = state.partySize >= PARTY_MAX;
      if (dec)
        dec.setAttribute('aria-label', 'Decrease party size (currently ' + state.partySize + ')');
      if (inc)
        inc.setAttribute('aria-label', 'Increase party size (currently ' + state.partySize + ')');
    }

    if (dec) {
      dec.addEventListener('click', function () {
        if (state.partySize > PARTY_MIN) {
          state.partySize--;
          state.time = '';
          renderStepper();
        }
      });
    }

    if (inc) {
      inc.addEventListener('click', function () {
        if (state.partySize < PARTY_MAX) {
          state.partySize++;
          state.time = '';
          renderStepper();
        }
      });
    }

    renderStepper();
  }

  /* ─── Step 2: Date ────────────────────────────────────────────────── */

  function initDatePicker() {
    var input = document.getElementById('res-date');
    if (!input) return;

    var today = new Date();
    var maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 90);

    function toISODate(d) {
      return d.toISOString().split('T')[0];
    }

    input.setAttribute('min', toISODate(today));
    input.setAttribute('max', toISODate(maxDate));

    input.addEventListener('change', function () {
      state.date = input.value;
      state.time = '';
      setFieldError('res-date', 'res-date-error', '');
    });
  }

  function validateDate() {
    var input = document.getElementById('res-date');
    if (!input || !input.value) {
      setFieldError('res-date', 'res-date-error', 'Please select a date.');
      return false;
    }
    var d = new Date(input.value + 'T12:00:00');
    if (d.getDay() === 1) {
      setFieldError(
        'res-date',
        'res-date-error',
        'We are closed on Mondays. Please choose another day.'
      );
      return false;
    }
    return true;
  }

  /* ─── Step 3: Time Slots ──────────────────────────────────────────── */

  function renderTimeSlots() {
    var container = document.getElementById('time-slots');
    var slots, isFullyBooked, empty, icon, msgEl, hint;

    if (!container) return;

    container.innerHTML = '';

    slots = getSlotsForDate(state.date, state.partySize);

    if (slots === null || (Array.isArray(slots) && slots.length === 0)) {
      isFullyBooked = Array.isArray(slots) && slots.length === 0;

      empty = document.createElement('div');
      empty.className = 'slots-empty';

      icon = document.createElement('div');
      icon.className = 'slots-empty-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#calendar-x"></use></svg>';

      msgEl = document.createElement('p');
      msgEl.className = 'slots-empty-msg';
      msgEl.textContent = isFullyBooked
        ? 'Fully booked for your party size.'
        : 'No availability on this date.';

      hint = document.createElement('p');
      hint.className = 'slots-empty-hint';
      hint.textContent = 'Try another date, or call us at +44 (0)20 7123 4567.';

      empty.appendChild(icon);
      empty.appendChild(msgEl);
      empty.appendChild(hint);
      container.appendChild(empty);
      return;
    }

    ALL_SLOTS.forEach(function (slot) {
      var available = slots.indexOf(slot) !== -1;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot-btn';
      btn.textContent = slot;

      if (!available) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.setAttribute('aria-label', slot + ' — unavailable');
        btn.classList.add('time-slot-btn--unavailable');
      } else {
        btn.setAttribute('aria-label', slot + ' — available');
        btn.addEventListener('click', function () {
          state.time = slot;
          container.querySelectorAll('.time-slot-btn').forEach(function (b) {
            b.classList.remove('time-slot-btn--selected');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('time-slot-btn--selected');
          btn.setAttribute('aria-pressed', 'true');
        });
      }

      container.appendChild(btn);
    });
  }

  /* ─── Step 4: Contact ─────────────────────────────────────────────── */

  function initContactForm() {
    var nameInput = document.getElementById('res-name');
    var emailInput = document.getElementById('res-email');
    var requestsInput = document.getElementById('res-requests');

    if (nameInput) {
      nameInput.addEventListener('input', function () {
        state.name = nameInput.value.trim();
        if (state.name) setFieldError('res-name', 'res-name-error', '');
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', function () {
        state.email = emailInput.value.trim();
        if (state.email) setFieldError('res-email', 'res-email-error', '');
      });
    }

    if (requestsInput) {
      requestsInput.addEventListener('input', function () {
        state.requests = requestsInput.value;
      });
    }
  }

  function validateContact() {
    var valid = true;

    var nameInput = document.getElementById('res-name');
    if (!nameInput || !nameInput.value.trim()) {
      setFieldError('res-name', 'res-name-error', 'Please enter your full name.');
      valid = false;
    }

    var emailInput = document.getElementById('res-email');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput || !emailInput.value.trim()) {
      setFieldError('res-email', 'res-email-error', 'Please enter your email address.');
      valid = false;
    } else if (!emailPattern.test(emailInput.value.trim())) {
      setFieldError('res-email', 'res-email-error', 'Please enter a valid email address.');
      valid = false;
    }

    return valid;
  }

  /* ─── Step 5: Confirmation ────────────────────────────────────────── */

  function buildConfirmationCard() {
    var card = document.getElementById('confirmation-card');
    if (!card) return;

    var dateObj = new Date(state.date + 'T12:00:00');
    var formattedDate = dateObj.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    var rows = [
      { label: 'Name', value: state.name },
      { label: 'Date', value: formattedDate },
      { label: 'Time', value: state.time },
      {
        label: 'Party size',
        value: state.partySize + ' ' + (state.partySize === 1 ? 'guest' : 'guests'),
      },
      { label: 'Confirmation sent to', value: state.email },
    ];

    if (state.requests.trim()) {
      rows.push({ label: 'Special requests', value: state.requests.trim(), isNote: true });
    }

    card.innerHTML = '';
    rows.forEach(function (row) {
      var div = document.createElement('div');
      div.className = 'confirmation-row';

      var label = document.createElement('span');
      label.className = 'confirmation-label';
      label.textContent = row.label;

      var value = document.createElement('span');
      value.className = row.isNote ? 'confirmation-requests' : 'confirmation-value';
      value.textContent = row.value;

      div.appendChild(label);
      div.appendChild(value);
      card.appendChild(div);
    });
  }

  function simulateSubmit(onSuccess, onError) {
    var btnNext = document.getElementById('btn-next');
    if (btnNext) {
      btnNext.disabled = true;
      btnNext.textContent = 'Confirming…';
    }

    setTimeout(function () {
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.innerHTML =
          'Confirm Reservation <svg class="icon" aria-hidden="true"><use href="#arrow-right"></use></svg>';
      }
      onSuccess();
    }, 700);

    void onError;
  }

  /* ─── Validation per step ─────────────────────────────────────────── */

  function validateStep(n) {
    clearFieldErrors();

    if (n === 1) {
      return state.partySize >= PARTY_MIN && state.partySize <= PARTY_MAX;
    }
    if (n === 2) {
      return validateDate();
    }
    if (n === 3) {
      if (!state.time) {
        var container = document.getElementById('time-slots');
        if (container && !container.querySelector('.slots-empty')) {
          var hint = document.createElement('p');
          hint.className = 'field-error';
          hint.style.textAlign = 'center';
          hint.id = 'slot-error';
          hint.textContent = 'Please select a time slot.';
          var existing = document.getElementById('slot-error');
          if (existing) existing.remove();
          container.after(hint);
        }
        return false;
      }
      var slotErr = document.getElementById('slot-error');
      if (slotErr) slotErr.remove();
      return true;
    }
    if (n === 4) {
      return validateContact();
    }
    return true;
  }

  /* ─── Step navigation handlers ────────────────────────────────────── */

  function handleNext() {
    if (!validateStep(state.step)) return;

    if (state.step === 4) {
      var errBanner = document.getElementById('submit-error');
      if (errBanner) errBanner.setAttribute('hidden', '');

      simulateSubmit(
        function () {
          buildConfirmationCard();
          showStep(5);
        },
        function () {
          if (errBanner) errBanner.removeAttribute('hidden');
        }
      );
      return;
    }

    var next = state.step + 1;

    if (next === 3) {
      renderTimeSlots();
    }

    showStep(next);
  }

  function handleBack() {
    if (state.step <= 1) return;
    clearFieldErrors();
    showStep(state.step - 1);
  }

  /* ─── Print ───────────────────────────────────────────────────────── */

  function initPrintBtn() {
    var btn = document.getElementById('print-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        window.print();
      });
    }
  }

  /* ─── Retry ───────────────────────────────────────────────────────── */

  function initRetry() {
    var btn = document.getElementById('btn-retry');
    if (btn) {
      btn.addEventListener('click', function () {
        handleNext();
      });
    }
  }

  /* ─── Init ────────────────────────────────────────────────────────── */

  function init() {
    var btnNext = document.getElementById('btn-next');
    var btnBack = document.getElementById('btn-back');

    if (btnNext) btnNext.addEventListener('click', handleNext);
    if (btnBack) btnBack.addEventListener('click', handleBack);

    initPartySize();
    initDatePicker();
    initContactForm();
    initPrintBtn();
    initRetry();
    updateProgress();
    updateNavButtons();
  }

  document.addEventListener('carta:ready', init);
  document.addEventListener('carta:error', init);
})();
