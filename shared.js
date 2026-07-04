(() => {
  const rootScript = document.currentScript;
  const rootUrl = new URL(rootScript.getAttribute('src') || 'shared.js', document.baseURI);
  const root = new URL('.', rootUrl).href;

  const SETTINGS_KEY = 'dudu-settings';
  const ACHIEVEMENTS_KEY = 'dudu-conquistas';
  const PLAYED_KEY = 'dudu-jogos-jogados';

  const records = {
    snake: { label: 'Cobrinha', key: 'cobrinha-recorde', unit: 'pts', better: 'higher' },
    memory: { label: 'Memória', key: 'dudu-memoria-recorde', unit: 'jogadas', better: 'lower' },
    game2048: { label: '2048', key: 'dudu-2048-recorde', unit: 'pts', better: 'higher' },
    mines: { label: 'Campo Minado', key: 'dudu-minas-recorde', unit: 's', better: 'lower' },
    velha: { label: 'Velha', key: 'dudu-velha-recorde', unit: 'vitórias', better: 'higher' },
    pong: { label: 'Pong', key: 'dudu-pong-recorde', unit: 'pts', better: 'higher' },
    tetris: { label: 'Tetris', key: 'dudu-tetris-recorde', unit: 'pts', better: 'higher' },
    simon: { label: 'Simon', key: 'dudu-simon-recorde', unit: 'fase', better: 'higher' },
    forca: { label: 'Forca', key: 'dudu-forca-recorde', unit: 'vitórias', better: 'higher' },
    sudoku: { label: 'Sudoku', key: 'dudu-sudoku-recorde', unit: 's', better: 'lower' },
    invaders: { label: 'Invaders', key: 'dudu-invaders-recorde', unit: 'pts', better: 'higher' },
    golfe: { label: 'Golfe Cósmico', key: 'dudu-golfe-recorde', unit: 'tacadas', better: 'lower' },
    flappy: { label: 'Flappy Dudu', key: 'dudu-flappy-recorde', unit: 'pts', better: 'higher' },
    breakout: { label: 'Breakout Dudu', key: 'dudu-breakout-recorde', unit: 'pts', better: 'higher' },
    dino: { label: 'Dino Runner', key: 'dudu-dino-recorde', unit: 'm', better: 'higher' },
    labirinto: { label: 'Labirinto', key: 'dudu-labirinto-recorde', unit: 'fases', better: 'higher' },
    bolha: { label: 'Bolha Pop', key: 'dudu-bolha-recorde', unit: 'pts', better: 'higher' },
    whack: { label: 'Whack-a-Mole', key: 'dudu-whack-recorde', unit: 'pts', better: 'higher' },
    genius2: { label: 'Genius 2.0', key: 'dudu-genius2-recorde', unit: 'fase', better: 'higher' },
    'memoria-temas': { label: 'Memória Temas', key: 'dudu-memoria-temas-recorde', unit: 'jogadas', better: 'lower' },
    pacman: { label: 'Pac-Man', key: 'dudu-pacman-recorde', unit: 'pts', better: 'higher' },
    xadrez: { label: 'Xadrez', key: 'dudu-xadrez-recorde', unit: 'capturas', better: 'higher' },
    paciencia: { label: 'Paciência', key: 'dudu-paciencia-recorde', unit: 'mov.', better: 'lower' },
    freecell: { label: 'FreeCell', key: 'dudu-freecell-recorde', unit: 'mov.', better: 'lower' },
    spider: { label: 'Spider', key: 'dudu-spider-recorde', unit: 'mov.', better: 'lower' }
  };

  const achievements = [
    { id: 'first-play', title: 'Primeira partida', desc: 'Começou qualquer jogo.' },
    { id: 'snake-50', title: 'Cobra esperta', desc: 'Fez 50 pontos na Cobrinha.' },
    { id: 'memory-win', title: 'Boa memória', desc: 'Venceu o jogo da Memória.' },
    { id: '2048-128', title: 'Números subindo', desc: 'Criou uma peça 128 no 2048.' },
    { id: 'mines-win', title: 'Sem explodir', desc: 'Venceu uma partida de Campo Minado.' },
    { id: 'velha-win', title: 'Trinca perfeita', desc: 'Venceu no Jogo da Velha.' },
    { id: 'pong-10', title: 'Raquete quente', desc: 'Fez 10 pontos no Pong.' },
    { id: 'tetris-line', title: 'Linha limpa', desc: 'Limpou uma linha no Tetris.' },
    { id: 'simon-5', title: 'Sequência afiada', desc: 'Chegou à fase 5 no Simon.' },
    { id: 'forca-win', title: 'Palavra salva', desc: 'Venceu uma partida de Forca.' },
    { id: 'sudoku-win', title: 'Grade resolvida', desc: 'Terminou o Sudoku mini.' },
    { id: 'invaders-100', title: 'Defensor arcade', desc: 'Fez 100 pontos em Space Invaders.' },
    { id: 'golfe-estrela', title: 'Colecionador estelar', desc: 'Pegou uma estrela bônus no Golfe Cósmico.' },
    { id: 'golfe-par', title: 'Tacada de outro planeta', desc: 'Terminou o campo do Golfe Cósmico no par ou abaixo.' },
    { id: 'flappy-10', title: 'Asinhas firmes', desc: 'Fez 10 pontos no Flappy Dudu.' },
    { id: 'flappy-25', title: 'Voo longo', desc: 'Fez 25 pontos no Flappy Dudu.' },
    { id: 'breakout-50', title: 'Parede rachada', desc: 'Fez 50 pontos no Breakout Dudu.' },
    { id: 'breakout-clear', title: 'Tela limpa', desc: 'Limpou uma fase do Breakout Dudu.' },
    { id: 'dino-100', title: 'Corredor jurássico', desc: 'Correu 100m no Dino Runner.' },
    { id: 'labirinto-5', title: 'Sem se perder', desc: 'Venceu 5 fases do Labirinto.' },
    { id: 'bolha-30', title: 'Estoura tudo', desc: 'Fez 30 pontos no Bolha Pop.' },
    { id: 'whack-30', title: 'Mira rápida', desc: 'Fez 30 pontos no Whack-a-Mole.' },
    { id: 'genius-8', title: 'Memória elétrica', desc: 'Chegou à fase 8 no Genius 2.0.' },
    { id: 'memoria-temas-win', title: 'Tema dominado', desc: 'Venceu a Memória com Temas.' },
    { id: 'pacman-clear', title: 'Labirinto limpo', desc: 'Comeu todos os pontos no Pac-Man.' },
    { id: 'xadrez-mate', title: 'Xeque-mate', desc: 'Venceu uma partida de Xadrez.' },
    { id: 'klondike-win', title: 'Paciência completa', desc: 'Terminou uma partida de Paciência.' },
    { id: 'freecell-win', title: 'Células livres', desc: 'Terminou uma partida de FreeCell.' },
    { id: 'spider-run', title: 'Sequência tecida', desc: 'Fechou uma sequência no Spider.' },
    { id: 'spider-win', title: 'Teia completa', desc: 'Terminou uma partida de Spider.' },
    { id: 'all-games', title: 'Tour completo', desc: 'Jogou todos os jogos.' }
  ];

  const defaults = {
    difficulty: 'normal',
    muted: false,
    theme: 'dark'
  };

  const difficultyLabels = {
    easy: 'Fácil',
    normal: 'Normal',
    hard: 'Difícil'
  };

  function getJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function setJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function setItem(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch {}
  }

  function removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  function getSettings() {
    return { ...defaults, ...getJson(SETTINGS_KEY, {}) };
  }

  function saveSettings(next) {
    const settings = { ...getSettings(), ...next };
    setJson(SETTINGS_KEY, settings);
    applyTheme();
    window.dispatchEvent(new CustomEvent('dudu-settings-change', { detail: settings }));
    return settings;
  }

  function applyTheme() {
    document.documentElement.dataset.theme = getSettings().theme;
  }

  function getDifficulty() {
    return getSettings().difficulty;
  }

  function sound(type = 'tick') {
    if (getSettings().muted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = type === 'win' ? 660 : type === 'fail' ? 150 : type === 'score' ? 520 : 320;
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      setTimeout(() => ctx.close(), 180);
    } catch {}
  }

  function getRecord(game) {
    const meta = records[game];
    if (!meta) return 0;
    return Number(getItem(meta.key)) || 0;
  }

  function setRecord(game, value) {
    const meta = records[game];
    if (!meta) return false;
    if (!Number.isFinite(value) || value <= 0) return false;
    const current = getRecord(game);
    const isRecord = !current ||
      (meta.better === 'higher' ? value > current : value < current);
    if (isRecord) {
      setItem(meta.key, value);
      window.dispatchEvent(new CustomEvent('dudu-record-change'));
    }
    return isRecord;
  }

  function markPlayed(game) {
    const played = getJson(PLAYED_KEY, {});
    played[game] = true;
    setJson(PLAYED_KEY, played);
    unlock('first-play');
    if (Object.keys(records).every(key => played[key])) unlock('all-games');
  }

  function getUnlocked() {
    return getJson(ACHIEVEMENTS_KEY, {});
  }

  function unlock(id) {
    const unlocked = getUnlocked();
    if (unlocked[id]) return false;
    unlocked[id] = new Date().toISOString();
    setJson(ACHIEVEMENTS_KEY, unlocked);
    const achievement = achievements.find(item => item.id === id);
    if (achievement) {
      toast('Conquista desbloqueada: ' + achievement.title);
      sound('win');
      window.dispatchEvent(new CustomEvent('dudu-achievement-change'));
    }
    return true;
  }

  function toast(message) {
    let el = document.querySelector('.dg-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'dg-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function clearProgress() {
    Object.values(records).forEach(record => removeItem(record.key));
    removeItem(ACHIEVEMENTS_KEY);
    removeItem(PLAYED_KEY);
    window.dispatchEvent(new CustomEvent('dudu-reset'));
    renderRecords();
    renderAchievements();
    toast('Recordes e conquistas zerados.');
  }

  function button(text, className) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'dg-control' + (className ? ' ' + className : '');
    el.textContent = text;
    return el;
  }

  function installControls(options = {}) {
    const bar = document.createElement('div');
    bar.className = 'dg-topbar';

    const theme = button(getSettings().theme === 'light' ? 'Escuro' : 'Claro');
    theme.title = 'Alternar modo claro/escuro';
    theme.addEventListener('click', () => {
      const next = getSettings().theme === 'light' ? 'dark' : 'light';
      saveSettings({ theme: next });
      theme.textContent = next === 'light' ? 'Escuro' : 'Claro';
    });
    bar.appendChild(theme);

    const mute = button(getSettings().muted ? 'Som off' : 'Som on');
    mute.title = 'Ativar ou silenciar sons';
    mute.addEventListener('click', () => {
      const next = !getSettings().muted;
      saveSettings({ muted: next });
      mute.textContent = next ? 'Som off' : 'Som on';
      if (!next) sound('tick');
    });
    bar.appendChild(mute);

    if (options.difficulty) {
      const select = document.createElement('select');
      select.className = 'dg-control';
      select.title = 'Dificuldade';
      Object.entries(difficultyLabels).forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        select.appendChild(option);
      });
      select.value = getDifficulty();
      select.addEventListener('change', () => {
        saveSettings({ difficulty: select.value });
        if (typeof options.onDifficultyChange === 'function') options.onDifficultyChange(select.value);
      });
      bar.appendChild(select);
    }

    const reset = button('Zerar recordes', 'dg-danger');
    reset.title = 'Apagar recordes e conquistas deste navegador';
    reset.addEventListener('click', () => {
      if (confirm('Zerar todos os recordes e conquistas salvos neste navegador?')) clearProgress();
    });
    bar.appendChild(reset);

    document.body.prepend(bar);
  }

  function renderRecords() {
    const target = document.querySelector('[data-dg-records]');
    if (!target) return;
    target.innerHTML = '';
    Object.entries(records).forEach(([key, meta]) => {
      const value = getRecord(key);
      const item = document.createElement('div');
      item.className = 'dg-stat';
      item.innerHTML = '<span>' + meta.label + '</span><b>' +
        (value ? value : '-') + '</b><span>' + meta.unit + '</span>';
      target.appendChild(item);
    });
  }

  function renderAchievements() {
    const target = document.querySelector('[data-dg-achievements]');
    if (!target) return;
    const unlocked = getUnlocked();
    target.innerHTML = '';
    achievements.forEach(item => {
      const done = Boolean(unlocked[item.id]);
      const el = document.createElement('div');
      el.className = 'dg-achievement' + (done ? '' : ' locked');
      el.innerHTML = '<b>' + (done ? item.title : 'Bloqueada') + '</b><br><span>' +
        item.desc + '</span>';
      target.appendChild(el);
    });
  }

  function initHome() {
    installControls();
    renderRecords();
    renderAchievements();
    window.addEventListener('dudu-record-change', renderRecords);
    window.addEventListener('dudu-achievement-change', renderAchievements);
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(root + 'sw.js').catch(() => {});
    });
  }

  applyTheme();
  registerServiceWorker();

  window.DuduGames = {
    achievements,
    clearProgress,
    getDifficulty,
    getRecord,
    getSettings,
    initHome,
    installControls,
    markPlayed,
    renderAchievements,
    renderRecords,
    saveSettings,
    setRecord,
    sound,
    unlock
  };
})();
