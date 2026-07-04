(() => {
  const rootScript = document.currentScript;
  const rootUrl = new URL(rootScript.getAttribute('src') || 'shared.js', document.baseURI);
  const root = new URL('.', rootUrl).href;

  const SETTINGS_KEY = 'dudu-settings';
  const ACHIEVEMENTS_KEY = 'dudu-conquistas';
  const PLAYED_KEY = 'dudu-jogos-jogados';
  const PROFILE_KEY = 'dudu-profile';
  const DAILY_KEY = 'dudu-daily';
  const WALLET_KEY = 'dudu-wallet';
  const STORE_KEY = 'dudu-store';
  const TOURNAMENT_KEY = 'dudu-tournament';

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
    spider: { label: 'Spider', key: 'dudu-spider-recorde', unit: 'mov.', better: 'lower' },
    penaltis: { label: 'Pênaltis Dudu', key: 'dudu-penaltis-recorde', unit: 'gols', better: 'higher' },
    embaixadinhas: { label: 'Embaixadinhas', key: 'dudu-embaixadinhas-recorde', unit: 'toques', better: 'higher' },
    'falta-perfeita': { label: 'Falta Perfeita', key: 'dudu-falta-recorde', unit: 'pts', better: 'higher' },
    'mini-futebol': { label: 'Mini Futebol', key: 'dudu-mini-futebol-recorde', unit: 'gols', better: 'higher' },
    cabecada: { label: 'Cabeçada', key: 'dudu-cabecada-recorde', unit: 'pts', better: 'higher' },
    goleiro: { label: 'Goleiro Dudu', key: 'dudu-goleiro-recorde', unit: 'defesas', better: 'higher' },
    'drible-run': { label: 'Drible Run', key: 'dudu-drible-recorde', unit: 'm', better: 'higher' },
    'chute-alvo': { label: 'Chute ao Alvo', key: 'dudu-alvo-recorde', unit: 'pts', better: 'higher' },
    'copa-dudu': { label: 'Copa Dudu', key: 'dudu-copa-recorde', unit: 'pts', better: 'higher' },
    'futebol-botao': { label: 'Futebol de Botão', key: 'dudu-botao-recorde', unit: 'gols', better: 'higher' }
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
    { id: 'penaltis-5', title: 'Frio no pênalti', desc: 'Marcou 5 gols em Pênaltis Dudu.' },
    { id: 'embaixadinhas-50', title: 'Bola no pé', desc: 'Fez 50 embaixadinhas.' },
    { id: 'falta-50', title: 'Cobrança perfeita', desc: 'Fez 50 pontos em Falta Perfeita.' },
    { id: 'mini-futebol-3', title: 'Artilheiro 1x1', desc: 'Fez 3 gols no Mini Futebol.' },
    { id: 'cabecada-40', title: 'Cabeça certeira', desc: 'Fez 40 pontos em Cabeçada.' },
    { id: 'goleiro-10', title: 'Muralha Dudu', desc: 'Fez 10 defesas como goleiro.' },
    { id: 'drible-120', title: 'Driblador veloz', desc: 'Correu 120m no Drible Run.' },
    { id: 'alvo-120', title: 'Mira calibrada', desc: 'Fez 120 pontos no Chute ao Alvo.' },
    { id: 'copa-win', title: 'Campeão da Copa', desc: 'Terminou a Copa Dudu.' },
    { id: 'botao-3', title: 'Craque de botão', desc: 'Fez 3 gols no Futebol de Botão.' },
    { id: 'daily-first', title: 'Missão cumprida', desc: 'Concluiu uma missão diária.' },
    { id: 'tournament-finish', title: 'Mini-campeão', desc: 'Terminou um torneio de 5 jogos.' },
    { id: 'all-games', title: 'Tour completo', desc: 'Jogou todos os jogos.' }
  ];

  const gameRoutes = {
    snake: 'cobrinha/',
    memory: 'memoria/',
    game2048: '2048/',
    mines: 'campo-minado/',
    velha: 'velha/',
    pong: 'pong/',
    tetris: 'tetris/',
    simon: 'simon/',
    forca: 'forca/',
    sudoku: 'sudoku/',
    invaders: 'space-invaders/',
    golfe: 'golfe/',
    flappy: 'flappy/',
    breakout: 'breakout/',
    dino: 'dino/',
    labirinto: 'labirinto/',
    bolha: 'bolha/',
    whack: 'whack/',
    genius2: 'genius2/',
    'memoria-temas': 'memoria-temas/',
    pacman: 'pacman/',
    xadrez: 'xadrez/',
    paciencia: 'paciencia/',
    freecell: 'freecell/',
    spider: 'spider/',
    penaltis: 'penaltis/',
    embaixadinhas: 'embaixadinhas/',
    'falta-perfeita': 'falta-perfeita/',
    'mini-futebol': 'mini-futebol/',
    cabecada: 'cabecada/',
    goleiro: 'goleiro/',
    'drible-run': 'drible-run/',
    'chute-alvo': 'chute-alvo/',
    'copa-dudu': 'copa-dudu/',
    'futebol-botao': 'futebol-botao/'
  };

  const tournamentGames = ['snake', 'pong', 'dino', 'breakout', 'labirinto', 'bolha', 'whack', 'genius2', 'pacman', 'tetris', 'penaltis', 'embaixadinhas', 'goleiro', 'chute-alvo'];

  const storeItems = [
    { id: 'theme-ocean', type: 'theme', title: 'Tema Oceano', desc: 'Azul, verde e fundo profundo.', price: 30 },
    { id: 'theme-sunset', type: 'theme', title: 'Tema Pôr do Sol', desc: 'Rosa, amarelo e contraste quente.', price: 45 },
    { id: 'theme-arcade', type: 'theme', title: 'Tema Arcade', desc: 'Visual neon com fundo mais vibrante.', price: 60 },
    { id: 'avatar-star', type: 'avatar', title: 'Avatar Estrela', desc: 'Um avatar brilhante para o perfil.', price: 20 },
    { id: 'avatar-crown', type: 'avatar', title: 'Avatar Coroa', desc: 'Visual de campeão local.', price: 50 }
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

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function seededOrder(items, seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return [...items].sort((a, b) => {
      const av = (hash ^ a.charCodeAt(0) ^ a.length) % 997;
      const bv = (hash ^ b.charCodeAt(0) ^ b.length) % 997;
      return av - bv;
    });
  }

  function getWallet() {
    return Number(getItem(WALLET_KEY)) || 0;
  }

  function addCoins(amount) {
    const next = Math.max(0, getWallet() + amount);
    setItem(WALLET_KEY, next);
    window.dispatchEvent(new CustomEvent('dudu-wallet-change'));
    return next;
  }

  function getSettings() {
    return { ...defaults, ...getJson(SETTINGS_KEY, {}) };
  }

  function getProfile() {
    return { name: 'Dudu', avatar: '🎮', ...getJson(PROFILE_KEY, {}) };
  }

  function saveProfile(profile) {
    setJson(PROFILE_KEY, { ...getProfile(), ...profile });
    window.dispatchEvent(new CustomEvent('dudu-profile-change'));
  }

  function getStore() {
    return { owned: {}, activeTheme: '', activeAvatar: '', ...getJson(STORE_KEY, {}) };
  }

  function saveStore(store) {
    setJson(STORE_KEY, store);
    applyTheme();
    window.dispatchEvent(new CustomEvent('dudu-store-change'));
  }

  function buyStoreItem(id) {
    const item = storeItems.find(entry => entry.id === id);
    if (!item) return false;
    const store = getStore();
    if (!store.owned[id]) {
      if (getWallet() < item.price) {
        toast('Moedas insuficientes.');
        return false;
      }
      addCoins(-item.price);
      store.owned[id] = true;
      toast('Desbloqueado: ' + item.title);
    }
    if (item.type === 'theme') store.activeTheme = id;
    if (item.type === 'avatar') {
      store.activeAvatar = id;
      saveProfile({ avatar: id === 'avatar-star' ? '⭐' : '👑' });
    }
    saveStore(store);
    return true;
  }

  function saveSettings(next) {
    const settings = { ...getSettings(), ...next };
    setJson(SETTINGS_KEY, settings);
    applyTheme();
    window.dispatchEvent(new CustomEvent('dudu-settings-change', { detail: settings }));
    return settings;
  }

  function applyTheme() {
    const html = document.documentElement;
    html.dataset.theme = getSettings().theme;
    html.dataset.shopTheme = getStore().activeTheme || '';
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
    updateDailyByScore(game, value);
    updateTournament(game, value);
    return isRecord;
  }

  function markPlayed(game) {
    const played = getJson(PLAYED_KEY, {});
    played[game] = true;
    setJson(PLAYED_KEY, played);
    updateDailyPlayed(game);
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
    updateDailyByAchievement(id);
    const achievement = achievements.find(item => item.id === id);
    if (achievement) {
      toast('Conquista desbloqueada: ' + achievement.title);
      sound('win');
      window.dispatchEvent(new CustomEvent('dudu-achievement-change'));
    }
    return true;
  }

  function freshDaily() {
    return {
      date: todayKey(),
      played: {},
      wins: {},
      score: {},
      claimed: {}
    };
  }

  function getDaily() {
    const daily = getJson(DAILY_KEY, freshDaily());
    if (daily.date !== todayKey()) {
      const next = freshDaily();
      setJson(DAILY_KEY, next);
      return next;
    }
    return { ...freshDaily(), ...daily };
  }

  function saveDaily(daily) {
    setJson(DAILY_KEY, daily);
    window.dispatchEvent(new CustomEvent('dudu-daily-change'));
  }

  function dailyMissions() {
    const order = seededOrder(['snake100', 'play3', 'win2', 'tetris300', 'dino80'], todayKey());
    const picked = ['snake100', ...order.filter(id => id !== 'snake100')].slice(0, 3);
    const labels = {
      snake100: { title: 'Faça 100 pontos na Cobrinha', reward: 20, total: 1 },
      play3: { title: 'Jogue 3 jogos diferentes', reward: 15, total: 3 },
      win2: { title: 'Vença 2 partidas', reward: 25, total: 2 },
      tetris300: { title: 'Faça 300 pontos no Tetris', reward: 20, total: 1 },
      dino80: { title: 'Corra 80m no Dino Runner', reward: 20, total: 1 }
    };
    return picked.map(id => ({ id, ...labels[id] }));
  }

  function missionProgress(id, daily = getDaily()) {
    if (id === 'snake100') return daily.score.snake >= 100 ? 1 : 0;
    if (id === 'tetris300') return daily.score.tetris >= 300 ? 1 : 0;
    if (id === 'dino80') return daily.score.dino >= 80 ? 1 : 0;
    if (id === 'play3') return Math.min(3, Object.keys(daily.played).length);
    if (id === 'win2') return Math.min(2, Object.keys(daily.wins).length);
    return 0;
  }

  function updateDailyPlayed(game) {
    const daily = getDaily();
    daily.played[game] = true;
    saveDaily(daily);
  }

  function updateDailyByScore(game, value) {
    const daily = getDaily();
    daily.score[game] = Math.max(Number(daily.score[game]) || 0, value);
    saveDaily(daily);
  }

  function updateDailyByAchievement(id) {
    if (!/win|clear|mate|par|perfect|completa|run/.test(id)) return;
    const daily = getDaily();
    daily.wins[id] = true;
    saveDaily(daily);
  }

  function claimDaily(id) {
    const daily = getDaily();
    const mission = dailyMissions().find(item => item.id === id);
    if (!mission || daily.claimed[id] || missionProgress(id, daily) < mission.total) return false;
    daily.claimed[id] = true;
    saveDaily(daily);
    addCoins(mission.reward);
    unlock('daily-first');
    toast('Missão concluída: +' + mission.reward + ' moedas.');
    return true;
  }

  function getTournament() {
    return getJson(TOURNAMENT_KEY, null);
  }

  function saveTournament(tournament) {
    if (!tournament) removeItem(TOURNAMENT_KEY);
    else setJson(TOURNAMENT_KEY, tournament);
    window.dispatchEvent(new CustomEvent('dudu-tournament-change'));
  }

  function startTournament() {
    const games = seededOrder(tournamentGames, String(Date.now())).slice(0, 5);
    const tournament = {
      id: Date.now(),
      games,
      index: 0,
      scores: {},
      complete: false
    };
    saveTournament(tournament);
    toast('Torneio iniciado: 5 jogos em sequência.');
    location.href = root + gameRoutes[games[0]] + '?torneio=1';
  }

  function updateTournament(game, value) {
    const tournament = getTournament();
    if (!tournament || tournament.complete || tournament.games[tournament.index] !== game) return;
    tournament.scores[game] = Math.max(Number(tournament.scores[game]) || 0, value);
    tournament.index += 1;
    if (tournament.index >= tournament.games.length) {
      tournament.complete = true;
      tournament.total = Object.values(tournament.scores).reduce((sum, n) => sum + Number(n || 0), 0);
      addCoins(40);
      unlock('tournament-finish');
      toast('Torneio completo! +' + tournament.total + ' pontos e +40 moedas.');
    } else {
      toast('Jogo registrado. Próximo: ' + records[tournament.games[tournament.index]].label + '.');
    }
    saveTournament(tournament);
  }

  function tournamentNextUrl() {
    const tournament = getTournament();
    if (!tournament || tournament.complete) return root;
    return root + gameRoutes[tournament.games[tournament.index]] + '?torneio=1';
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

    const tournament = getTournament();
    if (tournament && !tournament.complete) {
      const next = button('Torneio ' + (tournament.index + 1) + '/5');
      next.title = 'Continuar torneio';
      next.addEventListener('click', () => { location.href = tournamentNextUrl(); });
      bar.appendChild(next);
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

  function renderProfile() {
    const target = document.querySelector('[data-dg-profile]');
    if (!target) return;
    const profile = getProfile();
    const played = Object.keys(getJson(PLAYED_KEY, {})).length;
    const unlocked = Object.keys(getUnlocked()).length;
    const recordCount = Object.keys(records).filter(key => getRecord(key)).length;
    target.innerHTML = `
      <div class="dg-profile-card">
        <div class="dg-avatar">${profile.avatar}</div>
        <label>Nome<input class="dg-input" data-profile-name value="${profile.name.replace(/"/g, '&quot;')}" maxlength="18"></label>
        <div class="dg-profile-stats">
          <span><b>${played}</b> jogos</span>
          <span><b>${recordCount}</b> recordes</span>
          <span><b>${unlocked}</b> conquistas</span>
          <span><b>${getWallet()}</b> moedas</span>
        </div>
      </div>
    `;
    const input = target.querySelector('[data-profile-name]');
    input.addEventListener('change', () => saveProfile({ name: input.value.trim() || 'Dudu' }));
  }

  function renderDailyMissions() {
    const target = document.querySelector('[data-dg-daily]');
    if (!target) return;
    const daily = getDaily();
    target.innerHTML = dailyMissions().map(mission => {
      const progress = missionProgress(mission.id, daily);
      const done = progress >= mission.total;
      const claimed = daily.claimed[mission.id];
      return `
        <div class="dg-mission">
          <b>${mission.title}</b>
          <span>${progress}/${mission.total} · +${mission.reward} moedas</span>
          <button class="dg-control" data-claim="${mission.id}" ${done && !claimed ? '' : 'disabled'}>${claimed ? 'Recebida' : done ? 'Receber' : 'Em andamento'}</button>
        </div>
      `;
    }).join('');
    target.querySelectorAll('[data-claim]').forEach(btn => btn.addEventListener('click', () => {
      claimDaily(btn.dataset.claim);
      renderDailyMissions();
      renderProfile();
      renderStore();
    }));
  }

  function renderTournament() {
    const target = document.querySelector('[data-dg-tournament]');
    if (!target) return;
    const tournament = getTournament();
    if (!tournament) {
      target.innerHTML = `
        <div class="dg-tournament">
          <div><b>Modo torneio</b><span>Jogue 5 mini-jogos seguidos e some a pontuação.</span></div>
          <button class="dg-control" data-tournament-start>Começar</button>
        </div>
      `;
    } else {
      const total = Object.values(tournament.scores || {}).reduce((sum, n) => sum + Number(n || 0), 0);
      const current = tournament.complete ? 'Finalizado' : records[tournament.games[tournament.index]].label;
      target.innerHTML = `
        <div class="dg-tournament">
          <div><b>${tournament.complete ? 'Torneio completo' : 'Torneio em andamento'}</b><span>${current} · ${tournament.index}/${tournament.games.length} jogos · ${total} pts</span></div>
          <button class="dg-control" data-tournament-next>${tournament.complete ? 'Novo torneio' : 'Continuar'}</button>
          <button class="dg-control dg-danger" data-tournament-reset>Cancelar</button>
        </div>
      `;
    }
    target.querySelector('[data-tournament-start]')?.addEventListener('click', startTournament);
    target.querySelector('[data-tournament-next]')?.addEventListener('click', () => {
      if (getTournament()?.complete) startTournament();
      else location.href = tournamentNextUrl();
    });
    target.querySelector('[data-tournament-reset]')?.addEventListener('click', () => {
      saveTournament(null);
      renderTournament();
    });
  }

  function renderStore() {
    const target = document.querySelector('[data-dg-store]');
    if (!target) return;
    const store = getStore();
    target.innerHTML = storeItems.map(item => {
      const owned = Boolean(store.owned[item.id]);
      const active = store.activeTheme === item.id || store.activeAvatar === item.id;
      return `
        <div class="dg-shop-item">
          <b>${item.title}</b>
          <span>${item.desc}</span>
          <button class="dg-control" data-buy="${item.id}">${active ? 'Ativo' : owned ? 'Usar' : item.price + ' moedas'}</button>
        </div>
      `;
    }).join('');
    target.querySelectorAll('[data-buy]').forEach(btn => btn.addEventListener('click', () => {
      buyStoreItem(btn.dataset.buy);
      renderStore();
      renderProfile();
    }));
  }

  function initHome() {
    installControls();
    renderProfile();
    renderTournament();
    renderDailyMissions();
    renderStore();
    renderRecords();
    renderAchievements();
    window.addEventListener('dudu-record-change', renderRecords);
    window.addEventListener('dudu-achievement-change', renderAchievements);
    window.addEventListener('dudu-profile-change', renderProfile);
    window.addEventListener('dudu-wallet-change', () => { renderProfile(); renderStore(); });
    window.addEventListener('dudu-daily-change', renderDailyMissions);
    window.addEventListener('dudu-tournament-change', renderTournament);
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
    addCoins,
    buyStoreItem,
    clearProgress,
    claimDaily,
    getDifficulty,
    getProfile,
    getRecord,
    getSettings,
    getStore,
    getTournament,
    getWallet,
    initHome,
    installControls,
    markPlayed,
    renderAchievements,
    renderDailyMissions,
    renderProfile,
    renderRecords,
    renderStore,
    renderTournament,
    saveSettings,
    saveProfile,
    startTournament,
    setRecord,
    storeItems,
    sound,
    tournamentNextUrl,
    unlock
  };
})();
