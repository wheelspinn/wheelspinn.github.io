// footer.js — Site Footer Component
(function () {
  const LINKS = {
    'Spin Wheel': [
      { label: 'Custom Wheel', href: '#hero' },
      { label: 'Yes or No Wheel', href: '#hero' },
      { label: 'Random Name Picker', href: '#hero' },
      { label: 'Number Wheel', href: '#hero' },
      { label: 'Color Wheel', href: '#hero' },
    ],
    'Features': [
      { label: 'Image Upload', href: '#features' },
      { label: 'Custom Colors', href: '#features' },
      { label: 'Sound Effects', href: '#features' },
      { label: 'Spin History', href: '#features' },
      { label: 'Wheel Presets', href: '#wheel-types-section' },
    ],
    'Info': [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Use Cases', href: '#use-cases' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Contact', href: '/contact' },
      { label: 'About', href: '/about' },
    ],
  };

  const SOCIAL = [
    { icon: '𝕏', label: 'X/Twitter' },
    { icon: '🔵', label: 'Facebook' },
    { icon: '📸', label: 'Instagram' },
    { icon: '▶', label: 'YouTube' },
  ];

  function buildFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;

    const colsHTML = Object.entries(LINKS).map(([title, links]) => `
      <div class="footer-col">
        <div class="footer-col-title">${title}</div>
        <div class="footer-links">
          ${links.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
        </div>
      </div>
    `).join('');

    footer.innerHTML = `
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="footer-logo">
              <div class="footer-logo-icon">🎡</div>
              Wheel Spinner
            </div>
            <p class="footer-tagline">
              The most customizable free spin the wheel tool online. Make decisions fun with beautiful, interactive spinning wheels — no signup needed.
            </p>
            <div class="footer-social">
              ${SOCIAL.map(s => `<button class="social-btn" title="${s.label}">${s.icon}</button>`).join('')}
            </div>
          </div>
          ${colsHTML}
        </div>
        <div class="footer-bottom">
          <p class="footer-copy">© ${new Date().getFullYear()} WheelSpinn.github.io — Free Spin The Wheel Tool. All rights reserved.</p>
          <div class="footer-legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Use</a>
            <a href="/cookies">Cookie Policy</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </div>
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildFooter);
  } else {
    buildFooter();
  }
})();
