const STORAGE_KEY = 'shizi-leyuan-progress-v1';
const app = document.getElementById('app');
const today = () => new Date().toLocaleDateString('sv-SE');
const safe = (value) => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

const freshProgress = () => ({ version: 1, dates: [], words: {}, history: [], last: { bookId: 'book1', lesson: 1, index: 0 } });
let progress;
try {
  progress = Object.assign(freshProgress(), JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
  if (progress.version !== 1 || !Array.isArray(progress.dates) || !progress.words) progress = freshProgress();
} catch { progress = freshProgress(); }

const state = {
  books: [], audio: { items: [], prompts: [] }, screen: 'home', bookId: progress.last?.bookId || 'book1',
  lesson: progress.last?.lesson || 1, index: 0, question: 0, wrongChoices: [], firstWrong: false,
  answerDone: false, score: 0, missed: new Set(), soundStatus: '', message: '', audioObject: null,
};

function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { state.message = '本机存储空间不足，暂时无法保存学习记录。'; } }
function touchDay() { const day = today(); if (!progress.dates.includes(day)) { progress.dates.push(day); progress.dates.sort(); save(); } }
function getBook() { return state.books.find(book => book.id === state.bookId) || state.books[0]; }
function getLesson() { return getBook()?.lessons[state.lesson - 1]; }
function allItems() { return state.books.flatMap(book => book.lessons.flatMap(lesson => lesson.items)); }
function wordStats(id) { return progress.words[id] || { seen: 0, attempts: 0, correctFirstTry: 0, wrong: 0, streak: 0, mastered: false, lastSeen: '' }; }
function isEasy(stats) { return stats.wrong >= 2 && stats.streak < 3; }
function masteredCount(book) { return book.lessons.flatMap(lesson => lesson.items).filter(item => wordStats(item.id).mastered).length; }
function studiedCount(book) { return book.lessons.flatMap(lesson => lesson.items).filter(item => wordStats(item.id).seen > 0).length; }
function audioRecord(id, kind = 'items') { return state.audio[kind]?.find(entry => entry.id === id); }
function hasSpeech() { return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; }
function hasAudio(item) { return Boolean(audioRecord(item.id)?.ready); }
function stopAudio() { if (state.audioObject) { state.audioObject.pause(); state.audioObject = null; } if (hasSpeech()) speechSynthesis.cancel(); }
function speechFallback(text) {
  if (!hasSpeech()) { state.soundStatus = '此设备暂不能朗读，请家长协助。'; render(); return; }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN'; utterance.rate = 0.82; utterance.pitch = 1.16;
  const voice = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('zh'));
  if (voice) utterance.voice = voice;
  state.soundStatus = '正在使用浏览器临时朗读；AI 童声音频待制作。';
  speechSynthesis.speak(utterance);
  render();
}
function playEntry(entry, text) {
  stopAudio();
  if (entry?.ready) {
    const audio = new Audio(entry.file);
    state.audioObject = audio;
    audio.play().then(() => { state.soundStatus = '正在播放 AI 童声。'; render(); }).catch(() => speechFallback(text));
  } else speechFallback(text);
}
function speakWord(item) { playEntry(audioRecord(item.id), item.char); }
function speakPrompt(id) { const entry = audioRecord(id, 'prompts'); if (entry) playEntry(entry, entry.text); }

function setScreen(screen) { stopAudio(); state.screen = screen; state.message = ''; render(); window.scrollTo({ top: 0, behavior: 'instant' }); }
function selectBook(bookId) { state.bookId = bookId; state.lesson = 1; progress.last = { bookId, lesson: 1, index: 0 }; save(); render(); }
function openLesson(lesson) {
  state.lesson = lesson; state.index = 0;
  progress.last = { bookId: state.bookId, lesson, index: 0 };
  touchDay(); save(); setScreen('loading');
  const bookId = state.bookId;
  ensurePack(bookId, lesson).then(() => {
    if (state.bookId === bookId && state.lesson === lesson && state.screen === 'loading') { noteSeen(getLesson().items[0]); setScreen('learn'); }
  }).catch(error => { console.error(error); setScreen('load-error'); state.message = '图片暂时无法加载，请检查网络后重试。'; render(); });
}
function resume() {
  state.bookId = progress.last?.bookId || 'book1';
  state.lesson = progress.last?.lesson || 1;
  state.index = Math.min(progress.last?.index || 0, 7);
  touchDay(); setScreen('loading');
  const bookId = state.bookId, lesson = state.lesson;
  ensurePack(bookId, lesson).then(() => {
    if (state.bookId === bookId && state.lesson === lesson && state.screen === 'loading') { noteSeen(getLesson().items[state.index]); setScreen('learn'); }
  }).catch(error => { console.error(error); setScreen('load-error'); state.message = '图片暂时无法加载，请检查网络后重试。'; render(); });
}
function noteSeen(item) { const stats = wordStats(item.id); stats.seen += 1; stats.lastSeen = today(); progress.words[item.id] = stats; touchDay(); save(); }
function moveStudy(delta) {
  const next = state.index + delta;
  if (next < 0) return;
  if (next >= getLesson().items.length) { startQuiz(); return; }
  state.index = next;
  progress.last = { bookId: state.bookId, lesson: state.lesson, index: next };
  noteSeen(getLesson().items[next]);
  setScreen('learn');
}
function startQuiz() { state.question = 0; state.score = 0; state.missed = new Set(); state.wrongChoices = []; state.firstWrong = false; state.answerDone = false; touchDay(); setScreen('quiz'); }
function questionType() { const item = getLesson().items[state.question]; return state.question % 2 === 0 && (hasAudio(item) || hasSpeech()) ? 'audio' : 'picture'; }
function optionsFor(item) {
  const items = getLesson().items;
  const target = items.findIndex(candidate => candidate.id === item.id);
  const choices = [item];
  for (let distance = 1; choices.length < 4 && distance < items.length; distance++) {
    const candidate = items[(target + distance * 3) % items.length];
    if (!choices.some(choice => choice.id === candidate.id)) choices.push(candidate);
  }
  const shift = (state.question * 3 + state.lesson) % choices.length;
  return [...choices.slice(shift), ...choices.slice(0, shift)];
}
function chooseAnswer(id) {
  if (state.answerDone || state.wrongChoices.includes(id)) return;
  const item = getLesson().items[state.question];
  const stats = wordStats(item.id);
  if (id !== item.id) {
    state.wrongChoices.push(id); state.firstWrong = true; state.missed.add(item.id);
    stats.wrong += 1; stats.streak = 0; stats.mastered = false;
    state.message = '再试一次，你可以做到！'; speakPrompt('retry');
  } else {
    state.answerDone = true; stats.attempts += 1; stats.lastSeen = today();
    if (!state.firstWrong) { stats.correctFirstTry += 1; stats.streak += 1; state.score += 1; }
    else stats.streak = 0;
    stats.mastered = stats.streak >= 2;
    state.message = state.firstWrong ? '找到了！下次再试着一次答对。' : '答对啦，真棒！';
    speakPrompt('correct');
  }
  progress.words[item.id] = stats; touchDay(); save(); render();
}
function nextQuestion() {
  if (!state.answerDone) return;
  if (state.question === getLesson().items.length - 1) {
    progress.history.unshift({ date: today(), bookId: state.bookId, lesson: state.lesson, score: state.score, total: getLesson().items.length, missed: [...state.missed] });
    progress.history = progress.history.slice(0, 30);
    const nextLesson = Math.min(state.lesson + 1, getBook().lessons.length);
    progress.last = { bookId: state.bookId, lesson: nextLesson, index: 0 };
    save(); setScreen('summary'); speakPrompt('complete'); return;
  }
  state.question += 1; state.wrongChoices = []; state.firstWrong = false; state.answerDone = false; state.message = '';
  stopAudio(); render(); window.scrollTo({ top: 0, behavior: 'instant' });
}

function header() {
  const nav = [['home','课程'],['results','我的成果'],['parent','家长记录']];
  return `<header class="topbar"><button class="brand" data-action="home" aria-label="返回识字乐园首页"><span class="brand-mark">字</span><span>识字乐园</span></button><nav class="nav" aria-label="主导航">${nav.map(([screen,label]) => `<button class="nav-btn" data-action="${screen}" ${state.screen === screen ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav></header>`;
}
function homeView() {
  const book = getBook(); const last = progress.last || { bookId: 'book1', lesson: 1 };
  return `<main><div class="home-grid"><section class="hero-panel"><span class="eyebrow">✦ 今天也来认识新朋友</span><h1>一个字，一个<br>新发现！</h1><p>看一看、听一听，再来闯关吧。</p><button class="primary-btn" data-action="resume">${Object.keys(progress.words).length ? '继续学习' : '开始识字'} ✨</button></section><div class="side-stack"><div class="stat-card"><div class="stat-icon">📅</div><div><strong>${progress.dates.length} 天</strong><span>累计学习</span></div></div><div class="stat-card"><div class="stat-icon">🌟</div><div><strong>${allItems().filter(item => wordStats(item.id).mastered).length} 个</strong><span>已掌握的字卡</span></div></div></div></div><div class="section-head"><h2>选择识字册</h2><span class="subtitle">${book.lessons.length} 关 · 每关 8 个字</span></div><div class="book-grid">${state.books.map(b => `<button class="book-tile ${b.color} ${state.bookId === b.id ? 'selected' : ''}" data-action="book" data-id="${b.id}" aria-pressed="${state.bookId === b.id}"><span class="big-icon">${b.id === 'book1' ? '🪁' : '🚀'}</span><h3>${b.name}</h3><p>${b.subtitle}</p><small>已学 ${studiedCount(b)} / ${b.lessons.length * 8} 张卡</small></button>`).join('')}</div><div class="section-head"><h2>${book.name} · 选一关</h2><span class="subtitle">点选关卡开始学习</span></div><div class="lesson-grid">${book.lessons.map(lesson => { const known = lesson.items.filter(item => wordStats(item.id).mastered).length; return `<button class="lesson-tile" data-action="lesson" data-lesson="${lesson.number}" aria-label="第 ${lesson.number} 关，认识 ${known} 个字"><span class="lesson-number">第 ${lesson.number} 关</span><strong>${lesson.items.slice(0,4).map(item => item.char).join('')}</strong><small>已掌握 ${known} / 8 张卡</small><div class="progress-line"><span style="width:${known / 8 * 100}%"></span></div></button>`; }).join('')}</div></main>`;
}
function learnView() {
  const lesson = getLesson(); const item = lesson.items[state.index];
  return `<main><div class="content-top"><div><button class="back-btn" data-action="home">← 返回课程</button><div class="breadcrumb">${getBook().name} · 第 ${state.lesson} 关</div></div><span class="round-pill">第 ${state.index + 1} / ${lesson.items.length} 个字</span></div><div class="progress-line" aria-label="本关学习进度"><span style="width:${(state.index + 1) / lesson.items.length * 100}%"></span></div><div class="section-head"><h1 class="page-title">看图，认识这个字</h1></div><div class="study-layout"><div class="picture-card"><div class="picture-stage"><img src="${assetUrl(item.picture)}" alt="${safe(item.char)}字的教材插图"></div></div><div class="char-card"><img class="scan-char" src="${assetUrl(item.characterImage)}" alt="教材中的${safe(item.char)}字"><div class="huge-char" aria-label="${safe(item.char)}">${safe(item.char)}</div><button class="audio-btn" data-action="speak-word" aria-label="朗读${safe(item.char)}字">🔊 听这个字</button><p class="audio-note">${hasAudio(item) ? 'AI 童声' : '目前为浏览器临时朗读 · AI 童声待制作'}</p><p class="audio-note" role="status">${safe(state.soundStatus)}</p></div></div><div class="study-actions"><button class="soft-btn" data-action="previous" ${state.index === 0 ? 'disabled' : ''}>← 上一个</button><button class="success-btn" data-action="next-study">${state.index === lesson.items.length - 1 ? '去闯关 →' : '下一个字 →'}</button></div></main>`;
}
function quizView() {
  const item = getLesson().items[state.question]; const type = questionType();
  return `<main><div class="content-top"><div><button class="back-btn" data-action="home">← 返回课程</button><div class="breadcrumb">${getBook().name} · 第 ${state.lesson} 关 · 认字闯关</div></div><span class="round-pill">第 ${state.question + 1} / 8 题</span></div><div class="progress-line" aria-label="闯关进度"><span style="width:${state.question / 8 * 100}%"></span></div><section class="quiz-card"><span class="eyebrow">${type === 'audio' ? '🔊 听音选字' : '🖼️ 看图选字'}</span><h1>${type === 'audio' ? '听一听，选出这个字' : '看一看，选出这个字'}</h1>${type === 'audio' ? `<div class="quiz-audio"><button class="audio-btn" data-action="speak-question" aria-label="播放题目字音">🔊 点我听一听</button></div>` : `<div class="quiz-visual"><img src="${assetUrl(item.quizPicture)}" alt="教材插图，猜一猜对应的字"></div>`}<div class="answer-grid">${optionsFor(item).map(option => `<button class="answer-btn ${state.wrongChoices.includes(option.id) ? 'wrong' : ''} ${state.answerDone && option.id === item.id ? 'correct' : ''}" data-action="answer" data-id="${option.id}" ${state.answerDone || state.wrongChoices.includes(option.id) ? 'disabled' : ''} aria-label="选择${safe(option.char)}">${safe(option.char)}</button>`).join('')}</div><div class="feedback ${state.answerDone ? 'good' : state.firstWrong ? 'try' : ''}" role="status">${safe(state.message)}</div>${type === 'audio' ? `<p class="audio-note">${hasAudio(item) ? 'AI 童声' : '当前使用浏览器临时朗读 · AI 童声待制作'}</p>` : ''}${state.answerDone ? `<button class="success-btn" data-action="next-question">${state.question === 7 ? '看闯关结果 →' : '下一题 →'}</button>` : ''}</section></main>`;
}
function summaryView() {
  const total = getLesson().items.length;
  return `<main><div class="summary-card"><div class="summary-stars" aria-hidden="true">${state.score >= 7 ? '🌟🌟🌟' : state.score >= 5 ? '🌟🌟' : '🌟'}</div><h1>第 ${state.lesson} 关完成啦！</h1><p>一次答对 ${state.score} / ${total} 题${state.missed.size ? `，还有 ${state.missed.size} 个字可以再练练。` : '，每个字都认出来啦！'}</p><div class="summary-actions"><button class="soft-btn" data-action="retry-lesson">再练一次</button><button class="primary-btn" data-action="next-lesson">${state.lesson < getBook().lessons.length ? '学习下一关 →' : '返回课程 →'}</button></div></div></main>`;
}
function resultsView() {
  const known = allItems().filter(item => wordStats(item.id).mastered);
  const count = known.length;
  const badges = [1,8,24,50,100,200].filter(threshold => count >= threshold).length;
  return `<main><button class="back-btn" data-action="home">← 返回课程</button><h1 class="page-title">我的识字成果</h1><p class="subtitle">每次练习，都是新的进步。</p><div class="stats-grid"><div class="stat-card"><div class="stat-icon">🌟</div><div><strong>${count}</strong><span>掌握的字卡</span></div></div><div class="stat-card"><div class="stat-icon">📅</div><div><strong>${progress.dates.length}</strong><span>学习天数</span></div></div><div class="stat-card"><div class="stat-icon">🏅</div><div><strong>${badges}</strong><span>获得的徽章</span></div></div></div><section class="panel"><h2>我的小徽章</h2><div class="word-list">${[1,8,24,50,100,200].map((n,i) => `<div class="word-chip" style="opacity:${count >= n ? 1 : .4}"><strong>${['✨','🌈','🚀','🏆','💫','👑'][i]}</strong><small>认识 ${n} 字</small></div>`).join('')}</div></section></main>`;
}
function parentView() {
  const items = allItems(); const known = items.filter(item => wordStats(item.id).mastered);
  const difficult = items.filter(item => isEasy(wordStats(item.id))).sort((a,b) => wordStats(b.id).wrong - wordStats(a.id).wrong);
  const history = progress.history.slice(0,10);
  return `<main><button class="back-btn" data-action="home">← 返回课程</button><h1 class="page-title">家长学习记录</h1><p class="subtitle">记录仅保存在这台设备的当前浏览器中。</p><div class="stats-grid"><div class="stat-card"><div class="stat-icon">📅</div><div><strong>${progress.dates.length}</strong><span>累计学习天数</span></div></div><div class="stat-card"><div class="stat-icon">🌟</div><div><strong>${known.length}</strong><span>自动判定已掌握</span></div></div><div class="stat-card"><div class="stat-icon">🎯</div><div><strong>${difficult.length}</strong><span>容易错的字</span></div></div></div><div class="parent-grid"><section class="panel"><h2>容易错的字</h2><p class="muted">累计答错至少 2 次，且近期还没有连续 3 次一次答对。</p>${difficult.length ? `<div class="word-list">${difficult.map(item => `<div class="word-chip"><strong>${safe(item.char)}</strong><small>错 ${wordStats(item.id).wrong} 次</small></div>`).join('')}</div>` : '<p class="empty-message">目前没有容易错的字，继续练习吧。</p>'}</section><section class="panel"><h2>已掌握的字卡</h2><p class="muted">同一张字卡连续两次闯关一次答对，即判定为掌握。</p>${known.length ? `<div class="word-list">${known.map(item => `<div class="word-chip"><strong>${safe(item.char)}</strong><small>${item.id.startsWith('book1') ? '第一册' : '第三册'}</small></div>`).join('')}</div>` : '<p class="empty-message">完成闯关并多练几次，这里会出现已掌握的字卡。</p>'}</section><section class="panel"><h2>最近闯关</h2>${history.length ? `<ul class="history-list">${history.map(row => `<li><span>${safe(row.date)} · ${row.bookId === 'book1' ? '第一册' : '第三册'}第 ${row.lesson} 关</span><strong>${row.score}/${row.total} 题一次答对</strong></li>`).join('')}</ul>` : '<p class="empty-message">完成第一关后，这里会显示练习记录。</p>'}</section><section class="panel"><h2>记录说明</h2><p>孩子进入学习或闯关时，记下当天的学习日期。答错会计入该字的错误次数；再次答对后可以继续积累掌握度。</p><p class="muted">更换设备、浏览器或清理浏览器数据后，本机记录不会自动同步。</p><button class="reset-btn" data-action="reset">清除本机学习记录</button></section></div></main>`;
}
function loadingView() {
  return '<main class="loading-card"><span class="loading-icon">✦</span><h1>正在打开这一关…</h1><p>马上就能看图识字啦。</p><button class="soft-btn" data-action="home">返回课程</button></main>';
}
function loadErrorView() {
  return `<main class="loading-card"><h1>图片暂时打不开</h1><p>${safe(state.message)}</p><button class="primary-btn" data-action="retry-load">再试一次</button><button class="soft-btn" data-action="home">返回课程</button></main>`;
}
function render() {
  if (!state.books.length) return;
  let content;
  try {
    content = ({ home: homeView, learn: learnView, quiz: quizView, summary: summaryView, results: resultsView, parent: parentView, loading: loadingView, "load-error": loadErrorView }[state.screen] || homeView)();
  } catch (error) { console.error(error); content = '<main class="panel"><h1>页面暂时打不开</h1><button class="primary-btn" data-action="home">返回课程</button></main>'; }
  app.innerHTML = header() + content;
}

app.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]'); if (!button) return;
  const action = button.dataset.action;
  switch (action) {
    case 'home': setScreen('home'); break;
    case 'results': setScreen('results'); break;
    case 'parent': setScreen('parent'); break;
    case 'book': selectBook(button.dataset.id); break;
    case 'lesson': openLesson(Number(button.dataset.lesson)); break;
    case 'resume': resume(); break;
    case 'previous': moveStudy(-1); break;
    case 'next-study': moveStudy(1); break;
    case 'speak-word': speakWord(getLesson().items[state.index]); break;
    case 'speak-question': speakWord(getLesson().items[state.question]); break;
    case 'answer': chooseAnswer(button.dataset.id); break;
    case 'next-question': nextQuestion(); break;
    case 'retry-lesson': openLesson(state.lesson); break;
    case 'next-lesson': if (state.lesson < getBook().lessons.length) { openLesson(state.lesson + 1); } else setScreen('home'); break;
    case 'retry-load': openLesson(state.lesson); break;
    case 'reset': if (window.confirm('确定清除这台设备上的全部学习记录吗？此操作无法撤销。')) { progress = freshProgress(); save(); state.bookId = 'book1'; state.lesson = 1; setScreen('parent'); } break;
  }
});

const courseSource = window.LITERACY_DATA
  ? Promise.resolve([window.LITERACY_DATA.books, window.LITERACY_DATA.audio])
  : Promise.all([fetch('catalog.json').then(r => { if (!r.ok) throw new Error('课程读取失败'); return r.json(); }), fetch('audio/manifest.json').then(r => r.json())]);
courseSource
  .then(([books, audio]) => { state.books = books; state.audio = audio; if (!books.some(book => book.id === state.bookId)) state.bookId = 'book1'; render(); })
  .catch(error => { console.error(error); app.innerHTML = '<div class="loading-card"><h1>课程暂时无法打开</h1><p>请刷新页面重试。</p></div>'; });

// The optional browser Model Context API exposes the same course actions to supported agents.
if (document.modelContext?.registerTool) {
  const register = tool => Promise.resolve(document.modelContext.registerTool(tool)).catch(error => console.warn('WebMCP registration failed', error));
  register({
    name: 'list_literacy_courses', title: '查看识字课程',
    description: '列出识字册和每册的关卡数。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute() { return state.books.map(book => ({ id: book.id, name: book.name, lessonCount: book.lessons.length })); },
  });
  register({
    name: 'get_literacy_progress', title: '查看学习进度',
    description: '读取当前浏览器保存的学习天数、已认识字数和易错字数。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute() { const items = allItems(); return { studyDays: progress.dates.length, mastered: items.filter(item => wordStats(item.id).mastered).length, difficult: items.filter(item => isEasy(wordStats(item.id))).length }; },
  });
  register({
    name: 'start_literacy_lesson', title: '开始识字关卡',
    description: '打开指定识字册的一关，与在页面上点选关卡相同。',
    inputSchema: { type: 'object', properties: { bookId: { type: 'string', enum: ['book1','book3'] }, lesson: { type: 'integer', minimum: 1, maximum: 36 } }, required: ['bookId','lesson'], additionalProperties: false },
    annotations: { readOnlyHint: false },
    execute(input) {
      if (!state.books.length) throw new Error('课程尚未载入');
      if (!['book1','book3'].includes(input?.bookId) || !Number.isInteger(input?.lesson) || input.lesson < 1 || input.lesson > state.books.find(book => book.id === input.bookId)?.lessons.length) throw new Error('无效的识字册或关卡');
      state.bookId = input.bookId; openLesson(input.lesson);
      return { bookId: state.bookId, lesson: state.lesson, character: getLesson().items[0].char };
    },
  });
}
