const signalBtn = document.getElementById('signal-btn');
const numberEl = document.getElementById('signal-number');
const textEl = document.getElementById('signal-text');

const btnRu = document.getElementById('lang-ru');
const btnEn = document.getElementById('lang-en');

let lang = 'en';

function getSignal() {
  if (Math.random() < 0.8) {
    return Math.floor(Math.random() * 4) + 1; // 1–4 (80%)
  } else {
    return Math.floor(Math.random() * 4) + 5; // 5–8 (20%)
  }
}

function updateText(value) {
  if (lang === 'ru') {
    textEl.textContent = `Поставьте ${value} блок(а) подряд`;
  } else {
    textEl.textContent = `Place ${value} block(s) in a row`;
  }
}

signalBtn.addEventListener('click', () => {
  const value = getSignal();
  numberEl.textContent = value;
  updateText(value);

  // блокировка кнопки на 10 сек
  signalBtn.disabled = true;
  let countdown = 10;
  signalBtn.textContent = `Wait ${countdown}s...`;

  const timer = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      signalBtn.textContent = `Wait ${countdown}s...`;
    } else {
      clearInterval(timer);
      signalBtn.textContent = lang === 'ru' ? "ПОЛУЧИТЬ СИГНАЛ" : "GET SIGNAL";
      signalBtn.disabled = false;
    }
  }, 1000);
});

// переключение языка
btnRu.addEventListener('click', () => {
  lang = 'ru';
  btnRu.classList.add('active');
  btnEn.classList.remove('active');
  textEl.textContent = 'Нажмите "ПОЛУЧИТЬ СИГНАЛ"';
  signalBtn.textContent = "ПОЛУЧИТЬ СИГНАЛ";
});

btnEn.addEventListener('click', () => {
  lang = 'en';
  btnEn.classList.add('active');
  btnRu.classList.remove('active');
  textEl.textContent = 'Press "GET SIGNAL"';
  signalBtn.textContent = "GET SIGNAL";
});

// splash screen hide
window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  const app = document.getElementById('app');
  
  setTimeout(() => {
    splash.style.opacity = 0;
    setTimeout(() => {
      splash.classList.add('hidden');
      app.classList.remove('hidden');
    }, 500);
  }, 2500);
});
