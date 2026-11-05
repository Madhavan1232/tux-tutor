import sharp from 'sharp';

const inputPath = 'C:/Users/madha/.gemini/antigravity/brain/dea80e89-7067-4557-bfd1-8223da496ed5/.user_uploaded/media_1793801944075_ab9fe750.jpg';

const img = sharp(inputPath);
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// Step 1: Flood fill from borders to identify outer background
// Any pixel reached from the border where brightness <= threshold is definitely background.
// But we want to preserve the red glow.
// Let's find the peak of the red contour enclosing Tux.

// Let's create an alpha mask of size width * height, initialized to 255 (opaque)
const alpha = new Uint8Array(width * height);
alpha.fill(255);

// Flood fill from borders with a very low threshold (e.g. max(R,G,B) <= 8)
// These pixels are pure black background.
const isPureBackground = new Uint8Array(width * height);
const queue = [];

for (let x = 0; x < width; x++) {
  queue.push(x, 0);
  queue.push(x, height - 1);
  isPureBackground[x] = 1;
  isPureBackground[(height - 1) * width + x] = 1;
}
for (let y = 0; y < height; y++) {
  queue.push(0, y);
  queue.push(width - 1, y);
  isPureBackground[y * width] = 1;
  isPureBackground[y * width + width - 1] = 1;
}

let head = 0;
// Threshold for pure background
const BLACK_THRESH = 8;
while (head < queue.length) {
  const x = queue[head++];
  const y = queue[head++];

  const neighbors = [
    [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
  ];

  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const nIdx = ny * width + nx;
      if (!isPureBackground[nIdx]) {
        const pIdx = nIdx * channels;
        const val = Math.max(data[pIdx], data[pIdx + 1], data[pIdx + 2]);
        if (val <= BLACK_THRESH) {
          isPureBackground[nIdx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }
}

// Now, any pixel marked as pure background has alpha = 0
for (let i = 0; i < width * height; i++) {
  if (isPureBackground[i]) {
    alpha[i] = 0;
  }
}

// Now let's handle the outer red glow:
// Between pure background and the solid red contour peak, the pixels are glow pixels.
// Let's do another flood fill from pure background into pixels that are NOT inside Tux.
// What pixels are glow pixels?
// They are connected to pure background and have R > G + 10 (red hue) or low brightness.
// Let's check how thick the glow is and what values it has.
console.log('Pure background pixels count:', isPureBackground.filter(v => v === 1).length);

