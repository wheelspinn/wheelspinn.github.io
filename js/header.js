// header.js — Site Header Component
(function () {
  const NAV = [
    { label: 'Spin Wheel', href: '#hero' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Wheel Types', href: '#wheel-types-section' },
    { label: 'Use Cases', href: '#use-cases' },
    { label: 'FAQ', href: '#faq' },
  ];

  function buildHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    header.innerHTML = `
      <div class="header-inner">
        <a href="#hero" class="logo">
          <div class="logo-icon">🎡</div>
          WheelSpinn
        </a>
        <nav class="nav-links" id="main-nav">
          ${NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join('')}
          <a href="#hero" class="nav-cta">Spin Now 🎲</a>
        </nav>
        <button class="hamburger" id="hamburger" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    `;

    // Mobile nav
    const mobileNav = document.createElement('nav');
    mobileNav.className = 'mobile-nav';
    mobileNav.id = 'mobile-nav';
    mobileNav.innerHTML = NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join('') +
      `<a href="#hero" class="nav-cta" style="text-align:center;margin-top:4px;">Spin Now 🎲</a>`;
    document.body.insertBefore(mobileNav, document.body.children[1]);

    // Hamburger toggle
    const hamburger = document.getElementById('hamburger');
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });

    // Close mobile nav on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileNav.classList.remove('open'));
    });

    // Scroll behavior
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Active nav highlight
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + current) a.classList.add('active');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildHeader);
  } else {
    buildHeader();
  }
})();
