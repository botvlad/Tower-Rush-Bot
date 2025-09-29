// app.js — устойчивая версия
document.addEventListener('DOMContentLoaded', () => {
  const signalBtn = document.getElementById('signal-btn');
  const analyzeBtn = document.getElementById('analyze'); 
  const installBtn = document.getElementById('install-btn');

  const numberEl = document.getElementById('signal-number') || document.getElementById('result') || null;
  const textEl = document.getElementById('signal-text') || document.getElementById('result') || null;

  const btnRu = document.getElementById('lang-ru');
  const btnEn = document.getElementById('lang-en');

  let lang = 'en';
  let deferredPrompt = null;

  console.log('[app] DOM ready. Elements found:', { signalBtn: !!signalBtn, analyzeBtn: !!analyzeBtn });

  function getSignal() {
    if (Math.random() < 0.8) {
      return Math.floor(Math.random() * 4) + 1;
    } else {
      return Math.floor(Math.random() * 4) + 5;
    }
  }

  function updateText(value) {
    if (!textEl) return;
    if (lang === 'ru') {
      textEl.textContent = `Поставьте ${value} блок(а) подряд`;
    } else {
      textEl.textContent = `Place ${value} block(s) in a row`;
    }
  }

  function showSignal(value) {
    if (numberEl) numberEl.textContent = value;
    updateText(value);
    console.log('[app] signal shown:', value);
  }

  function startCooldown(btn, seconds = 10) {
    if (!btn) return;
    btn.disabled = true;
    let remaining = seconds;
    const originalText = (lang === 'ru') ? (btn.dataset.ru || 'ПОЛУЧИТЬ СИГНАЛ') : (btn.dataset.en || 'GET SIGNAL');
    btn.textContent = (lang === 'ru') ? `Подождите ${remaining}s...` : `Wait ${remaining}s...`;
    const t = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        btn.textContent = (lang === 'ru') ? `Подождите ${remaining}s...` : `Wait ${remaining}s...`;
      } else {
        clearInterval(t);
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }, 1000);
  }

  function onGetSignalClick(e) {
    try {
      const value = getSignal();
      showSignal(value);
      const btn = e.currentTarget;
      startCooldown(btn, 10);
    } catch (err) {
      console.error('[app] error in onGetSignalClick:', err);
    }
  }

  if (signalBtn) {
    signalBtn.dataset.en = 'GET SIGNAL';
    signalBtn.dataset.ru = 'ПОЛУЧИТЬ СИГНАЛ';
    signalBtn.addEventListener('click', onGetSignalClick);
  }
  if (analyzeBtn) {
    analyzeBtn.dataset.en = 'ANALYZE';
    analyzeBtn.dataset.ru = 'АНАЛИЗ';
    analyzeBtn.addEventListener('click', onGetSignalClick);
  }

  if (btnRu) {
    btnRu.addEventListener('click', () => {
      lang = 'ru';
      btnRu.classList.add('active');
      btnEn && btnEn.classList.remove('active');
      if (textEl) textEl.textContent = 'Нажмите "ПОЛУЧИТЬ СИГНАЛ"';
      if (signalBtn) signalBtn.textContent = 'ПОЛУЧИТЬ СИГНАЛ';
    });
  }
  if (btnEn) {
    btnEn.addEventListener('click', () => {
      lang = 'en';
      btnEn.classList.add('active');
      btnRu && btnRu.classList.remove('active');
      if (textEl) textEl.textContent = 'Press "GET SIGNAL"';
      if (signalBtn) signalBtn.textContent = 'GET SIGNAL';
    });
  }

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

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.classList.remove('hidden');
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        console.log('[app] install choice:', choice);
        deferredPrompt = null;
        installBtn.classList.add('hidden');
      }, { once: true });
    }
  });
});
