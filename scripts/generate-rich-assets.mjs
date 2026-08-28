import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

// Helper to draw a pixel on PNG buffer
function setPixelPNG(png, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

// Helper to draw filled rectangle on PNG
function drawRectPNG(png, x, y, width, height, r, g, b, a = 255) {
  for (let i = y; i < y + height; i++) {
    for (let j = x; j < x + width; j++) {
      setPixelPNG(png, j, i, r, g, b, a);
    }
  }
}

// Helper to draw line on PNG
function drawLinePNG(png, x0, y0, x1, y1, r, g, b, a = 255) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0;
  let cy = y0;

  while (true) {
    setPixelPNG(png, cx, cy, r, g, b, a);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
}

// Helper for JPEG buffer
function setPixelJPEG(imgData, width, height, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (width * y + x) * 4;
  imgData.data[idx] = r;
  imgData.data[idx + 1] = g;
  imgData.data[idx + 2] = b;
  imgData.data[idx + 3] = a;
}

function drawRectJPEG(imgData, width, height, x, y, w, h, r, g, b, a = 255) {
  for (let i = y; i < y + h; i++) {
    for (let j = x; j < x + w; j++) {
      setPixelJPEG(imgData, width, height, j, i, r, g, b, a);
    }
  }
}

// 1. Generate screenshot.png (1280x720) - Modern Olmart Dashboard
console.log('Generating screenshot.png (1280x720)...');
const screenshot = new PNG({ width: 1280, height: 720 });
// Background: Soft grey/white canvas (#f8fafc)
drawRectPNG(screenshot, 0, 0, 1280, 720, 248, 250, 252);

// Header bar (#0d5c3a - Olmart Emerald)
drawRectPNG(screenshot, 0, 0, 1280, 60, 13, 92, 58);
// Gold accent stripe (#d4af37)
drawRectPNG(screenshot, 0, 60, 1280, 4, 212, 175, 55);

// Logo block (Gold/White)
drawRectPNG(screenshot, 40, 15, 120, 30, 212, 175, 55);
// Search bar input
drawRectPNG(screenshot, 200, 15, 400, 30, 255, 255, 255);
drawRectPNG(screenshot, 610, 15, 70, 30, 212, 175, 55);

// Nav links right
drawRectPNG(screenshot, 1000, 20, 60, 20, 255, 255, 255);
drawRectPNG(screenshot, 1080, 20, 60, 20, 255, 255, 255);
drawRectPNG(screenshot, 1160, 20, 80, 20, 212, 175, 55);

// Hero banner inside dashboard (1200x200)
drawRectPNG(screenshot, 40, 90, 1200, 200, 18, 50, 38);
// Decorative pattern overlay on hero
for (let i = 0; i < 1200; i += 40) {
  drawLinePNG(screenshot, 40 + i, 90, 40 + i + 100, 290, 212, 175, 55, 80);
}
// Banner Text box & CTA
drawRectPNG(screenshot, 80, 120, 450, 40, 255, 255, 255);
drawRectPNG(screenshot, 80, 175, 300, 25, 212, 175, 55);
drawRectPNG(screenshot, 80, 220, 140, 40, 212, 175, 55);

// Category Pills Row
for (let c = 0; c < 6; c++) {
  drawRectPNG(screenshot, 40 + c * 200, 310, 180, 45, 255, 255, 255);
  drawRectPNG(screenshot, 50 + c * 200, 320, 25, 25, 13, 92, 58);
  drawRectPNG(screenshot, 85 + c * 200, 325, 100, 15, 100, 116, 139);
}

// Product Grid Title
drawRectPNG(screenshot, 40, 380, 250, 30, 15, 23, 42);

// Product Cards (4 columns x 1 row)
for (let col = 0; col < 4; col++) {
  const cx = 40 + col * 305;
  const cy = 430;
  // Card container
  drawRectPNG(screenshot, cx, cy, 285, 260, 255, 255, 255);
  // Image box
  drawRectPNG(screenshot, cx + 15, cy + 15, 255, 140, 241, 245, 249);
  // Product image mock detail
  drawRectPNG(screenshot, cx + 45, cy + 35, 195, 100, 13 + col * 40, 92 + col * 20, 150);
  // Title & Rating
  drawRectPNG(screenshot, cx + 15, cy + 168, 180, 16, 30, 41, 59);
  drawRectPNG(screenshot, cx + 15, cy + 192, 100, 14, 148, 163, 184);
  // Price (DZD) & Cart Button
  drawRectPNG(screenshot, cx + 15, cy + 218, 110, 22, 13, 92, 58);
  drawRectPNG(screenshot, cx + 220, cy + 212, 50, 32, 212, 175, 55);
}

fs.writeFileSync('screenshot.png', PNG.sync.write(screenshot));
console.log('✅ screenshot.png updated (1280x720 binary PNG)');


// 2. Generate public/marketplace.jpg (1200x630 JPEG)
console.log('Generating public/marketplace.jpg (1200x630)...');
const widthJPG = 1200;
const heightJPG = 630;
const rawJPGData = {
  data: Buffer.alloc(widthJPG * heightJPG * 4),
  width: widthJPG,
  height: heightJPG
};

// Rich Emerald Gradient Background
for (let y = 0; y < heightJPG; y++) {
  for (let x = 0; x < widthJPG; x++) {
    const factor = (x + y) / (widthJPG + heightJPG);
    const r = Math.floor(10 + factor * 20);
    const g = Math.floor(70 + factor * 60);
    const b = Math.floor(45 + factor * 40);
    setPixelJPEG(rawJPGData, widthJPG, heightJPG, x, y, r, g, b);
  }
}

// Gold Frame & Geometric Motifs
drawRectJPEG(rawJPGData, widthJPG, heightJPG, 30, 30, 1140, 10, 212, 175, 55);
drawRectJPEG(rawJPGData, widthJPG, heightJPG, 30, 590, 1140, 10, 212, 175, 55);
drawRectJPEG(rawJPGData, widthJPG, heightJPG, 30, 30, 10, 570, 212, 175, 55);
drawRectJPEG(rawJPGData, widthJPG, heightJPG, 1160, 30, 10, 570, 212, 175, 55);

// Title Box & Branding Elements
drawRectJPEG(rawJPGData, widthJPG, heightJPG, 80, 120, 600, 70, 255, 255, 255);
drawRectJPEG(rawJPGData, widthJPG, heightJPG, 80, 210, 480, 40, 212, 175, 55);
drawRectJPEG(rawJPGData, widthJPG, heightJPG, 80, 270, 350, 30, 240, 240, 240);
drawRectJPEG(rawJPGData, widthJPG, heightJPG, 80, 330, 200, 50, 212, 175, 55);

// Featured Product Cards on right
for (let p = 0; p < 3; p++) {
  const px = 720 + p * 140;
  const py = 180 + (p % 2) * 60;
  drawRectJPEG(rawJPGData, widthJPG, heightJPG, px, py, 120, 280, 255, 255, 255);
  drawRectJPEG(rawJPGData, widthJPG, heightJPG, px + 10, py + 10, 100, 120, 220, 180, 100);
  drawRectJPEG(rawJPGData, widthJPG, heightJPG, px + 10, py + 140, 80, 15, 30, 30, 30);
  drawRectJPEG(rawJPGData, widthJPG, heightJPG, px + 10, py + 165, 60, 15, 13, 92, 58);
  drawRectJPEG(rawJPGData, widthJPG, heightJPG, px + 10, py + 230, 100, 35, 212, 175, 55);
}

const jpegImageData = jpeg.encode(rawJPGData, 90);
fs.writeFileSync('public/marketplace.jpg', jpegImageData.data);
console.log('✅ public/marketplace.jpg updated (1200x630 binary JPEG)');


// 3. Generate src/assets/images/premium_algerian_marketplace_banner_1780280262615.png (1200x630)
console.log('Generating premium_algerian_marketplace_banner (1200x630)...');
const premBanner = new PNG({ width: 1200, height: 630 });

// Dark Emerald Luxury Canvas
drawRectPNG(premBanner, 0, 0, 1200, 630, 8, 42, 28);

// Arabesque Tile Grid Overlay
for (let y = 0; y < 630; y += 60) {
  for (let x = 0; x < 1200; x += 60) {
    drawLinePNG(premBanner, x, y, x + 60, y + 60, 212, 175, 55, 40);
    drawLinePNG(premBanner, x + 60, y, x, y + 60, 212, 175, 55, 40);
  }
}

// Golden Header Banner Badge
drawRectPNG(premBanner, 60, 60, 400, 50, 212, 175, 55);
drawRectPNG(premBanner, 60, 130, 700, 80, 255, 255, 255);
drawRectPNG(premBanner, 60, 230, 550, 40, 200, 225, 215);

// Featured Categories Badges
const cats = ['Artisanat', 'Dattes & Produits Bio', 'High-Tech', 'Mode & Cuir'];
for (let i = 0; i < cats.length; i++) {
  drawRectPNG(premBanner, 60 + i * 190, 300, 170, 50, 18, 80, 50);
  drawRectPNG(premBanner, 70 + i * 190, 310, 150, 30, 212, 175, 55);
}

// CTA Button
drawRectPNG(premBanner, 60, 400, 250, 60, 212, 175, 55);
drawRectPNG(premBanner, 75, 415, 220, 30, 8, 42, 28);

// Right Side Visual Composition (Pottery / Craft Showcase)
drawRectPNG(premBanner, 820, 100, 320, 430, 255, 255, 255);
drawRectPNG(premBanner, 840, 120, 280, 240, 212, 175, 55);
drawRectPNG(premBanner, 840, 380, 200, 25, 30, 40, 50);
drawRectPNG(premBanner, 840, 420, 140, 30, 13, 92, 58);

const premPath = 'src/assets/images/premium_algerian_marketplace_banner_1780280262615.png';
fs.mkdirSync(path.dirname(premPath), { recursive: true });
fs.writeFileSync(premPath, PNG.sync.write(premBanner));
console.log(`✅ ${premPath} updated (1200x630 binary PNG)`);


// 4. Generate public/images/textures/arabesque.png (512x512 Seamless Geometric Texture)
console.log('Generating public/images/textures/arabesque.png (512x512)...');
const arabesque = new PNG({ width: 512, height: 512 });
// Background: Soft cream (#faf8f5)
drawRectPNG(arabesque, 0, 0, 512, 512, 250, 248, 245);

// Draw tileable geometric stars & diamonds in gold line art
const tileSize = 64;
for (let y = 0; y < 512; y += tileSize) {
  for (let x = 0; x < 512; x += tileSize) {
    const cx = x + tileSize / 2;
    const cy = y + tileSize / 2;
    // Diamond
    drawLinePNG(arabesque, cx, y, x + tileSize, cy, 212, 175, 55, 120);
    drawLinePNG(arabesque, x + tileSize, cy, cx, y + tileSize, 212, 175, 55, 120);
    drawLinePNG(arabesque, cx, y + tileSize, x, cy, 212, 175, 55, 120);
    drawLinePNG(arabesque, x, cy, cx, y, 212, 175, 55, 120);

    // Inner Square
    drawLinePNG(arabesque, x + 16, y + 16, x + 48, y + 16, 180, 140, 40, 100);
    drawLinePNG(arabesque, x + 48, y + 16, x + 48, y + 48, 180, 140, 40, 100);
    drawLinePNG(arabesque, x + 48, y + 48, x + 16, y + 48, 180, 140, 40, 100);
    drawLinePNG(arabesque, x + 16, y + 48, x + 16, y + 16, 180, 140, 40, 100);
  }
}

fs.mkdirSync('public/images/textures', { recursive: true });
fs.writeFileSync('public/images/textures/arabesque.png', PNG.sync.write(arabesque));
console.log('✅ public/images/textures/arabesque.png updated (512x512 binary PNG)');


// 5. Generate public/images/textures/clean-textile.png (512x512 Linen Texture)
console.log('Generating public/images/textures/clean-textile.png (512x512)...');
const textile = new PNG({ width: 512, height: 512 });

// Soft natural linen weave (#f5f5f0)
for (let y = 0; y < 512; y++) {
  for (let x = 0; x < 512; x++) {
    const isWarp = (x % 4 < 2);
    const isWeft = (y % 4 < 2);
    let val = 245;
    if (isWarp && isWeft) val = 252;
    else if (!isWarp && !isWeft) val = 238;
    else val = 246;

    setPixelPNG(textile, x, y, val, val - 2, val - 5, 255);
  }
}

fs.writeFileSync('public/images/textures/clean-textile.png', PNG.sync.write(textile));
console.log('✅ public/images/textures/clean-textile.png updated (512x512 binary PNG)');


// 6. Generate public/images/textures/moroccan-flower.png (512x512 Floral Zellige Tile)
console.log('Generating public/images/textures/moroccan-flower.png (512x512)...');
const flower = new PNG({ width: 512, height: 512 });

// Soft terracotta/warm background (#fbf7f0)
drawRectPNG(flower, 0, 0, 512, 512, 251, 247, 240);

// Tile grid of 128x128 floral Zellige motifs
const zSize = 128;
for (let y = 0; y < 512; y += zSize) {
  for (let x = 0; x < 512; x += zSize) {
    const cx = x + zSize / 2;
    const cy = y + zSize / 2;

    // Petal lines radiating from center
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = (angle * Math.PI) / 180;
      const px = Math.round(cx + Math.cos(rad) * 45);
      const py = Math.round(cy + Math.sin(rad) * 45);
      drawLinePNG(flower, cx, cy, px, py, 13, 92, 58, 160); // Emerald
    }

    // Outer tile boundary
    drawLinePNG(flower, x, y, x + zSize, y, 212, 175, 55, 140);
    drawLinePNG(flower, x + zSize, y, x + zSize, y + zSize, 212, 175, 55, 140);
    drawLinePNG(flower, x + zSize, y + zSize, x, y + zSize, 212, 175, 55, 140);
    drawLinePNG(flower, x, y + zSize, x, y, 212, 175, 55, 140);

    // Center gold dot
    drawRectPNG(flower, cx - 6, cy - 6, 12, 12, 212, 175, 55);
  }
}

fs.writeFileSync('public/images/textures/moroccan-flower.png', PNG.sync.write(flower));
console.log('✅ public/images/textures/moroccan-flower.png updated (512x512 binary PNG)');

console.log('\n🎉 ALL 6 RICH VISUAL IMAGE ASSETS SUCCESSFULLY GENERATED!');
