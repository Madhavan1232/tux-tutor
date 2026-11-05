import sharp from 'sharp';

const inputPath = 'C:/Users/madha/.gemini/antigravity/brain/dea80e89-7067-4557-bfd1-8223da496ed5/.user_uploaded/media_1793801944075_ab9fe750.jpg';

const img = sharp(inputPath);
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (const thresh of [5, 10, 15, 20, 25]) {
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const val = Math.max(data[idx], data[idx + 1], data[idx + 2]);
      if (val > thresh) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`Thresh ${thresh}: X: [${minX}, ${maxX}] (${maxX - minX + 1}), Y: [${minY}, ${maxY}] (${maxY - minY + 1})`);
}

