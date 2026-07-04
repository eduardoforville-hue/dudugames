(() => {
  const dg = window.DuduGames;
  const root = document.getElementById('football-root');
  const game = document.body.dataset.footballGame;
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const auxEl = document.getElementById('aux');
  const msg = document.getElementById('msg');
  const startBtn = document.getElementById('start');
  let best = dg.getRecord(game);
  let cleanup = () => {};
  let raf = 0;
  bestEl.textContent = best || '-';

  const difficulty = () => dg.getDifficulty();
  const diffSpeed = () => ({ easy: .85, normal: 1, hard: 1.22 }[difficulty()] || 1);
  const rnd = (min, max) => min + Math.random() * (max - min);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function setScore(v) { scoreEl.textContent = v; }
  function setAux(v) { auxEl.textContent = v; }
  function setMsg(v) { msg.textContent = v; }
  function saveScore(v) {
    if (dg.setRecord(game, v)) {
      best = v;
      bestEl.textContent = best;
    }
  }
  function clearRoot() {
    cancelAnimationFrame(raf);
    cleanup();
    cleanup = () => {};
    root.innerHTML = '';
  }
  function button(text, action, label) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'btn football-btn';
    el.textContent = text;
    el.dataset.action = action;
    if (label) el.setAttribute('aria-label', label);
    return el;
  }
  function setupCanvas() {
    clearRoot();
    const cv = document.createElement('canvas');
    cv.width = 640;
    cv.height = 380;
    cv.className = 'quick-canvas football-canvas game-board';
    root.appendChild(cv);
    return [cv, cv.getContext('2d')];
  }
  function setupActions(actions) {
    const bar = document.createElement('div');
    bar.className = 'football-actions';
    actions.forEach(item => bar.appendChild(button(item[0], item[1], item[2])));
    root.appendChild(bar);
    return bar;
  }
  function pointerPos(cv, e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height };
  }
  function loop(step) {
    function frame(ts) {
      step(ts);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  function pitch(ctx, tone = 'classic') {
    const grass = ctx.createLinearGradient(0, 0, 0, 380);
    grass.addColorStop(0, tone === 'night' ? '#0f766e' : '#15803d');
    grass.addColorStop(1, tone === 'night' ? '#064e3b' : '#166534');
    ctx.fillStyle = grass;
    ctx.fillRect(0, 0, 640, 380);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.035)';
      ctx.fillRect(i * 80, 0, 80, 380);
    }
    ctx.strokeStyle = 'rgba(236,253,245,.72)';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, 592, 332);
    ctx.beginPath(); ctx.moveTo(320, 24); ctx.lineTo(320, 356); ctx.stroke();
    ctx.beginPath(); ctx.arc(320, 190, 58, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(236,253,245,.85)';
    ctx.beginPath(); ctx.arc(320, 190, 4, 0, Math.PI * 2); ctx.fill();
  }
  function goal(ctx, y = 34, side = 'top') {
    const top = side === 'top';
    const gy = top ? y : 380 - y - 42;
    ctx.fillStyle = 'rgba(226,232,240,.94)';
    ctx.fillRect(190, gy, 260, 12);
    ctx.fillRect(190, gy, 12, 42);
    ctx.fillRect(438, gy, 12, 42);
    ctx.strokeStyle = 'rgba(226,232,240,.42)';
    ctx.lineWidth = 1;
    for (let x = 205; x < 438; x += 18) { ctx.beginPath(); ctx.moveTo(x, gy + 12); ctx.lineTo(x, gy + 42); ctx.stroke(); }
    for (let yy = gy + 18; yy < gy + 42; yy += 10) { ctx.beginPath(); ctx.moveTo(202, yy); ctx.lineTo(438, yy); ctx.stroke(); }
  }
  function ball(ctx, x, y, r = 11) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(1, r * .12);
    ctx.beginPath(); ctx.arc(x, y, r * .55, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55);
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke();
    }
    ctx.restore();
  }
  function player(ctx, x, y, color = '#4ade80', pose = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, -22, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(-15, 9); ctx.moveTo(0, -4); ctx.lineTo(15, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(-12, 34); ctx.moveTo(0, 15); ctx.lineTo(14 + pose, 34); ctx.stroke();
    ctx.restore();
  }
  function target(ctx, x, y, r = 18) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
  }
  function overlay(ctx, text, sub = '') {
    ctx.fillStyle = 'rgba(3,7,18,.62)';
    ctx.fillRect(0, 140, 640, 92);
    ctx.fillStyle = '#e6edf3';
    ctx.font = '800 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 320, 178);
    if (sub) {
      ctx.font = '600 15px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(sub, 320, 204);
    }
  }
  function drawScoreBug(ctx, text) {
    ctx.fillStyle = 'rgba(15,23,42,.52)';
    ctx.fillRect(18, 16, 160, 34);
    ctx.fillStyle = '#e6edf3';
    ctx.font = '700 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(text, 32, 38);
  }

  function runPenalties() {
    const [cv, ctx] = setupCanvas();
    const bar = setupActions([['← curva', 'curveLeft'], ['Chutar', 'shoot'], ['curva →', 'curveRight']]);
    let score = 0, kicks = 0, aim = { x: 320, y: 78 }, curve = 0, ballState = null, keeper = { x: 320, dive: 0 }, result = '';
    function shoot() {
      if (ballState) return;
      kicks++;
      const goalieTarget = rnd(210, 430);
      keeper.dive = goalieTarget;
      ballState = { x: 320, y: 318, t: 0, sx: 320, sy: 318, tx: aim.x + curve * 22, ty: aim.y };
      result = '';
      dg.markPlayed(game);
    }
    function draw() {
      pitch(ctx, 'night'); goal(ctx); target(ctx, aim.x, aim.y, 17);
      player(ctx, keeper.dive || keeper.x, 70, '#fbbf24', 0);
      player(ctx, 292, 326, '#22d3ee', Math.sin(Date.now() / 120) * 2);
      if (ballState) {
        ballState.t += .035 * diffSpeed();
        const t = Math.min(1, ballState.t);
        const arc = Math.sin(t * Math.PI) * 54;
        const bx = ballState.sx + (ballState.tx - ballState.sx) * t + curve * Math.sin(t * Math.PI) * 36;
        const by = ballState.sy + (ballState.ty - ballState.sy) * t - arc;
        ball(ctx, bx, by, 10 - t * 2);
        if (t >= 1) {
          const inGoal = ballState.tx > 202 && ballState.tx < 438 && ballState.ty > 46 && ballState.ty < 112;
          const saved = Math.abs((keeper.dive || 320) - ballState.tx) < 58 && ballState.ty > 48;
          if (inGoal && !saved) { score++; result = 'Gol!'; dg.sound('score'); }
          else { result = saved ? 'Defendeu!' : 'Para fora!'; dg.sound('fail'); }
          setScore(score); setAux(kicks + ' chutes'); saveScore(score); if (score >= 5) dg.unlock('penaltis-5');
          ballState = null;
        }
      } else {
        ball(ctx, 320, 318, 11);
      }
      drawScoreBug(ctx, score + ' gols');
      if (result) overlay(ctx, result, 'Mire no gol e chute de novo.');
    }
    cv.addEventListener('pointerdown', e => { const p = pointerPos(cv, e); aim = { x: clamp(p.x, 210, 430), y: clamp(p.y, 48, 116) }; });
    bar.addEventListener('click', e => {
      const a = e.target.dataset.action;
      if (a === 'curveLeft') curve = clamp(curve - 1, -3, 3);
      if (a === 'curveRight') curve = clamp(curve + 1, -3, 3);
      if (a === 'shoot') shoot();
      setAux('Curva ' + curve);
    });
    startBtn.onclick = () => { score = kicks = 0; curve = 0; result = ''; ballState = null; setScore(0); setAux('Curva 0'); };
    setMsg('Toque no gol para mirar, ajuste a curva e chute.');
    loop(draw);
  }

  function runKeepUps() {
    const [cv, ctx] = setupCanvas();
    let score = 0, combo = 0, ballObj, playerX, over;
    function reset() {
      score = combo = 0; over = false; playerX = 320; ballObj = { x: 320, y: 122, vy: 1.2, vx: 1.4 };
      setScore(0); setAux('combo 0'); dg.markPlayed(game);
    }
    function kick(p) {
      if (over) return reset();
      if (Math.abs(p.x - ballObj.x) < 72 && Math.abs(p.y - ballObj.y) < 92) {
        combo++;
        score += 1 + Math.floor(combo / 8);
        ballObj.vy = -7.4 - Math.min(2, combo * .05);
        ballObj.vx = clamp((ballObj.x - p.x) * .05, -4.2, 4.2);
        playerX = clamp(p.x, 60, 580);
        setScore(score); setAux('combo ' + combo); saveScore(score); dg.sound('score');
        if (score >= 50) dg.unlock('embaixadinhas-50');
      }
    }
    function draw() {
      pitch(ctx); player(ctx, playerX, 316, '#38bdf8', Math.sin(Date.now()/120)*4);
      if (!over) {
        ballObj.vy += .24 * diffSpeed();
        ballObj.x += ballObj.vx; ballObj.y += ballObj.vy;
        if (ballObj.x < 24 || ballObj.x > 616) ballObj.vx *= -1;
        if (ballObj.y > 340) { over = true; saveScore(score); dg.sound('fail'); }
      }
      ball(ctx, ballObj.x, ballObj.y, 14);
      drawScoreBug(ctx, score + ' toques');
      if (over) overlay(ctx, 'A bola caiu', 'Toque para recomeçar.');
    }
    cv.addEventListener('pointerdown', e => kick(pointerPos(cv, e)));
    startBtn.onclick = reset;
    setMsg('Toque na bola antes dela cair. Quanto maior o combo, mais pontos.');
    reset(); loop(draw);
  }

  function runFreeKick() {
    const [cv, ctx] = setupCanvas();
    const bar = setupActions([['← curva', 'left'], ['Cobrar', 'kick'], ['curva →', 'right']]);
    let score = 0, shots = 0, aim = { x: 320, y: 70 }, curve = 0, wind = rnd(-2, 2), shot = null, note = '';
    function kick() {
      if (shot) return;
      shots++; shot = { x: 320, y: 330, t: 0, tx: aim.x + curve * 20 + wind * 18, ty: aim.y }; dg.markPlayed(game);
    }
    function drawWall() {
      for (let i = 0; i < 5; i++) player(ctx, 250 + i * 34, 180, '#f97316');
    }
    function draw() {
      pitch(ctx, 'night'); goal(ctx); drawWall(); target(ctx, aim.x, aim.y);
      player(ctx, 292, 330, '#22d3ee'); ball(ctx, 320, 330);
      if (shot) {
        shot.t += .03 * diffSpeed();
        const t = Math.min(1, shot.t), arc = Math.sin(t * Math.PI) * 80;
        const x = 320 + (shot.tx - 320) * t + curve * Math.sin(t * Math.PI) * 38 + wind * t * 12;
        const y = 330 + (shot.ty - 330) * t - arc;
        ball(ctx, x, y, 10 - t * 2);
        if (t > .47 && t < .56 && y > 150 && y < 210 && x > 230 && x < 410) {
          note = 'Na barreira!'; shot = null; dg.sound('fail');
        } else if (t >= 1) {
          const ok = shot.tx > 202 && shot.tx < 438 && shot.ty > 44 && shot.ty < 116;
          if (ok) { score += 10; note = 'Golaço!'; dg.sound('score'); if (score >= 50) dg.unlock('falta-50'); }
          else { note = 'Passou perto!'; dg.sound('fail'); }
          setScore(score); setAux('vento ' + wind.toFixed(1)); saveScore(score); shot = null;
        }
      }
      drawScoreBug(ctx, score + ' pts');
      if (note) overlay(ctx, note, 'Vento: ' + wind.toFixed(1));
    }
    cv.addEventListener('pointerdown', e => { const p = pointerPos(cv, e); aim = { x: clamp(p.x, 210, 430), y: clamp(p.y, 46, 112) }; });
    bar.addEventListener('click', e => { if (e.target.dataset.action === 'left') curve--; if (e.target.dataset.action === 'right') curve++; if (e.target.dataset.action === 'kick') kick(); curve = clamp(curve, -3, 3); });
    startBtn.onclick = () => { score = shots = 0; curve = 0; wind = rnd(-2, 2); note = ''; shot = null; setScore(0); setAux('vento ' + wind.toFixed(1)); };
    setMsg('Mire no gol, controle a curva e passe por cima da barreira.');
    setAux('vento ' + wind.toFixed(1)); loop(draw);
  }

  function runMiniFootball() {
    const [cv, ctx] = setupCanvas();
    const bar = setupActions([['←', 'left'], ['↑', 'up'], ['Chutar', 'shoot'], ['↓', 'down'], ['→', 'right']]);
    let score = 0, rival = 0, p, bot, b, keys = {};
    function reset() {
      p = { x: 210, y: 190 }; bot = { x: 430, y: 190 }; b = { x: 320, y: 190, vx: 0, vy: 0 }; keys = {}; score = rival = 0; setScore(0); setAux('0 x 0'); dg.markPlayed(game);
    }
    function shoot() {
      if (dist(p, b) < 42) { b.vx = 6.8; b.vy = (b.y - p.y) * .06; dg.sound('tick'); }
    }
    function step() {
      pitch(ctx); goal(ctx, 34); goal(ctx, 34, 'bottom');
      if (keys.left) p.x -= 4; if (keys.right) p.x += 4; if (keys.up) p.y -= 4; if (keys.down) p.y += 4;
      p.x = clamp(p.x, 40, 600); p.y = clamp(p.y, 44, 336);
      const botTarget = b.x > 320 ? b : { x: 430, y: 190 };
      bot.x += Math.sign(botTarget.x - bot.x) * 2.2 * diffSpeed();
      bot.y += Math.sign(botTarget.y - bot.y) * 2.2 * diffSpeed();
      if (dist(p, b) < 34) { b.vx += (b.x - p.x) * .04; b.vy += (b.y - p.y) * .04; }
      if (dist(bot, b) < 36) { b.vx -= 5.8; b.vy += (b.y - bot.y) * .05; }
      b.x += b.vx; b.y += b.vy; b.vx *= .985; b.vy *= .985;
      if (b.y < 34 || b.y > 346) b.vy *= -1;
      if (b.x > 620 && b.y > 142 && b.y < 238) { score++; b = { x: 320, y: 190, vx: 0, vy: 0 }; dg.sound('score'); }
      if (b.x < 20 && b.y > 142 && b.y < 238) { rival++; b = { x: 320, y: 190, vx: 0, vy: 0 }; dg.sound('fail'); }
      if (b.x < 12 || b.x > 628) b.vx *= -1;
      setScore(score); setAux(score + ' x ' + rival); saveScore(score);
      if (score >= 3) dg.unlock('mini-futebol-3');
      player(ctx, p.x, p.y, '#22d3ee'); player(ctx, bot.x, bot.y, '#fb7185'); ball(ctx, b.x, b.y, 10); drawScoreBug(ctx, score + ' x ' + rival);
    }
    bar.addEventListener('pointerdown', e => { const a = e.target.dataset.action; if (a === 'shoot') shoot(); else keys[a] = true; });
    bar.addEventListener('pointerup', e => { keys[e.target.dataset.action] = false; });
    bar.addEventListener('pointerleave', () => { keys = {}; });
    startBtn.onclick = reset; setMsg('Use o d-pad, encoste na bola e chute para o gol.'); reset(); loop(step);
  }

  function runHeaders() {
    const [cv, ctx] = setupCanvas();
    const bar = setupActions([['←', 'left'], ['Cabecear', 'jump'], ['→', 'right']]);
    let score = 0, playerX = 320, jump = 0, cross;
    function resetCross() { cross = { x: -20, y: rnd(90, 178), vx: rnd(4, 6) * diffSpeed(), vy: rnd(.35, 1.1) }; }
    function hit() {
      jump = 28;
      if (Math.abs(cross.x - playerX) < 48 && cross.y > 116 && cross.y < 214) {
        const precision = Math.max(1, Math.round(12 - Math.abs(cross.x - playerX) / 5));
        score += precision; setScore(score); saveScore(score); dg.sound('score'); resetCross(); if (score >= 40) dg.unlock('cabecada-40');
      }
    }
    function draw() {
      pitch(ctx); goal(ctx); cross.x += cross.vx; cross.y += cross.vy; if (cross.x > 680 || cross.y > 280) resetCross();
      player(ctx, playerX, 300 - jump, '#38bdf8'); jump = Math.max(0, jump - 1.7);
      ball(ctx, cross.x, cross.y, 11); target(ctx, playerX, 148, 22); drawScoreBug(ctx, score + ' pts');
    }
    bar.addEventListener('click', e => { const a = e.target.dataset.action; if (a === 'left') playerX -= 26; if (a === 'right') playerX += 26; if (a === 'jump') hit(); playerX = clamp(playerX, 80, 560); });
    startBtn.onclick = () => { score = 0; playerX = 320; setScore(0); resetCross(); dg.markPlayed(game); };
    setMsg('Posicione o jogador e cabeceie no tempo certo.');
    resetCross(); dg.markPlayed(game); loop(draw);
  }

  function runGoalkeeper() {
    const [cv, ctx] = setupCanvas();
    const bar = setupActions([['←', 'left'], ['Defender', 'save'], ['→', 'right']]);
    let score = 0, keeperX = 320, dive = 0, shot;
    function newShot() { shot = { x: rnd(240, 400), y: 338, tx: rnd(210, 430), ty: rnd(60, 118), t: 0 }; }
    function save() { dive = 24; }
    function draw() {
      pitch(ctx, 'night'); goal(ctx); player(ctx, keeperX, 78 - dive, '#fbbf24'); dive = Math.max(0, dive - 1.5);
      shot.t += .018 * diffSpeed();
      const x = shot.x + (shot.tx - shot.x) * shot.t;
      const y = shot.y + (shot.ty - shot.y) * shot.t;
      ball(ctx, x, y, 10);
      if (shot.t >= 1) {
        if (Math.abs(keeperX - shot.tx) < 48 || dive > 10) { score++; dg.sound('score'); if (score >= 10) dg.unlock('goleiro-10'); }
        else dg.sound('fail');
        setScore(score); setAux(score + ' defesas'); saveScore(score); newShot();
      }
      drawScoreBug(ctx, score + ' defesas');
    }
    cv.addEventListener('pointerdown', e => { keeperX = clamp(pointerPos(cv, e).x, 210, 430); save(); });
    bar.addEventListener('click', e => { const a = e.target.dataset.action; if (a === 'left') keeperX -= 38; if (a === 'right') keeperX += 38; if (a === 'save') save(); keeperX = clamp(keeperX, 210, 430); });
    startBtn.onclick = () => { score = 0; setScore(0); newShot(); dg.markPlayed(game); };
    setMsg('Mova o goleiro e toque em Defender no momento do chute.');
    newShot(); dg.markPlayed(game); loop(draw);
  }

  function runDribble() {
    const [cv, ctx] = setupCanvas();
    const bar = setupActions([['←', 'left'], ['Drible', 'dribble'], ['→', 'right']]);
    let lane = 1, score = 0, inv = 0, obstacles = [], frame = 0, over = false;
    const lanes = [210, 320, 430];
    function reset() { lane = 1; score = frame = 0; inv = 0; obstacles = []; over = false; setScore(0); dg.markPlayed(game); }
    function draw() {
      pitch(ctx); frame++;
      if (!over && frame % Math.round(62 / diffSpeed()) === 0) obstacles.push({ lane: Math.floor(Math.random()*3), y: -30 });
      obstacles.forEach(o => o.y += 4.4 * diffSpeed()); obstacles = obstacles.filter(o => o.y < 430);
      if (!over) {
        score = Math.floor(frame / 8); setScore(score); setAux(score + 'm'); saveScore(score); inv = Math.max(0, inv - 1);
        if (score >= 120) dg.unlock('drible-120');
        if (obstacles.some(o => o.lane === lane && o.y > 270 && o.y < 336 && inv <= 0)) { over = true; dg.sound('fail'); }
      }
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(lanes[i], 30); ctx.lineTo(lanes[i], 350); ctx.stroke(); }
      obstacles.forEach(o => player(ctx, lanes[o.lane], o.y, '#fb7185'));
      player(ctx, lanes[lane], 318, inv ? '#fbbf24' : '#22d3ee'); ball(ctx, lanes[lane] + 18, 338, 9); drawScoreBug(ctx, score + 'm');
      if (over) overlay(ctx, 'Perdeu a bola', 'Toque em Novo jogo.');
    }
    bar.addEventListener('click', e => { const a = e.target.dataset.action; if (a === 'left') lane--; if (a === 'right') lane++; if (a === 'dribble') inv = 34; lane = clamp(lane, 0, 2); });
    startBtn.onclick = reset; setMsg('Troque de faixa e use Drible para passar pelos marcadores.'); reset(); loop(draw);
  }

  function runTargetShot() {
    const [cv, ctx] = setupCanvas();
    let score = 0, time = 30, aim = { x: 320, y: 88 }, tgt = { x: 320, y: 76 }, timer = 0;
    function nextTarget() { tgt = { x: rnd(220, 420), y: rnd(56, 112), r: rnd(16, 28) }; }
    function shoot() {
      const hit = Math.hypot(aim.x - tgt.x, aim.y - tgt.y) < tgt.r + 8;
      if (hit) { score += Math.round(30 - tgt.r); dg.sound('score'); nextTarget(); if (score >= 120) dg.unlock('alvo-120'); } else dg.sound('fail');
      setScore(score); saveScore(score);
    }
    function reset() { score = 0; time = 30; timer = performance.now(); setScore(0); nextTarget(); dg.markPlayed(game); }
    function draw(ts) {
      pitch(ctx, 'night'); goal(ctx); target(ctx, tgt.x, tgt.y, tgt.r); target(ctx, aim.x, aim.y, 12); player(ctx, 298, 330, '#22d3ee'); ball(ctx, 320, 330);
      if (ts - timer > 1000) { time--; timer = ts; setAux(time + 's'); if (time <= 0) { saveScore(score); reset(); } }
      drawScoreBug(ctx, score + ' pts');
    }
    cv.addEventListener('pointerdown', e => { aim = pointerPos(cv, e); if (aim.y < 150) shoot(); });
    startBtn.onclick = reset; setMsg('Toque nos alvos dentro do gol para chutar.'); reset(); loop(draw);
  }

  function runCup() {
    const [cv, ctx] = setupCanvas();
    const bar = setupActions([['Ação', 'act'], ['Próxima', 'next']]);
    const stages = ['Pênalti', 'Falta', 'Goleiro', 'Alvo'];
    let stage = 0, score = 0, tries = 0, aim = { x: 320, y: 80 };
    function action() {
      tries++;
      const chance = clamp(.7 - stage * .08 + (difficulty() === 'easy' ? .12 : difficulty() === 'hard' ? -.1 : 0), .35, .82);
      if (Math.random() < chance) { score += [10, 15, 12, 8][stage]; dg.sound('score'); }
      else dg.sound('fail');
      setScore(score); setAux(stages[stage] + ' ' + tries + '/3'); saveScore(score);
      if (tries >= 3) next();
    }
    function next() {
      tries = 0; stage++;
      if (stage >= stages.length) { dg.unlock('copa-win'); saveScore(score); stage = 0; score = 0; }
      setAux(stages[stage] + ' 0/3');
    }
    function draw() {
      pitch(ctx, stage % 2 ? 'night' : 'classic'); goal(ctx);
      if (stage === 0) { target(ctx, aim.x, aim.y); player(ctx, 292, 330, '#22d3ee'); ball(ctx, 320, 330); }
      if (stage === 1) { for (let i = 0; i < 5; i++) player(ctx, 250 + i * 34, 180, '#f97316'); ball(ctx, 320, 330); }
      if (stage === 2) { player(ctx, 320, 78, '#fbbf24'); ball(ctx, 320 + Math.sin(Date.now()/180)*80, 260); }
      if (stage === 3) { target(ctx, 320 + Math.sin(Date.now()/250)*90, 78, 24); ball(ctx, 320, 330); }
      ctx.fillStyle = '#e6edf3'; ctx.font = '800 30px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Copa Dudu', 320, 202);
      drawScoreBug(ctx, stages[stage] + ' · ' + score + ' pts');
    }
    bar.addEventListener('click', e => { if (e.target.dataset.action === 'act') action(); else next(); });
    startBtn.onclick = () => { stage = score = tries = 0; setScore(0); setAux('Pênalti 0/3'); dg.markPlayed(game); };
    setMsg('Quatro provas rápidas: pênalti, falta, goleiro e alvo.');
    setAux('Pênalti 0/3'); dg.markPlayed(game); loop(draw);
  }

  function runButtonFootball() {
    const [cv, ctx] = setupCanvas();
    let score = 0, puck = { x: 170, y: 190 }, ballObj = { x: 320, y: 190, vx: 0, vy: 0 }, drag = null;
    function reset() { score = 0; puck = { x: 170, y: 190 }; ballObj = { x: 320, y: 190, vx: 0, vy: 0 }; setScore(0); dg.markPlayed(game); }
    function drawButton(x, y, color) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.72)'; ctx.lineWidth = 3; ctx.stroke();
    }
    function draw() {
      pitch(ctx); goal(ctx, 34); goal(ctx, 34, 'bottom');
      ballObj.x += ballObj.vx; ballObj.y += ballObj.vy; ballObj.vx *= .975; ballObj.vy *= .975;
      if (ballObj.y < 34 || ballObj.y > 346) ballObj.vy *= -1;
      if (ballObj.x > 620 && ballObj.y > 142 && ballObj.y < 238) { score++; setScore(score); saveScore(score); dg.sound('score'); ballObj = { x: 320, y: 190, vx: 0, vy: 0 }; if (score >= 3) dg.unlock('botao-3'); }
      if (ballObj.x < 14 || ballObj.x > 626) ballObj.vx *= -1;
      if (dist(puck, ballObj) < 36) { ballObj.vx += (ballObj.x - puck.x) * .08; ballObj.vy += (ballObj.y - puck.y) * .08; }
      drawButton(470, 140, '#fb7185'); drawButton(470, 240, '#fb7185'); drawButton(puck.x, puck.y, '#22d3ee'); ball(ctx, ballObj.x, ballObj.y, 10);
      if (drag) { ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(puck.x, puck.y); ctx.lineTo(drag.x, drag.y); ctx.stroke(); }
      drawScoreBug(ctx, score + ' gols');
    }
    cv.addEventListener('pointerdown', e => { const p = pointerPos(cv, e); if (Math.hypot(p.x - puck.x, p.y - puck.y) < 42) drag = p; });
    cv.addEventListener('pointermove', e => { if (drag) drag = pointerPos(cv, e); });
    cv.addEventListener('pointerup', e => {
      if (!drag) return;
      const p = pointerPos(cv, e);
      puck.vx = (puck.x - p.x) * .18; puck.vy = (puck.y - p.y) * .18;
      puck.x = clamp(puck.x + puck.vx, 40, 600); puck.y = clamp(puck.y + puck.vy, 46, 334);
      drag = null; dg.sound('tick');
    });
    startBtn.onclick = reset; setMsg('Arraste o botão azul para mirar e solte para chutar.'); reset(); loop(draw);
  }

  const runners = {
    penaltis: runPenalties,
    embaixadinhas: runKeepUps,
    'falta-perfeita': runFreeKick,
    'mini-futebol': runMiniFootball,
    cabecada: runHeaders,
    goleiro: runGoalkeeper,
    'drible-run': runDribble,
    'chute-alvo': runTargetShot,
    'copa-dudu': runCup,
    'futebol-botao': runButtonFootball
  };

  dg.installControls({ difficulty: true, onDifficultyChange: () => runners[game]() });
  window.addEventListener('dudu-reset', () => { best = 0; bestEl.textContent = '-'; });
  runners[game]();
})();
