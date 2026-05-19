(function () {
  const pages = document.querySelectorAll('.page');
  const total = pages.length;
  let cur = 0;
  let bgmPlaying = false;
  const bgm = document.getElementById('bgm');
  const progressEl = document.getElementById('progress');

  function updateProgress() {
    if (progressEl) progressEl.textContent = (cur + 1) + ' / ' + total;
  }

  function updateNavButtons() {
    const gNext = document.getElementById('globalNext');
    const gPrev = document.getElementById('globalPrev');
    if (gNext) gNext.classList.toggle('hidden', cur === 0 || cur >= total - 1);
    if (gPrev) gPrev.classList.toggle('hidden', cur <= 1);
  }

  function goTo(i) {
    if (i < 0 || i >= total) return;
    pages[cur].classList.remove('active');
    cur = i;
    pages[cur].classList.add('active');
    updateProgress();
    updateNavButtons();
    if (cur === 0) startLoading();
    if (cur === 13) initPoster();
    if (cur === 16) genQRCode();
  }

  function next() { goTo(cur + 1); }
  function prev() { goTo(cur - 1); }

  window.nextPage = next;
  window.prevPage = prev;
  window.goToPage = goTo;

  function startLoading() {
    const bar = document.querySelector('.loader-bar i');
    if (bar) bar.style.width = '0';
    setTimeout(function () {
      if (cur === 0) next();
    }, 2200);
  }

  document.getElementById('musicBtn')?.addEventListener('click', function () {
    if (!bgm) return;
    if (bgmPlaying) {
      bgm.pause();
      this.textContent = '♪';
    } else {
      bgm.play().catch(function () {});
      this.textContent = '♫';
    }
    bgmPlaying = !bgmPlaying;
  });

  let touchY = 0;
  let touchTarget = null;
  document.addEventListener('touchstart', function (e) {
    touchY = e.touches[0].clientY;
    touchTarget = e.target;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dy) < 50) return;
    // don't swipe when interacting with video/audio/input/button
    if (touchTarget && touchTarget.closest('video,audio,input,textarea,button,.scene-slider,.poem-nav,.slider-ctrl')) return;
    if (dy < -50 && cur > 0 && cur < total - 1) next();
    if (dy > 50 && cur > 1) prev();
  }, { passive: true });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') next();
    if (e.key === 'ArrowUp' || e.key === 'PageUp') prev();
  });

  let wheelLock = false;
  document.addEventListener('wheel', function (e) {
    if (wheelLock || cur === 0) return;
    if (Math.abs(e.deltaY) < 30) return;
    wheelLock = true;
    if (e.deltaY > 0) next();
    else prev();
    setTimeout(function () { wheelLock = false; }, 400);
  }, { passive: true });

  document.getElementById('globalNext')?.addEventListener('click', next);
  document.getElementById('globalPrev')?.addEventListener('click', prev);
  document.getElementById('memoryNext')?.addEventListener('click', next);

  document.querySelectorAll('.choice-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.choice-btn').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      const mem = document.getElementById('memoryResult');
      if (mem) {
        mem.textContent = '已记录：' + btn.dataset.mem;
        mem.classList.add('show');
      }
      setTimeout(next, 600);
    });
  });

  document.querySelectorAll('.tab').forEach(function (tab, idx) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('on'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('show'); });
      tab.classList.add('on');
      document.querySelectorAll('.tab-panel')[idx]?.classList.add('show');
    });
  });

  document.querySelectorAll('[data-popup]').forEach(function (el) {
    el.addEventListener('click', function () {
      const id = el.dataset.popup;
      const pop = document.getElementById(id);
      if (pop) {
        pop.classList.toggle('show');
        playSfx('sfxClick');
      }
    });
  });

  const slot = document.getElementById('xiangnangSlot');
  const craftItems = document.querySelectorAll('.craft-item');
  let xnParts = 0;
  craftItems.forEach(function (item) {
    item.addEventListener('click', function () {
      if (item.classList.contains('used')) return;
      item.classList.add('used');
      xnParts++;
      const span = document.createElement('span');
      span.textContent = item.textContent.trim();
      slot?.appendChild(span);
      if (slot) slot.classList.add('filled');
      playSfx('sfxClick');
      if (xnParts >= 3) {
        document.getElementById('xnDone')?.classList.add('show');
      }
    });
  });

  let zongStep = 0;
  const zongSteps = ['选糯米与馅料', '裹紧粽叶', '系上彩绳'];
  document.querySelectorAll('.zong-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      zongStep++;
      document.querySelectorAll('.step-dot').forEach(function (d, i) {
        if (i < zongStep) d.classList.add('done');
      });
      const vis = document.getElementById('zongziVisual');
      if (vis) vis.style.transform = 'scale(' + (1 + zongStep * 0.15) + ')';
      document.getElementById('zongTip').textContent = zongStep < 3 ? '下一步：' + zongSteps[zongStep] : '粽子完成！';
      playSfx('sfxClick');
      if (zongStep >= 3) document.getElementById('zongDone')?.classList.add('show');
    });
  });

  document.querySelectorAll('.rope-colors span').forEach(function (sp) {
    sp.addEventListener('click', function () {
      const pop = document.getElementById('ropePop');
      if (pop) {
        pop.textContent = sp.dataset.tip || '';
        pop.classList.add('show');
      }
    });
  });

  document.getElementById('forehead')?.addEventListener('click', function () {
    this.classList.add('marked');
    document.getElementById('xhPop')?.classList.add('show');
    playSfx('sfxClick');
  });

  let sceneIdx = 0;
  const track = document.getElementById('sceneTrack');
  document.getElementById('scenePrev')?.addEventListener('click', function () {
    sceneIdx = Math.max(0, sceneIdx - 1);
    if (track) track.style.transform = 'translateX(-' + (sceneIdx * 100) + '%)';
  });
  document.getElementById('sceneNext')?.addEventListener('click', function () {
    sceneIdx = Math.min(2, sceneIdx + 1);
    if (track) track.style.transform = 'translateX(-' + (sceneIdx * 100) + '%)';
  });

  let poemIdx = 0;
  const poems = [
    { t: '五月五日午，赠我一枝艾。\n故人不可见，新知万里外。\n丹心照夙昔，鬓发日已改。\n我欲从灵均，三湘隔辽海。', a: '文天祥《端午即事》', title: '端午即事', dynasty: '南宋' },
    { t: '轻汗微微透碧纨，\n明朝端午浴芳兰。\n流香涨腻满晴川。\n彩线轻缠红玉臂，\n小符斜挂绿云鬟。\n佳人相见一千年。', a: '苏轼《浣溪沙·端午》', title: '浣溪沙·端午', dynasty: '北宋' },
    { t: '宫衣亦有名，端午被恩荣。\n细葛含风软，香罗叠雪轻。\n自天题处湿，当暑著来清。\n意内称长短，终身荷圣情。', a: '杜甫《端午日赐衣》', title: '端午日赐衣', dynasty: '唐' }
  ];
  function showPoem() {
    const p = poems[poemIdx];
    document.getElementById('poemTitle').textContent = p.title;
    document.getElementById('poemDynasty').textContent = p.dynasty;
    document.getElementById('poemText').textContent = p.t;
    document.getElementById('poemAuthor').textContent = '—— ' + p.a;
  }
  document.getElementById('poemPrev')?.addEventListener('click', function () {
    poemIdx = (poemIdx - 1 + poems.length) % poems.length;
    showPoem();
  });
  document.getElementById('poemNext')?.addEventListener('click', function () {
    poemIdx = (poemIdx + 1) % poems.length;
    showPoem();
  });
  document.getElementById('poemRead')?.addEventListener('click', function () {
    const p = poems[poemIdx];
    const text = p.t.replace(/\n/g, '，');
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = 0.8;
      utter.pitch = 1;
      window.speechSynthesis.speak(utter);
    } else {
      alert('您的浏览器不支持语音朗读，请使用Chrome或Edge浏览器');
    }
  });
  showPoem();

  let posterReady = false;
  function initPoster() {
    if (posterReady) return;
    posterReady = true;
    const canvas = document.getElementById('posterCanvas');
    const nameInput = document.getElementById('posterName');
    if (!canvas || !nameInput) return;
    document.getElementById('genPoster')?.addEventListener('click', function gen() {
      const name = nameInput.value.trim() || '朋友';
      const ctx = canvas.getContext('2d');
      canvas.width = 600;
      canvas.height = 900;
      const g = ctx.createLinearGradient(0, 0, 0, 900);
      g.addColorStop(0, '#1a5c45');
      g.addColorStop(1, '#0d3b2e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 600, 900);
      ctx.strokeStyle = '#e8d5a3';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 520, 820);
      ctx.fillStyle = '#e8d5a3';
      ctx.font = 'bold 48px KaiTi, serif';
      ctx.textAlign = 'center';
      ctx.fillText('端午安康', 300, 200);
      ctx.font = '36px KaiTi, serif';
      ctx.fillText(name, 300, 380);
      ctx.font = '28px KaiTi, serif';
      ctx.fillText('岁岁无忧 · 龙舟竞渡', 300, 480);
      ctx.font = '120px serif';
      ctx.fillText('🐉', 300, 650);
      ctx.font = '22px KaiTi, serif';
      ctx.fillText('指尖上的传承 · 2026', 300, 820);
      canvas.style.display = 'block';
      document.getElementById('savePoster').style.display = 'inline-block';
    });
    document.getElementById('savePoster')?.addEventListener('click', function () {
      const a = document.createElement('a');
      a.download = '端午祈福海报.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    });
  }

  let qrGenerated = false;
  function genQRCode() {
    if (qrGenerated) return;
    qrGenerated = true;
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;
    const url = location.href;
    const qrApi = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(url);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 200, 200);
      ctx.drawImage(img, 0, 0, 200, 200);
      canvas.style.width = '120px';
      canvas.style.height = '120px';
    };
    img.onerror = function () {
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#333';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code', 100, 90);
      ctx.fillText('部署后可自动生成', 100, 115);
      canvas.style.width = '120px';
      canvas.style.height = '120px';
    };
    img.src = qrApi;
  }

  function playSfx(id) {
    // click.mp3 not bundled; sfx disabled, no-op
  }

  pages[0].classList.add('active');
  updateProgress();
  updateNavButtons();
  startLoading();
  initPoster();
})();
