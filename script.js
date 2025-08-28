(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const searchToggle = document.getElementById('searchToggle');
  const headerSearch = document.getElementById('headerSearch');
  const headerSearchInput = document.getElementById('headerSearchInput');
  const headerSearchClear = document.getElementById('headerSearchClear');
  const sidebarSearchInput = document.getElementById('sidebarSearchInput');
  const categoryList = document.getElementById('categoryList');
  const postsGrid = document.getElementById('postsGrid');
  const posts = Array.from(postsGrid.querySelectorAll('.post-card'));

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Theme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(initialTheme);
  function setTheme(theme) {
    if (theme === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
    if (themeToggle) themeToggle.querySelector('.icon').textContent = theme === 'dark' ? '🌙' : '☀️';
  }
  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    setTheme(next);
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (headerSearch && !headerSearch.hidden) toggleHeaderSearch(false);
    });
  });

  // Header search toggle
  function toggleHeaderSearch(forceState) {
    const nextOpen = typeof forceState === 'boolean' ? forceState : headerSearch.hidden;
    headerSearch.hidden = !nextOpen;
    searchToggle.setAttribute('aria-expanded', String(nextOpen));
    if (nextOpen) {
      headerSearchInput?.focus();
    }
  }
  searchToggle?.addEventListener('click', () => toggleHeaderSearch());
  headerSearchClear?.addEventListener('click', () => {
    if (headerSearchInput) headerSearchInput.value = '';
    applyFilters();
    headerSearchInput?.focus();
  });

  // Filters and search
  let activeCategory = 'all';
  const activeChipClass = 'is-active';

  categoryList?.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const chip = target.closest('button.chip');
    if (!chip) return;
    const next = chip.getAttribute('data-filter');
    if (!next) return;
    activeCategory = next;
    categoryList.querySelectorAll('button.chip').forEach((c) => c.classList.remove(activeChipClass));
    chip.classList.add(activeChipClass);
    applyFilters();
  });

  const debounced = (fn, ms = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), ms);
    };
  };

  const onSearchInput = debounced(() => applyFilters(), 150);
  headerSearchInput?.addEventListener('input', onSearchInput);
  sidebarSearchInput?.addEventListener('input', onSearchInput);

  function textMatches(post, query) {
    if (!query) return true;
    const title = post.querySelector('.title')?.textContent?.toLowerCase() || '';
    const excerpt = post.querySelector('.excerpt')?.textContent?.toLowerCase() || '';
    return title.includes(query) || excerpt.includes(query);
  }

  function applyFilters() {
    const q1 = headerSearchInput?.value.trim().toLowerCase() || '';
    const q2 = sidebarSearchInput?.value.trim().toLowerCase() || '';
    const query = (q1 + ' ' + q2).trim();

    let visibleCount = 0;
    posts.forEach((post) => {
      const cat = post.getAttribute('data-category');
      const categoryOK = activeCategory === 'all' || cat === activeCategory;
      const searchOK = textMatches(post, query);
      const show = categoryOK && searchOK;
      post.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    postsGrid.setAttribute('data-visible-count', String(visibleCount));
  }

  // Scroll reveal
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
})();



