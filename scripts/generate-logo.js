import sharp from 'sharp';
import fs from 'fs';

const inputPath = 'C:/Users/madha/.gemini/antigravity/brain/dea80e89-7067-4557-bfd1-8223da496ed5/.user_uploaded/media_1793801944075_ab9fe750.jpg';

const img = sharp(inputPath);
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// Step 1: Identify all pixels outside the red contour peak
// Contour peak definition: r >= 180 && r > g + 50 && r > b + 50
const PEAK_R = 180;
const isContourPeak = new Uint8Array(width * height);
for (let i = 0; i < width * height; i++) {
  const p = i * channels;
  const r = data[p];
  const g = data[p + 1];
  const b = data[p + 2];
  if (r >= PEAK_R && r > g + 40 && r > b + 40) {
    isContourPeak[i] = 1;
  }
}

// Flood fill from border to find everything strictly outside the contour peak
const isOutsidePeak = new Uint8Array(width * height);
const queue = [];

for (let x = 0; x < width; x++) {
  queue.push(x, 0);
  queue.push(x, height - 1);
  isOutsidePeak[x] = 1;
  isOutsidePeak[(height - 1) * width + x] = 1;
}
for (let y = 0; y < height; y++) {
  queue.push(0, y);
  queue.push(width - 1, y);
  isOutsidePeak[y * width] = 1;
  isOutsidePeak[y * width + width - 1] = 1;
}

let head = 0;
while (head < queue.length) {
  const x = queue[head++];
  const y = queue[head++];

  const neighbors = [
    [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
  ];

  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const nIdx = ny * width + nx;
      if (!isOutsidePeak[nIdx] && !isContourPeak[nIdx]) {
        isOutsidePeak[nIdx] = 1;
        queue.push(nx, ny);
      }
    }
  }
}

// Now create the output RGBA buffer (4 channels)
const outData = Buffer.alloc(width * height * 4);

// Cutoff for outer glow fading into transparent
const CUTOFF_MIN = 12;
const CUTOFF_MAX = 180;

for (let i = 0; i < width * height; i++) {
  const srcIdx = i * channels;
  const dstIdx = i * 4;

  const r = data[srcIdx];
  const g = data[srcIdx + 1];
  const b = data[srcIdx + 2];

  if (!isOutsidePeak[i]) {
    // Inside or on the contour peak: 100% OPAQUE TUX
    outData[dstIdx] = r;
    outData[dstIdx + 1] = g;
    outData[dstIdx + 2] = b;
    outData[dstIdx + 3] = 255;
  } else {
    // Outside the contour peak: outer red glow over black background
    // Calculate glow alpha from red intensity
    if (r <= CUTOFF_MIN) {
      // Pure black background outside the glow
      outData[dstIdx] = 0;
      outData[dstIdx + 1] = 0;
      outData[dstIdx + 2] = 0;
      outData[dstIdx + 3] = 0;
    } else {
      // Smoothly scale alpha from 0 at CUTOFF_MIN to 255 at CUTOFF_MAX
      const t = Math.min(Math.max((r - CUTOFF_MIN) / (CUTOFF_MAX - CUTOFF_MIN), 0), 1);
      // Smoothstep curve for natural optical glow falloff
      const smoothAlpha = t * t * (3 - 2 * t);
      const a = Math.round(smoothAlpha * 255);

      if (a === 0) {
        outData[dstIdx] = 0;
        outData[dstIdx + 1] = 0;
        outData[dstIdx + 2] = 0;
        outData[dstIdx + 3] = 0;
      } else {
        // Unmultiply red to remove black halo when rendered on transparent/other background
        const alphaFrac = a / 255;
        // Unmultiply gently so it stays purely red
        const unmultR = Math.min(Math.round(r / Math.max(alphaFrac, 0.4)), 255);
        const unmultG = Math.min(Math.round(g / Math.max(alphaFrac, 0.4)), 255);
        const unmultB = Math.min(Math.round(b / Math.max(alphaFrac, 0.4)), 255);

        outData[dstIdx] = unmultR;
        outData[dstIdx + 1] = unmultG;
        outData[dstIdx + 2] = unmultB;
        outData[dstIdx + 3] = a;
      }
    }
  }
}

// Ensure destination directories exist
fs.mkdirSync('src/assets', { recursive: true });
fs.mkdirSync('public', { recursive: true });

// Save transparent logo.png
await sharp(outData, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile('src/assets/logo.png');

console.log('Saved src/assets/logo.png successfully!');

// Also save to public/logo.png for favicon and static access
await sharp(outData, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile('public/logo.png');

// Generate favicons at 32x32, 64x64, 192x192, 512x512
await sharp('src/assets/logo.png').resize(32, 32).png().toFile('public/favicon-32x32.png');
await sharp('src/assets/logo.png').resize(64, 64).png().toFile('public/favicon-64x64.png');
await sharp('src/assets/logo.png').resize(32, 32).toFile('public/favicon.ico');
await sharp('src/assets/logo.png').resize(180, 180).png().toFile('public/apple-touch-icon.png');

console.log('All icons generated successfully!');

