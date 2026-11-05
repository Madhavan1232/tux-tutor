import sharp from 'sharp';

const inputPath = 'C:/Users/madha/.gemini/antigravity/brain/dea80e89-7067-4557-bfd1-8223da496ed5/.user_uploaded/media_1793801944075_ab9fe750.jpg';

const img = sharp(inputPath);
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// Let's test a flood fill from (0,0) where background is black.
// For the neon glow: if we want to remove the black background while preserving the red glow,
// we can compute alpha based on distance or color.
// First, let's check what a flood fill from border with threshold=15 reaches:
const visited = new Uint8Array(width * height);
const queue = [];

for (let x = 0; x < width; x++) {
  queue.push(x, 0);
  queue.push(x, height - 1);
  visited[x] = 1;
  visited[(height - 1) * width + x] = 1;
}
for (let y = 0; y < height; y++) {
  queue.push(0, y);
  queue.push(width - 1, y);
  visited[y * width] = 1;
  visited[y * width + width - 1] = 1;
}

// Let's test threshold = 20
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
      if (!visited[nIdx]) {
        const pIdx = nIdx * channels;
        const val = Math.max(data[pIdx], data[pIdx + 1], data[pIdx + 2]);
        if (val <= 20) {
          visited[nIdx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }
}

console.log('Total visited pixels (background):', queue.length / 2);
console.log('Center (512, 512) visited?:', visited[512 * width + 512]);
console.log('Head center (512, 200) visited?:', visited[200 * width + 512]);

