/**
 * ARKNIGHTS: ENDFIELD - REAL POINT-CLOUD 3D ENGINE & CONTROLLER
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- 0. PV音声再生確認モーダル制御 ---
  const pvModal = document.getElementById('pv-modal');
  const pvVideo = document.getElementById('pv-video');
  const btnSoundOn = document.getElementById('btn-sound-on');
  const btnSoundOff = document.getElementById('btn-sound-off');

  if (pvModal && pvVideo && btnSoundOn && btnSoundOff) {
    document.body.style.overflow = 'hidden';

    const closePvModal = () => {
      pvModal.style.display = 'none';
      document.body.style.overflow = '';
    };

    btnSoundOn.addEventListener('click', () => {
      if (pvVideo.contentWindow) {
        pvVideo.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
        pvVideo.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } else {
        pvVideo.muted = false;
        pvVideo.play().catch(() => {});
      }
      closePvModal();
    });

    btnSoundOff.addEventListener('click', () => {
      if (pvVideo.contentWindow) {
        pvVideo.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
        pvVideo.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } else {
        pvVideo.muted = true;
        pvVideo.play().catch(() => {});
      }
      closePvModal();
    });
  }

  // --- 1. キャラクターフィルター ＆ モーダル機能 ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.getAttribute('data-filter');
      cards.forEach(card => {
        const role = card.getAttribute('data-role');
        card.style.display = (filterValue === 'all' || filterValue === role) ? 'block' : 'none';
      });
    });
  });

  const modal = document.getElementById('js-modal');
  const modalClose = document.getElementById('js-modal-close');
  if (cards.length > 0 && modal) {
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const modalImg = document.getElementById('js-modal-img');
        const src = card.querySelector('img') ? card.querySelector('img').src : '';
        if (src) {
          modalImg.src = src;
          modalImg.style.display = 'block';
        } else {
          modalImg.style.display = 'none';
        }
        document.getElementById('js-modal-role').textContent = card.getAttribute('data-role') || '';
        document.getElementById('js-modal-name').textContent = card.getAttribute('data-name') || '';
        document.getElementById('js-modal-element').textContent = card.getAttribute('data-element') || '';
        document.getElementById('js-modal-desc').textContent = card.getAttribute('data-desc') || '';
        modal.classList.add('is-active');
      });
    });
    if (modalClose) {
      modalClose.addEventListener('click', () => modal.classList.remove('is-active'));
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('is-active'); });
    }
  }

  // --- 2. LORE 世界観データ定義 ---
  const loreData = [
    {
      enTitle: "DIJIANG", jaTitle: "帝江号",
      desc: "帝江号は、タロIIの軌道上に位置する飛行ユニットで、エンドフィールド工業の拠点として機能している。その中には膨大な研究設備があり、原料採掘や集成工業システムなど、多岐にわたる機能をサポートしている。",
      shape: "spaceship"
    },
    {
      enTitle: "ANKHOR", jaTitle: "アンカー",
      desc: "アンカーはアングロスの生成を阻害するために造られた装置。こうした由来不明の装置がタロIIの各地にランダムで投下され、有害物質の拡散と病害発生を引き起こすアングロスを生み出し続ける。",
      shape: "anchor"
    },
    {
      enTitle: "AIC", jaTitle: "集成工業システム",
      desc: "集成工業システムは、エンドフィールド工業が誇る最も重要かつコアな技術の一つである。これにより、生産設備の小型化とユニット化を実現し、最小限の人員で完全な自動生産ラインを短時間で構築できるようになり、基地建設の効率が飛躍的に向上した。",
      shape: "cube"
    },
    {
      enTitle: "TIANSHI PILLAR", jaTitle: "天師杭",
      desc: "天師杭は環境気候を制御するための術師装置で、武陵における過酷な自然環境の影響を軽減しつつ、開拓地を制御するため、武陵の開拓者たちは武陵技術と異界術を組み合わせ、天師杭の開発に成功した。",
      shape: "pillar"
    },
    {
      enTitle: "AGGELOID", jaTitle: "アンゲロス",
      desc: "アングロスとは、アンカーによって生み出された、あらゆる敵対的な物質変異体の総称である。自然物質で構成され、攻撃性を持つ。タロIIの開拓において、人類対者として重大な脅威であり「アングロス戦争」の由来ともなった。",
      shape: "aggeloid"
    },
    {
      enTitle: "LANDBREAKER", jaTitle: "ランドブレーカー",
      desc: "「ランドブレイカー」という集団は、多くの組織、文明の狭間で生き抜き、暴力や独自の生き残りを模索する武装陣営の総称を有する。彼らはそれぞれの目的を持っており、過激な集団もあれば交友可能な集団も存在する。",
      shape: "landbreaker"
    }
  ];

  let currentIndex = 0;
  const canvas = document.getElementById('particleCanvas');
  
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const PARTICLE_COUNT = 5000; // 粒子数を5000に減量
    const particles = [];
    
    // 3Dインタラクション制御変数
    let autoAngleY = 0;
    let userRotX = 0;
    let userRotY = 0;
    let zoomLevel = 1.0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    // 画面外描画制御フラグ & IntersectionObserver
    let isCanvasVisible = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isCanvasVisible = entry.isIntersecting;
      });
    }, { threshold: 0.0 });
    observer.observe(canvas);

    function resizeCanvas() {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 粒子クラス
    class Particle {
      constructor() {
        this.x = (Math.random() - 0.5) * 400;
        this.y = (Math.random() - 0.5) * 400;
        this.z = (Math.random() - 0.5) * 400;
        this.targetX = this.x;
        this.targetY = this.y;
        this.targetZ = this.z;
        this.vx = 0; this.vy = 0; this.vz = 0;
        this.size = Math.random() * 0.8 + 0.4;
        this.brightness = Math.random() * 0.5 + 0.5;
      }

      update() {
        this.vx *= 0.84; this.vy *= 0.84; this.vz *= 0.84;
        this.x += (this.targetX - this.x) * 0.06 + this.vx;
        this.y += (this.targetY - this.y) * 0.06 + this.vy;
        this.z += (this.targetZ - this.z) * 0.06 + this.vz;
      }

      explode() {
        this.vx = (Math.random() - 0.5) * 70;
        this.vy = (Math.random() - 0.5) * 70;
        this.vz = (Math.random() - 0.5) * 70;
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    // 3D Point Cloud 形状アルゴリズム
    function generateShapePoints(shapeType) {
      const points = [];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x = 0, y = 0, z = 0;

        if (shapeType === 'spaceship') {
          const section = Math.random();
          if (section < 0.45) {
            const len = Math.random();
            x = -200 + len * 220;
            const subType = Math.random();
            if (subType < 0.55) {
              const railAngle = (Math.floor(Math.random() * 4) * Math.PI) / 2 + Math.PI / 4;
              const radius = 22;
              x += (Math.random() - 0.5) * 3;
              y = Math.sin(railAngle) * radius + (Math.random() - 0.5) * 2;
              z = Math.cos(railAngle) * radius + (Math.random() - 0.5) * 2;
            } else if (subType < 0.85) {
              const ringIndex = Math.floor(Math.random() * 8);
              x = -180 + ringIndex * 26 + (Math.random() - 0.5) * 2;
              const a = Math.random() * Math.PI * 2;
              const radius = 22;
              y = Math.sin(a) * radius; z = Math.cos(a) * radius;
            } else {
              y = (Math.random() - 0.5) * 5; z = (Math.random() - 0.5) * 5;
            }
          } else if (section < 0.82) {
            x = 20 + Math.random() * 100;
            const sub = Math.random();
            if (sub < 0.35) {
              x = 60 + Math.random() * 25; y = 18 + Math.random() * 52; z = (Math.random() - 0.5) * 10;
            } else if (sub < 0.75) {
              y = (Math.random() - 0.5) * 36; z = (Math.random() - 0.5) * 36;
            } else {
              y = (Math.random() - 0.5) * 24; z = ((Math.random() < 0.5 ? 1 : -1) * (22 + Math.random() * 16));
            }
          } else if (section < 0.94) {
            const t = Math.random();
            x = 120 + t * 45;
            const radius = (1 - t) * 20;
            const a = Math.random() * Math.PI * 2;
            y = Math.sin(a) * radius + (Math.random() - 0.5) * 2; z = Math.cos(a) * radius + (Math.random() - 0.5) * 2;
          } else {
            const podId = Math.floor(Math.random() * 6);
            x = [-140, -60, 20, 80, 110, 140][podId] + (Math.random() - 0.5) * 8;
            y = [50, -50, 60, -45, 40, -35][podId] + (Math.random() - 0.5) * 8;
            z = [40, -35, -50, 45, -35, 40][podId] + (Math.random() - 0.5) * 8;
          }
        } 
        else if (shapeType === 'anchor') {
          const section = Math.random();
          if (section < 0.25) {
            const coreY = -100;
            if (Math.random() < 0.18) {
              const r = Math.random() * 14;
              const a1 = Math.random() * Math.PI * 2; const a2 = Math.random() * Math.PI;
              x = Math.sin(a2) * Math.cos(a1) * r; y = coreY + Math.cos(a2) * r; z = Math.sin(a2) * Math.sin(a1) * r;
            } else {
              const ringId = Math.floor(Math.random() * 3);
              const radius = 45 + ringId * 28 + Math.random() * 8;
              const a = Math.random() * Math.PI * 2;
              const rx = Math.cos(a) * radius; const rz = Math.sin(a) * radius;
              x = rx; y = coreY + rz * Math.sin(0.35) + (Math.random() - 0.5) * 5; z = rz * Math.cos(0.35);
            }
          } else if (section < 0.62) {
            const h = Math.random();
            y = -100 + h * 240;
            const r = Math.pow(Math.random(), 0.6) * (14 + h * 18);
            const a = Math.random() * Math.PI * 2;
            x = Math.cos(a) * r + (Math.random() - 0.5) * 4; z = Math.sin(a) * r + (Math.random() - 0.5) * 4;
          } else if (section < 0.90) {
            const spikeId = Math.floor(Math.random() * 14);
            const angle = (spikeId / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
            const originY = -85 + Math.random() * 110;
            const length = 30 + Math.random() * 60;
            const progress = Math.random();
            x = Math.cos(angle) * (16 + progress * length) + (Math.random() - 0.5) * 6;
            y = originY - progress * (length * 0.45) + (Math.random() - 0.5) * 6;
            z = Math.sin(angle) * (16 + progress * length) + (Math.random() - 0.5) * 6;
          } else {
            const a = Math.random() * Math.PI * 2; const dist = 25 + Math.random() * 95;
            y = -120 + Math.random() * 220; x = Math.cos(a) * dist; z = Math.sin(a) * dist;
          }
        } 
        else if (shapeType === 'cube') {
          const section = Math.random();
          if (section < 0.25) {
            if (Math.random() < 0.45) {
              const trackId = Math.floor(Math.random() * 3);
              x = (Math.random() - 0.5) * 320; y = 90 + (Math.random() - 0.5) * 4; z = -75 + trackId * 45 + (Math.random() - 0.5) * 6;
            } else {
              x = (Math.random() - 0.5) * 300; y = 95; z = (Math.random() - 0.5) * 240;
            }
          } else if (section < 0.68) {
            const cx = (Math.floor(Math.random() * 4) - 1.5) * 65;
            const cz = (Math.floor(Math.random() * 3) - 1.0) * 65 - 10;
            if (Math.random() < 0.62) {
              const h = Math.random() * 75; y = 90 - h;
              const a = Math.random() * Math.PI * 2; const radius = 12 + Math.random() * 4;
              x = cx + Math.cos(a) * radius; z = cz + Math.sin(a) * radius;
            } else {
              x = cx + (Math.random() - 0.5) * 28; y = 10 + (Math.random() - 0.5) * 14; z = cz + (Math.random() - 0.5) * 28;
            }
          } else if (section < 0.88) {
            if (Math.random() < 0.28) {
              x = -110 + Math.floor(Math.random() * 3) * 110; y = -120 + Math.random() * 210; z = -110 + (Math.random() - 0.5) * 10;
            } else {
              const beamT = Math.random();
              x = -120 + Math.random() * 240 + ((Math.random() - 0.5) * 260 - (-120 + Math.random() * 240)) * beamT;
              y = -100 + beamT * 185 + (Math.random() - 0.5) * 3;
              z = -110 + (75 - (-110)) * beamT;
            }
          } else {
            x = (Math.random() - 0.5) * 280; y = 78 + (Math.random() - 0.5) * 8; z = -75 + Math.floor(Math.random() * 3) * 45 + (Math.random() - 0.5) * 8;
          }
        } 
        else if (shapeType === 'pillar') {
          const section = Math.random();
          if (section < 0.22) {
            const h = Math.random(); y = 100 - h * 240;
            const a = Math.random() * Math.PI * 2; const radius = 7 + Math.random() * 6;
            x = Math.cos(a) * radius + (Math.random() - 0.5) * 3; z = Math.sin(a) * radius + (Math.random() - 0.5) * 3;
          } else if (section < 0.50) {
            const h = Math.random(); y = 100 - h * 130;
            const twistAngle = h * Math.PI * 2.5; const trunkRadius = 18 + (1 - h) * 16;
            const a = Math.random() * Math.PI * 2;
            x = Math.cos(twistAngle) * 10 + Math.cos(a) * trunkRadius + (Math.random() - 0.5) * 5;
            z = Math.sin(twistAngle) * 10 + Math.sin(a) * trunkRadius + (Math.random() - 0.5) * 5;
          } else if (section < 0.85) {
            const branchId = Math.floor(Math.random() * 6);
            const baseAngle = (branchId / 6) * Math.PI * 2;
            const t = Math.random();
            const spreadRadius = 18 + Math.pow(t, 0.85) * 125;
            const branchY = -20 - Math.sin(t * Math.PI * 0.5) * 95;
            const finalAngle = baseAngle + (Math.random() < 0.4 ? 1 : -1) * (t * 0.45);
            x = Math.cos(finalAngle) * spreadRadius + Math.sin(t * Math.PI * 3) * 10 + (Math.random() - 0.5) * (10 - t * 6);
            y = branchY + (Math.random() - 0.5) * (10 - t * 6);
            z = Math.sin(finalAngle) * spreadRadius + Math.sin(t * Math.PI * 3) * 10 + (Math.random() - 0.5) * (10 - t * 6);
          } else {
            if (Math.random() < 0.45) {
              const tier = Math.floor(Math.random() * 3);
              x = (Math.random() - 0.5) * (110 - tier * 25); y = 95 + tier * 10; z = (Math.random() - 0.5) * (110 - tier * 25);
            } else {
              const a = Math.random() * Math.PI * 2; const r = 25 + Math.random() * 115;
              x = Math.cos(a) * r; y = -130 + Math.random() * 170; z = Math.sin(a) * r;
            }
          }
        } 
        else if (shapeType === 'aggeloid' || shapeType === 'angel') {
          // アンゲロス (元の構造)
          const section = Math.random();
          if (section < 0.35) {
            const ringId = Math.floor(Math.random() * 2);
            const r = 35 + ringId * 25 + (Math.random() - 0.5) * 6;
            const a = Math.random() * Math.PI * 2;
            x = Math.cos(a) * r;
            y = Math.sin(a) * r;
            z = (Math.random() - 0.5) * 8;
          } else if (section < 0.75) {
            const h = (Math.random() - 0.5) * 160;
            const r = (1 - Math.abs(h) / 80) * 32;
            const a = Math.random() * Math.PI * 2;
            x = Math.cos(a) * r + (Math.random() - 0.5) * 4;
            y = h;
            z = Math.sin(a) * r + (Math.random() - 0.5) * 4;
          } else {
            const side = Math.random() < 0.5 ? -1 : 1;
            const t = Math.random();
            x = side * (30 + t * 85) + (Math.random() - 0.5) * 10;
            y = -60 + t * 120 + (Math.random() - 0.5) * 10;
            z = (Math.random() - 0.5) * 35;
          }
        } 
        else if (shapeType === 'landbreaker') {
          // ランドブレーカー
          const section = Math.random();
          if (section < 0.28) {
            const h = Math.random();
            y = -45 + h * 65;
            const vTaper = (1 - h * 0.35); 
            const chestR = 44 * vTaper;
            const a = Math.random() * Math.PI * 2;
            x = Math.cos(a) * chestR + (Math.random() - 0.5) * 6;
            z = Math.sin(a) * (chestR * 0.75) + (Math.random() - 0.5) * 6;
          } 
          else if (section < 0.48) {
            const side = Math.random() < 0.5 ? -1 : 1;
            const part = Math.random();
            if (part < 0.5) {
              const r = 24 + Math.random() * 8;
              const a1 = Math.random() * Math.PI * 2;
              const a2 = Math.random() * Math.PI;
              x = side * 56 + Math.sin(a2) * Math.cos(a1) * r;
              y = -45 + Math.cos(a2) * r;
              z = Math.sin(a2) * Math.sin(a1) * r;
            } else {
              const t = Math.random();
              x = side * (42 + t * 35);
              y = -50 - t * 45;
              z = (Math.random() - 0.5) * 30;
            }
          } 
          else if (section < 0.68) {
            const armSide = Math.random() < 0.5 ? -1 : 1;
            const t = Math.random();
            const armThickness = 18 * (1 - t * 0.2);
            const a = Math.random() * Math.PI * 2;

            if (armSide === 1) {
              x = 58 + Math.cos(a) * armThickness + t * 20;
              y = -35 + t * 75;
              z = Math.sin(a) * armThickness;
            } else {
              x = -58 + Math.cos(a) * armThickness - t * 15;
              y = -35 + t * 65;
              z = 15 + Math.sin(a) * armThickness;
            }
          } 
          else if (section < 0.80) {
            const t = Math.random();
            x = -50 - t * 70;
            y = 20 + t * 40;
            z = 20 + (Math.random() - 0.5) * 14;
          } 
          else if (section < 0.93) {
            const legSide = Math.random() < 0.5 ? -1 : 1;
            const t = Math.random();
            const legThickness = 20 * (1 - t * 0.25);
            const a = Math.random() * Math.PI * 2;
            x = legSide * (24 + t * 15) + Math.cos(a) * legThickness;
            y = 20 + t * 70;
            z = Math.sin(a) * legThickness;
          } 
          else {
            if (Math.random() < 0.4) {
              const r = Math.random() * 12;
              const a1 = Math.random() * Math.PI * 2;
              const a2 = Math.random() * Math.PI;
              x = Math.sin(a2) * Math.cos(a1) * r;
              y = -60 + Math.cos(a2) * r;
              z = Math.sin(a2) * Math.sin(a1) * r;
            } else {
              const tubeId = Math.floor(Math.random() * 4);
              const tubeX = -9 + tubeId * 6;
              const t = Math.random();
              x = tubeX;
              y = -52 + t * 35;
              z = 16 + Math.sin(t * Math.PI) * 6;
            }
          }
        }

        points.push({ x, y, z });
      }
      return points;
    }

    function updateParticleTargets(shapeType) {
      const points = generateShapePoints(shapeType);
      particles.forEach((p, idx) => {
        p.explode();
        p.targetX = points[idx].x;
        p.targetY = points[idx].y;
        p.targetZ = points[idx].z;
      });
    }

    // --- 3D ドラッグ＆ズーム＆クリック爆散インタラクション ---
    canvas.style.cursor = 'grab';

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      canvas.style.cursor = 'grabbing';
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      userRotY += deltaX * 0.008;
      userRotX += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'grab';
      }
    });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      userRotY += deltaX * 0.008;
      userRotX += deltaY * 0.008;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoomLevel -= e.deltaY * 0.0012;
      zoomLevel = Math.min(Math.max(0.5, zoomLevel), 2.2);
    }, { passive: false });

    canvas.addEventListener('click', () => {
      particles.forEach(p => p.explode());
    });

    // --- アニメーション描画ループ ---
    function animate() {
      requestAnimationFrame(animate);

      // 画面外にある時は処理を行わずスキップ
      if (!isCanvasVisible) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isDragging) {
        autoAngleY += 0.006;
      }

      const totalAngleY = autoAngleY + userRotY;
      const totalAngleX = userRotX;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const fov = 340;

      const minDimension = Math.min(canvas.width, canvas.height);
      const responsiveScale = Math.max(0.9, minDimension / 330) * zoomLevel;

      ctx.globalCompositeOperation = 'lighter';

      const cosY = Math.cos(totalAngleY); const sinY = Math.sin(totalAngleY);
      const cosX = Math.cos(totalAngleX); const sinX = Math.sin(totalAngleX);

      particles.forEach(p => {
        p.update();

        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const scale = fov / (fov + z2 + 220);

        const screenX = centerX + x1 * scale * responsiveScale;
        const screenY = centerY + y2 * scale * responsiveScale;

        const alpha = Math.min(0.95, Math.max(0.12, (z2 + 180) / 320)) * p.brightness;
        ctx.fillStyle = `rgba(240, 245, 255, ${alpha})`;

        ctx.beginPath();
        const particleSize = Math.max(0.4, p.size * scale * (responsiveScale * 0.75));
        ctx.arc(screenX, screenY, particleSize, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
    }

    // UI切り替え制御
    function updateUI(index) {
      const data = loreData[index];
      document.getElementById('js-en-title').textContent = data.enTitle;
      document.getElementById('js-ja-title').textContent = data.jaTitle;
      document.getElementById('js-counter').textContent = `${index + 1}/${loreData.length}`;
      document.getElementById('js-desc-text').textContent = data.desc;

      const progressBar = document.getElementById('js-progress-bar');
      if (progressBar) {
        const step = 100 / loreData.length;
        progressBar.style.width = `${step}%`;
        progressBar.style.marginLeft = `${step * index}%`;
      }

      userRotX = 0;
      userRotY = 0;
      zoomLevel = 1.0;

      updateParticleTargets(data.shape);
    }

    const btnPrev = document.getElementById('js-prev-btn');
    const btnNext = document.getElementById('js-next-btn');
    if (btnPrev && btnNext) {
      btnPrev.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + loreData.length) % loreData.length;
        updateUI(currentIndex);
      });
      btnNext.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % loreData.length;
        updateUI(currentIndex);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + loreData.length) % loreData.length;
        updateUI(currentIndex);
      } else if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % loreData.length;
        updateUI(currentIndex);
      }
    });

    updateUI(0);
    animate();
  }

});