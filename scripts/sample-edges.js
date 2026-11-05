import sharp from 'sharp';

const inputPath = 'C:/Users/madha/.gemini/antigravity/brain/dea80e89-7067-4557-bfd1-8223da496ed5/.user_uploaded/media_1793801944075_ab9fe750.jpg';

const img = sharp(inputPath);
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, channels } = info;

// For each row around the head (e.g. y = 300) and body (e.g. y = 600),
// print pixel values across the outline from outside to inside:
console.log('Row y = 300 (left edge of head):');
for (let x = 300; x <= 360; x += 3) {
  const idx = (300 * width + x) * channels;
  console.log(`x=${x}: R=${data[idx]}, G=${data[idx+1]}, B=${data[idx+2]}`);
}

console.log('\nRow y = 600 (left edge of body/arm):');
for (let x = 160; x <= 220; x += 3) {
  const idx = (600 * width + x) * channels;
  console.log(`x=${x}: R=${data[idx]}, G=${data[idx+1]}, B=${data[idx+2]}`);
}

