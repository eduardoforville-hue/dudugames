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
    let dino, obstacles, frame, score, running, raf;
    function reset() {
      dino = { x: 74, y: 244, vy: 0, onGround: true };
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
        if (dino.y >= 244) { dino.y = 244; dino.vy = 0; dino.onGround = true; }
        if (frame % Math.round(82 - speed * 5) === 0) obstacles.push({ x: 660, w: rand(20, 38), h: rand(28, 58) });
        obstacles.forEach(o => o.x -= speed);
        obstacles = obstacles.filter(o => o.x > -60);
        score = Math.floor(frame / 6);
        setScore(score); setAux(score + 'm');
        if (score >= 100) dg.unlock('dino-100');
        for (const o of obstacles) {
          if (dino.x + 28 > o.x && dino.x < o.x + o.w && dino.y + 34 > 276 - o.h) {
            running = false; saveScore(score); dg.sound('fail'); setMsg('Fim da corrida. Toque para tentar de novo.');
          }
        }
      }
      draw(); raf = requestAnimationFrame(step);
    }
    function draw() {
      ctx.fillStyle = '#0d1526'; ctx.fillRect(0,0,640,320);
      ctx.fillStyle = 'rgba(34,211,238,.14)';
      for (let i = 0; i < 8; i++) ctx.fillRect((i * 100 - frame * 1.4) % 760 - 80, 70 + i % 3 * 38, 46, 8);
      ctx.fillStyle = '#1f3b2d'; ctx.fillRect(0, 282, 640, 38);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(dino.x, dino.y, 30, 34);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(dino.x + 22, dino.y + 8, 18, 8);
      ctx.fillStyle = '#fb7185'; obstacles.forEach(o => ctx.fillRect(o.x, 276 - o.h, o.w, o.h));
      if (!running) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0,120,640,80); ctx.fillStyle = '#e6edf3'; ctx.font = '700 28px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Fim da corrida', 320, 170); }
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

  function runQuiz() {
    clearRoot();
    const data = [
      ['Qual jogo tem blocos caindo?', ['Tetris','Pong','Forca'], 0],
      ['Quanto vale 2 + 2?', ['3','4','22'], 1],
      ['Qual peça anda em L no xadrez?', ['Bispo','Cavalo','Torre'], 1],
      ['Qual planeta é vermelho?', ['Marte','Vênus','Netuno'], 0],
      ['HTML é usado para...', ['música','páginas web','desenhar no papel'], 1],
      ['No Campo Minado, bandeira marca...', ['bomba','ponto','tempo'], 0]
    ];
    let q = 0, score = 0, deck = shuffle([...data]);
    const box = document.createElement('div'); box.className = 'quiz-box dg-panel'; root.appendChild(box);
    function render() {
      if (q >= deck.length) {
        box.innerHTML = `<h2>Fim!</h2><p>${score}/${deck.length} corretas.</p>`;
        saveScore(score); if (score === deck.length) dg.unlock('quiz-perfect'); return;
      }
      const [question, answers] = deck[q];
      box.innerHTML = `<h2>${question}</h2>`;
      answers.forEach((answer, i) => {
        const b = button(answer); b.onclick = () => choose(i); box.appendChild(b);
      });
      setScore(score); setAux((q + 1) + '/' + deck.length);
    }
    function choose(i) {
      dg.markPlayed(game);
      if (i === deck[q][2]) { score++; dg.sound('score'); } else dg.sound('fail');
      q++; render();
    }
    startBtn.onclick = () => { q = 0; score = 0; deck = shuffle([...data]); render(); };
    setMsg('Responda rápido e tente acertar tudo.');
    render();
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
  function deck(oneSuit=false) {
    const s = oneSuit ? ['♠'] : suits;
    return shuffle(s.flatMap(suit => ranks.map((rank, i) => ({ suit, rank, value: i + 1, color: suit === '♥' || suit === '♦' ? 'red' : 'black', up: true }))));
  }
  function cardText(c) { return c ? c.rank + c.suit : ''; }
  function renderCard(c) {
    const el = button(cardText(c), 'card-tile ' + (c?.color || ''));
    return el;
  }

  function runChess() {
    clearRoot();
    const board = document.createElement('div'); board.className='chess-board'; root.appendChild(board);
    let turn='w', selected=null, captures=0;
    let b = [
      ['♜','♞','♝','♛','♚','♝','♞','♜'],['♟','♟','♟','♟','♟','♟','♟','♟'],['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['♙','♙','♙','♙','♙','♙','♙','♙'],['♖','♘','♗','♕','♔','♗','♘','♖']
    ];
    const white='♙♖♘♗♕♔';
    const black='♟♜♞♝♛♚';
    function color(p){return white.includes(p)?'w':black.includes(p)?'b':'';}
    function ok(sx,sy,tx,ty){
      const p=b[sy][sx], dx=tx-sx, dy=ty-sy, adx=Math.abs(dx), ady=Math.abs(dy), c=color(p);
      if(!p||color(b[ty][tx])===c)return false;
      const clear=()=>{const stepx=Math.sign(dx),stepy=Math.sign(dy);let x=sx+stepx,y=sy+stepy;while(x!==tx||y!==ty){if(b[y][x])return false;x+=stepx;y+=stepy;}return true;};
      if('♙♟'.includes(p)){const f=c==='w'?-1:1;return (dx===0&&!b[ty][tx]&&dy===f)||(dx===0&&!b[ty][tx]&&dy===2*f&&((c==='w'&&sy===6)||(c==='b'&&sy===1))&&!b[sy+f][sx])||(adx===1&&dy===f&&b[ty][tx]);}
      if('♖♜'.includes(p))return (dx===0||dy===0)&&clear();
      if('♗♝'.includes(p))return adx===ady&&clear();
      if('♕♛'.includes(p))return (adx===ady||dx===0||dy===0)&&clear();
      if('♘♞'.includes(p))return adx*ady===2;
      if('♔♚'.includes(p))return adx<=1&&ady<=1;
      return false;
    }
    function click(x,y){
      const p=b[y][x];
      if(selected){const [sx,sy]=selected;if(ok(sx,sy,x,y)){if(b[y][x])captures++; b[y][x]=b[sy][sx]; b[sy][sx]=''; turn=turn==='w'?'b':'w'; selected=null; setScore(captures); setAux(turn==='w'?'Brancas':'Pretas'); saveScore(captures); dg.markPlayed(game);} else selected=null; render(); return;}
      if(p&&color(p)===turn){selected=[x,y];render();}
    }
    function render(){board.innerHTML='';for(let y=0;y<8;y++)for(let x=0;x<8;x++){const cell=button(b[y][x],'chess-cell '+((x+y)%2?'dark':'light'));if(selected&&selected[0]===x&&selected[1]===y)cell.classList.add('sel');cell.onclick=()=>click(x,y);board.appendChild(cell);}}
    startBtn.onclick=()=>location.reload();
    setMsg('Xadrez local para 2 jogadores. Regras de movimento básicas, sem xeque automático.');
    setScore(0); setAux('Brancas'); render();
  }

  function runSolitaire(kind) {
    clearRoot();
    const area = document.createElement('div'); area.className='cards-area'; root.appendChild(area);
    let stock=[], waste=[], foundations=[[],[],[],[]], cells=[], cols=[], moves=0;
    function reset() {
      const d = deck(kind === 'spider');
      moves = 0; waste=[]; foundations=[[],[],[],[]]; cells=[null,null,null,null];
      const count = kind === 'freecell' ? 8 : kind === 'spider' ? 10 : 7;
      cols = Array.from({length:count},()=>[]);
      if(kind==='freecell') d.forEach((c,i)=>cols[i%8].push(c));
      else if(kind==='spider'){ for(let i=0;i<54;i++) cols[i%10].push(d[i%d.length]); stock=d.slice(0,30); }
      else { for(let i=0;i<7;i++) for(let j=0;j<=i;j++) cols[i].push(d.pop()); stock=d; }
      render(); dg.markPlayed(game);
    }
    function canFoundation(c, f){const top=foundations[f].at(-1);return !top?c.value===1:top.suit===c.suit&&c.value===top.value+1;}
    function autoFoundation(c){for(let i=0;i<4;i++)if(canFoundation(c,i)){foundations[i].push(c);moves++;return true;}return false;}
    function completeSpider(col){const tail=col.slice(-13); if(tail.length===13&&tail.every((c,i)=>c.value===13-i)){col.splice(-13); foundations[0].push({rank:'K-A',suit:'♠',value:13,color:'black'}); dg.unlock('spider-run');}}
    function clickCol(i){
      const col=cols[i], c=col.at(-1); if(!c)return;
      if(kind==='spider'){ for(const target of cols){const t=target.at(-1); if(target!==col && (!t || t.value===c.value+1)){target.push(col.pop()); completeSpider(target); moves++; render(); return;}} }
      else if(autoFoundation(c)){col.pop();}
      else if(kind==='freecell'){const empty=cells.findIndex(x=>!x); if(empty>=0){cells[empty]=col.pop();moves++;}}
      render();
    }
    function clickCell(i){const c=cells[i]; if(!c)return; if(autoFoundation(c)){cells[i]=null; render();}}
    function drawStock(){
      if(kind==='spider'){ if(stock.length<10)return; cols.forEach(col=>col.push(stock.pop())); }
      else if(stock.length) waste.push(stock.pop()); else { stock=waste.reverse(); waste=[]; }
      moves++; render();
    }
    function render(){
      area.innerHTML='';
      const top=document.createElement('div'); top.className='cards-top';
      const s=button(kind==='spider'?'Comprar linha':'Comprar', 'card-pile'); s.onclick=drawStock; s.textContent += stock.length?' '+stock.length:''; top.appendChild(s);
      if(kind==='klondike'){const w=renderCard(waste.at(-1)); w.onclick=()=>{const c=waste.at(-1); if(c&&autoFoundation(c)){waste.pop();render();}}; top.appendChild(w);}
      if(kind==='freecell')cells.forEach((c,i)=>{const el=c?renderCard(c):button('Livre','card-pile');el.onclick=()=>clickCell(i);top.appendChild(el);});
      foundations.forEach((f,i)=>{const el=f.length?renderCard(f.at(-1)):button('Base','card-pile');top.appendChild(el);});
      area.appendChild(top);
      const table=document.createElement('div'); table.className='cards-table cards-' + cols.length;
      cols.forEach((col,i)=>{const stack=document.createElement('button');stack.type='button';stack.className='card-stack';stack.onclick=()=>clickCol(i);stack.innerHTML=col.map(cardText).join('<br>')||'·';table.appendChild(stack);});
      area.appendChild(table);
      setScore(moves); setAux(foundations.reduce((a,f)=>a+f.length,0)+' bases');
      const done = kind==='spider'?foundations[0].length>=4:foundations.reduce((a,f)=>a+f.length,0)>=52;
      if(done){saveScore(moves);dg.unlock(kind+'-win');setMsg('Vitória em '+moves+' movimentos!');}
    }
    startBtn.onclick=reset;
    setMsg(kind==='klondike'?'Paciência simplificada: compre cartas e envie ases às bases.':kind==='freecell'?'Use células livres e complete as bases.':'Spider 1 naipe: monte sequências do Rei ao Ás.');
    reset();
  }

  const runners = {
    dino: runDino,
    labirinto: runLabirinto,
    bolha: () => runPopGame('bolha'),
    whack: () => runPopGame('whack'),
    quiz: runQuiz,
    genius2: runGenius,
    'memoria-temas': runMemoryThemes,
    pacman: runPacman,
    xadrez: runChess,
    paciencia: () => runSolitaire('klondike'),
    freecell: () => runSolitaire('freecell'),
    spider: () => runSolitaire('spider')
  };

  dg.installControls({ difficulty: !['xadrez','paciencia','freecell','spider','quiz','memoria-temas'].includes(game), onDifficultyChange: () => runners[game]() });
  window.addEventListener('dudu-reset', () => { best = 0; bestEl.textContent = '-'; });
  runners[game]();
})();
