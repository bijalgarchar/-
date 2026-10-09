import * as THREE from 'three';

/**
 * Creates high-fidelity procedural canvas textures for authentic food and thali models
 */

// 1. Toasted Phulka Rotli Texture (Golden toasted spots + desi ghee sheen)
export function createRotliTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base soft wheat dough tone
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle flour shading
  const radial = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  radial.addColorStop(0, '#fef08a');
  radial.addColorStop(0.7, '#fde047');
  radial.addColorStop(1, '#eab308');
  ctx.fillStyle = radial;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(0, 0, 512, 512);

  // Authentic golden-brown toasted spots (ચડવેલી રોટલીના ડાઘ)
  ctx.globalAlpha = 0.85;
  const spots = [
    { x: 180, y: 160, r: 18, color: '#92400e' },
    { x: 220, y: 190, r: 28, color: '#78350f' },
    { x: 310, y: 170, r: 22, color: '#b45309' },
    { x: 340, y: 240, r: 16, color: '#92400e' },
    { x: 280, y: 310, r: 32, color: '#78350f' },
    { x: 190, y: 290, r: 24, color: '#92400e' },
    { x: 140, y: 230, r: 14, color: '#b45309' },
    { x: 250, y: 260, r: 19, color: '#d97706' },
    { x: 380, y: 320, r: 12, color: '#92400e' },
    { x: 120, y: 340, r: 15, color: '#b45309' },
    { x: 260, y: 120, r: 20, color: '#78350f' },
    { x: 370, y: 150, r: 14, color: '#92400e' },
  ];

  spots.forEach((spot) => {
    const sGrad = ctx.createRadialGradient(spot.x, spot.y, 2, spot.x, spot.y, spot.r);
    sGrad.addColorStop(0, '#451a03');
    sGrad.addColorStop(0.5, spot.color);
    sGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Glistening desi ghee specks
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 40; i++) {
    const gx = 100 + Math.random() * 312;
    const gy = 100 + Math.random() * 312;
    ctx.beginPath();
    ctx.arc(gx, gy, 1.5 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 2. Stainless Steel Radial Polish Texture
export function createSteelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cx = 256;
  const cy = 256;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 512, 512);

  // Concentric brushed metal rings
  ctx.lineWidth = 1.5;
  for (let r = 10; r < 256; r += 4) {
    ctx.strokeStyle = r % 8 === 0 ? '#94a3b8' : '#e2e8f0';
    ctx.globalAlpha = 0.35 + Math.random() * 0.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 3. Gujarati Dal Texture (Tempered golden dal with mustard seeds & fresh coriander)
export function createDalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm rich yellow dal base
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.7, '#d97706');
  grad.addColorStop(1, '#b45309');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Mustard seeds (કાળા રાઈના દાણા)
  ctx.fillStyle = '#1e293b';
  ctx.globalAlpha = 0.9;
  for (let i = 0; i < 60; i++) {
    const sx = 80 + Math.random() * 350;
    const sy = 80 + Math.random() * 350;
    ctx.beginPath();
    ctx.arc(sx, sy, 2 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cumin seeds (જીરું)
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2;
  for (let i = 0; i < 35; i++) {
    const jx = 100 + Math.random() * 312;
    const jy = 100 + Math.random() * 312;
    const angle = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(jx, jy);
    ctx.lineTo(jx + Math.cos(angle) * 7, jy + Math.sin(angle) * 7);
    ctx.stroke();
  }

  // Chopped fresh green coriander leaves (કોથમીર)
  ctx.fillStyle = '#15803d';
  for (let i = 0; i < 28; i++) {
    const lx = 120 + Math.random() * 272;
    const ly = 120 + Math.random() * 272;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 6 + Math.random() * 4, 3 + Math.random() * 2, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// 4. Fresh Curd Texture (Creamy white with roasted cumin powder sprinkle)
export function createCurdTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Smooth silky white curd
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);

  const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Roasted jeera powder sprinkled in center
  for (let i = 0; i < 180; i++) {
    const dist = Math.random() * 160;
    const angle = Math.random() * Math.PI * 2;
    const px = 256 + Math.cos(angle) * dist;
    const py = 256 + Math.sin(angle) * dist;
    ctx.fillStyle = Math.random() > 0.4 ? '#78350f' : '#b45309';
    ctx.globalAlpha = 0.6 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.arc(px, py, 1 + Math.random() * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// 5. Fresh Cucumber Slice Texture
export function createCucumberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Outer dark green skin
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  // Pale green crisp flesh
  ctx.fillStyle = '#dcfce7';
  ctx.beginPath();
  ctx.arc(128, 128, 108, 0, Math.PI * 2);
  ctx.fill();

  // Translucent seed core
  ctx.fillStyle = '#bbf7d0';
  ctx.beginPath();
  ctx.arc(128, 128, 55, 0, Math.PI * 2);
  ctx.fill();

  // Seeds
  ctx.fillStyle = '#86efac';
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const sx = 128 + Math.cos(angle) * 32;
    const sy = 128 + Math.sin(angle) * 32;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 8, 3, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// 6. Juicy Tomato Slice Texture
export function createTomatoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Outer ripe red skin
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  // Juicy red meat
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.fill();

  // 3-4 seed chambers (locules) with yellow seeds and gelatinous pulp
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI * 2) / 4;
    const cx = 128 + Math.cos(angle) * 50;
    const cy = 128 + Math.sin(angle) * 50;
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 28, 16, angle, 0, Math.PI * 2);
    ctx.fill();

    // Seeds
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 2, 3, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy + 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// 7. Burger Bun Sesame Seed Texture
export function createBurgerBunTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Golden toasted brioche bun
  const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.8, '#d97706');
  grad.addColorStop(1, '#b45309');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // White sesame seeds on top
  ctx.fillStyle = '#fef3c7';
  for (let i = 0; i < 120; i++) {
    const sx = 80 + Math.random() * 352;
    const sy = 80 + Math.random() * 352;
    const angle = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 5, 2.5, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// 8. Cola Can Texture
export function createColaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Bright red soda can
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 0, 512, 256);

  // White dynamic swoosh
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(40, 180);
  ctx.bezierCurveTo(160, 40, 320, 220, 480, 80);
  ctx.stroke();

  // Bold label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FIZZY COLA', 256, 120);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('HIGH SUGAR • 39g • JAYESH’S JUNK FOOD', 256, 155);

  return new THREE.CanvasTexture(canvas);
}

// 9. Tongue Dorsum Oral Mucosa Texture (Anatomical Papillae micro-relief)
export function createTongueMucosaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Natural healthy oral mucosa base
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle midline groove (Median Sulcus)
  const sulcus = ctx.createLinearGradient(230, 0, 282, 0);
  sulcus.addColorStop(0, 'transparent');
  sulcus.addColorStop(0.5, 'rgba(136, 19, 55, 0.6)');
  sulcus.addColorStop(1, 'transparent');
  ctx.fillStyle = sulcus;
  ctx.fillRect(230, 0, 52, 512);

  // Thousands of micro papillae dots
  ctx.fillStyle = '#fecdd3';
  for (let i = 0; i < 900; i++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    ctx.globalAlpha = 0.2 + Math.random() * 0.35;
    ctx.beginPath();
    ctx.arc(px, py, 1 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red fungiform papillae
  ctx.fillStyle = '#be123c';
  for (let i = 0; i < 180; i++) {
    const fx = Math.random() * 512;
    const fy = Math.random() * 512;
    ctx.globalAlpha = 0.5 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
