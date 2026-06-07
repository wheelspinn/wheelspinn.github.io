// wheel.js — Full Wheel Spinner Application
(function () {

  // ─── PALETTES ───────────────────────────────────────────────────────────────
  const PALETTES = {
    rainbow:  ['#FF6B6B','#FF9F43','#FFD166','#06D6A0','#4ECDC4','#6C63FF','#A29BFE','#FD79A8'],
    ocean:    ['#0077B6','#00B4D8','#90E0EF','#023E8A','#48CAE4','#0096C7','#ADE8F4','#03045E'],
    forest:   ['#2D6A4F','#40916C','#52B788','#74C69D','#95D5B2','#B7E4C7','#D8F3DC','#1B4332'],
    sunset:   ['#F94144','#F3722C','#F8961E','#F9C74F','#90BE6D','#43AA8B','#4D908E','#577590'],
    candy:    ['#FF6FB0','#FF99C9','#FFB347','#FFDAB9','#C9F0FF','#85E89D','#F4A261','#E76F51'],
    monochrome:['#2B2D42','#3D3F54','#555770','#6D7086','#8D99AE','#A8B2C0','#C4CBD3','#EDF2F4'],
  };

  // ─── PRESETS ────────────────────────────────────────────────────────────────
  const PRESETS = {
    custom:    { label: 'Custom', entries: ['Option 1','Option 2','Option 3','Option 4','Option 5','Option 6'] },
    yesno:     { label: 'Yes / No', entries: ['YES ✅','NO ❌','YES ✅','MAYBE 🤔','NO ❌','YES ✅'] },
    numbers:   { label: 'Numbers', entries: ['1','2','3','4','5','6','7','8','9','10'] },
    colors:    { label: 'Colors', entries: ['🔴 Red','🟠 Orange','🟡 Yellow','🟢 Green','🔵 Blue','🟣 Purple','⚫ Black','⚪ White'] },
    days:      { label: 'Days', entries: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    lunch:     { label: 'Lunch', entries: ['🍕 Pizza','🍣 Sushi','🍔 Burger','🌮 Tacos','🍜 Noodles','🥗 Salad','🌯 Wrap','🍛 Curry'] },
    truth:     { label: 'Truth/Dare', entries: ['Truth 🎤','Dare 🔥','Truth 🎤','Dare 🔥','Skip ⏭','Double Dare 💥'] },
    prizes:    { label: 'Prizes', entries: ['🥇 Gold','🥈 Silver','🥉 Bronze','🎁 Gift','💰 Bonus','🎉 Party','Try Again','🏆 Trophy'] },
  };

  // ─── APP STATE ───────────────────────────────────────────────────────────────
  const state = {
    entries: [],
    images: {},       // index → dataURL
    palette: 'rainbow',
    spinning: false,
    currentAngle: 0,
    targetAngle: 0,
    history: [],
    soundOn: true,
    preset: 'custom',
    spinSpeed: 5,
    spinDuration: 5,
    showImage: true,
    fontStyle: 'default',
  };

  // ─── DOM REFS ────────────────────────────────────────────────────────────────
  let canvas, ctx, animFrame;
  const APP_ID = 'wheel-app';

  // ─── INIT ─────────────────────────────────────────────────────────────────────
  function init() {
    const app = document.getElementById(APP_ID);
    if (!app) return;

    renderApp(app);
    loadPreset('custom');
    requestAnimationFrame(drawWheel);
    setupReveal();
    createFloatingParticles();
    setupFAQ();
    setupSoundToggle();

    window.addEventListener('resize', () => {
      resizeCanvas();
      drawWheel();
    });
  }

  // ─── RENDER APP HTML ──────────────────────────────────────────────────────────
  function renderApp(app) {
    app.innerHTML = `
      <div class="app-topbar">
        <div class="app-topbar-title">🎡 Spin The Wheel</div>
        <div class="app-tabs" id="app-tabs">
          <div class="app-tab active" data-tab="spin">Spin</div>
          <div class="app-tab" data-tab="entries">Entries</div>
          <div class="app-tab" data-tab="settings">Settings</div>
        </div>
      </div>

      <div class="app-body">
        <!-- WHEEL PANEL -->
        <div class="wheel-panel">
          <div class="wheel-types" id="preset-selector">
            ${Object.entries(PRESETS).map(([k,v]) =>
              `<button class="wheel-type-btn${k==='custom'?' active':''}" data-preset="${k}">${v.label}</button>`
            ).join('')}
          </div>

          <div class="wheel-wrapper" id="wheel-wrapper">
            <div class="wheel-pointer"></div>
            <canvas id="wheel-canvas" width="320" height="320"></canvas>
            <button class="wheel-center-btn" id="center-btn" title="Spin!">SPIN</button>
            <div class="confetti-container" id="confetti-container"></div>
            <div class="winner-overlay" id="winner-overlay">
              <div class="winner-emoji" id="winner-emoji">🎉</div>
              <div class="winner-label">Winner!</div>
              <div class="winner-text" id="winner-text">Option 1</div>
              <img id="winner-img" class="winner-img" src="" alt="" style="display:none">
              <div class="winner-actions">
                <button class="winner-again" id="winner-again">Spin Again</button>
                <button class="winner-close" id="winner-close">Close</button>
              </div>
            </div>
          </div>

          <button class="spin-btn" id="spin-btn">
            <span>🎲</span> SPIN THE WHEEL
          </button>
        </div>

        <!-- SIDEBAR -->
        <div class="sidebar-panel" id="sidebar-spin">
          <!-- Entries -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">⚙ Entries (drag to reorder)</div>
          </div>
          <div class="entries-list" id="entries-list"></div>
          <button class="add-entry-btn" id="add-entry-btn">＋ Add Entry</button>

          <!-- History -->
          <div class="sidebar-section" style="margin-top:auto">
            <div class="sidebar-section-title">📜 Recent Spins</div>
          </div>
          <div class="history-list" id="history-list">
            <div style="padding:8px 12px;font-size:0.78rem;color:var(--text3);font-family:var(--font-ui)">No spins yet</div>
          </div>

          <!-- Settings quick -->
          <div class="sidebar-section">
            <div class="sidebar-section-title">🎨 Color Palette</div>
            <div class="palette-btns" id="palette-btns" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:4px;">
              ${Object.entries(PALETTES).map(([k,colors]) => `
                <button class="palette-btn${k==='rainbow'?' pal-active':''}" data-pal="${k}" title="${k}"
                  style="width:26px;height:26px;border-radius:6px;border:2.5px solid ${k==='rainbow'?'var(--secondary)':'var(--border)'};
                  background:linear-gradient(135deg,${colors[0]},${colors[2]},${colors[4]});cursor:pointer;transition:var(--transition)">
                </button>
              `).join('')}
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">🔊 Sound</div>
            <div class="setting-row">
              <span class="setting-label">Sound effects</span>
              <div class="setting-control">
                <button class="mini-btn active" id="sound-on-btn">On</button>
                <button class="mini-btn" id="sound-off-btn">Off</button>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">🎛 Spin Speed</div>
            <input type="range" class="mini-range" id="speed-range" min="3" max="10" value="5" style="width:100%">
            <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text3);font-family:var(--font-ui);margin-top:3px">
              <span>Slow</span><span>Fast</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Get canvas
    canvas = document.getElementById('wheel-canvas');
    ctx = canvas.getContext('2d');

    // Resize
    resizeCanvas();

    // Events
    document.getElementById('spin-btn').addEventListener('click', spinWheel);
    document.getElementById('center-btn').addEventListener('click', spinWheel);
    document.getElementById('add-entry-btn').addEventListener('click', () => addEntry(''));
    document.getElementById('winner-again').addEventListener('click', () => {
      document.getElementById('winner-overlay').classList.remove('show');
      clearConfetti();
      spinWheel();
    });
    document.getElementById('winner-close').addEventListener('click', () => {
      document.getElementById('winner-overlay').classList.remove('show');
      clearConfetti();
    });

    // Preset buttons
    document.getElementById('preset-selector').addEventListener('click', e => {
      const btn = e.target.closest('[data-preset]');
      if (!btn) return;
      document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadPreset(btn.dataset.preset);
    });

    // Palette buttons
    document.getElementById('palette-btns').addEventListener('click', e => {
      const btn = e.target.closest('[data-pal]');
      if (!btn) return;
      document.querySelectorAll('.palette-btn').forEach(b => {
        b.style.borderColor = 'var(--border)';
        b.classList.remove('pal-active');
      });
      btn.style.borderColor = 'var(--secondary)';
      btn.classList.add('pal-active');
      state.palette = btn.dataset.pal;
      drawWheel();
    });

    // Sound buttons
    document.getElementById('sound-on-btn').addEventListener('click', () => {
      state.soundOn = true;
      document.getElementById('sound-on-btn').classList.add('active');
      document.getElementById('sound-off-btn').classList.remove('active');
    });
    document.getElementById('sound-off-btn').addEventListener('click', () => {
      state.soundOn = false;
      document.getElementById('sound-off-btn').classList.add('active');
      document.getElementById('sound-on-btn').classList.remove('active');
    });

    // Speed
    document.getElementById('speed-range').addEventListener('input', e => {
      state.spinSpeed = parseInt(e.target.value);
    });
  }

  // ─── CANVAS RESIZE ────────────────────────────────────────────────────────────
  function resizeCanvas() {
    const wrapper = document.getElementById('wheel-wrapper');
    if (!wrapper || !canvas) return;
    const size = Math.min(wrapper.clientWidth - 40, 320);
    canvas.width = size;
    canvas.height = size;
  }

  // ─── LOAD PRESET ─────────────────────────────────────────────────────────────
  function loadPreset(key) {
    state.preset = key;
    state.entries = [...PRESETS[key].entries];
    state.images = {};
    renderEntries();
    drawWheel();
  }

  // ─── RENDER ENTRIES ───────────────────────────────────────────────────────────
  function renderEntries() {
    const list = document.getElementById('entries-list');
    if (!list) return;
    const palette = PALETTES[state.palette];
    list.innerHTML = '';

    state.entries.forEach((entry, i) => {
      const color = palette[i % palette.length];
      const row = document.createElement('div');
      row.className = 'entry-row';
      row.dataset.index = i;

      // Hidden file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      fileInput.addEventListener('change', e => handleImageUpload(e, i));

      const imgBtn = document.createElement('button');
      imgBtn.className = 'entry-img-btn';
      imgBtn.title = 'Upload image for this slice';
      if (state.images[i]) {
        imgBtn.innerHTML = `<img src="${state.images[i]}" alt="">`;
      } else {
        imgBtn.innerHTML = '📷';
      }
      imgBtn.addEventListener('click', () => fileInput.click());

      row.innerHTML = `
        <div class="entry-color" style="background:${color}"></div>
        <input class="entry-input" type="text" value="${escHtml(entry)}" placeholder="Enter option..." data-i="${i}">
        <button class="entry-del" data-i="${i}" title="Remove">✕</button>
      `;
      row.insertBefore(fileInput, row.firstChild);
      row.insertBefore(imgBtn, row.querySelector('.entry-del'));

      // Input change
      row.querySelector('.entry-input').addEventListener('input', e => {
        state.entries[parseInt(e.target.dataset.i)] = e.target.value;
        drawWheel();
      });

      // Delete
      row.querySelector('.entry-del').addEventListener('click', e => {
        const idx = parseInt(e.target.dataset.i);
        if (state.entries.length <= 2) { showToast('Need at least 2 entries!', '⚠️'); return; }
        state.entries.splice(idx, 1);
        delete state.images[idx];
        renderEntries();
        drawWheel();
      });

      list.appendChild(row);
    });
  }

  function addEntry(val) {
    if (state.entries.length >= 20) { showToast('Maximum 20 entries!', '⚠️'); return; }
    state.entries.push(val || `Option ${state.entries.length + 1}`);
    renderEntries();
    drawWheel();
    // Scroll to bottom
    const list = document.getElementById('entries-list');
    if (list) list.scrollTop = list.scrollHeight;
  }

  // ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────
  function handleImageUpload(e, idx) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      state.images[idx] = ev.target.result;
      renderEntries();
      drawWheel();
      showToast('Image added to slice!', '🖼️');
    };
    reader.readAsDataURL(file);
  }

  // ─── DRAW WHEEL ───────────────────────────────────────────────────────────────
  function drawWheel() {
    if (!canvas || !ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(cx, cy) - 6;

    ctx.clearRect(0, 0, W, H);

    const entries = state.entries.filter(e => e.trim() !== '');
    if (entries.length < 2) return;

    const palette = PALETTES[state.palette];
    const sliceAngle = (2 * Math.PI) / entries.length;

    // Drop shadow
    ctx.shadowColor = 'rgba(108,99,255,0.2)';
    ctx.shadowBlur = 20;

    entries.forEach((entry, i) => {
      const startAngle = state.currentAngle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = palette[i % palette.length];

      // Slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Slice border
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sliceAngle / 2);

      // Draw image if available
      const imgSrc = state.images[i];
      if (imgSrc && state.showImage) {
        try {
          const img = new Image();
          img.src = imgSrc;
          if (img.complete) {
            const imgSize = Math.min(R * 0.22, 32);
            ctx.save();
            ctx.beginPath();
            ctx.arc(R * 0.68, 0, imgSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, R * 0.68 - imgSize / 2, -imgSize / 2, imgSize, imgSize);
            ctx.restore();
          }
        } catch(e) {}
      }

      // Text label
      const fontSize = Math.max(9, Math.min(14, R / (entries.length * 0.9)));
      ctx.font = `bold ${fontSize}px Nunito, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 3;

      // Truncate long text
      let label = entry;
      const maxLen = Math.max(8, Math.floor(30 / entries.length));
      if (label.length > maxLen) label = label.substring(0, maxLen - 1) + '…';

      ctx.fillText(label, R - 14, 0);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.12, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.12);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(1, '#E0DAFF');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(108,99,255,0.3)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.strokeStyle = 'rgba(108,99,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // ─── SPIN ─────────────────────────────────────────────────────────────────────
  function spinWheel() {
    if (state.spinning) return;
    const entries = state.entries.filter(e => e.trim() !== '');
    if (entries.length < 2) { showToast('Add at least 2 entries!', '⚠️'); return; }

    state.spinning = true;
    document.getElementById('spin-btn').disabled = true;
    document.getElementById('winner-overlay').classList.remove('show');
    clearConfetti();

    // Random winner
    const winnerIdx = Math.floor(Math.random() * entries.length);
    const sliceAngle = (2 * Math.PI) / entries.length;

    // Calculate target angle so winner ends under the pointer (top, -π/2)
    const currentNorm = ((state.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const winnerCenter = winnerIdx * sliceAngle + sliceAngle / 2;
    const targetNorm = (2 * Math.PI) - winnerCenter + (3 * Math.PI / 2);
    const extraSpins = (5 + state.spinSpeed) * Math.PI * 2;
    const delta = ((targetNorm - currentNorm) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const totalRotation = extraSpins + delta;

    const duration = (3000 + state.spinSpeed * 400);
    const startAngle = state.currentAngle;
    const startTime = performance.now();

    if (state.soundOn) playSpinSound();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      state.currentAngle = startAngle + totalRotation * eased;
      drawWheel();

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        state.spinning = false;
        document.getElementById('spin-btn').disabled = false;
        state.currentAngle = startAngle + totalRotation;
        drawWheel();
        showWinner(winnerIdx, entries);
      }
    }
    animFrame = requestAnimationFrame(animate);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  // ─── WINNER ───────────────────────────────────────────────────────────────────
  function showWinner(idx, entries) {
    const text = entries[idx];
    const palette = PALETTES[state.palette];
    const color = palette[idx % palette.length];

    document.getElementById('winner-text').textContent = text;
    document.getElementById('winner-text').style.color = color;

    // Show image if available
    const winnerImg = document.getElementById('winner-img');
    if (state.images[idx]) {
      winnerImg.src = state.images[idx];
      winnerImg.style.display = 'block';
    } else {
      winnerImg.style.display = 'none';
    }

    // Pick a fun emoji
    const emojis = ['🎉','🏆','🌟','🎊','🥳','🎯','✨','🔥'];
    document.getElementById('winner-emoji').textContent = emojis[Math.floor(Math.random() * emojis.length)];

    document.getElementById('winner-overlay').classList.add('show');

    // Add to history
    addToHistory(text, color);

    // Confetti!
    spawnConfetti();

    if (state.soundOn) playWinSound();
  }

  // ─── HISTORY ─────────────────────────────────────────────────────────────────
  function addToHistory(text, color) {
    const existing = state.history.find(h => h.text === text);
    if (existing) {
      existing.count++;
    } else {
      state.history.unshift({ text, color, count: 1 });
      if (state.history.length > 8) state.history.pop();
    }
    renderHistory();
  }

  function renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    if (state.history.length === 0) {
      list.innerHTML = `<div style="padding:8px 12px;font-size:0.78rem;color:var(--text3);font-family:var(--font-ui)">No spins yet</div>`;
      return;
    }
    list.innerHTML = state.history.map(h => `
      <div class="history-item">
        <div class="history-dot" style="background:${h.color}"></div>
        <div class="history-text">${escHtml(h.text)}</div>
        <div class="history-count">×${h.count}</div>
      </div>
    `).join('');
  }

  // ─── CONFETTI ─────────────────────────────────────────────────────────────────
  function spawnConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    const colors = ['#FF6B35','#6C63FF','#FFD166','#06D6A0','#EF476F','#118AB2','#FFB347','#A29BFE'];
    const shapes = ['circle','square','triangle'];

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const size = 6 + Math.random() * 8;
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 2;

        piece.style.cssText = `
          left:${left}%; width:${size}px; height:${size}px;
          background:${color};
          border-radius:${shape === 'circle' ? '50%' : shape === 'square' ? '2px' : '0'};
          animation-duration:${duration}s; animation-delay:${delay}s;
          ${shape === 'triangle' ? `
            width:0;height:0;background:none;
            border-left:${size/2}px solid transparent;
            border-right:${size/2}px solid transparent;
            border-bottom:${size}px solid ${color};
          ` : ''}
        `;
        container.appendChild(piece);
        setTimeout(() => piece.remove(), (duration + delay + 0.5) * 1000);
      }, i * 20);
    }
  }

  function clearConfetti() {
    const container = document.getElementById('confetti-container');
    if (container) container.innerHTML = '';
  }

  // ─── SOUNDS ───────────────────────────────────────────────────────────────────
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playTone(freq, type, duration, gainVal) {
    try {
      const ac = getAudioCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      gain.gain.setValueAtTime(gainVal || 0.1, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch(e){}
  }

  function playSpinSound() {
    // Ticking effect
    let ticks = 0;
    const interval = setInterval(() => {
      playTone(300 + Math.random() * 200, 'square', 0.05, 0.05);
      ticks++;
      if (ticks > 30) clearInterval(interval);
    }, 80);
    setTimeout(() => clearInterval(interval), 3000);
  }

  function playWinSound() {
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'sine', 0.4, 0.15), i * 150);
    });
  }

  // ─── FLOATING PARTICLES ───────────────────────────────────────────────────────
  function createFloatingParticles() {
    const colors = ['#FF6B35','#6C63FF','#FFD166','#06D6A0','#EF476F'];
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 4 + Math.random() * 8;
      p.style.cssText = `
        left:${Math.random()*100}%;
        width:${size}px; height:${size}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        animation-duration:${8+Math.random()*12}s;
        animation-delay:${Math.random()*10}s;
      `;
      document.body.appendChild(p);
    }
  }

  // ─── REVEAL ANIMATIONS ────────────────────────────────────────────────────────
  function setupReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ─── FAQ ──────────────────────────────────────────────────────────────────────
  function setupFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
      item.querySelector('.faq-q').addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ─── SOUND TOGGLE ──────────────────────────────────────────────────────────────
  function setupSoundToggle() {
    const btn = document.getElementById('sound-toggle-global');
    if (!btn) return;
    btn.addEventListener('click', () => {
      state.soundOn = !state.soundOn;
      btn.textContent = state.soundOn ? '🔊' : '🔇';
      btn.title = state.soundOn ? 'Sound On' : 'Sound Off';
    });
  }

  // ─── TOAST ────────────────────────────────────────────────────────────────────
  function showToast(msg, icon) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.id = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `${icon || '✅'} ${msg}`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ─── UTIL ─────────────────────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─── START ────────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for inline usage
  window.WheelApp = { showToast, spinWheel: () => {
    const btn = document.getElementById('spin-btn');
    if (btn) btn.click();
  }};

})();
