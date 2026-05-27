/* global menuData */

(function () {
  var TAG_LABELS = {
    GF: 'Gluten-Free',
    V: 'Vegetarian',
    VG: 'Vegan',
    DF: 'Dairy-Free',
    NF: 'Nut-Free',
  };

  /* ─── Render ──────────────────────────────────────────────────────── */

  function buildTag(code) {
    var span = document.createElement('span');
    span.className = 'menu-tag';
    span.textContent = code;
    span.setAttribute('title', TAG_LABELS[code] || code);
    return span;
  }

  function buildCard(item) {
    var card = document.createElement('article');
    card.className = 'menu-card';
    card.dataset.tags = item.tags.join(' ');

    var name = document.createElement('h4');
    name.className = 'menu-card-name';
    name.textContent = item.name;

    var price = document.createElement('span');
    price.className = 'menu-card-price';
    price.textContent = '£' + item.price;

    var desc = document.createElement('p');
    desc.className = 'menu-card-desc';
    desc.textContent = item.description;

    var tags = document.createElement('div');
    tags.className = 'menu-card-tags';
    item.tags.forEach(function (code) {
      tags.appendChild(buildTag(code));
    });

    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(desc);
    if (item.tags.length > 0) {
      card.appendChild(tags);
    }

    return card;
  }

  function buildSection(section) {
    var block = document.createElement('div');
    block.className = 'menu-section-block';
    block.id = 'section-' + section.id;

    var header = document.createElement('div');
    header.className = 'menu-section-block-header';

    var title = document.createElement('h3');
    title.className = 'menu-section-block-title';
    title.textContent = section.label;

    header.appendChild(title);
    block.appendChild(header);

    var cards = document.createElement('div');
    cards.className = 'menu-cards';
    section.items.forEach(function (item) {
      cards.appendChild(buildCard(item));
    });

    block.appendChild(cards);
    return block;
  }

  function renderMenu(data) {
    var grid = document.getElementById('menu-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!data || !data.sections || data.sections.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'menu-empty';
      empty.textContent = 'Menu not available. Please call us to enquire.';
      grid.appendChild(empty);
      return;
    }

    data.sections.forEach(function (section) {
      grid.appendChild(buildSection(section));
    });

    initFilter();
    initSectionNav();
  }

  /* ─── Filter ──────────────────────────────────────────────────────── */

  function applyFilter(filter) {
    var cards = document.querySelectorAll('.menu-card');
    var visibleCount = 0;

    cards.forEach(function (card) {
      var tags = card.dataset.tags ? card.dataset.tags.split(' ') : [];
      var show = filter === 'all' || tags.indexOf(filter) !== -1;

      if (show) {
        card.classList.remove('is-hidden');
        visibleCount++;
      } else {
        card.classList.add('is-hidden');
      }
    });

    var sections = document.querySelectorAll('.menu-section-block');
    sections.forEach(function (section) {
      var sectionCards = section.querySelectorAll('.menu-card:not(.is-hidden)');
      section.style.display = sectionCards.length === 0 ? 'none' : '';
    });

    var liveRegion = document.getElementById('menu-grid');
    if (liveRegion) {
      liveRegion.setAttribute('aria-label', 'Menu items — ' + visibleCount + ' shown');
    }
  }

  function initFilter() {
    var buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;
        buttons.forEach(function (b) {
          b.setAttribute('aria-pressed', 'false');
          b.classList.remove('filter-btn--active');
        });
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('filter-btn--active');
        applyFilter(filter);
      });
    });
  }

  /* ─── Sticky Section Nav ──────────────────────────────────────────── */

  function initSectionNav() {
    var navLinks = document.querySelectorAll('.menu-nav-link');
    if (!navLinks.length || !('IntersectionObserver' in window)) return;

    var sectionIds = [];
    navLinks.forEach(function (link) {
      sectionIds.push(link.dataset.section);
    });

    var activeSection = sectionIds[0];

    function setActiveLink(id) {
      navLinks.forEach(function (link) {
        var isActive = link.dataset.section === id;
        link.classList.toggle('is-active', isActive);
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.id.replace('section-', '');
          if (entry.isIntersecting) {
            activeSection = id;
            setActiveLink(activeSection);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach(function (id) {
      var el = document.getElementById('section-' + id);
      if (el) observer.observe(el);
    });

    setActiveLink(activeSection);
  }

  /* ─── Init ────────────────────────────────────────────────────────── */

  document.addEventListener('carta:ready', function () {
    renderMenu(menuData);
  });

  document.addEventListener('carta:error', function () {
    var grid = document.getElementById('menu-grid');
    if (!grid) return;
    grid.innerHTML =
      '<p class="menu-empty">Unable to load menu. Please call us at +44 (0)20 7123 4567.</p>';
  });
})();
