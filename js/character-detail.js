document.addEventListener('DOMContentLoaded', () => {
  // URLの query parameter (例: ?id=gilberta) を取得
  const params = new URLSearchParams(window.location.search);
  const charId = params.get('id');
  const data = CHARACTERS[charId];

  // 存在しないIDの場合は一覧に戻す
  if (!data) {
    window.location.href = 'index2.html';
    return;
  }

  // テキスト・画像データの流し込み
  document.getElementById('js-page-title').textContent = `${data.name} - アークナイツ：エンドフィールド`;
  document.getElementById('js-char-img').src = data.image;
  document.getElementById('js-char-img').alt = data.name;
  document.getElementById('js-char-name').textContent = data.name;
  if (document.getElementById('js-char-en')) {
    document.getElementById('js-char-en').textContent = data.enName || '';
  }
  document.getElementById('js-char-rarity').textContent = data.rarity;
  document.getElementById('js-char-role').textContent = data.role;
  document.getElementById('js-char-element').textContent = data.element;
  document.getElementById('js-char-overview').textContent = data.overview;

  // ギャラリーサムネイル生成と切替制御
  const galleryContainer = document.getElementById('js-gallery-list');
  if (galleryContainer) {
    const allImages = [data.image, ...(data.gallery || [])];
    galleryContainer.innerHTML = allImages.map((imgSrc, index) => `
      <img src="${imgSrc}" class="thumb-item ${index === 0 ? 'active' : ''}" data-src="${imgSrc}" alt="ギャラリー画像 ${index + 1}">
    `).join('');

    const mainImg = document.getElementById('js-char-img');
    const thumbs = galleryContainer.querySelectorAll('.thumb-item');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        mainImg.src = thumb.getAttribute('data-src');
      });
    });
  }

  // スキルリストの動的生成
  const skillsContainer = document.getElementById('js-skills-list');
  if (skillsContainer) {
    skillsContainer.innerHTML = data.skills.map(skill => `
      <div class="skill-card">
        <h3>${skill.name}</h3>
        <p>${skill.desc}</p>
      </div>
    `).join('');
  }
});