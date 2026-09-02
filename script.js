/**
 * ARKNIGHTS: ENDFIELD - HIGH-PRECISION 3D HOLOGRAM ENGINE
 * 公式動画の質感（メッシュ接続線・加算発光・スキャン波・高精度モデル）を再現
 */

/**
 * ARKNIGHTS: ENDFIELD - REAL POINT-CLOUD 3D ENGINE
 * 公式の3D点群スキャン（白〜シルバーの超高密度粒子構造）を数式で完全再現
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. ロール絞り込み＆モーダル（既存機能） ---
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
        document.getElementById('js-modal-img').src = card.querySelector('img').src;
        document.getElementById('js-modal-role').textContent = card.getAttribute('data-role');
        document.getElementById('js-modal-name').textContent = card.getAttribute('data-name');
        document.getElementById('js-modal-element').textContent = card.getAttribute('data-element');
        document.getElementById('js-modal-desc').textContent = card.getAttribute('data-desc');
        modal.classList.add('is-active');
      });
    });
    if (modalClose) {
      modalClose.addEventListener('click', () => modal.classList.remove('is-active'));
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('is-active'); });
    }
  }

  // --- 2. LORE 世界観データ ---
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
      desc: "集成工業システムは、エンドフィールド工業が誇る最も重要かつコアな技術の一つである。これにより、生産設備の小型化とユニット化を実現し、最小限の人員で完全な自動生産ラインを短時間で構築できるようになった。",
      shape: "cube"
    },
    {
      enTitle: "TIANSHI PILLAR", jaTitle: "天師杭",
      desc: "天師杭は環境気候を制御するための術師装置で、武陵における過酷な自然環境の影響を軽減しつつ、開拓地を制御するため、武陵の開拓者たちは武陵技術と異界術を組み合わせ、天師杭の開発に成功した。",
      shape: "pillar"
    },
    {
      enTitle: "AGGELOID", jaTitle: "アングロス",
      desc: "アングロスとは、アンカーによって生み出された、あらゆる敵対的な物質変異体の総称である。自然物質で構成され、攻撃性を持つ。タロIIの開拓において、人類対者として重大な脅威であり「アングロス戦争」の由来ともなった。",
      shape: "angel"
    },
    {
      enTitle: "LANDBREAKER", jaTitle: "ランドブレイカー",
      desc: "「ランドブレイカー」という集団は、多くの組織、文明の狭間で生き抜き、暴力や独自の生き残りを模索する武装陣営の総称を有する。彼らはそれぞれの目的を持っており、過激な集団もあれば交友可能な集団も存在する。",
      shape: "humanoid"
    }
  ];

  let currentIndex = 0;
  const canvas = document.getElementById('particleCanvas');
  
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const PARTICLE_COUNT = 3200; // 超高密度点群（公式画像準拠）
    const particles = [];
    let angleY = 0;

    function resizeCanvas() {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 点群パーティクルクラス
    class Particle {
      constructor() {
        this.x = (Math.random() - 0.5) * 400;
        this.y = (Math.random() - 0.5) * 400;
        this.z = (Math.random() - 0.5) * 400;
        this.targetX = this.x;
        this.targetY = this.y;
        this.targetZ = this.z;
        this.vx = 0; this.vy = 0; this.vz = 0;
        this.size = Math.random() * 1.2 + 0.6;
        this.brightness = Math.random() * 0.5 + 0.5; // 個別の輝度ムラ
      }

      update() {
        this.vx *= 0.84; this.vy *= 0.84; this.vz *= 0.84;
        this.x += (this.targetX - this.x) * 0.06 + this.vx;
        this.y += (this.targetY - this.y) * 0.06 + this.vy;
        this.z += (this.targetZ - this.z) * 0.06 + this.vz;
      }

      explode() {
        this.vx = (Math.random() - 0.5) * 60;
        this.vy = (Math.random() - 0.5) * 60;
        this.vz = (Math.random() - 0.5) * 60;
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    // --- 公式画像に基く超高精度3D点群（Point Cloud）生成 ---
    function generateShapePoints(shapeType) {
      const points = [];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x = 0, y = 0, z = 0;

        if (shapeType === 'spaceship') {
          // 【画像1】帝江号: 前方に伸びる細長い先端＋中央巨大タワー構造＋後部エンジン
          const section = Math.random();
          if (section < 0.45) {
            // 前方〜艦首（鋭利に伸びるボディ）
            const px = Math.random() * 160; // 0 ~ 160
            const r = Math.pow((160 - px) / 160, 0.8) * 35;
            const a = Math.random() * Math.PI * 2;
            x = px;
            y = Math.sin(a) * r * 0.6;
            z = Math.cos(a) * r;
          } else if (section < 0.75) {
            // 中央構造体（縦長タワー＆垂直ブリッジ）
            x = (Math.random() - 0.5) * 60 - 20;
            y = (Math.random() - 0.5) * 110 - 20;
            z = (Math.random() - 0.5) * 45;
          } else {
            // 後部（巨大エンジン＆ブロック）
            x = -Math.random() * 100 - 20;
            const r = (1 - Math.abs(x + 70) / 100) * 45 + 10;
            const a = Math.random() * Math.PI * 2;
            y = Math.sin(a) * r;
            z = Math.cos(a) * r;
          }
        } 
        else if (shapeType === 'anchor') {
          // 【画像2】アンカー: 上下に非常に鋭く尖ったひし形/針状ボディ
          const h = (Math.random() - 0.5) * 320; // -160 ~ 160
          y = h;
          // 中央が膨らみ端が極細になる紡錘形
          const profile = Math.pow(1 - Math.abs(h) / 160, 1.8);
          const r = profile * 45;
          const a = Math.random() * Math.PI * 2;
          x = Math.cos(a) * r;
          z = Math.sin(a) * r;

          // 中央部のリング段差構造
          if (Math.abs(h) < 25) {
            x *= 1.3; z *= 1.3;
          }
        } 
        else if (shapeType === 'cube') {
          // 【画像3】集成工業システム: 左の手前タワー＋右奥のプラント建築群＋ベース基板
          const r = Math.random();
          if (r < 0.35) {
            // 斜めベース基板 (メッシュ状)
            x = (Math.random() - 0.5) * 220;
            z = (Math.random() - 0.5) * 220;
            y = 80 + (Math.random() - 0.5) * 6;
          } else if (r < 0.75) {
            // 左手前の主タワー構造（太い筒＋支持ブレース）
            const h = Math.random() * 180 - 100; // -100 ~ 80
            y = h;
            const radius = h > 30 ? 25 : 45;
            const a = Math.random() * Math.PI * 2;
            x = -50 + Math.cos(a) * radius;
            z = Math.sin(a) * radius;
          } else {
            // 右奥の複数のプラント・建築ブロック
            const b = Math.floor(Math.random() * 3);
            const bx = 30 + b * 35;
            x = bx + (Math.random() - 0.5) * 25;
            y = 80 - Math.random() * (40 + b * 20);
            z = (Math.random() - 0.5) * 30;
          }
        } 
        else if (shapeType === 'pillar') {
          // 【画像4】天師杭: 四角い基板＋太い幹＋上部に何段階も広がる巨木の枝構造
          const r = Math.random();
          if (r < 0.25) {
            // 土台（四角形メッシュ）
            x = (Math.random() - 0.5) * 180;
            z = (Math.random() - 0.5) * 180;
            y = 110;
          } else if (r < 0.55) {
            // ねじれた中心幹
            const h = Math.random() * 100 + 10; // 10 ~ 110
            y = h;
            const twist = h * 0.05;
            const radius = (120 - h) * 0.3;
            const a = Math.random() * Math.PI * 2;
            x = Math.cos(a + twist) * radius;
            z = Math.sin(a + twist) * radius;
          } else {
            // 上部に幾何学的に広がる大樹の枝（フラクタル風拡散）
            const branchId = Math.floor(Math.random() * 8);
            const angle = (branchId / 8) * Math.PI * 2;
            const dist = Math.random() * 110 + 20;
            y = 10 - Math.pow(dist / 110, 0.8) * 90; // 上へ広がる
            x = Math.cos(angle) * dist + (Math.random() - 0.5) * 20;
            z = Math.sin(angle) * dist + (Math.random() - 0.5) * 20;
          }
        } 
        else if (shapeType === 'angel') {
          // 【画像5】アングロス: 下部一本足＋上部にV字状に伸びる幾何学結晶翼＋周囲の浮遊片
          const r = Math.random();
          if (r < 0.25) {
            // 下部の脚/ベースコラム
            y = Math.random() * 80 + 20;
            const radius = (100 - y) * 0.15 + 3;
            const a = Math.random() * Math.PI * 2;
            x = Math.cos(a) * radius;
            z = Math.sin(a) * radius;
          } else if (r < 0.85) {
            // 上部に巨大に広がるV字状の結晶翼
            const wingSide = (Math.random() < 0.5) ? 1 : -1;
            const t = Math.random();
            x = t * 130 * wingSide;
            y = -t * 90 + (Math.random() - 0.5) * 25;
            z = (Math.random() - 0.5) * (30 + t * 20);
          } else {
            // 周囲に浮遊する破片・結晶パーティクル
            x = (Math.random() - 0.5) * 180;
            y = (Math.random() - 0.5) * 160 - 20;
            z = (Math.random() - 0.5) * 100;
          }
        } 
        else {
          // 【画像6】ランドブレイカー: どっしり構えた重甲メカ＋右手の巨大ハンマー
          const r = Math.random();
          if (r < 0.2) {
            // 右手の巨大ハンマー（柄と正方形の頭部）
            if (Math.random() < 0.4) {
              // 柄
              x = -70 + (Math.random() - 0.5) * 8;
              y = (Math.random() - 0.5) * 120 + 10;
              z = -20 + (Math.random() - 0.5) * 8;
            } else {
              // ハンマーヘッド（大きな立方体）
              x = -70 + (Math.random() - 0.5) * 45;
              y = 50 + (Math.random() - 0.5) * 45;
              z = -20 + (Math.random() - 0.5) * 45;
            }
          } else if (r < 0.5) {
            // 開いた両脚・下半身
            y = Math.random() * 80 + 30; // 30 ~ 110
            const legSide = Math.random() < 0.5 ? -1 : 1;
            x = (20 + (y - 30) * 0.3) * legSide + (Math.random() - 0.5) * 15;
            z = (Math.random() - 0.5) * 25;
          } else {
            // 胸部・巨大な両肩スパイク・頭部
            y = (Math.random() - 0.5) * 90 - 20; // -65 ~ 25
            const width = (y < -30) ? 75 : 50; // 肩幅広め
            x = (Math.random() - 0.5) * width;
            z = (Math.random() - 0.5) * 40;
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

    // --- メインアニメーション（純粋な白〜シルバーのPoint Cloud描画） ---
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      angleY += 0.007; // 3D回転

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const fov = 340;

      // 重なり部分が自発光する加算合成（Point Cloud特有の輝度感）
      ctx.globalCompositeOperation = 'lighter';

      particles.forEach(p => {
        p.update();

        // 3D Y軸回転計算
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);

        const rx = p.x * cosY - p.z * sinY;
        const rz = p.x * sinY + p.z * cosY;
        const ry = p.y;

        const scale = fov / (fov + rz + 220);
        const screenX = centerX + rx * scale;
        const screenY = centerY + ry * scale;

        // 奥行きに応じたアルファ値・サイズ（白〜高輝度シルバー）
        const alpha = Math.min(0.9, Math.max(0.1, (rz + 180) / 320)) * p.brightness;
        ctx.fillStyle = `rgba(240, 245, 255, ${alpha})`;

        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.6, p.size * scale), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(animate);
    }

    // --- UIテキスト＆ゲージ更新 ---
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

    updateUI(0);
    animate();
  }

});