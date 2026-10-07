/* Bubu Protocol — a little picture book. No frameworks, no assets: bears are SVG, sounds are Web Audio. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const INK = '#4B2C25';

  /* ================= BEARS ================= */
  const LOOK = {
    bubu: { body: '#FFFFFF', ear: '#3A2A2A', foot: '#3A2A2A', cheek: '#F7B3B8' },
    dudu: { body: '#C99B78', ear: '#C99B78', foot: '#C99B78', cheek: '#F3C46A' },
  };
  const EYES = {
    happy:  `<circle cx="78" cy="90" r="6" fill="${INK}"/><circle cx="122" cy="90" r="6" fill="${INK}"/>`,
    tired:  `<path d="M70 92 h16 M114 92 h16" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
             <path d="M150 64 q6 10 0 14 q-6 -4 0 -14z" fill="#9FD3F2" stroke="${INK}" stroke-width="2.5"/>`,
    sleep:  `<path d="M70 89 q8 8 16 0 M114 89 q8 8 16 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    angry:  `<circle cx="80" cy="92" r="6" fill="${INK}"/><circle cx="120" cy="92" r="6" fill="${INK}"/>
             <path d="M68 76 l18 8 M132 76 l-18 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    excited:`<path d="M72 84 l12 7 l-12 7 M128 84 l-12 7 l12 7" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  const MOUTH = {
    happy: 'M92 101 q4 6 8 0 q4 6 8 0',
    tired: 'M93 104 q7 -4 14 0',
    angry: 'M92 105 q8 -6 16 0',
  };
  function bear(kind, mood) {
    const c = LOOK[kind];
    const mouth = MOUTH[mood] || MOUTH.happy;
    return `<svg viewBox="0 0 200 200" role="img" aria-label="${kind === 'bubu' ? 'Bubu the panda' : 'Dudu the bear'}">
      <g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="50" cy="46" r="18" fill="${c.ear}"/><circle cx="150" cy="46" r="18" fill="${c.ear}"/>
        <path d="M64 118 Q54 184 80 184 H120 Q146 184 136 118 Z" fill="${c.body}"/>
        <ellipse cx="82" cy="186" rx="15" ry="9" fill="${c.foot}"/><ellipse cx="118" cy="186" rx="15" ry="9" fill="${c.foot}"/>
        <ellipse cx="62" cy="142" rx="10" ry="15" fill="${c.body}" transform="rotate(20 62 142)"/>
        <ellipse cx="138" cy="142" rx="10" ry="15" fill="${c.body}" transform="rotate(-20 138 142)"/>
        <ellipse cx="100" cy="86" rx="68" ry="54" fill="${c.body}"/>
      </g>
      <ellipse cx="56" cy="104" rx="13" ry="9" fill="${c.cheek}"/><ellipse cx="144" cy="104" rx="13" ry="9" fill="${c.cheek}"/>
      ${EYES[mood] || EYES.happy}
      <path d="${mouth}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
  const paintBears = () => $$('.bear-slot').forEach(s => { s.innerHTML = bear(s.dataset.bear, s.dataset.mood); });
  const setMood = (slot, mood) => { slot.dataset.mood = mood; slot.innerHTML = bear(slot.dataset.bear, mood); };

  /* ================= SOUND ================= */
  const Sound = (() => {
    let ctx, master, musicBus, on = true, musicTimer;
    function init() {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.0;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
      musicBus.connect(lp); lp.connect(master);
    }
    function tone({ f = 440, to, dur = .2, type = 'sine', vol = .2, at = 0, out } = {}) {
      if (!ctx || !on) return;
      const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.02, dur / 3));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(out || master); o.start(t); o.stop(t + dur + .05);
    }
    function noise(dur = .15, vol = .3, at = 0, freq = 800) {
      if (!ctx || !on) return;
      const t = ctx.currentTime + at, len = ctx.sampleRate * dur;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource(), g = ctx.createGain(), bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = freq; g.gain.value = vol;
      src.buffer = buf; src.connect(bp); bp.connect(g); g.connect(master); src.start(t);
    }
    const fx = {
      squeak: () => { tone({ f: 900, to: 1700, dur: .09, vol: .15 }); tone({ f: 1700, to: 1100, dur: .09, vol: .12, at: .09 }); },
      pop:    () => tone({ f: 380, to: 900, dur: .08, vol: .2 }),
      creak:  () => { tone({ f: 110, to: 190, dur: .7, type: 'sawtooth', vol: .04 }); tone({ f: 140, to: 95, dur: .5, type: 'sawtooth', vol: .03, at: .5 }); },
      bonk:   () => { tone({ f: 220, to: 55, dur: .3, type: 'triangle', vol: .5 }); noise(.12, .5, 0, 600);
                      tone({ f: 1100, to: 2200, dur: .1, vol: .18, at: .04 }); tone({ f: 2200, to: 1300, dur: .12, vol: .14, at: .14 }); },
      giggle: (at = 0) => { [0, .11, .22, .36, .47].forEach((d, i) => {
                        const f = i % 2 ? 820 : 980; tone({ f, to: f * 1.18, dur: .08, vol: .12, at: at + d, type: 'triangle' }); }); },
      whoosh: () => noise(.35, .15, 0, 1800),
      chime:  () => [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone({ f, dur: .7, vol: .08, at: i * .09 })),
      heart:  (n = 0) => tone({ f: [523, 659, 784, 1046][n % 4], dur: .4, vol: .1 }),
      flip:   () => { noise(.08, .12, 0, 2500); tone({ f: 600, to: 900, dur: .06, vol: .06 }); },
      sigh:   () => tone({ f: 330, to: 220, dur: .9, type: 'triangle', vol: .05 }),
    };
    // lo-fi bedtime loop: soft triangle pads + sparse music-box notes
    const CHORDS = [[174.6, 220, 261.6, 329.6], [164.8, 196, 246.9, 293.7], [146.8, 174.6, 220, 261.6], [130.8, 164.8, 196, 246.9]];
    const BOX = [523.3, 587.3, 659.3, 784, 880, 1046.5];
    let step = 0;
    function bar() {
      const ch = CHORDS[step++ % CHORDS.length];
      ch.forEach(f => tone({ f, dur: 3.9, type: 'triangle', vol: .05, out: musicBus }));
      tone({ f: ch[0] / 2, dur: 3.9, vol: .07, out: musicBus });
      [0, 1.1, 2.2, 3].forEach(at => { if (Math.random() < .55) tone({ f: BOX[Math.random() * BOX.length | 0], dur: 1.2, vol: .045, at, out: musicBus }); });
    }
    function startMusic() {
      if (!ctx || musicTimer) return;
      musicBus.gain.setTargetAtTime(1, ctx.currentTime, 1.5);
      bar(); musicTimer = setInterval(bar, 4000);
    }
    function setOn(v) {
      on = v;
      if (!ctx) return;
      master.gain.setTargetAtTime(v ? .9 : 0, ctx.currentTime, .1);
      if (v) { ctx.resume(); startMusic(); }
    }
    // Real Bubu voice clips (sounds/bNN.m4a). Each moment in the book maps to one or more clips;
    // lists rotate so repeated taps don't sound identical. Missing clips fall back to synth.
    const VOICE = {
      start: ['b01'], tired: ['b02'], welcome: ['b03'], pizza: ['b04', 'b05'],
      summon: ['b06'], bonk: ['b07', 'b08', 'b09'], bonked: ['b10'],
      duvet: ['b11'], lamp: ['b12'], tea: ['b13'], plush: ['b14'], sleepy: ['b15'],
      polaroid: ['b16', 'b17'], hug: ['b18'],
    };
    const buffers = {}, turn = {};
    let ready = Promise.resolve();
    function loadVoices() {
      const ids = [...new Set(Object.values(VOICE).flat())];
      ready = Promise.all(ids.map(id => fetch(`sounds/${id}.m4a`).then(r => r.ok ? r.arrayBuffer() : Promise.reject())
        .then(b => ctx.decodeAudioData(b)).then(buf => { buffers[id] = buf; }).catch(() => {})));
    }
    function voice(role, { at = 0, vol = 1 } = {}) {
      const list = VOICE[role];
      if (!ctx || !on || !list) return false;
      const id = list[(turn[role] = ((turn[role] ?? -1) + 1) % list.length)];
      const buf = buffers[id];
      if (!buf) return false;
      const src = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime + at;
      g.gain.value = vol; src.buffer = buf; src.connect(g); g.connect(master); src.start(t);
      // duck the music under her voice
      musicBus.gain.setTargetAtTime(.35, t, .05);
      musicBus.gain.setTargetAtTime(1, t + buf.duration, .4);
      return true;
    }
    document.addEventListener('visibilitychange', () => { if (ctx) document.hidden ? ctx.suspend() : on && ctx.resume(); });
    return { init() { const first = !ctx; init(); if (first) loadVoices(); }, fx, voice, startMusic, setOn, get on() { return on; }, get ready() { return ready; } };
  })();

  /* ================= PARTICLES ================= */
  const HEART = c => `<svg viewBox="0 0 40 36"><path d="M20 34 C6 24 2 16 2 10 A9 9 0 0 1 20 7 A9 9 0 0 1 38 10 C38 16 34 24 20 34Z" fill="${c}" stroke="${INK}" stroke-width="3"/></svg>`;
  const STAR = c => `<svg viewBox="0 0 40 40"><path d="M20 3 L25 15 L38 16 L28 25 L31 38 L20 31 L9 38 L12 25 L2 16 L15 15 Z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`;
  const fxLayer = $('#fx');
  function burst(x, y, n = 14) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.innerHTML = i % 2 ? HEART(['#EE6B6B', '#F4AFB4'][i % 4 > 1 ? 1 : 0]) : STAR(['#F6C86B', '#FFE7A8'][i % 3 ? 0 : 1]);
      const a = (Math.PI * 2 * i) / n + Math.random() * .4, d = 70 + Math.random() * 90;
      p.style.left = x - 13 + 'px'; p.style.top = y - 13 + 'px';
      p.style.setProperty('--dx', Math.cos(a) * d + 'px');
      p.style.setProperty('--dy', Math.sin(a) * d + 'px');
      p.style.setProperty('--r', (Math.random() * 360 | 0) + 'deg');
      fxLayer.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }
  function floatHearts(x, y, n = 6) {
    for (let i = 0; i < n; i++) {
      const h = document.createElement('div');
      h.className = 'floaty'; h.innerHTML = HEART(i % 2 ? '#F4AFB4' : '#EE6B6B');
      h.style.left = x - 12 + (Math.random() * 80 - 40) + 'px'; h.style.top = y + 'px';
      h.style.animationDelay = i * .15 + 's';
      h.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
      fxLayer.appendChild(h);
      h.addEventListener('animationend', () => h.remove());
    }
  }
  const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  /* ================= PAGES ================= */
  const pages = $$('.page'), book = $('#book'), pager = $('#pager');
  const dots = $('#dots'), prevBtn = $('#prevBtn'), nextBtn = $('#nextBtn');
  const TITLES = ['Cover', 'The heavy door', 'The hammer room', 'The blanket fort', 'Memory constellations', 'The cozy haven'];
  let current = 0;
  pages.forEach((_, i) => {
    const li = document.createElement('li'), b = document.createElement('button');
    b.setAttribute('aria-label', i ? `Chapter ${i}: ${TITLES[i]}` : 'Cover');
    b.addEventListener('click', () => go(i));
    li.appendChild(b); dots.appendChild(li);
  });
  const enter = {};
  function go(i) {
    if (i < 0 || i >= pages.length || i === current) return;
    book.classList.toggle('going-back', i < current);
    pages[current].classList.remove('is-active');
    current = i;
    pages[i].classList.add('is-active');
    $$('button', dots).forEach((b, j) => j === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'));
    prevBtn.style.visibility = i === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = i === pages.length - 1 ? 'Read again' : 'Next page';
    pager.classList.toggle('is-hidden', i === 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fxLayer.replaceChildren(); Sound.fx.flip();
    enter[i] && enter[i]();
  }
  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current === pages.length - 1 ? 0 : current + 1));
  document.addEventListener('keydown', e => {
    if (e.target.matches('input')) return;
    if (e.key === 'ArrowRight' && current > 0) nextBtn.click();
    if (e.key === 'ArrowLeft') go(current - 1);
  });

  const soundBtn = $('#soundBtn');
  soundBtn.addEventListener('click', () => {
    Sound.init();
    const v = !Sound.on; Sound.setOn(v);
    soundBtn.setAttribute('aria-pressed', v);
    soundBtn.setAttribute('aria-label', v ? 'Turn sound off' : 'Turn sound on');
  });
  $('#startBtn').addEventListener('click', () => {
    Sound.init(); Sound.setOn(Sound.on); Sound.startMusic();
    Sound.ready.then(() => Sound.voice('start') || Sound.fx.giggle());
    go(1);
  });

  /* ---------- Chapter 1: the heavy door ---------- */
  const door = $('.scene-door');
  let doorTimers = [];
  enter[1] = () => {
    doorTimers.forEach(clearTimeout); doorTimers = [];
    door.classList.remove('open', 'inside-now', 'handed');
    setMood($('.bubu-walk .bear-slot'), 'tired');
    $('#b1a').classList.remove('show'); $('#b1b').classList.remove('show');
    $('#hint1').hidden = false;
    $('#n1').textContent = 'Bubu drags herself home from coliz, bag scraping along the floor. One more step. Just one more.';
    const walker = $('.bubu-walk'); walker.style.animation = 'none'; walker.offsetHeight; walker.style.animation = '';
    doorTimers.push(setTimeout(() => { $('#b1a').classList.add('show'); Sound.voice('tired') || Sound.fx.sigh(); }, 2400));
  };
  $('#knob').addEventListener('click', async () => {
    if (door.classList.contains('open')) return;
    $('#hint1').hidden = true; $('#b1a').classList.remove('show');
    Sound.fx.creak();
    door.classList.add('open');
    await wait(900);
    $('#b1b').classList.add('show'); Sound.voice('welcome') || (Sound.fx.squeak(), Sound.fx.giggle(.3));
    $('#n1').textContent = 'Dudu was already at the door, way too excited, with a slice of Domino’s ready for her.';
    await wait(2800);
    $('#b1b').classList.remove('show');
    door.classList.add('handed');
    setMood($('.bubu-walk .bear-slot'), 'excited');
    Sound.fx.pop(); Sound.voice('pizza', { at: .1 }) || Sound.fx.giggle(.2);
    burst(...centerOf($('.bubu-walk')), 12);
    $('#n1').textContent = 'One look at the pizza and Bubu’s tired face melts into the biggest smile.';
    await wait(2600);
    door.classList.add('inside-now');
    floatHearts(...centerOf($('.doorway')), 5);
    Sound.fx.chime();
  });

  /* ---------- Chapter 2: the hammer room ---------- */
  const form = $('#annoyForm'), input = $('#annoyInput'), bonkBtn = $('#bonkBtn');
  const target = $('#target'), runner = $('#runner'), dudu2 = $('.bear-slot', runner);
  let bonks = 0, busy = false;
  enter[2] = () => setTimeout(() => $('#b2').classList.add('show'), 300);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const txt = input.value.trim() || 'whatever it was';
    $('#signText').textContent = txt;
    target.classList.remove('bonked'); target.hidden = false;
    target.style.animation = 'none'; target.offsetHeight; target.style.animation = '';
    $('#emptyArena').hidden = true;
    $('#b2').textContent = 'Oh, it’s YOU. Stay right there.';
    setMood(dudu2, 'angry');
    bonkBtn.disabled = false; bonkBtn.focus({ preventScroll: true });
    input.value = '';
    Sound.fx.pop(); Sound.voice('summon', { at: .1 });
  });
  bonkBtn.addEventListener('click', async () => {
    if (busy || target.hidden) return;
    busy = true; bonkBtn.disabled = true;
    $('#b2').classList.remove('show');
    const rr = runner.getBoundingClientRect(), tr = target.getBoundingClientRect();
    runner.style.setProperty('--dist', Math.max(0, tr.left - rr.right + 10) + 'px');
    runner.classList.remove('charge'); runner.offsetHeight; runner.classList.add('charge');
    Sound.fx.whoosh();
    await wait(520);
    Sound.fx.bonk(); Sound.voice('bonk', { at: .05 });
    target.classList.add('bonked');
    burst(...centerOf(target), 16);
    await wait(450);
    target.hidden = true;
    bonks++;
    $('#bonkCount').textContent = `Bonked: ${bonks}`;
    setMood(dudu2, 'excited');
    Sound.voice('bonked', { at: .5 }) || Sound.fx.giggle(.05);
    $('#b2').textContent = bonks > 1 ? 'Next! Dudu is on duty all night.' : 'Hehe. Gone. Anything else?';
    $('#b2').classList.add('show');
    $('#emptyArena').hidden = false;
    runner.classList.remove('charge');
    busy = false;
    input.focus({ preventScroll: true });
  });

  /* ---------- Chapter 3: the blanket fort ---------- */
  const fort = $('#fortScene'), bed = $('#bed'), cells = $$('.cell'), shell = $('#battery');
  const LABELS = ['Almost empty. That’s okay.', 'A tiny bit warmer.', 'Getting cozy.', 'Almost there.', 'Full of love. No talking required.'];
  const used = new Set();
  function apply(kind) {
    if (used.has(kind)) return;
    used.add(kind);
    $(`.item[data-item="${kind}"]`).classList.add('used');
    if (kind === 'duvet') { bed.classList.add('covered'); Sound.fx.whoosh(); }
    if (kind === 'lamp') { fort.classList.add('dim'); Sound.fx.pop(); }
    if (kind === 'tea') { bed.classList.add('has-tea'); Sound.fx.squeak(); }
    if (kind === 'plush') { bed.classList.add('has-plush'); Sound.fx.squeak(); }
    Sound.voice(kind, { at: .15 });
    const n = used.size;
    cells[n].classList.add('on'); shell.classList.add('full');
    Sound.fx.heart(n);
    $('#batteryLabel').textContent = LABELS[n];
    floatHearts(...centerOf(bed), 3);
    if (n === cells.length - 1) {
      setTimeout(() => {
        setMood($('.bed-bubu'), 'sleep');
        $('#n3').textContent = 'Resting without speaking is 100% allowed. Encouraged, even.';
        Sound.fx.chime(); Sound.voice('sleepy', { at: 1.2 });
      }, 600);
    }
  }
  $$('.item').forEach(item => {
    let sx, sy, dragging = false, ox, oy;
    item.addEventListener('pointerdown', e => {
      if (used.has(item.dataset.item)) return;
      sx = e.clientX; sy = e.clientY; dragging = false;
      item.setPointerCapture(e.pointerId);
    });
    item.addEventListener('pointermove', e => {
      if (sx == null) return;
      if (!dragging && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
        dragging = true;
        const r = item.getBoundingClientRect(); ox = sx - r.left; oy = sy - r.top;
        item._ph = document.createElement('div');
        item._ph.style.cssText = `width:${r.width}px;height:${r.height}px`;
        item.after(item._ph);
        item.classList.add('dragging');
        Sound.fx.squeak();
      }
      if (dragging) {
        item.style.left = e.clientX - ox + 'px'; item.style.top = e.clientY - oy + 'px';
        const b = bed.getBoundingClientRect();
        bed.classList.toggle('drop-ready', e.clientX > b.left && e.clientX < b.right && e.clientY > b.top - 40 && e.clientY < b.bottom);
      }
    });
    const end = e => {
      if (sx == null) return;
      const wasDrag = dragging; sx = null; dragging = false;
      if (!wasDrag) return; // a plain tap is handled by click
      item.classList.remove('dragging'); item.style.left = item.style.top = '';
      item._ph && item._ph.remove();
      const hit = bed.classList.contains('drop-ready');
      bed.classList.remove('drop-ready');
      item._suppressClick = true;
      if (hit && e.type === 'pointerup') apply(item.dataset.item);
    };
    item.addEventListener('pointerup', end);
    item.addEventListener('pointercancel', end);
    item.addEventListener('click', () => {
      if (item._suppressClick) { item._suppressClick = false; return; }
      apply(item.dataset.item);
    });
  });

  /* ---------- Chapter 4: memory constellations ---------- */
  // Edit these freely — front label + what's written on the back.
  const MEMORIES = [
    { label: 'mai coliz ja rahiii', back: 'And somehow I miss you before you even reach the gate.', bg: '#FDE2E4', art: 'bubu-wave' },
    { label: 'Laddu', back: 'Round, sweet, and my favourite thing. No notes.', bg: '#FFF1C9', art: 'heart' },
    { label: 'Dudu', back: 'Secretly makes me feel the best in the world when my Bubu calls me Dudu.', bg: '#E5ECFB', art: 'dudu' },
    { label: 'cutu', back: 'Not a nickname. A factual description.', bg: '#E8F4E4', art: 'bubu' },
    { label: 'low-battery days', back: 'You don’t have to be bubbly for me to love you. Quiet you is my favourite too.', bg: '#F3E6F7', art: 'sleep' },
    { label: 'just existing', back: 'You don’t have to do anything today. Being you is already enough.', bg: '#FFE7D6', art: 'both' },
  ];
  const ART = {
    'bubu-wave': () => bear('bubu', 'excited'), bubu: () => bear('bubu', 'happy'), dudu: () => bear('dudu', 'happy'),
    sleep: () => bear('bubu', 'sleep'), heart: () => `<div class="heart-art">${HEART('#EE6B6B')}</div>`,
    both: () => `<div style="display:flex;width:100%">${bear('dudu', 'happy')}${bear('bubu', 'happy')}</div>`,
  };
  const wall = $('#polaroids');
  MEMORIES.forEach(m => {
    const b = document.createElement('button');
    b.className = 'polaroid';
    b.setAttribute('aria-label', `Photo: ${m.label}. Tap to turn over.`);
    b.innerHTML = `<div class="polaroid-inner">
      <div class="face front"><div class="photo" style="background:${m.bg}">${ART[m.art]()}</div><div class="label">${m.label}</div></div>
      <div class="face back">${m.back}</div></div>`;
    b.addEventListener('click', () => {
      const f = b.classList.toggle('flipped');
      b.setAttribute('aria-label', f ? m.back : `Photo: ${m.label}. Tap to turn over.`);
      Sound.fx.flip();
      if (f) { Sound.voice('polaroid') || Sound.fx.heart(Math.random() * 4 | 0); floatHearts(...centerOf(b), 2); }
    });
    wall.appendChild(b);
  });
  const bulbs = $('.bulbs');
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('span'); s.className = 'bulb';
    const x = (i + .5) / 12; // follow the fairy-light curve roughly
    s.style.left = `calc(${x * 100}% - 5px)`;
    s.style.top = 6 + Math.abs(Math.sin(x * Math.PI * 4)) * 14 + 'px';
    s.style.animationDelay = (i % 4) * .5 + 's';
    bulbs.appendChild(s);
  }

  /* ---------- Chapter 5: the cozy haven ---------- */
  const stars = $('.stars');
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('span'); s.className = 'star';
    s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 60 + '%';
    s.style.animationDelay = Math.random() * 3 + 's';
    stars.appendChild(s);
  }
  const hugBtn = $('#hugBtn'), snuggle = $('#snuggle'), letter = $('#letter');
  const HOLD = 1600;
  let raf, t0, hugTick;
  function hold(e) {
    e.preventDefault();
    if (raf) return;
    hugBtn.classList.add('holding'); t0 = performance.now(); hugTick = 0;
    const loop = now => {
      const p = Math.min(1, (now - t0) / HOLD);
      hugBtn.style.setProperty('--p', p);
      if (p > hugTick + .25) { hugTick += .25; Sound.fx.heart(hugTick * 4); }
      if (p >= 1) return hugDone();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  function release() {
    if (!raf) return;
    cancelAnimationFrame(raf); raf = null;
    hugBtn.classList.remove('holding'); hugBtn.style.setProperty('--p', 0);
  }
  function hugDone() {
    raf = null;
    hugBtn.classList.remove('holding'); hugBtn.style.setProperty('--p', 0);
    snuggle.classList.add('hug');
    Sound.fx.chime(); Sound.voice('hug', { at: .3 }) || Sound.fx.giggle(.5);
    burst(...centerOf(snuggle), 18);
    floatHearts(...centerOf(snuggle), 8);
    $('.hug-label', hugBtn).textContent = 'Hug again';
    if (letter.hidden) {
      letter.hidden = false;
      setTimeout(() => letter.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 400);
    }
    setTimeout(() => snuggle.classList.remove('hug'), 2600);
  }
  hugBtn.addEventListener('pointerdown', hold);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => hugBtn.addEventListener(t, release));
  hugBtn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) hold(e); });
  hugBtn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') release(); });
  hugBtn.addEventListener('contextmenu', e => e.preventDefault());

  /* ---------- boot ---------- */
  paintBears();
  pager.classList.add('is-hidden');
})();
