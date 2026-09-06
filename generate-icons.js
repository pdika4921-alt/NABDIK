const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(size, r, g, b) {
  const width = size, height = size;

  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const t = Buffer.from(type);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crcBuf]);
  }

  const raw = [];
  for (let y = 0; y < height; y++) {
    raw.push(0); // filter none
    for (let x = 0; x < width; x++) {
      const cx = width / 2, cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxR = width * 0.42;
      const cornerDist = Math.max(Math.abs(x - cx), Math.abs(y - cy));

      // Rounded square shape
      if (cornerDist < maxR || (cornerDist < maxR * 1.1 && dist < maxR * 1.15)) {
        const f = 1 - (dist / maxR) * 0.2;
        raw.push(Math.min(255, Math.floor(r * f)));
        raw.push(Math.min(255, Math.floor(g * f)));
        raw.push(Math.min(255, Math.floor(b * f)));
      } else {
        raw.push(15); raw.push(15); raw.push(19); // bg color #0f0f13
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2;

  const compressed = zlib.deflateSync(Buffer.from(raw));

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const dir = path.join(__dirname, 'public', 'icons');
fs.writeFileSync(path.join(dir, 'icon-192.png'), createPNG(192, 167, 139, 250));
fs.writeFileSync(path.join(dir, 'icon-512.png'), createPNG(512, 167, 139, 250));
console.log('Icons regenerated!');
