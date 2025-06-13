const sharp = require('sharp');
const fs = require('fs');

// OGP画像の生成 (1200x630)
sharp('ogp.svg')
  .resize(1200, 630)
  .png()
  .toFile('ogp.png')
  .then(() => console.log('OGP画像を生成しました'))
  .catch(err => console.error('OGP画像の生成に失敗しました:', err));

// 収納ボックスアイコンのSVGを作成
const boxIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(256, 256)">
    <rect x="-150" y="-150" width="300" height="300" rx="30" fill="white" opacity="0.2"/>
    <rect x="-130" y="-130" width="260" height="260" rx="25" fill="white" opacity="0.3"/>
    
    <!-- 引き出し -->
    <rect x="-110" y="-80" width="220" height="80" rx="15" fill="white" opacity="0.9"/>
    <rect x="-110" y="0" width="220" height="80" rx="15" fill="white" opacity="0.9"/>
    <rect x="-110" y="80" width="220" height="80" rx="15" fill="white" opacity="0.9"/>
    
    <!-- 取っ手 -->
    <rect x="-40" y="-40" width="80" height="20" rx="10" fill="#4A90E2"/>
    <rect x="-40" y="40" width="80" height="20" rx="10" fill="#4A90E2"/>
    <rect x="-40" y="120" width="80" height="20" rx="10" fill="#4A90E2"/>
  </g>
</svg>`;

// 一時的なSVGファイルを作成
fs.writeFileSync('temp-icon.svg', boxIconSvg);

// アイコン画像の生成
Promise.all([
  // favicon.png (32x32)
  sharp('temp-icon.svg')
    .resize(32, 32)
    .png()
    .toFile('favicon.png')
    .then(() => console.log('favicon.pngを生成しました'))
    .catch(err => console.error('favicon.pngの生成に失敗しました:', err)),

  // icon-192.png (192x192)
  sharp('temp-icon.svg')
    .resize(192, 192)
    .png()
    .toFile('icon-192.png')
    .then(() => console.log('icon-192.pngを生成しました'))
    .catch(err => console.error('icon-192.pngの生成に失敗しました:', err)),

  // icon-512.png (512x512)
  sharp('temp-icon.svg')
    .resize(512, 512)
    .png()
    .toFile('icon-512.png')
    .then(() => console.log('icon-512.pngを生成しました'))
    .catch(err => console.error('icon-512.pngの生成に失敗しました:', err))
]).then(() => {
  // 一時ファイルを削除
  fs.unlinkSync('temp-icon.svg');
  console.log('一時ファイルを削除しました');
}); 