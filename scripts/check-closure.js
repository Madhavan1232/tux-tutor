import sharp from 'sharp';

const inputPath = 'C:/Users/madha/.gemini/antigravity/brain/dea80e89-7067-4557-bfd1-8223da496ed5/.user_uploaded/media_1793801944075_ab9fe750.jpg';

const img = sharp(inputPath);
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (const peakThresh of [150, 160, 170, 180, 190, 200]) {
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
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];
          // We can cross as long as it's not a strong red contour pixel:
          // A contour pixel has r >= peakThresh and r > g + 50 and r > b + 50
          const isContour = r >= peakThresh && r > g + 40 && r > b + 40;
          if (!isContour) {
            visited[nIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  const reachedHead = visited[200 * width + 512];
  const reachedBelly = visited[512 * width + 512];
  console.log(`PeakThresh ${peakThresh}: Reached head? ${reachedHead}, Reached belly? ${reachedBelly}`);
}

