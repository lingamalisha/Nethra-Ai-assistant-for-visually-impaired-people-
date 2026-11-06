import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer: height rows, each with 1 filter byte (0) + width * 4 bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crc]);
}

// CRC32 implementation for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Icon drawing function: deep slate background, golden eye & concentric wave rings
function drawAssistantIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Rounded squircle border
  const cornerR = w * 0.18;
  const innerX = Math.max(0, Math.abs(dx) - (w / 2 - cornerR));
  const innerY = Math.max(0, Math.abs(dy) - (h / 2 - cornerR));
  const squircleDist = Math.sqrt(innerX * innerX + innerY * innerY);
  if (squircleDist > cornerR) {
    return [0, 0, 0, 0]; // Transparent outside squircle
  }

  // Base background: #0A0A0C
  let r = 10, g = 10, b = 12, a = 255;

  // Thin gold squircle border line
  if (squircleDist >= cornerR - 3 && squircleDist <= cornerR) {
    return [250, 204, 21, 180];
  }

  // Outer sonic wave ring (dist around 0.35 * w)
  const ring1 = Math.abs(dist - w * 0.35);
  if (ring1 < w * 0.035 && Math.abs(dx) > w * 0.15) {
    return [250, 204, 21, 230];
  }

  // Inner sonic wave ring (dist around 0.26 * w)
  const ring2 = Math.abs(dist - w * 0.26);
  if (ring2 < w * 0.025 && Math.abs(dx) > w * 0.12) {
    return [255, 255, 255, 220];
  }

  // Center Eye / Aperture
  // Elliptical eye contour: (dx / (w * 0.22))^2 + (dy / (h * 0.12))^2 ~ 1
  const eyeMetric = (dx / (w * 0.25)) ** 2 + (dy / (h * 0.14)) ** 2;
  if (eyeMetric <= 1.25 && eyeMetric >= 0.8) {
    return [250, 204, 21, 255]; // Yellow gold eye contour
  }

  // Center Pupil
  if (dist < w * 0.09) {
    if (dist < w * 0.04) {
      // Highlight dot
      if (Math.abs(dx - w * 0.015) < w * 0.012 && Math.abs(dy + h * 0.015) < h * 0.012) {
        return [255, 255, 255, 255];
      }
      return [10, 10, 12, 255]; // dark center
    }
    return [250, 204, 21, 255]; // gold iris
  }

  return [r, g, b, a];
}

const pwa192 = createPNG(192, 192, drawAssistantIcon);
fs.writeFileSync('public/pwa-192x192.png', pwa192);

const pwa512 = createPNG(512, 512, drawAssistantIcon);
fs.writeFileSync('public/pwa-512x512.png', pwa512);

const pwaMaskable512 = createPNG(512, 512, (x, y, w, h) => {
  // Maskable icon uses solid background
  const [r, g, b, a] = drawAssistantIcon(x, y, w, h);
  if (a === 0) return [10, 10, 12, 255];
  return [r, g, b, a];
});
fs.writeFileSync('public/pwa-maskable-512x512.png', pwaMaskable512);

const appleTouch = createPNG(180, 180, drawAssistantIcon);
fs.writeFileSync('public/apple-touch-icon.png', appleTouch);

console.log('Generated PNG icons successfully.');
