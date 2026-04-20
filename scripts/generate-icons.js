// PWAアイコン生成スクリプト（依存パッケージ不要）
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

// CRC32テーブル
const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
  crcTable[i] = c
}
function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF]
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const t = Buffer.from(type)
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  t.copy(out, 4)
  data.copy(out, 8)
  out.writeUInt32BE(crc32(Buffer.concat([t, data])), 8 + data.length)
  return out
}

function makePNG(size) {
  const pixels = []
  for (let y = 0; y < size; y++) {
    pixels.push(0) // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = getPixel(x, y, size)
      pixels.push(r, g, b)
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2 // bit depth 8, RGB

  const compressed = zlib.deflateSync(Buffer.from(pixels), { level: 9 })

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function lerp(a, b, t) { return Math.round(a + (b - a) * Math.max(0, Math.min(1, t))) }

function getPixel(x, y, s) {
  const cx = s / 2, cy = s / 2

  // 背景グラデーション: 左上 #1E3A8A → 右下 #3B82F6
  const t = ((x / s) + (y / s)) / 2
  const bgR = lerp(30, 59, t)
  const bgG = lerp(58, 130, t)
  const bgB = lerp(138, 246, t)

  // カード矩形の定義
  const pad = s * 0.13
  const cl = pad, cr = s - pad
  const ct = s * 0.28, cb = s * 0.72
  const rad = s * 0.06

  // 角丸チェック（4隅）
  function inRoundRect(px, py) {
    if (px < cl || px > cr || py < ct || py > cb) return false
    const corners = [
      [cl + rad, ct + rad], [cr - rad, ct + rad],
      [cl + rad, cb - rad], [cr - rad, cb - rad],
    ]
    for (const [cx2, cy2] of corners) {
      if (px < cx2 && py < cy2 && Math.hypot(px - cx2, py - cy2) > rad) {
        if (px < cx2 - rad || py < cy2 - rad) return false
        const dx = px - cx2, dy = py - cy2
        if (dx * dx + dy * dy > rad * rad) return false
      }
      if (px > cr - rad && py < cy2 && px > cx2 && py < cy2) {
        const dx = px - cx2, dy = py - cy2
        if (dx * dx + dy * dy > rad * rad) return false
      }
    }
    return true
  }

  const onCard = x >= cl && x <= cr && y >= ct && y <= cb &&
    !(x < cl + rad && y < ct + rad && Math.hypot(x - cl - rad, y - ct - rad) > rad) &&
    !(x > cr - rad && y < ct + rad && Math.hypot(x - cr + rad, y - ct - rad) > rad) &&
    !(x < cl + rad && y > cb - rad && Math.hypot(x - cl - rad, y - cb + rad) > rad) &&
    !(x > cr - rad && y > cb - rad && Math.hypot(x - cr + rad, y - cb + rad) > rad)

  if (!onCard) return [bgR, bgG, bgB]

  // カード内コンテンツ（白ベース）
  const lm = cl + s * 0.1  // 左マージン
  const rm = cr - s * 0.08 // 右マージン
  const lh = s * 0.06      // ライン高さ（太さ）

  // 1行目（名前ライン） - 濃いめ
  const ly1 = ct + (cb - ct) * 0.32
  if (Math.abs(y - ly1) < lh * 0.6 && x >= lm && x <= rm - s * 0.2) {
    return [37, 99, 235]
  }
  // 細線1
  const ly2 = ct + (cb - ct) * 0.55
  if (Math.abs(y - ly2) < lh * 0.35 && x >= lm && x <= rm - s * 0.35) {
    return [147, 197, 253]
  }
  // 細線2
  const ly3 = ct + (cb - ct) * 0.7
  if (Math.abs(y - ly3) < lh * 0.35 && x >= lm && x <= rm - s * 0.45) {
    return [147, 197, 253]
  }

  // 左端の小丸（アバター風）
  const circX = lm + s * 0.075, circY = ct + (cb - ct) * 0.18, circR = s * 0.065
  if (Math.hypot(x - circX, y - circY) < circR) {
    return [96, 165, 250]
  }

  return [255, 255, 255]
}

const outDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(outDir, { recursive: true })

for (const size of [192, 512]) {
  const buf = makePNG(size)
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), buf)
  console.log(`✓ icon-${size}.png (${buf.length} bytes)`)
}
console.log('アイコン生成完了')
