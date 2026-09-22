"use strict";

const PINYIN_GROUPS = {
  initials: {
    label: "声母",
    cards: [
      ["b", "bō · 玻璃的玻", "🥛", "双唇紧闭，再轻轻放开", "玻"],
      ["p", "pō · 山坡的坡", "⛰️", "双唇送出一口气", "坡"],
      ["m", "mō · 摸一摸的摸", "🖐️", "双唇合上，用鼻子发声", "摸"],
      ["f", "fó · 大佛的佛", "🙏", "上牙轻碰下唇", "佛"],
      ["d", "dé · 得到的得", "🎁", "舌尖轻碰上牙床", "得"],
      ["t", "tè · 特别的特", "✨", "舌尖放开，送出一口气", "特"],
      ["n", "nǐ · 你的你", "👋", "舌尖顶住上牙床，鼻子发声", "你"],
      ["l", "lè · 快乐的乐", "😄", "舌尖顶住上牙床，气从两边出", "乐"],
      ["g", "gē · 哥哥的哥", "👦", "舌根轻轻抬起", "哥"],
      ["k", "kē · 科学的科", "🔬", "舌根放开，送出气流", "科"],
      ["h", "hē · 喝水的喝", "🥤", "气流从舌根摩擦出来", "喝"],
      ["j", "jī · 小鸡的鸡", "🐥", "嘴角展开，舌面抬起", "鸡"],
      ["q", "qī · 七个的七", "7️⃣", "嘴角展开，轻轻送气", "七"],
      ["x", "xī · 西瓜的西", "🍉", "嘴角展开，气流轻轻摩擦", "西"],
      ["zh", "zhī · 知道的知", "💡", "舌尖翘起，不送气", "知"],
      ["ch", "chī · 吃饭的吃", "🍚", "舌尖翘起，用力送气", "吃"],
      ["sh", "shī · 老师的师", "👩‍🏫", "舌尖翘起，气流摩擦", "师"],
      ["r", "rì · 太阳的日", "🌞", "舌尖翘起，声带振动", "日"],
      ["z", "zì · 写字的字", "✍️", "舌尖平放，不送气", "字"],
      ["c", "cǎo · 小草的草", "🌱", "舌尖平放，用力送气", "草"],
      ["s", "sān · 三个的三", "3️⃣", "舌尖靠近下牙，送出细气流", "三"],
      ["y", "yī · 衣服的衣", "👕", "嘴角展开，声音拉长", "衣"],
      ["w", "wū · 乌鸦的乌", "🐦‍⬛", "嘴唇拢圆，声音拉长", "乌"]
    ]
  },
  simpleFinals: {
    label: "单韵母",
    cards: [
      ["a", "ā · 阿姨的阿", "👩", "嘴巴张大：啊——", "阿"],
      ["o", "ō · 公鸡喔喔叫", "🐓", "嘴巴拢圆：喔——", "喔"],
      ["e", "é · 白鹅的鹅", "🪿", "嘴巴扁扁：鹅——", "鹅"],
      ["i", "yī · 衣服的衣", "👕", "牙齿对齐，嘴角展开", "衣"],
      ["u", "wū · 乌鸦的乌", "🐦‍⬛", "嘴唇突出，拢成小圆圈", "乌"],
      ["ü", "yú · 小鱼的鱼", "🐟", "嘴唇拢圆，像吹小口哨", "鱼"]
    ]
  },
  compoundFinals: {
    label: "复韵母",
    cards: [
      ["ai", "ài · 爱心的爱", "❤️", "先发 a，再滑向 i", "爱"],
      ["ei", "fēi · 飞机的飞", "✈️", "先发 e，再滑向 i", "飞"],
      ["ui", "shuǐ · 喝水的水", "💧", "从 u 快速滑向 i", "水"],
      ["ao", "māo · 小猫的猫", "🐱", "先张大嘴，再拢圆", "猫"],
      ["ou", "gǒu · 小狗的狗", "🐶", "先发 o，再滑向 u", "狗"],
      ["iu", "liù · 六个的六", "6️⃣", "从 i 快速滑向 u", "六"],
      ["ie", "dié · 蝴蝶的蝶", "🦋", "先发 i，再滑向 e", "蝶"],
      ["üe", "yuè · 月亮的月", "🌙", "先发 ü，再滑向 e", "月"]
    ]
  },
  nasalFinals: {
    label: "鼻韵母",
    cards: [
      ["an", "ān · 安全的安", "🛟", "先发 a，舌尖再抬起", "安"],
      ["en", "mén · 大门的门", "🚪", "先发 e，舌尖再抬起", "门"],
      ["in", "yīn · 音乐的音", "🎵", "先发 i，声音送到鼻腔", "音"],
      ["un", "yún · 白云的云", "☁️", "嘴唇拢圆，声音送到鼻腔", "云"],
      ["ang", "yáng · 小羊的羊", "🐑", "嘴巴打开，声音靠后", "羊"],
      ["eng", "fēng · 大风的风", "🌬️", "舌根抬起，鼻音收尾", "风"],
      ["ing", "xīng · 星星的星", "⭐", "嘴角展开，鼻音收尾", "星"],
      ["ong", "zhōng · 时钟的钟", "🕰️", "嘴唇拢圆，鼻音收尾", "钟"]
    ]
  }
};

const TONES = {
  a: ["ā", "á", "ǎ", "à"],
  o: ["ō", "ó", "ǒ", "ò"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"]
};

const TONE_NAMES = ["一声 · 平平的", "二声 · 往上扬", "三声 · 拐个弯", "四声 · 往下降"];
const TONE_HINTS = ["像走平路", "像爬山坡", "先下再上", "像下山坡"];

const WRITING_LETTERS = {
  a: {
    speech: "a，阿姨的阿",
    steps: ["先写左半圆", "再写竖右弯"],
    strokes: [
      [[0.6, 0.38], [0.53, 0.28], [0.38, 0.26], [0.25, 0.34], [0.2, 0.5], [0.24, 0.66], [0.38, 0.72], [0.52, 0.66], [0.59, 0.52], [0.6, 0.38]],
      [[0.61, 0.29], [0.61, 0.45], [0.61, 0.6], [0.61, 0.73]]
    ]
  },
  o: {
    speech: "o，公鸡喔喔叫",
    steps: ["从左上起笔，一笔写成圆圈"],
    strokes: [
      [[0.58, 0.31], [0.43, 0.25], [0.29, 0.31], [0.21, 0.45], [0.22, 0.61], [0.34, 0.72], [0.5, 0.7], [0.6, 0.58], [0.62, 0.42], [0.58, 0.31]]
    ]
  },
  e: {
    speech: "e，白鹅的鹅",
    steps: ["从中间起笔，横着向右", "接着向上绕一圈，一笔写成"],
    strokes: [
      [[0.22, 0.5], [0.36, 0.5], [0.52, 0.49], [0.62, 0.44], [0.58, 0.33], [0.45, 0.27], [0.31, 0.32], [0.23, 0.45], [0.22, 0.59], [0.3, 0.69], [0.44, 0.72], [0.57, 0.66]]
    ]
  },
  i: {
    speech: "i，衣服的衣",
    steps: ["先写短竖", "再在上面点一点"],
    strokes: [
      [[0.46, 0.36], [0.46, 0.5], [0.46, 0.64], [0.46, 0.73]],
      [[0.46, 0.21], [0.46, 0.215]]
    ]
  },
  u: {
    speech: "u，乌鸦的乌",
    steps: ["先写竖右弯", "再写一竖"],
    strokes: [
      [[0.26, 0.34], [0.26, 0.5], [0.27, 0.63], [0.34, 0.71], [0.46, 0.72], [0.56, 0.64], [0.6, 0.51]],
      [[0.61, 0.34], [0.61, 0.5], [0.61, 0.62], [0.61, 0.73]]
    ]
  },
  ü: {
    speech: "ü，小鱼的鱼",
    steps: ["先写竖右弯", "再写一竖", "点左边一点", "点右边一点"],
    strokes: [
      [[0.26, 0.36], [0.26, 0.52], [0.28, 0.65], [0.36, 0.72], [0.48, 0.71], [0.57, 0.62], [0.6, 0.5]],
      [[0.61, 0.36], [0.61, 0.52], [0.61, 0.64], [0.61, 0.73]],
      [[0.36, 0.22], [0.36, 0.225]],
      [[0.53, 0.22], [0.53, 0.225]]
    ]
  },
  b: {
    speech: "b，玻璃的玻",
    steps: ["先写一竖", "再写右半圆"],
    strokes: [
      [[0.31, 0.16], [0.31, 0.34], [0.31, 0.54], [0.31, 0.75]],
      [[0.32, 0.43], [0.43, 0.35], [0.56, 0.38], [0.63, 0.5], [0.61, 0.64], [0.51, 0.72], [0.39, 0.69], [0.32, 0.6]]
    ]
  },
  p: {
    speech: "p，山坡的坡",
    steps: ["先写一竖，向下伸", "再写右半圆"],
    strokes: [
      [[0.31, 0.34], [0.31, 0.5], [0.31, 0.69], [0.31, 0.88]],
      [[0.32, 0.42], [0.43, 0.34], [0.56, 0.38], [0.62, 0.5], [0.6, 0.64], [0.49, 0.71], [0.38, 0.67], [0.32, 0.59]]
    ]
  },
  m: {
    speech: "m，摸一摸的摸",
    steps: ["先写一竖", "再写第一个右弯竖", "最后写第二个右弯竖"],
    strokes: [
      [[0.2, 0.37], [0.2, 0.53], [0.2, 0.72]],
      [[0.21, 0.45], [0.29, 0.36], [0.39, 0.38], [0.43, 0.49], [0.43, 0.72]],
      [[0.44, 0.45], [0.52, 0.36], [0.62, 0.39], [0.66, 0.5], [0.66, 0.72]]
    ]
  },
  f: {
    speech: "f，大佛的佛",
    steps: ["先写右弯竖", "再写一短横"],
    strokes: [
      [[0.58, 0.22], [0.49, 0.17], [0.4, 0.22], [0.36, 0.34], [0.36, 0.52], [0.36, 0.72]],
      [[0.22, 0.43], [0.37, 0.43], [0.53, 0.43]]
    ]
  },
  n: {
    speech: "n，你好的你",
    steps: ["先写一竖", "再写右弯竖"],
    strokes: [
      [[0.25, 0.38], [0.25, 0.54], [0.25, 0.72]],
      [[0.26, 0.47], [0.35, 0.37], [0.49, 0.38], [0.57, 0.49], [0.57, 0.72]]
    ]
  },
  l: {
    speech: "l，快乐的乐",
    steps: ["从上到下写一竖"],
    strokes: [
      [[0.46, 0.17], [0.46, 0.35], [0.46, 0.54], [0.46, 0.73]]
    ]
  }
};

const QUIZ_WORDS = [
  { emoji: "🐱", word: "猫", answer: "māo", options: ["māo", "máo", "mǎo", "mào"] },
  { emoji: "🐶", word: "狗", answer: "gǒu", options: ["gōu", "góu", "gǒu", "gòu"] },
  { emoji: "🐰", word: "兔子", answer: "tù zi", options: ["tū zi", "tú zi", "tǔ zi", "tù zi"] },
  { emoji: "🍎", word: "苹果", answer: "píng guǒ", options: ["pīng guǒ", "píng guǒ", "pǐn guǒ", "pìng guǒ"] },
  { emoji: "🚗", word: "汽车", answer: "qì chē", options: ["qī chē", "qí chē", "qǐ chē", "qì chē"] },
  { emoji: "✈️", word: "飞机", answer: "fēi jī", options: ["fēi jī", "féi jī", "fěi jī", "fèi jī"] },
  { emoji: "🌸", word: "花", answer: "huā", options: ["huā", "huá", "huǎ", "huà"] },
  { emoji: "📖", word: "书", answer: "shū", options: ["sū", "shū", "shǔ", "shù"] },
  { emoji: "🌙", word: "月亮", answer: "yuè liang", options: ["yuē liang", "yué liang", "yuě liang", "yuè liang"] },
  { emoji: "🍉", word: "西瓜", answer: "xī guā", options: ["xī guā", "xí guā", "xǐ guā", "xì guā"] },
  { emoji: "🐦", word: "小鸟", answer: "xiǎo niǎo", options: ["xiāo niǎo", "xiáo niǎo", "xiǎo niǎo", "xiào niǎo"] },
  { emoji: "☂️", word: "雨伞", answer: "yǔ sǎn", options: ["yū sǎn", "yú sǎn", "yǔ sǎn", "yù sǎn"] }
];

const STORAGE_KEY = "pinyin-playground-progress-v2";
const defaults = { stars: 0, learned: [], writingCompleted: [], dailyGoal: 6, soundOn: true };
let saved;

try {
  saved = { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
} catch {
  saved = { ...defaults };
}

const state = {
  page: "home",
  group: "initials",
  cardIndex: 0,
  vowel: "a",
  writingLetter: "a",
  stars: Number(saved.stars) || 0,
  learned: new Set(Array.isArray(saved.learned) ? saved.learned : []),
  writingCompleted: new Set(Array.isArray(saved.writingCompleted) ? saved.writingCompleted : []),
  dailyGoal: Number(saved.dailyGoal) || 6,
  soundOn: saved.soundOn !== false,
  quiz: { questions: [], index: 0, score: 0, locked: false }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      stars: state.stars,
      learned: [...state.learned],
      writingCompleted: [...state.writingCompleted],
      dailyGoal: state.dailyGoal,
      soundOn: state.soundOn
    })
  );
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1700);
}

function playChime(kind = "good") {
  if (!state.soundOn) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const notes = kind === "good" ? [523, 659, 784] : [260, 210];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + index * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.1 + 0.18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + index * 0.1);
    oscillator.stop(context.currentTime + index * 0.1 + 0.2);
  });
  setTimeout(() => context.close(), 700);
}

function speak(text, options = {}) {
  if (!state.soundOn) {
    showToast("声音已关闭，点右上角可以打开");
    return;
  }
  if (!("speechSynthesis" in window)) {
    showToast("当前浏览器暂不支持语音播放");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = options.rate || 0.72;
  utterance.pitch = options.pitch || 1.08;
  const chineseVoice = window.speechSynthesis.getVoices().find((voice) => /zh[-_]CN/i.test(voice.lang));
  if (chineseVoice) utterance.voice = chineseVoice;
  window.speechSynthesis.speak(utterance);
}

function addStar(count = 1) {
  state.stars += count;
  persist();
  updateProgress();
}

function updateProgress() {
  $("#starCount").textContent = state.stars;
  const today = Math.min(state.stars, state.dailyGoal);
  $("#dailyProgress").style.width = `${(today / state.dailyGoal) * 100}%`;
  $("#dailyProgressText").textContent = `${today} / ${state.dailyGoal}`;
  $("#dailyGoal").value = String(state.dailyGoal);
}

function goTo(page) {
  state.page = page;
  $$(".page").forEach((section) => {
    const active = section.id === `page-${page}`;
    section.hidden = !active;
    section.classList.toggle("active", active);
  });
  $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.pageLink === page));
  if (page === "learn") renderLearn();
  if (page === "tones") renderTones();
  if (page === "write") renderWriting();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function currentCard() {
  return PINYIN_GROUPS[state.group].cards[state.cardIndex];
}

function cardId(group = state.group, index = state.cardIndex) {
  return `${group}:${PINYIN_GROUPS[group].cards[index][0]}`;
}

function renderCategoryTabs() {
  $("#categoryTabs").innerHTML = Object.entries(PINYIN_GROUPS)
    .map(
      ([key, group]) =>
        `<button class="category-tab ${key === state.group ? "active" : ""}" role="tab" aria-selected="${key === state.group}" data-group="${key}">${group.label}</button>`
    )
    .join("");
}

function renderMiniCards() {
  const group = PINYIN_GROUPS[state.group];
  $("#miniCardGrid").innerHTML = group.cards
    .map((card, index) => {
      const learned = state.learned.has(cardId(state.group, index));
      return `<button class="mini-card ${index === state.cardIndex ? "active" : ""} ${learned ? "learned" : ""}" data-card-index="${index}" aria-label="学习 ${card[0]}${learned ? "，已经学会" : ""}">${card[0]}</button>`;
    })
    .join("");
  const learnedInGroup = group.cards.filter((_, index) => state.learned.has(cardId(state.group, index))).length;
  $("#groupProgress").textContent = `${learnedInGroup} / ${group.cards.length}`;
}

function renderLearn() {
  renderCategoryTabs();
  renderMiniCards();
  const [letter, example, emoji, mouthTip] = currentCard();
  $("#soundBadge").textContent = PINYIN_GROUPS[state.group].label;
  $("#pinyinLetter").textContent = letter;
  $("#mouthTip").textContent = mouthTip;
  $("#exampleEmoji").textContent = emoji;
  $("#exampleText").textContent = example;
  const learned = state.learned.has(cardId());
  $("#learnedButton").textContent = learned ? "已经会读啦 ✓" : "我会读啦 ⭐";
  $("#learnedButton").classList.toggle("done", learned);
}

function moveCard(delta) {
  const total = PINYIN_GROUPS[state.group].cards.length;
  state.cardIndex = (state.cardIndex + delta + total) % total;
  renderLearn();
}

function toggleLearned() {
  const id = cardId();
  if (state.learned.has(id)) {
    showToast("这个拼音已经点亮啦");
    return;
  }
  state.learned.add(id);
  addStar();
  playChime("good");
  showToast("太棒啦，得到 1 颗星星！");
  renderLearn();
}

function renderTones() {
  $("#vowelButtons").innerHTML = Object.keys(TONES)
    .map(
      (vowel) =>
        `<button class="vowel-button ${vowel === state.vowel ? "active" : ""}" data-vowel="${vowel}" aria-pressed="${vowel === state.vowel}">${vowel}</button>`
    )
    .join("");
  $("#toneGrid").innerHTML = TONES[state.vowel]
    .map(
      (tone, index) => `<button class="tone-card" data-tone-index="${index}">
        <strong>${tone}</strong>
        <span>${TONE_NAMES[index]}</span>
        <small>${TONE_HINTS[index]}</small>
      </button>`
    )
    .join("");
}

function playTone(index) {
  const symbol = TONES[state.vowel][index];
  $$(".tone-card").forEach((card, cardIndex) => card.classList.toggle("active", cardIndex === index));
  $("#toneTrain").style.left = `${7 + index * 25}%`;
  $("#toneRhyme").textContent = `${TONE_NAMES[index]}，${TONE_HINTS[index]}。跟我读：${symbol}——`;
  speak(`${symbol}。${TONE_NAMES[index]}`, { rate: 0.62 });
}

const STROKE_COLORS = ["#ff735d", "#5bbce9", "#8ed9bb", "#a987e8"];
let strokeAnimationFrame = 0;
let traceDrawing = false;

function drawGuideLines(context, canvas) {
  context.save();
  context.strokeStyle = "#dfe6ec";
  context.lineWidth = 2;
  context.setLineDash([10, 10]);
  [0.22, 0.5, 0.78].forEach((ratio) => {
    context.beginPath();
    context.moveTo(22, canvas.height * ratio);
    context.lineTo(canvas.width - 22, canvas.height * ratio);
    context.stroke();
  });
  context.strokeStyle = "#eef1f4";
  context.beginPath();
  context.moveTo(canvas.width / 2, 18);
  context.lineTo(canvas.width / 2, canvas.height - 18);
  context.stroke();
  context.restore();
}

function drawLetterTemplate(context, canvas, letter, strong = false) {
  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `bold ${Math.round(canvas.height * 0.67)}px "Comic Sans MS", "KaiTi", cursive`;
  context.fillStyle = strong ? "rgba(169, 135, 232, 0.12)" : "rgba(169, 135, 232, 0.06)";
  context.strokeStyle = strong ? "rgba(109, 120, 144, 0.26)" : "rgba(109, 120, 144, 0.16)";
  context.lineWidth = strong ? 3 : 2;
  context.setLineDash([9, 10]);
  context.fillText(letter, canvas.width / 2, canvas.height * 0.51);
  context.strokeText(letter, canvas.width / 2, canvas.height * 0.51);
  context.restore();
}

function drawCanvasBase(canvas, letter, strong = false) {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fffdf8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGuideLines(context, canvas);
  drawLetterTemplate(context, canvas, letter, strong);
}

function pathDistance(points) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]);
  }
  return total;
}

function drawNormalizedPath(context, canvas, points, progress, color) {
  const maxDistance = pathDistance(points) * Math.max(0, Math.min(1, progress));
  let travelled = 0;
  context.save();
  context.strokeStyle = color;
  context.lineWidth = Math.max(13, canvas.width * 0.026);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(points[0][0] * canvas.width, points[0][1] * canvas.height);
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const segment = Math.hypot(current[0] - previous[0], current[1] - previous[1]);
    if (travelled + segment <= maxDistance) {
      context.lineTo(current[0] * canvas.width, current[1] * canvas.height);
      travelled += segment;
      continue;
    }
    const remaining = Math.max(0, maxDistance - travelled);
    const ratio = segment === 0 ? 0 : remaining / segment;
    context.lineTo(
      (previous[0] + (current[0] - previous[0]) * ratio) * canvas.width,
      (previous[1] + (current[1] - previous[1]) * ratio) * canvas.height
    );
    break;
  }
  context.stroke();
  context.restore();
}

function drawStrokePreview() {
  const canvas = $("#strokeDemoCanvas");
  const writing = WRITING_LETTERS[state.writingLetter];
  drawCanvasBase(canvas, state.writingLetter);
  const context = canvas.getContext("2d");
  writing.strokes.forEach((stroke, index) => {
    drawNormalizedPath(context, canvas, stroke, 1, `${STROKE_COLORS[index % STROKE_COLORS.length]}99`);
    const [x, y] = stroke[0];
    context.save();
    context.fillStyle = STROKE_COLORS[index % STROKE_COLORS.length];
    context.beginPath();
    context.arc(x * canvas.width, y * canvas.height, 15, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff";
    context.font = "bold 17px system-ui";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(index + 1), x * canvas.width, y * canvas.height + 1);
    context.restore();
  });
}

function playStrokeDemo() {
  cancelAnimationFrame(strokeAnimationFrame);
  const canvas = $("#strokeDemoCanvas");
  const writing = WRITING_LETTERS[state.writingLetter];
  const context = canvas.getContext("2d");
  const durationPerStroke = 850;
  const startedAt = performance.now();

  function animate(now) {
    const elapsed = now - startedAt;
    const activeIndex = Math.min(writing.strokes.length - 1, Math.floor(elapsed / durationPerStroke));
    const activeProgress = Math.min(1, (elapsed % durationPerStroke) / durationPerStroke);
    drawCanvasBase(canvas, state.writingLetter);
    writing.strokes.forEach((stroke, index) => {
      const progress = index < activeIndex ? 1 : index === activeIndex ? activeProgress : 0;
      if (progress > 0) drawNormalizedPath(context, canvas, stroke, progress, STROKE_COLORS[index % STROKE_COLORS.length]);
    });
    $$(".stroke-step").forEach((step, index) => step.classList.toggle("active", index === activeIndex));
    if (elapsed < writing.strokes.length * durationPerStroke) {
      strokeAnimationFrame = requestAnimationFrame(animate);
    } else {
      $$(".stroke-step").forEach((step) => step.classList.remove("active"));
      showToast("看清楚了吗？轮到你写啦！");
    }
  }

  strokeAnimationFrame = requestAnimationFrame(animate);
}

function clearTraceCanvas() {
  drawCanvasBase($("#traceCanvas"), state.writingLetter, true);
}

function renderWritingButtons() {
  $("#writingLetterButtons").innerHTML = Object.keys(WRITING_LETTERS)
    .map((letter) => {
      const active = letter === state.writingLetter;
      const done = state.writingCompleted.has(letter);
      return `<button class="writing-letter-button ${active ? "active" : ""} ${done ? "done" : ""}" data-writing-letter="${letter}" aria-pressed="${active}">${letter}</button>`;
    })
    .join("");
}

function updateWritingCompleteButton() {
  const done = state.writingCompleted.has(state.writingLetter);
  $("#finishWriting").textContent = done ? "已经写好啦 ✓" : "我写好啦 ⭐";
  $("#finishWriting").classList.toggle("done", done);
}

function renderWriting() {
  cancelAnimationFrame(strokeAnimationFrame);
  const writing = WRITING_LETTERS[state.writingLetter];
  renderWritingButtons();
  $("#writingLetterTitle").textContent = state.writingLetter;
  $("#strokeSteps").innerHTML = writing.steps
    .map((step, index) => `<li class="stroke-step"><span class="stroke-number">${index + 1}</span>${step}</li>`)
    .join("");
  updateWritingCompleteButton();
  drawStrokePreview();
  clearTraceCanvas();
}

function finishWriting() {
  if (state.writingCompleted.has(state.writingLetter)) {
    showToast("这个字母已经获得星星啦");
    return;
  }
  state.writingCompleted.add(state.writingLetter);
  addStar();
  playChime("good");
  persist();
  renderWritingButtons();
  updateWritingCompleteButton();
  showToast("写得真认真，得到 1 颗星星！");
}

function canvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height
  };
}

function setupTraceCanvas() {
  const canvas = $("#traceCanvas");
  const context = canvas.getContext("2d");

  canvas.addEventListener("pointerdown", (event) => {
    traceDrawing = true;
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event, canvas);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.strokeStyle = "#5c4ac7";
    context.lineWidth = 14;
    context.lineCap = "round";
    context.lineJoin = "round";
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!traceDrawing) return;
    const point = canvasPoint(event, canvas);
    context.lineTo(point.x, point.y);
    context.stroke();
  });

  const stopDrawing = (event) => {
    if (!traceDrawing) return;
    traceDrawing = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  canvas.addEventListener("pointerleave", (event) => {
    if (event.buttons === 0) traceDrawing = false;
  });
}

function shuffle(items) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function startQuiz() {
  state.quiz = { questions: shuffle(QUIZ_WORDS).slice(0, 8), index: 0, score: 0, locked: false };
  $("#quizIntro").hidden = true;
  $("#quizResult").hidden = true;
  $("#quizGame").hidden = false;
  renderQuestion();
}

function renderQuestion() {
  const { questions, index, score } = state.quiz;
  const question = questions[index];
  state.quiz.locked = false;
  $("#quizStep").textContent = `第 ${index + 1} / ${questions.length} 关`;
  $("#quizScore").textContent = `⭐ ${score}`;
  $("#quizEmoji").textContent = question.emoji;
  $("#quizFeedback").textContent = "";
  $("#nextQuestion").hidden = true;
  $("#quizDots").innerHTML = questions
    .map((_, dotIndex) => `<span class="quiz-dot ${dotIndex < index ? "complete" : ""} ${dotIndex === index ? "current" : ""}"></span>`)
    .join("");
  $("#answerGrid").innerHTML = shuffle(question.options)
    .map((option) => `<button class="answer-button" data-answer="${option}">${option}</button>`)
    .join("");
}

function answerQuestion(button) {
  if (state.quiz.locked) return;
  const question = state.quiz.questions[state.quiz.index];
  if (button.dataset.answer === question.answer) {
    state.quiz.locked = true;
    state.quiz.score += 1;
    button.classList.add("correct");
    $$(".answer-button").forEach((answer) => (answer.disabled = true));
    $("#quizFeedback").textContent = `答对啦！${question.word}，${question.answer}。`;
    $("#quizFeedback").style.color = "#277557";
    $("#nextQuestion").hidden = false;
    $("#quizScore").textContent = `⭐ ${state.quiz.score}`;
    playChime("good");
    speak(`答对啦！${question.word}，${question.answer}`, { rate: 0.72 });
  } else {
    button.classList.add("wrong");
    button.disabled = true;
    $("#quizFeedback").textContent = "再想一想，你一定可以！";
    $("#quizFeedback").style.color = "#b34b3d";
    playChime("try");
  }
}

function nextQuestion() {
  if (state.quiz.index < state.quiz.questions.length - 1) {
    state.quiz.index += 1;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  const { score, questions } = state.quiz;
  $("#quizGame").hidden = true;
  $("#quizResult").hidden = false;
  const rating = score >= 7 ? 3 : score >= 5 ? 2 : 1;
  $("#resultStars").textContent = "⭐".repeat(rating);
  $("#resultTitle").textContent = score >= 7 ? "拼音小达人！" : score >= 5 ? "进步真大！" : "勇敢完成啦！";
  $("#resultText").textContent = `你答对了 ${score} 道题，获得 ${score} 颗星星。每天练一练，会读得越来越准！`;
  addStar(score);
  playChime("good");
}

function resetProgress() {
  const confirmed = window.confirm("要清空星星、拼音卡片和书写练习记录吗？这个操作不能撤销。幸好可以重新开始学习！");
  if (!confirmed) return;
  state.stars = 0;
  state.learned.clear();
  state.writingCompleted.clear();
  persist();
  updateProgress();
  renderLearn();
  renderWriting();
  $("#parentDialog").close();
  showToast("学习记录已经清空");
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const pageLink = event.target.closest("[data-page-link]");
    if (pageLink) goTo(pageLink.dataset.pageLink);

    const groupButton = event.target.closest("[data-group]");
    if (groupButton) {
      state.group = groupButton.dataset.group;
      state.cardIndex = 0;
      renderLearn();
    }

    const cardButton = event.target.closest("[data-card-index]");
    if (cardButton) {
      state.cardIndex = Number(cardButton.dataset.cardIndex);
      renderLearn();
    }

    const vowelButton = event.target.closest("[data-vowel]");
    if (vowelButton) {
      state.vowel = vowelButton.dataset.vowel;
      renderTones();
    }

    const toneButton = event.target.closest("[data-tone-index]");
    if (toneButton) playTone(Number(toneButton.dataset.toneIndex));

    const writingLetterButton = event.target.closest("[data-writing-letter]");
    if (writingLetterButton) {
      state.writingLetter = writingLetterButton.dataset.writingLetter;
      renderWriting();
    }

    const answerButton = event.target.closest("[data-answer]");
    if (answerButton) answerQuestion(answerButton);
  });

  $("#soundToggle").addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    $("#soundToggle").textContent = state.soundOn ? "🔊" : "🔇";
    $("#soundToggle").setAttribute("aria-pressed", String(state.soundOn));
    $("#soundToggle").setAttribute("aria-label", state.soundOn ? "关闭声音" : "打开声音");
    persist();
    if (state.soundOn) speak("声音打开啦");
  });

  $("#cardSpeakButton").addEventListener("click", () => {
    const [letter, example, , , word] = currentCard();
    speak(`${letter}。${example.replace("·", "，")}。${word}`, { rate: 0.64 });
  });
  $("#previousCard").addEventListener("click", () => moveCard(-1));
  $("#nextCard").addEventListener("click", () => moveCard(1));
  $("#learnedButton").addEventListener("click", toggleLearned);
  $("#writingSpeakButton").addEventListener("click", () => {
    speak(WRITING_LETTERS[state.writingLetter].speech, { rate: 0.68 });
  });
  $("#playStrokes").addEventListener("click", playStrokeDemo);
  $("#clearTrace").addEventListener("click", clearTraceCanvas);
  $("#finishWriting").addEventListener("click", finishWriting);
  $("#startQuiz").addEventListener("click", startQuiz);
  $("#restartQuiz").addEventListener("click", startQuiz);
  $("#nextQuestion").addEventListener("click", nextQuestion);
  $("#quizWordSpeak").addEventListener("click", () => {
    const question = state.quiz.questions[state.quiz.index];
    if (question) speak(`${question.word}。${question.answer}`, { rate: 0.7 });
  });
  $("#parentButton").addEventListener("click", () => $("#parentDialog").showModal());
  $("#dailyGoal").addEventListener("change", (event) => {
    state.dailyGoal = Number(event.target.value);
    persist();
    updateProgress();
    showToast("每日目标已更新");
  });
  $("#resetProgress").addEventListener("click", resetProgress);
}

function init() {
  $("#soundToggle").textContent = state.soundOn ? "🔊" : "🔇";
  $("#soundToggle").setAttribute("aria-pressed", String(state.soundOn));
  renderLearn();
  renderTones();
  renderWriting();
  updateProgress();
  setupTraceCanvas();
  bindEvents();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", init);

