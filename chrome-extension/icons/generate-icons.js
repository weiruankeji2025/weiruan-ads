/**
 * 威软去广告 - 图标生成脚本
 * 威软科技制作
 *
 * 运行方法: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// 创建简单的PNG图标 (纯色背景 + 文字)
// 使用最简单的PNG格式

function createPNG(size) {
    // PNG文件头
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

    // 创建简单的彩色图标数据
    const pixels = [];
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 圆形渐变背景
            if (distance <= radius) {
                // 紫色渐变 (#667eea to #764ba2)
                const t = (x + y) / (size * 2);
                const r = Math.floor(102 + t * 16);  // 102 -> 118
                const g = Math.floor(126 - t * 51);  // 126 -> 75
                const b = Math.floor(234 - t * 72);  // 234 -> 162
                pixels.push(r, g, b, 255);
            } else {
                // 透明背景
                pixels.push(0, 0, 0, 0);
            }
        }
    }

    // 简化：创建一个有效的最小PNG
    // 使用未压缩的数据会太大，所以使用zlib压缩

    const zlib = require('zlib');

    // 添加滤波器字节 (每行开头加0)
    const rawData = Buffer.alloc(size * size * 4 + size);
    let rawIdx = 0;
    let pixelIdx = 0;
    for (let y = 0; y < size; y++) {
        rawData[rawIdx++] = 0; // Filter: None
        for (let x = 0; x < size; x++) {
            rawData[rawIdx++] = pixels[pixelIdx++];
            rawData[rawIdx++] = pixels[pixelIdx++];
            rawData[rawIdx++] = pixels[pixelIdx++];
            rawData[rawIdx++] = pixels[pixelIdx++];
        }
    }

    // 压缩数据
    const compressed = zlib.deflateSync(rawData);

    // 创建CRC32表
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        crcTable[n] = c;
    }

    function crc32(buf) {
        let crc = 0xFFFFFFFF;
        for (let i = 0; i < buf.length; i++) {
            crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    function createChunk(type, data) {
        const typeBuffer = Buffer.from(type);
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length);
        const crcData = Buffer.concat([typeBuffer, data]);
        const crcValue = crc32(crcData);
        const crcBuffer = Buffer.alloc(4);
        crcBuffer.writeUInt32BE(crcValue);
        return Buffer.concat([length, typeBuffer, data, crcBuffer]);
    }

    // IHDR chunk
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);  // Width
    ihdr.writeUInt32BE(size, 4);  // Height
    ihdr[8] = 8;   // Bit depth
    ihdr[9] = 6;   // Color type (RGBA)
    ihdr[10] = 0;  // Compression
    ihdr[11] = 0;  // Filter
    ihdr[12] = 0;  // Interlace

    const ihdrChunk = createChunk('IHDR', ihdr);
    const idatChunk = createChunk('IDAT', compressed);
    const iendChunk = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 生成各种尺寸的图标
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
    const png = createPNG(size);
    const filename = path.join(__dirname, `icon${size}.png`);
    fs.writeFileSync(filename, png);
    console.log(`Created: icon${size}.png`);
});

console.log('All icons generated successfully!');
console.log('威软科技制作');
