(() => {
  const dg = window.DuduGames;
  const root = document.getElementById('quick-root');
  const game = document.body.dataset.quickGame;
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const auxEl = document.getElementById('aux');
  const msg = document.getElementById('msg');
  const startBtn = document.getElementById('start');
  let best = dg.getRecord(game);
  let cleanup = () => {};
  bestEl.textContent = best || '-';

  const difficulty = () => dg.getDifficulty();
  const setMsg = text => { msg.textContent = text; };
  function saveScore(value) {
    if (dg.setRecord(game, value)) {
      best = value;
      bestEl.textContent = best;
    }
  }
  function setScore(value) {
    scoreEl.textContent = value;
  }
  function setAux(value) {
    auxEl.textContent = value;
  }
  function clearRoot() {
    cleanup();
    cleanup = () => {};
    root.innerHTML = '';
  }
  function button(text, className = 'btn') {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = className;
    el.textContent = text;
    return el;
  }
  function canvas(width, height) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    c.className = 'quick-canvas game-board';
    root.appendChild(c);
    return c;
  }
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }
  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  function runDino() {
    clearRoot();
    const cv = canvas(640, 320), ctx = cv.getContext('2d');
    const speeds = { easy: 4, normal: 5, hard: 6.2 };
    const groundY = 278;
    let dino, obstacles, frame, score, running, raf;
    function reset() {
      dino = { x: 74, y: 232, w: 50, h: 46, vy: 0, onGround: true };
      obstacles = [];
      frame = 0; score = 0; running = true;
      setScore(0); setAux('0m'); setMsg('Espaço, toque ou ↑ para pular.');
      dg.markPlayed(game);
    }
    function jump() {
      if (!running) return reset();
      if (!dino.onGround) return;
      dino.vy = -10.5; dino.onGround = false; dg.sound('tick');
    }
    function step() {
      if (running) {
        frame++;
        const speed = speeds[difficulty()] || speeds.normal;
        dino.vy += .48; dino.y += dino.vy;
        if (dino.y >= groundY - dino.h) { dino.y = groundY - dino.h; dino.vy = 0; dino.onGround = true; }
        if (frame % Math.round(82 - speed * 5) === 0) {
          const kind = Math.random() > .38 ? 'cactus' : 'rock';
          obstacles.push({ x: 660, w: kind === 'cactus' ? rand(24, 38) : rand(34, 52), h: kind === 'cactus' ? rand(42, 66) : rand(24, 36), kind });
        }
        obstacles.forEach(o => o.x -= speed);
        obstacles = obstacles.filter(o => o.x > -60);
        score = Math.floor(frame / 6);
        setScore(score); setAux(score + 'm');
        if (score >= 100) dg.unlock('dino-100');
        for (const o of obstacles) {
          if (dino.x + 42 > o.x + 5 && dino.x + 7 < o.x + o.w - 3 && dino.y + 42 > groundY - o.h + 5) {
            running = false; saveScore(score); dg.sound('fail'); setMsg('Fim da corrida. Toque para tentar de novo.');
          }
        }
      }
      draw(); raf = requestAnimationFrame(step);
    }
    function roundedRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
    function draw() {
      const sky = ctx.createLinearGradient(0, 0, 0, 320);
      sky.addColorStop(0, '#15345f');
      sky.addColorStop(.55, '#17475b');
      sky.addColorStop(1, '#0d1526');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, 640, 320);

      ctx.fillStyle = 'rgba(255,255,255,.74)';
      for (let i = 0; i < 9; i++) {
        const x = (i * 112 - frame * .45) % 760 - 80;
        const y = 38 + (i % 4) * 30;
        ctx.beginPath();
        ctx.ellipse(x, y, 22, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 20, y + 2, 28, 10, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 45, y, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(34,211,238,.18)';
      for (let i = 0; i < 6; i++) {
        const x = (i * 160 - frame * .9) % 820 - 120;
        ctx.beginPath();
        ctx.moveTo(x, 236);
        ctx.lineTo(x + 82, 132 + (i % 2) * 18);
        ctx.lineTo(x + 176, 236);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = '#1f5f40'; ctx.fillRect(0, groundY, 640, 42);
      ctx.fillStyle = '#2f855a'; ctx.fillRect(0, groundY, 640, 8);
      ctx.fillStyle = 'rgba(251,191,36,.55)';
      for (let i = 0; i < 18; i++) {
        const x = (i * 44 - frame * 2.2) % 720 - 40;
        ctx.fillRect(x, groundY + 14 + (i % 3) * 7, 18, 3);
      }

      obstacles.forEach(o => drawObstacle(o));
      drawDino();

      if (!running) {
        ctx.fillStyle = 'rgba(3,7,18,.62)';
        ctx.fillRect(0, 112, 640, 92);
        ctx.fillStyle = '#e6edf3';
        ctx.font = '800 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Fim da corrida', 320, 158);
        ctx.font = '600 15px sans-serif';
        ctx.fillStyle = '#9fb0c3';
        ctx.fillText('Toque para tentar de novo', 320, 184);
      }
    }
    function drawDino() {
      const x = dino.x, y = dino.y;
      const bob = dino.onGround ? Math.sin(frame / 5) * 1.5 : 0;
      ctx.save();
      ctx.translate(0, bob);
      ctx.fillStyle = '#4ade80';
      roundedRect(x + 7, y + 15, 33, 28, 9); ctx.fill();
      roundedRect(x + 31, y + 4, 26, 21, 7); ctx.fill();
      ctx.fillStyle = '#86efac';
      roundedRect(x + 11, y + 21, 20, 14, 7); ctx.fill();
      ctx.fillStyle = '#bbf7d0';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 10 + i * 8, y + 16 - i % 2);
        ctx.lineTo(x + 14 + i * 8, y + 8);
        ctx.lineTo(x + 18 + i * 8, y + 16 - i % 2);
        ctx.fill();
      }
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(x + 49, y + 12, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(x + 55, y + 17);
      ctx.lineTo(x + 65, y + 20);
      ctx.lineTo(x + 55, y + 23);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + 12, y + 25); ctx.quadraticCurveTo(x - 10, y + 19, x - 3, y + 42); ctx.stroke();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 6;
      const stride = dino.onGround ? Math.sin(frame / 4) * 5 : -2;
      ctx.beginPath(); ctx.moveTo(x + 18, y + 41); ctx.lineTo(x + 14 + stride, y + 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 32, y + 41); ctx.lineTo(x + 37 - stride, y + 50); ctx.stroke();
      ctx.fillStyle = '#bbf7d0';
      ctx.fillRect(x + 13 + stride, y + 49, 12, 4);
      ctx.fillRect(x + 31 - stride, y + 49, 12, 4);
      ctx.restore();
    }
    function drawObstacle(o) {
      const base = groundY;
      if (o.kind === 'rock') {
        ctx.fillStyle = '#a78bfa';
        roundedRect(o.x, base - o.h, o.w, o.h, 8); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.22)';
        roundedRect(o.x + 7, base - o.h + 7, o.w * .45, 6, 3); ctx.fill();
        return;
      }
      ctx.fillStyle = '#fb7185';
      roundedRect(o.x + o.w * .32, base - o.h, o.w * .38, o.h, 8); ctx.fill();
      roundedRect(o.x, base - o.h * .72, o.w * .36, o.h * .38, 8); ctx.fill();
      roundedRect(o.x + o.w * .58, base - o.h * .62, o.w * .4, o.h * .34, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.2)';
      ctx.fillRect(o.x + o.w * .45, base - o.h + 8, 3, o.h - 14);
    }
    root.addEventListener('pointerdown', jump);
    document.addEventListener('keydown', onKey);
    function onKey(e) { if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); jump(); } }
    cleanup = () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); };
    startBtn.onclick = reset;
    reset(); step();
  }

  function runLabirinto() {
    clearRoot();
    const size = difficulty() === 'hard' ? 12 : difficulty() === 'easy' ? 8 : 10;
    let level = 1, player, goal, walls;
    const board = document.createElement('div');
    board.className = 'quick-grid maze-grid';
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    root.appendChild(board);
    const controls = document.createElement('div');
    controls.className = 'game-actions';
    ['↑','←','↓','→'].forEach((t, i) => {
      const b = button(t); b.onclick = () => move([[0,-1],[-1,0],[0,1],[1,0]][i]); controls.appendChild(b);
    });
    root.appendChild(controls);
    function build() {
      player = { x: 0, y: 0 }; goal = { x: size - 1, y: size - 1 }; walls = new Set();
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        if ((x || y) && (x !== goal.x || y !== goal.y) && Math.random() < .22) walls.add(x + ',' + y);
      }
      for (let i = 0; i < size; i++) { walls.delete(i + ',0'); walls.delete((size - 1) + ',' + i); }
      render();
    }
    function render() {
      board.innerHTML = '';
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const cell = document.createElement('button');
        cell.className = 'game-cell maze-cell';
        cell.textContent = player.x === x && player.y === y ? '🙂' : goal.x === x && goal.y === y ? '🏁' : walls.has(x + ',' + y) ? '■' : '';
        board.appendChild(cell);
      }
      setScore(level - 1); setAux('Fase ' + level);
    }
    function move([dx, dy]) {
      const nx = player.x + dx, ny = player.y + dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size || walls.has(nx + ',' + ny)) return;
      player = { x: nx, y: ny }; dg.markPlayed(game); dg.sound('tick');
      if (nx === goal.x && ny === goal.y) {
        level++; dg.sound('win'); saveScore(level - 1); if (level >= 5) dg.unlock('labirinto-5'); build();
      } else render();
    }
    function onKey(e) {
      const map = { ArrowUp:[0,-1], ArrowLeft:[-1,0], ArrowDown:[0,1], ArrowRight:[1,0] };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    }
    document.addEventListener('keydown', onKey);
    cleanup = () => document.removeEventListener('keydown', onKey);
    startBtn.onclick = () => { level = 1; build(); };
    setMsg('Leve o personagem até a bandeira.');
    build();
  }

  function runPopGame(kind) {
    clearRoot();
    const cv = canvas(560, 360), ctx = cv.getContext('2d');
    const isWhack = kind === 'whack';
    let score = 0, time = 30, items = [], raf, timer, active = false, holes = [];
    if (isWhack) {
      const grid = document.createElement('div');
      grid.className = 'quick-grid whack-grid';
      root.innerHTML = ''; root.appendChild(grid);
      for (let i = 0; i < 9; i++) {
        const b = button('', 'game-cell whack-cell');
        b.onclick = () => hit(i);
        grid.appendChild(b); holes.push(b);
      }
    }
    function start() {
      score = 0; time = 30; items = []; active = true; setScore(0); setAux('30s'); dg.markPlayed(game);
      clearInterval(timer); timer = setInterval(() => { time--; setAux(time + 's'); if (time <= 0) end(); }, 1000);
      if (isWhack) spawnWhack(); else loop();
    }
    function end() {
      active = false; clearInterval(timer); cancelAnimationFrame(raf); saveScore(score); dg.sound('win');
      if (score >= 30) dg.unlock(isWhack ? 'whack-30' : 'bolha-30');
      setMsg('Tempo! Pontuação: ' + score + '.');
    }
    function spawnWhack() {
      if (!active) return;
      holes.forEach(h => h.textContent = '');
      const i = Math.floor(Math.random() * holes.length);
      holes[i].textContent = '🎯';
      setTimeout(spawnWhack, difficulty() === 'hard' ? 520 : difficulty() === 'easy' ? 900 : 700);
    }
    function hit(i) {
      if (!active || holes[i].textContent !== '🎯') return;
      holes[i].textContent = ''; score++; setScore(score); dg.sound('score');
    }
    function addBubble() {
      items.push({ x: rand(30,530), y: 380, r: rand(14,30), vy: rand(1,2.4), c: ['#4ade80','#22d3ee','#a78bfa','#fbbf24'][Math.floor(Math.random()*4)] });
    }
    function loop() {
      if (!active) return;
      if (Math.random() < .08) addBubble();
      items.forEach(b => b.y -= b.vy);
      items = items.filter(b => b.y > -40);
      ctx.fillStyle = '#0d1526'; ctx.fillRect(0,0,560,360);
      items.forEach(b => { ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); });
      raf = requestAnimationFrame(loop);
    }
    cv.addEventListener('pointerdown', e => {
      if (!active || isWhack) return;
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * 560 / r.width, y = (e.clientY - r.top) * 360 / r.height;
      const hitIndex = items.findIndex(b => Math.hypot(x - b.x, y - b.y) <= b.r + 6);
      if (hitIndex >= 0) { items.splice(hitIndex, 1); score++; setScore(score); dg.sound('score'); }
    });
    cleanup = () => { clearInterval(timer); cancelAnimationFrame(raf); };
    startBtn.onclick = start;
    setMsg(isWhack ? 'Acerte o alvo antes que ele mude de lugar.' : 'Estoure o máximo de bolhas em 30 segundos.');
    start();
  }

  function runGenius() {
    clearRoot();
    const colors = ['#4ade80','#22d3ee','#a78bfa','#fb7185'];
    const pad = document.createElement('div'); pad.className = 'genius-grid'; root.appendChild(pad);
    let seq = [], input = [], showing = false, phase = 0;
    colors.forEach((c, i) => {
      const b = button('', 'genius-pad'); b.style.background = c; b.onclick = () => press(i); pad.appendChild(b);
    });
    const pads = [...pad.children];
    function flash(i) { pads[i].classList.add('active'); setTimeout(() => pads[i].classList.remove('active'), 220); }
    function next() {
      input = []; phase++; seq.push(Math.floor(Math.random()*4)); setScore(phase); setAux('Fase ' + phase); saveScore(phase); if (phase >= 8) dg.unlock('genius-8');
      showing = true; seq.forEach((v, i) => setTimeout(() => flash(v), 400 + i * 430)); setTimeout(() => showing = false, 450 + seq.length * 430);
    }
    function press(i) {
      if (showing) return;
      dg.markPlayed(game); flash(i); input.push(i); dg.sound('tick');
      if (seq[input.length - 1] !== i) { dg.sound('fail'); setMsg('Errou! Aperte jogar para recomeçar.'); phase = 0; seq = []; return; }
      if (input.length === seq.length) { dg.sound('score'); setTimeout(next, 500); }
    }
    startBtn.onclick = () => { seq = []; phase = 0; setMsg('Repita a sequência cada vez maior.'); next(); };
    setMsg('Repita a sequência cada vez maior.');
    next();
  }

  function runMemoryThemes() {
    clearRoot();
    const themes = {
      frutas: ['🍎','🍌','🍇','🍓','🍍','🥝','🍒','🍉'],
      bichos: ['🐶','🐱','🦊','🐼','🐸','🐵','🐧','🦁'],
      doces: ['🍩','🍪','🍰','🍫','🍭','🧁','🍮','🍦']
    };
    let theme = 'frutas', cards = [], open = [], moves = 0, found = 0;
    const select = document.createElement('select'); select.className = 'dg-control';
    Object.keys(themes).forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = t; select.appendChild(o); });
    select.onchange = () => { theme = select.value; start(); };
    const board = document.createElement('div'); board.className = 'quick-grid themed-memory';
    root.append(select, board);
    function start() {
      moves = 0; found = 0; open = []; cards = shuffle([...themes[theme], ...themes[theme]]).map(v => ({ v, open:false, done:false }));
      setScore(0); setAux(theme); render();
    }
    function render() {
      board.innerHTML = '';
      cards.forEach((card, i) => {
        const b = button(card.open || card.done ? card.v : '?', 'game-cell memory-theme-card');
        b.onclick = () => flip(i); board.appendChild(b);
      });
    }
    function flip(i) {
      const card = cards[i]; if (card.done || card.open || open.length >= 2) return;
      dg.markPlayed(game); card.open = true; open.push(i); render();
      if (open.length === 2) {
        moves++; setScore(moves);
        const [a,b] = open;
        if (cards[a].v === cards[b].v) {
          cards[a].done = cards[b].done = true; found++; open = []; dg.sound('score'); if (found === themes[theme].length) { saveScore(moves); dg.unlock('memoria-temas-win'); }
        } else setTimeout(() => { cards[a].open = cards[b].open = false; open = []; dg.sound('fail'); render(); }, 650);
      }
    }
    startBtn.onclick = start;
    setMsg('Escolha um tema e encontre os pares.');
    start();
  }

  function runPacman() {
    clearRoot();
    const cv = canvas(450, 450), ctx = cv.getContext('2d');
    const N = 15, S = 30;
    let p, ghosts, dots, walls, score, raf, dir = {x:0,y:0}, running = true;
    function key(x,y){return x+','+y;}
    function reset() {
      p = {x:1,y:1}; ghosts = [{x:13,y:13},{x:13,y:1}]; score = 0; running = true; dir = {x:0,y:0};
      walls = new Set(); dots = new Set();
      for (let y=0;y<N;y++) for (let x=0;x<N;x++) {
        if (x===0||y===0||x===N-1||y===N-1||(x%4===0&&y>2&&y<12)||(y%5===0&&x>2&&x<12)) walls.add(key(x,y));
        else dots.add(key(x,y));
      }
      dots.delete(key(1,1)); setScore(0); setAux(dots.size + ' pontos'); dg.markPlayed(game);
    }
    function move(ent, d) {
      const nx=ent.x+d.x, ny=ent.y+d.y; if (!walls.has(key(nx,ny))) { ent.x=nx; ent.y=ny; }
    }
    function tick() {
      if (running) {
        move(p, dir);
        if (dots.delete(key(p.x,p.y))) { score++; setScore(score); setAux(dots.size + ' pontos'); dg.sound('score'); }
        ghosts.forEach(g => {
          const options = shuffle([{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]).sort((a,b)=>Math.hypot(p.x-(g.x+a.x),p.y-(g.y+a.y))-Math.hypot(p.x-(g.x+b.x),p.y-(g.y+b.y)));
          move(g, options[0]);
        });
        if (ghosts.some(g => g.x===p.x&&g.y===p.y)) { running=false; saveScore(score); dg.sound('fail'); setMsg('Pegaram você!'); }
        if (!dots.size) { running=false; saveScore(score); dg.unlock('pacman-clear'); dg.sound('win'); setMsg('Labirinto limpo!'); }
      }
      draw(); raf=setTimeout(tick, difficulty()==='hard'?150:difficulty()==='easy'?230:190);
    }
    function draw() {
      ctx.fillStyle='#0d1526'; ctx.fillRect(0,0,450,450);
      walls.forEach(k=>{const [x,y]=k.split(',').map(Number); ctx.fillStyle='#22d3ee'; ctx.fillRect(x*S+2,y*S+2,S-4,S-4);});
      dots.forEach(k=>{const [x,y]=k.split(',').map(Number); ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(x*S+15,y*S+15,3,0,Math.PI*2); ctx.fill();});
      ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.arc(p.x*S+15,p.y*S+15,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fb7185'; ghosts.forEach(g=>ctx.fillRect(g.x*S+6,g.y*S+6,18,18));
    }
    function onKey(e){const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}}; if(m[e.key]){e.preventDefault();dir=m[e.key];}}
    document.addEventListener('keydown', onKey);
    cleanup=()=>{clearTimeout(raf);document.removeEventListener('keydown',onKey);};
    startBtn.onclick=()=>{clearTimeout(raf);reset();tick();};
    setMsg('Coma os pontos e fuja dos fantasmas.');
    reset(); tick();
  }

  const suits = ['♠','♥','♦','♣'];
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

  function makeDeck(options = {}) {
    const suitSet = options.suits || suits;
    const decks = options.decks || 1;
    const cards = [];
    for (let d = 0; d < decks; d++) {
      suitSet.forEach(suit => ranks.forEach((rank, i) => cards.push({
        id: `${d}-${suit}-${rank}-${cards.length}`,
        suit,
        rank,
        value: i + 1,
        color: suit === '♥' || suit === '♦' ? 'red' : 'black',
        up: options.faceUp !== false
      })));
    }
    return shuffle(cards);
  }

  function cardText(c) {
    return c ? c.rank + c.suit : '';
  }

  function runChess() {
    clearRoot();
    const board = document.createElement('div');
    const movesEl = document.createElement('div');
    board.className = 'chess-board';
    movesEl.className = 'chess-moves';
    root.append(board, movesEl);

    const icons = {
      wp:'♙', wr:'♖', wn:'♘', wb:'♗', wq:'♕', wk:'♔',
      bp:'♟', br:'♜', bn:'♞', bb:'♝', bq:'♛', bk:'♚'
    };
    let b, turn, selected, captures, enPassant, history, gameOver;

    function piece(c, t) {
      return { c, t, moved: false };
    }
    function setup() {
      b = Array.from({ length: 8 }, () => Array(8).fill(null));
      ['r','n','b','q','k','b','n','r'].forEach((t, x) => {
        b[0][x] = piece('b', t);
        b[1][x] = piece('b', 'p');
        b[6][x] = piece('w', 'p');
        b[7][x] = piece('w', t);
      });
      turn = 'w';
      selected = null;
      captures = 0;
      enPassant = null;
      history = [];
      gameOver = false;
      setScore(0);
      updateStatus('Brancas');
      setMsg('Xadrez para 2 jogadores: xeque, xeque-mate, roque, en passant e promoção automática para dama.');
      dg.markPlayed(game);
      render();
    }
    function inside(x, y) {
      return x >= 0 && y >= 0 && x < 8 && y < 8;
    }
    function opposite(c) {
      return c === 'w' ? 'b' : 'w';
    }
    function cloneBoard(src) {
      return src.map(row => row.map(p => p ? { ...p } : null));
    }
    function findKing(color, boardState = b) {
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        const p = boardState[y][x];
        if (p && p.c === color && p.t === 'k') return { x, y };
      }
      return null;
    }
    function clearPath(sx, sy, tx, ty, boardState = b) {
      const dx = Math.sign(tx - sx), dy = Math.sign(ty - sy);
      let x = sx + dx, y = sy + dy;
      while (x !== tx || y !== ty) {
        if (boardState[y][x]) return false;
        x += dx; y += dy;
      }
      return true;
    }
    function pseudoMoves(sx, sy, boardState = b, attacksOnly = false) {
      const p = boardState[sy][sx];
      if (!p) return [];
      const out = [];
      const add = (x, y) => {
        if (!inside(x, y)) return;
        const target = boardState[y][x];
        if (!target || target.c !== p.c) out.push({ x, y });
      };
      if (p.t === 'p') {
        const f = p.c === 'w' ? -1 : 1;
        [-1, 1].forEach(dx => {
          const x = sx + dx, y = sy + f;
          if (inside(x, y) && (attacksOnly || boardState[y][x] || (enPassant && enPassant.x === x && enPassant.y === y))) add(x, y);
        });
        if (!attacksOnly) {
          const one = sy + f, two = sy + f * 2;
          if (inside(sx, one) && !boardState[one][sx]) add(sx, one);
          if (!p.moved && inside(sx, two) && !boardState[one][sx] && !boardState[two][sx]) add(sx, two);
        }
      } else if (p.t === 'n') {
        [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([dx, dy]) => add(sx + dx, sy + dy));
      } else if (p.t === 'k') {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) add(sx + dx, sy + dy);
        if (!attacksOnly && !p.moved && !inCheck(p.c, boardState)) {
          [[7, 6, 5], [0, 2, 3]].forEach(([rookX, kingX, passX]) => {
            const rook = boardState[sy][rookX];
            const between = rookX === 7 ? [5, 6] : [1, 2, 3];
            if (rook && rook.t === 'r' && rook.c === p.c && !rook.moved &&
                between.every(x => !boardState[sy][x]) &&
                !isAttacked(passX, sy, opposite(p.c), boardState) &&
                !isAttacked(kingX, sy, opposite(p.c), boardState)) out.push({ x: kingX, y: sy, castle: rookX });
          });
        }
      } else {
        const dirs = {
          r: [[1,0],[-1,0],[0,1],[0,-1]],
          b: [[1,1],[1,-1],[-1,1],[-1,-1]],
          q: [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
        }[p.t];
        dirs.forEach(([dx, dy]) => {
          let x = sx + dx, y = sy + dy;
          while (inside(x, y)) {
            const target = boardState[y][x];
            if (!target) out.push({ x, y });
            else {
              if (target.c !== p.c) out.push({ x, y });
              break;
            }
            x += dx; y += dy;
          }
        });
      }
      return out.filter(m => {
        const dx = m.x - sx, dy = m.y - sy;
        if (['r','b','q'].includes(p.t)) return clearPath(sx, sy, m.x, m.y, boardState) && (boardState[m.y][m.x]?.c !== p.c);
        if (p.t === 'p' && !attacksOnly && dx === 0) return !boardState[m.y][m.x];
        return true;
      });
    }
    function isAttacked(x, y, byColor, boardState = b) {
      for (let sy = 0; sy < 8; sy++) for (let sx = 0; sx < 8; sx++) {
        const p = boardState[sy][sx];
        if (p && p.c === byColor && pseudoMoves(sx, sy, boardState, true).some(m => m.x === x && m.y === y)) return true;
      }
      return false;
    }
    function inCheck(color, boardState = b) {
      const k = findKing(color, boardState);
      return !!k && isAttacked(k.x, k.y, opposite(color), boardState);
    }
    function applyMove(boardState, sx, sy, move) {
      const next = cloneBoard(boardState);
      const moving = next[sy][sx];
      const target = next[move.y][move.x];
      if (moving.t === 'p' && enPassant && move.x === enPassant.x && move.y === enPassant.y && !target) {
        next[enPassant.victimY][enPassant.victimX] = null;
      }
      next[move.y][move.x] = { ...moving, moved: true };
      next[sy][sx] = null;
      if (move.castle !== undefined) {
        const rookTo = move.castle === 7 ? 5 : 3;
        next[move.y][rookTo] = { ...next[move.y][move.castle], moved: true };
        next[move.y][move.castle] = null;
      }
      if (moving.t === 'p' && (move.y === 0 || move.y === 7)) next[move.y][move.x].t = 'q';
      return next;
    }
    function legalMoves(sx, sy) {
      const p = b[sy][sx];
      if (!p) return [];
      return pseudoMoves(sx, sy).filter(m => !inCheck(p.c, applyMove(b, sx, sy, m)));
    }
    function hasLegalMove(color) {
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        if (b[y][x]?.c === color && legalMoves(x, y).length) return true;
      }
      return false;
    }
    function notation(sx, sy, tx, ty, moving, captured) {
      const files = 'abcdefgh';
      return `${icons[moving.c + moving.t]} ${files[sx]}${8 - sy}-${files[tx]}${8 - ty}${captured ? 'x' : ''}`;
    }
    function updateStatus(label) {
      setAux(label);
    }
    function click(x, y) {
      if (gameOver) return;
      const p = b[y][x];
      if (selected) {
        const [sx, sy] = selected;
        if (sx === x && sy === y) {
          selected = null;
          render();
          return;
        }
        if (p && p.c === turn) {
          selected = [x, y];
          render();
          return;
        }
        const move = legalMoves(sx, sy).find(m => m.x === x && m.y === y);
        if (!move) {
          setMsg('Movimento inválido ou deixaria o rei em xeque.');
          selected = null;
          render();
          return;
        }
        const moving = b[sy][sx];
        const epCapture = moving.t === 'p' && enPassant && x === enPassant.x && y === enPassant.y && !b[y][x];
        const captured = b[y][x] || (epCapture ? b[enPassant.victimY][enPassant.victimX] : null);
        b = applyMove(b, sx, sy, move);
        captures += captured ? 1 : 0;
        history.unshift(notation(sx, sy, x, y, moving, captured));
        enPassant = moving.t === 'p' && Math.abs(y - sy) === 2 ? { x, y: (y + sy) / 2, victimX: x, victimY: y } : null;
        turn = opposite(turn);
        selected = null;
        setScore(captures);
        saveScore(captures);
        dg.sound(captured ? 'score' : 'tick');
        if (inCheck(turn)) {
          if (!hasLegalMove(turn)) {
            gameOver = true;
            updateStatus('Xeque-mate');
            setMsg((turn === 'w' ? 'Pretas' : 'Brancas') + ' venceram por xeque-mate.');
            dg.unlock('xadrez-mate');
            dg.sound('win');
          } else {
            updateStatus((turn === 'w' ? 'Brancas' : 'Pretas') + ' em xeque');
            setMsg('Xeque! Defenda o rei.');
          }
        } else if (!hasLegalMove(turn)) {
          gameOver = true;
          updateStatus('Afogamento');
          setMsg('Empate por afogamento.');
        } else {
          updateStatus(turn === 'w' ? 'Brancas' : 'Pretas');
          setMsg('Toque uma peça e depois uma casa válida.');
        }
        render();
        return;
      }
      if (p && p.c === turn) {
        selected = [x, y];
        render();
      }
    }
    function render() {
      const legal = selected ? legalMoves(selected[0], selected[1]) : [];
      board.innerHTML = '';
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        const p = b[y][x];
        const pieceClass = p ? (p.c === 'w' ? ' white-piece' : ' black-piece') : '';
        const cell = button(p ? icons[p.c + p.t] : '', 'chess-cell ' + ((x + y) % 2 ? 'dark' : 'light') + pieceClass);
        if (selected && selected[0] === x && selected[1] === y) cell.classList.add('sel');
        if (legal.some(m => m.x === x && m.y === y)) cell.classList.add(p ? 'capture' : 'legal');
        if (p?.t === 'k' && inCheck(p.c)) cell.classList.add('check');
        cell.setAttribute('aria-label', `Casa ${x + 1}, ${y + 1}`);
        cell.onclick = () => click(x, y);
        board.appendChild(cell);
      }
      movesEl.textContent = history.slice(0, 6).join(' · ');
    }
    startBtn.onclick = setup;
    setup();
  }

  function runSolitaire(kind) {
    clearRoot();
    const area = document.createElement('div');
    area.className = 'cards-area';
    root.appendChild(area);
    let stock = [], waste = [], foundations = [], cells = [], cols = [], moves = 0, selected = null, won = false;

    function foundationCount() {
      return foundations.reduce((sum, f) => sum + f.length, 0);
    }
    function setCardMessage(text) {
      setMsg(text);
    }
    function reset() {
      moves = 0;
      selected = null;
      won = false;
      waste = [];
      cells = [null, null, null, null];
      foundations = kind === 'spider'
        ? Array.from({ length: 8 }, () => [])
        : suits.map(suit => Object.assign([], { suit }));
      if (kind === 'freecell') dealFreeCell();
      else if (kind === 'spider') dealSpider();
      else dealKlondike();
      dg.markPlayed(game);
      render();
    }
    function dealKlondike() {
      const d = makeDeck({ faceUp: false });
      cols = Array.from({ length: 7 }, () => []);
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
          const c = d.pop();
          c.up = j === i;
          cols[i].push(c);
        }
      }
      stock = d;
    }
    function dealFreeCell() {
      const d = makeDeck();
      cols = Array.from({ length: 8 }, () => []);
      d.forEach((c, i) => cols[i % 8].push(c));
      stock = [];
    }
    function spiderSuits() {
      if (difficulty() === 'easy') return ['♠'];
      if (difficulty() === 'hard') return suits;
      return ['♠', '♥'];
    }
    function dealSpider() {
      const suitSet = spiderSuits();
      const decks = Math.ceil(104 / (suitSet.length * 13));
      const d = makeDeck({ suits: suitSet, decks, faceUp: false }).slice(0, 104);
      cols = Array.from({ length: 10 }, () => []);
      for (let i = 0; i < 54; i++) {
        const c = d.pop();
        c.up = i >= 44;
        cols[i % 10].push(c);
      }
      stock = d;
    }
    function sameSelection(target) {
      return selected && selected.zone === target.zone && selected.index === target.index && selected.cardIndex === target.cardIndex;
    }
    function clearSelection() {
      selected = null;
    }
    function sourceCards() {
      if (!selected) return [];
      if (selected.zone === 'waste') return waste.length ? [waste.at(-1)] : [];
      if (selected.zone === 'cell') return cells[selected.index] ? [cells[selected.index]] : [];
      if (selected.zone === 'foundation') return foundations[selected.index].length ? [foundations[selected.index].at(-1)] : [];
      if (selected.zone === 'col') return cols[selected.index].slice(selected.cardIndex);
      return [];
    }
    function removeSource() {
      const cards = sourceCards();
      if (selected.zone === 'waste') waste.pop();
      else if (selected.zone === 'cell') cells[selected.index] = null;
      else if (selected.zone === 'foundation') foundations[selected.index].pop();
      else if (selected.zone === 'col') cols[selected.index].splice(selected.cardIndex);
      revealColumns();
      return cards;
    }
    function restoreSource(cards) {
      if (selected.zone === 'waste') waste.push(...cards);
      else if (selected.zone === 'cell') cells[selected.index] = cards[0];
      else if (selected.zone === 'foundation') foundations[selected.index].push(...cards);
      else if (selected.zone === 'col') cols[selected.index].push(...cards);
    }
    function revealColumns() {
      cols.forEach(col => {
        const top = col.at(-1);
        if (top && !top.up) top.up = true;
      });
    }
    function isAltDescending(cards) {
      return cards.every((c, i) => i === 0 || (cards[i - 1].value === c.value + 1 && cards[i - 1].color !== c.color));
    }
    function isSpiderRun(cards) {
      return cards.every((c, i) => c.up && (i === 0 || (cards[i - 1].value === c.value + 1 && cards[i - 1].suit === c.suit)));
    }
    function canSelectColumn(i, cardIndex) {
      const cards = cols[i].slice(cardIndex);
      if (!cards.length || !cards[0].up) return false;
      if (kind === 'spider') return isSpiderRun(cards);
      if (kind === 'freecell' && cards.length > movableLimit(i)) return false;
      return isAltDescending(cards);
    }
    function movableLimit(sourceCol) {
      if (kind !== 'freecell') return Infinity;
      const freeCells = cells.filter(c => !c).length;
      const emptyCols = cols.filter((col, i) => !col.length && i !== sourceCol).length;
      return (freeCells + 1) * Math.pow(2, emptyCols);
    }
    function movableLimitTo(sourceCol, targetCol) {
      if (kind !== 'freecell') return Infinity;
      const freeCells = cells.filter(c => !c).length;
      const emptyCols = cols.filter((col, i) => !col.length && i !== sourceCol && i !== targetCol).length;
      return (freeCells + 1) * Math.pow(2, emptyCols);
    }
    function canFoundation(card, i) {
      if (kind === 'spider') return false;
      const f = foundations[i];
      if (f.suit !== card.suit) return false;
      const top = f.at(-1);
      return top ? card.value === top.value + 1 : card.value === 1;
    }
    function canMoveToColumn(cards, i) {
      if (!cards.length) return false;
      const first = cards[0];
      const target = cols[i].at(-1);
      if (kind === 'klondike') return target ? target.up && target.value === first.value + 1 && target.color !== first.color : first.value === 13;
      if (kind === 'freecell') {
        if (selected?.zone === 'col' && cards.length > movableLimitTo(selected.index, i)) return false;
        return target ? target.value === first.value + 1 && target.color !== first.color : true;
      }
      return target ? target.up && target.value === first.value + 1 : true;
    }
    function selectWaste() {
      if (!waste.length) return;
      selected = { zone: 'waste' };
      setCardMessage('Carta do descarte selecionada. Toque numa base ou coluna válida.');
      render();
    }
    function selectCell(i) {
      if (!cells[i]) return;
      selected = { zone: 'cell', index: i };
      setCardMessage('Célula livre selecionada.');
      render();
    }
    function selectFoundation(i) {
      if (selected) {
        moveToFoundation(i);
        return;
      }
      if (kind !== 'spider' && foundations[i].length) {
        selected = { zone: 'foundation', index: i };
        setCardMessage('Base selecionada. Você pode devolver para uma coluna válida.');
        render();
      }
    }
    function selectColumn(i, cardIndex = cols[i].length - 1) {
      if (selected) {
        moveToColumn(i);
        return;
      }
      if (!canSelectColumn(i, cardIndex)) {
        setCardMessage(kind === 'spider' ? 'No Spider só dá para mover sequências abertas do mesmo naipe.' : 'Selecione uma sequência decrescente alternando cores.');
        return;
      }
      selected = { zone: 'col', index: i, cardIndex };
      setCardMessage('Sequência selecionada. Toque no destino.');
      render();
    }
    function moveToCell(i) {
      const cards = sourceCards();
      if (kind !== 'freecell' || cells[i] || cards.length !== 1) {
        setCardMessage('A célula livre recebe uma carta por vez.');
        return;
      }
      const moving = removeSource();
      cells[i] = moving[0];
      finishMove('Carta enviada para célula livre.');
    }
    function moveToFoundation(i) {
      const cards = sourceCards();
      if (cards.length !== 1 || !canFoundation(cards[0], i)) {
        setCardMessage('Essa carta ainda não pode ir para a base.');
        clearSelection();
        render();
        return;
      }
      const moving = removeSource();
      foundations[i].push(moving[0]);
      finishMove('Carta enviada para a base.');
    }
    function moveToColumn(i) {
      const cards = sourceCards();
      if (!cards.length || (selected.zone === 'col' && selected.index === i)) {
        clearSelection();
        render();
        return;
      }
      if (!canMoveToColumn(cards, i)) {
        setCardMessage('Destino inválido para essa sequência.');
        clearSelection();
        render();
        return;
      }
      const moving = removeSource();
      cols[i].push(...moving);
      if (kind === 'spider') completeSpiderRuns();
      finishMove('Movimento realizado.');
    }
    function finishMove(message) {
      moves++;
      clearSelection();
      dg.sound('tick');
      setCardMessage(message);
      checkWin();
      render();
    }
    function drawStock() {
      clearSelection();
      if (kind === 'spider') {
        if (!stock.length) {
          setCardMessage('Estoque vazio.');
          return;
        }
        if (cols.some(col => !col.length)) {
          setCardMessage('No Spider, preencha todas as colunas antes de comprar.');
          render();
          return;
        }
        cols.forEach(col => {
          const c = stock.pop();
          c.up = true;
          col.push(c);
        });
        moves++;
        setCardMessage('Nova linha distribuída.');
      } else {
        if (stock.length) {
          const draw = difficulty() === 'hard' && kind === 'klondike' ? 3 : 1;
          for (let i = 0; i < draw && stock.length; i++) {
            const c = stock.pop();
            c.up = true;
            waste.push(c);
          }
          moves++;
          setCardMessage('Carta comprada.');
        } else if (waste.length) {
          stock = waste.reverse().map(c => ({ ...c, up: false }));
          waste = [];
          moves++;
          setCardMessage('Descarte voltou para o estoque.');
        }
      }
      render();
    }
    function completeSpiderRuns() {
      cols.forEach(col => {
        let again = true;
        while (again) {
          again = false;
          const tail = col.slice(-13);
          if (tail.length === 13 && tail[0].value === 13 && tail.every((c, i) => c.up && c.value === 13 - i && c.suit === tail[0].suit)) {
            col.splice(-13);
            foundations[foundations.findIndex(f => !f.length)].push(...tail);
            revealColumns();
            dg.unlock('spider-run');
            dg.sound('score');
            again = true;
          }
        }
      });
    }
    function checkWin() {
      const done = kind === 'spider' ? foundations.every(f => f.length === 13) : foundationCount() === 52;
      if (done && !won) {
        won = true;
        saveScore(moves);
        dg.unlock(kind + '-win');
        setCardMessage('Vitória em ' + moves + ' movimentos!');
        dg.sound('win');
      }
    }
    function cardButton(card, onClick, extra = '') {
      const el = button(card.up ? cardText(card) : '◆', 'playing-card ' + (card.up ? card.color : 'is-down') + ' ' + extra);
      el.onclick = onClick;
      el.setAttribute('aria-label', card.up ? cardText(card) : 'Carta virada');
      return el;
    }
    function slot(text, onClick, extra = '') {
      const el = button(text, 'card-slot ' + extra);
      el.onclick = onClick;
      return el;
    }
    function renderTop() {
      const top = document.createElement('div');
      top.className = 'cards-top';
      if (kind !== 'freecell') top.appendChild(slot(kind === 'spider' ? `Comprar ${Math.ceil(stock.length / 10)}` : `Estoque ${stock.length}`, drawStock, stock.length ? '' : 'empty'));
      if (kind === 'klondike') {
        const wasteTop = waste.at(-1);
        top.appendChild(wasteTop ? cardButton(wasteTop, selectWaste, selected?.zone === 'waste' ? 'is-selected' : '') : slot('Descarte', () => {}, 'empty'));
      }
      if (kind === 'freecell') cells.forEach((c, i) => top.appendChild(c
        ? cardButton(c, () => selected ? moveToCell(i) : selectCell(i), selected?.zone === 'cell' && selected.index === i ? 'is-selected' : '')
        : slot('Livre', () => selected ? moveToCell(i) : null, 'empty')));
      foundations.forEach((f, i) => {
        const label = kind === 'spider' ? (f.length ? 'K-A' : 'Sequência') : (f.length ? cardText(f.at(-1)) : 'Base ' + f.suit);
        const el = f.length && kind !== 'spider'
          ? cardButton(f.at(-1), () => selectFoundation(i), selected?.zone === 'foundation' && selected.index === i ? 'is-selected' : '')
          : slot(label, () => selectFoundation(i), f.length ? 'complete' : 'empty');
        top.appendChild(el);
      });
      area.appendChild(top);
    }
    function renderColumns() {
      const table = document.createElement('div');
      table.className = 'cards-table cards-' + cols.length;
      cols.forEach((col, i) => {
        const stack = document.createElement('div');
        stack.className = 'card-stack';
        stack.onclick = event => {
          if (event.target === stack) selected ? moveToColumn(i) : null;
        };
        if (!col.length) stack.appendChild(slot('Vazio', () => selected ? moveToColumn(i) : null, 'empty'));
        col.forEach((card, cardIndex) => {
          const extra = selected?.zone === 'col' && selected.index === i && cardIndex >= selected.cardIndex ? 'is-selected' : '';
          const el = cardButton(card, event => {
            event.stopPropagation();
            if (sameSelection({ zone: 'col', index: i, cardIndex })) {
              clearSelection();
              render();
            } else {
              selectColumn(i, cardIndex);
            }
          }, extra);
          stack.appendChild(el);
        });
        table.appendChild(stack);
      });
      area.appendChild(table);
    }
    function render() {
      area.innerHTML = '';
      renderTop();
      renderColumns();
      setScore(moves);
      if (kind === 'spider') setAux(foundations.filter(f => f.length).length + '/8 seq.');
      else setAux(foundationCount() + '/52 bases');
    }
    startBtn.onclick = reset;
    if (kind === 'klondike') setCardMessage('Paciência completa: toque numa carta e depois no destino. No difícil, compra 3.');
    else if (kind === 'freecell') setCardMessage('FreeCell completo: use 4 células livres e mova sequências conforme espaços disponíveis.');
    else setCardMessage('Spider completo: fácil 1 naipe, normal 2, difícil 4. Monte sequências K-A do mesmo naipe.');
    reset();
  }

  const runners = {
    dino: runDino,
    labirinto: runLabirinto,
    bolha: () => runPopGame('bolha'),
    whack: () => runPopGame('whack'),
    genius2: runGenius,
    'memoria-temas': runMemoryThemes,
    pacman: runPacman,
    xadrez: runChess,
    paciencia: () => runSolitaire('klondike'),
    freecell: () => runSolitaire('freecell'),
    spider: () => runSolitaire('spider')
  };

  dg.installControls({ difficulty: !['xadrez','freecell','memoria-temas'].includes(game), onDifficultyChange: () => runners[game]() });
  window.addEventListener('dudu-reset', () => { best = 0; bestEl.textContent = '-'; });
  runners[game]();
})();
