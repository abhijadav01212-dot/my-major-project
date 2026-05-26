import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const outDir = path.resolve('public/visuals');
fs.mkdirSync(outDir, { recursive: true });

const width = 720;
const height = 460;
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuffer.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return out;
}

function color(hex, alpha = 255) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
    alpha
  ];
}

function mix(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function blend(buf, x, y, rgba) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (y * width + x) * 4;
  const a = rgba[3] / 255;
  buf[idx] = Math.round(rgba[0] * a + buf[idx] * (1 - a));
  buf[idx + 1] = Math.round(rgba[1] * a + buf[idx + 1] * (1 - a));
  buf[idx + 2] = Math.round(rgba[2] * a + buf[idx + 2] * (1 - a));
  buf[idx + 3] = 255;
}

function rect(buf, x, y, w, h, rgba) {
  for (let yy = Math.max(0, y); yy < Math.min(height, y + h); yy += 1) {
    for (let xx = Math.max(0, x); xx < Math.min(width, x + w); xx += 1) blend(buf, xx, yy, rgba);
  }
}

function roundRect(buf, x, y, w, h, r, rgba) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const cx = xx < x + r ? x + r : xx > x + w - r ? x + w - r : xx;
      const cy = yy < y + r ? y + r : yy > y + h - r ? y + h - r : yy;
      if ((xx - cx) ** 2 + (yy - cy) ** 2 <= r ** 2) blend(buf, xx, yy, rgba);
    }
  }
}

function circle(buf, cx, cy, r, rgba) {
  for (let y = cy - r; y <= cy + r; y += 1) {
    for (let x = cx - r; x <= cx + r; x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r ** 2) blend(buf, x, y, rgba);
    }
  }
}

function line(buf, x1, y1, x2, y2, rgba, size = 6) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    circle(buf, Math.round(x1 + (x2 - x1) * t), Math.round(y1 + (y2 - y1) * t), size, rgba);
  }
}

function base(bgA, bgB) {
  const buf = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const t = (x / width) * 0.62 + (y / height) * 0.38;
      const c = mix(bgA, bgB, t);
      const idx = (y * width + x) * 4;
      buf[idx] = c[0];
      buf[idx + 1] = c[1];
      buf[idx + 2] = c[2];
      buf[idx + 3] = 255;
    }
  }
  circle(buf, 580, 90, 150, color('#14b8a6', 58));
  circle(buf, 90, 370, 170, color('#0f766e', 36));
  roundRect(buf, 70, 70, 580, 320, 38, color('#ffffff', 178));
  roundRect(buf, 82, 82, 556, 296, 30, color('#f8ffff', 170));
  return buf;
}

function drawCar(buf) {
  roundRect(buf, 170, 245, 380, 64, 30, color('#0f172a', 235));
  roundRect(buf, 235, 195, 250, 82, 32, color('#102b31', 235));
  roundRect(buf, 270, 210, 82, 42, 16, color('#a7f3d0', 220));
  roundRect(buf, 365, 210, 80, 42, 16, color('#ccfbf1', 220));
  line(buf, 180, 290, 540, 260, color('#14b8a6', 170), 5);
  circle(buf, 240, 315, 38, color('#020617', 245));
  circle(buf, 480, 315, 38, color('#020617', 245));
  circle(buf, 240, 315, 18, color('#5eead4', 220));
  circle(buf, 480, 315, 18, color('#5eead4', 220));
}

function drawAnalytics(buf) {
  [88, 145, 205, 128, 245].forEach((h, i) => roundRect(buf, 185 + i * 68, 305 - h, 40, h, 12, color(i % 2 ? '#14b8a6' : '#0f766e', 225)));
  line(buf, 160, 250, 250, 210, color('#0f172a', 210), 7);
  line(buf, 250, 210, 340, 235, color('#0f172a', 210), 7);
  line(buf, 340, 235, 450, 150, color('#0f172a', 210), 7);
  line(buf, 450, 150, 565, 185, color('#0f172a', 210), 7);
  [160, 250, 340, 450, 565].forEach((x, i) => circle(buf, x, [250, 210, 235, 150, 185][i], 16, color('#5eead4', 240)));
}

function drawBill(buf) {
  roundRect(buf, 240, 108, 238, 250, 22, color('#ffffff', 245));
  roundRect(buf, 270, 145, 178, 22, 9, color('#14b8a6', 210));
  [192, 230, 268, 306].forEach((y, i) => roundRect(buf, 270, y, i === 3 ? 112 : 178, 15, 7, color(i === 3 ? '#0f766e' : '#cbd5e1', 205)));
  circle(buf, 500, 292, 54, color('#0f766e', 230));
  circle(buf, 500, 292, 31, color('#ccfbf1', 235));
}

function drawPerson(buf) {
  circle(buf, 360, 165, 58, color('#0f172a', 230));
  roundRect(buf, 275, 225, 170, 115, 48, color('#0f766e', 225));
  roundRect(buf, 302, 238, 116, 32, 15, color('#ccfbf1', 210));
  line(buf, 222, 278, 298, 245, color('#14b8a6', 220), 13);
  line(buf, 422, 245, 505, 300, color('#14b8a6', 220), 13);
}

function drawShield(buf) {
  roundRect(buf, 268, 120, 184, 230, 42, color('#0f172a', 235));
  roundRect(buf, 295, 150, 130, 170, 30, color('#0f766e', 230));
  line(buf, 330, 245, 355, 270, color('#ccfbf1', 245), 9);
  line(buf, 355, 270, 405, 210, color('#ccfbf1', 245), 9);
}

function drawWrench(buf) {
  line(buf, 250, 305, 455, 145, color('#0f172a', 240), 18);
  circle(buf, 466, 136, 48, color('#14b8a6', 210));
  circle(buf, 466, 136, 25, color('#f8ffff', 235));
  roundRect(buf, 215, 293, 84, 38, 18, color('#0f766e', 225));
}

function drawVisual(slug, mode) {
  const buf = base(color('#f8ffff'), color('#d9fbf4'));
  roundRect(buf, 112, 112, 496, 236, 34, color('#ffffff', 72));
  if (mode === 'car') drawCar(buf);
  if (mode === 'analytics') drawAnalytics(buf);
  if (mode === 'bill') drawBill(buf);
  if (mode === 'person') drawPerson(buf);
  if (mode === 'shield') drawShield(buf);
  if (mode === 'repair') drawWrench(buf);
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    buf.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
  fs.writeFileSync(path.join(outDir, `${slug}.png`), png);
}

const assets = {
  'luxury-car': 'car',
  'ai-analytics': 'analytics',
  'smart-billing': 'bill',
  'vehicle-service': 'car',
  'repair-status': 'repair',
  payment: 'bill',
  'staff-workflow': 'person',
  'repair-engineer': 'repair',
  'customer-support': 'person',
  'business-analytics': 'analytics',
  'revenue-management': 'analytics',
  'security-management': 'shield',
  invoice: 'bill',
  'payment-analytics': 'analytics',
  'gst-billing': 'bill'
};

for (const [slug, mode] of Object.entries(assets)) drawVisual(slug, mode);
console.log(`Generated ${Object.keys(assets).length} TorqueIQ PNG visuals in ${outDir}`);
