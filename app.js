(function(){
  function createLogger() {
    const logEl = document.getElementById('debug-log');
    function time() { return new Date().toLocaleTimeString(); }
    function write(msg, level='info') {
      const s = `[${time()}] ${msg}`;
      console[level === 'error' ? 'error' : 'log'](s);
      if (logEl) {
        const el = document.createElement('div');
        el.textContent = s;
        el.style.color = level === 'error' ? '#ff8b8b' : '#cfefff';
        logEl.appendChild(el);
        logEl.scrollTop = logEl.scrollHeight;
      }
    }
    return { write, error: (m)=>write(m,'error') };
  }

  const logger = createLogger();

  function safe(selector) {
    try { return document.getElementById(selector); } catch(e) { return null; }
  }

  function init() {
    logger.write('Initializing app...');
    const signalBtn = safe('signal-btn');
    const analyzeBtn = safe('analyze');
    const installBtn = safe('install-btn');
    const numberEl = safe('signal-number') || safe('result') || null;
    const textEl = safe('signal-text') || safe('result') || null;
    const btnRu = safe('lang-ru');
    const btnEn = safe('lang-en');
    const selfTestBtn = safe('selftest-btn');

    logger.write('Elements presence: ' + JSON.stringify({
      signalBtn: !!signalBtn,
      analyzeBtn: !!analyzeBtn,
      installBtn: !!installBtn,
      numberEl: !!numberEl,
      textEl: !!textEl,
      btnRu: !!btnRu,
      btnEn: !!btnEn
    }));

    let lang = 'en';
    let deferredPrompt = null;

    function getSignal() {
      if (Math.random() < 0.8) {
        return Math.floor(Math.random() * 4) + 1;
      } else {
        return Math.floor(Math.random() * 4) + 5;
      }
    }

    function updateText(value) {
      if (!textEl) return;
      textEl.textContent = lang === 'ru' ? `Поставьте ${value} блок(а) подряд` : `Place ${value} block(s) in a row`;
    }

    function showSignal(value) {
      if (numberEl) numberEl.textContent = value;
      updateText(value);
      logger.write('Signal shown: ' + value);
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
          logger.write('Cooldown finished');
        }
      }, 1000);
    }

    function onGetSignalClick(e) {
      try {
        const value = getSignal();
        showSignal(value);
        const btn = e.currentTarget || signalBtn;
        startCooldown(btn, 10);
      } catch (err) {
        logger.error('Error in onGetSignalClick: ' + (err && err.message));
      }
    }

    if (signalBtn) {
      signalBtn.dataset.en = signalBtn.dataset.en || 'GET SIGNAL';
      signalBtn.dataset.ru = signalBtn.dataset.ru || 'ПОЛУЧИТЬ СИГНАЛ';
      signalBtn.addEventListener('click', onGetSignalClick);
      logger.write('Attached click to #signal-btn');
    }

    if (analyzeBtn) {
      analyzeBtn.dataset.en = analyzeBtn.dataset.en || 'ANALYZE';
      analyzeBtn.dataset.ru = analyzeBtn.dataset.ru || 'АНАЛИЗ';
      analyzeBtn.addEventListener('click', onGetSignalClick);
      logger.write('Attached click to #analyze');
    }

    if (selfTestBtn) {
      selfTestBtn.addEventListener('click', () => {
        logger.write('Running self-test: simulating button click');
        if (signalBtn) signalBtn.click();
        else if (analyzeBtn) analyzeBtn.click();
        else logger.error('No signal/analyze button present to self-test');
      });
    }

    if (btnRu) {
      btnRu.addEventListener('click', () => {
        lang = 'ru';
        btnRu.classList && btnRu.classList.add('active');
        btnEn && btnEn.classList.remove('active');
        if (textEl) textEl.textContent = 'Нажмите "ПОЛУЧИТЬ СИГНАЛ"';
        if (signalBtn) signalBtn.textContent = 'ПОЛУЧИТЬ СИГНАЛ';
        logger.write('Language set to RU');
      });
    }
    if (btnEn) {
      btnEn.addEventListener('click', () => {
        lang = 'en';
        btnEn.classList && btnEn.classList.add('active');
        btnRu && btnRu.classList.remove('active');
        if (textEl) textEl.textContent = 'Press "GET SIGNAL"';
        if (signalBtn) signalBtn.textContent = 'GET SIGNAL';
        logger.write('Language set to EN');
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) {
        installBtn.classList.remove('hidden');
        installBtn.addEventListener('click', async () => {
          if (!deferredPrompt) return;
          deferredPrompt.prompt();
          const choice = await deferredPrompt.userChoice;
          logger.write('Install choice: ' + JSON.stringify(choice));
          deferredPrompt = null;
          installBtn.classList.add('hidden');
        }, { once: true });
      }
      logger.write('beforeinstallprompt captured');
    });

    // splash hide on load
    window.addEventListener('load', () => {
      const splash = document.getElementById('splash');
      const app = document.getElementById('app');
      logger.write('Window load event fired');
      setTimeout(() => {
        if (splash) splash.style.opacity = 0;
        setTimeout(() => {
          if (splash) splash.classList.add('hidden');
          if (app) app.classList.remove('hidden');
          logger.write('Splash hidden, app visible');
        }, 500);
      }, 2500);
    });

    logger.write('Init complete');
  } // init

  // run init on DOMContentLoaded asap, but also try immediate init if DOM already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    try { init(); } catch (e) { console.error(e); }
  }

  // global error handler to show errors in the UI debug log
  window.addEventListener('error', function (ev) {
    const msg = ev && ev.message ? ev.message : String(ev);
    try { const el = document.getElementById('debug-log'); if (el) { const d = document.createElement('div'); d.style.color='#ff8b8b'; d.textContent = '[Error] ' + msg; el.appendChild(d); } } catch(e){}
    console.error('Global error:', ev);
  });
})();