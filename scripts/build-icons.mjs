/**
 * Every raster icon, drawn from the same geometry the app draws.
 *
 *   node scripts/build-icons.mjs
 *
 * ## Why this exists rather than a one-line `sharp` command
 *
 * **It adds no dependency.** `package.json` is not to be touched, and an
 * `npx sharp-cli` invocation is a network fetch of a native binary that has to
 * succeed on whatever machine runs it. Node ships `zlib`, which is the only
 * hard part of writing a PNG, and an ICO is a header followed by bitmaps. So
 * this is a hundred lines of arithmetic instead of a supply chain.
 *
 * **It is reproducible.** The icons were "a placeholder sun mark generated
 * programmatically" with no generator in the repo, so nobody could regenerate
 * them and they drifted from the design system the moment it changed. Running
 * this file is now the whole procedure.
 *
 * ## The geometry is `components/marks/marks.tsx`, copied deliberately
 *
 * `RAY` and the centre circle below are the same numbers `SunMark` draws, in
 * the same -40..40 space. **Copied rather than imported**, because importing a
 * `.tsx` module into a plain Node script means a build step, and a build step
 * is the thing this file exists to avoid. The cost is that changing `SunMark`
 * means changing this too, which is what the check at the bottom is for.
 *
 * ## The colours are copies as well, and the reason is the same one the SVGs give
 *
 * No cascade reaches a file on disk. `#34485f` is `--ds-blue-fantastic`, the
 * `.ds-navbar` surface; `#ffb162` is `--ds-burning-flame`.
 */
import { deflateSync } from "node:zlib"
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

const BG = [0x34, 0x48, 0x5f, 0xff]
const FLAME = [0xff, 0xb1, 0x62, 0xff]
const WHITE = [0xff, 0xff, 0xff, 0xff]
const CLEAR = [0, 0, 0, 0]

/* ---------------------------------------------------------------- geometry */

/** `SunMark`'s ray, flattened from its two cubics into a polygon. */
const RAY_CUBICS = [
  [
    [0, -6],
    [3, -14],
    [4, -24],
    [0, -34],
  ],
  [
    [0, -34],
    [-4, -24],
    [-3, -14],
    [0, -6],
  ],
]

/**
 * 24 segments a curve. **Not a guess**: at the largest size here the ray is
 * about 130px long, so a segment is ~5px, and the supersampler below smooths
 * what is left. Going finer costs time and changes no pixel.
 */
const FLATTEN = 24

const cubic = ([p0, p1, p2, p3], t) => {
  const u = 1 - t
  const b0 = u * u * u
  const b1 = 3 * u * u * t
  const b2 = 3 * u * t * t
  const b3 = t * t * t
  return [
    b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0],
    b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1],
  ]
}

const RAY_POLY = RAY_CUBICS.flatMap((curve, i) =>
  Array.from({ length: FLATTEN }, (_, s) =>
    cubic(curve, (s + (i ? 1 : 0)) / FLATTEN),
  ),
)

/** Eight of them, pre-rotated, so the hot loop does no trigonometry. */
const RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return RAY_POLY.map(([x, y]) => [x * cos - y * sin, x * sin + y * cos])
})

/** Crossing number. The petal is simple and convex-ish, so this is exact. */
function inPolygon(poly, x, y) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

/**
 * The colour at one point in mark space, in `SunMark`'s own paint order:
 * rays, then the centre's fill, then its stroke on top.
 *
 * `hollow` is the badge: Android masks a badge by its alpha and tints the
 * result, so anything painted is opaque and the centre has to be a real hole
 * rather than a disc of background.
 */
function sample(x, y, { bg, fg, hollow }) {
  let colour = bg
  if (RAYS.some((poly) => inPolygon(poly, x, y))) colour = fg

  const r = Math.hypot(x, y)
  if (r <= 5.5) colour = hollow ? CLEAR : bg
  if (Math.abs(r - 5.5) <= 1) colour = fg

  return colour
}

/**
 * `size`×`size` RGBA, 4×4 supersampled.
 *
 * `span` is the fraction of the canvas the mark's 80-unit box fills. It is
 * larger on a favicon than on a home-screen icon on purpose: at 16px the rays
 * are barely a pixel wide, and the mark has to claim more of the square or it
 * reads as a dot.
 */
function render(size, span, palette) {
  const px = Buffer.alloc(size * size * 4)
  const unitsPerPixel = 80 / (size * span)
  const centre = size / 2
  const SS = 4

  for (let py = 0; py < size; py++) {
    for (let pxi = 0; pxi < size; pxi++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const mx = (pxi + (sx + 0.5) / SS - centre) * unitsPerPixel
          const my = (py + (sy + 0.5) / SS - centre) * unitsPerPixel
          const c = sample(mx, my, palette)
          // Premultiplied, so a transparent sample cannot tint its neighbours.
          const alpha = c[3] / 255
          r += c[0] * alpha
          g += c[1] * alpha
          b += c[2] * alpha
          a += c[3]
        }
      }

      /**
       * **Un-premultiply against the alpha *sum*, not the alpha average.**
       *
       * `r`, `g`, `b` and `a` are all sums over `SS * SS` samples, so the
       * averaging cancels: `(r / n) / ((a / 255) / n)` is just `r * 255 / a`.
       * The first version divided by the average anyway and left an extra
       * factor of `n`, which `Buffer` then truncated to eight bits — so
       * #34485f came out #4080F0 and #ffb162 came out #F01020, a baby-blue
       * square with a red sun. Every channel was 16× too large and wrapped.
       *
       * Clamped as well: rounding at the boundary can land on 256, and a
       * silent wrap is what made the first mistake render as plausible colours
       * instead of as garbage.
       */
      const n = SS * SS
      const i = (py * size + pxi) * 4
      const k = a > 0 ? 255 / a : 0
      const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)))
      px[i] = clamp(r * k)
      px[i + 1] = clamp(g * k)
      px[i + 2] = clamp(b * k)
      px[i + 3] = clamp(a / n)
    }
  }
  return px
}

/* -------------------------------------------------------------------- PNG */

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

const crc32 = (buf) => {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // truecolour with alpha
  // 10..12 are compression, filter and interlace methods: 0, 0, 0.

  // Filter byte 0 (None) per scanline. The art is smooth gradients of two
  // colours; Paeth would save a little and cost the clarity of this line.
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

/* -------------------------------------------------------------------- ICO */

/**
 * **BMP inside ICO, not PNG inside ICO.**
 *
 * Both are legal and PNG-in-ICO is smaller, but it is only understood from
 * Vista onward and the entire reason to ship a `.ico` at all is the browsers
 * that will not read `icon.svg`. Shipping a fallback that needs a modern
 * decoder defeats the fallback. These are a few kilobytes either way.
 *
 * The height in the header is doubled because the format expects a colour mask
 * followed by an AND mask. The AND mask is redundant for 32-bit images, whose
 * alpha channel already says it, but it must be present and padded to a
 * four-byte row stride, so it is written as zeroes.
 */
function ico(images) {
  const entries = []
  const bodies = []
  let offset = 6 + images.length * 16

  for (const { size, rgba } of images) {
    const header = Buffer.alloc(40)
    header.writeUInt32LE(40, 0)
    header.writeInt32LE(size, 4)
    header.writeInt32LE(size * 2, 8)
    header.writeUInt16LE(1, 12) // planes
    header.writeUInt16LE(32, 14) // bits per pixel

    const xor = Buffer.alloc(size * size * 4)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const src = ((size - 1 - y) * size + x) * 4 // BMP rows run bottom-up
        const dst = (y * size + x) * 4
        xor[dst] = rgba[src + 2] // B
        xor[dst + 1] = rgba[src + 1] // G
        xor[dst + 2] = rgba[src] // R
        xor[dst + 3] = rgba[src + 3] // A
      }
    }

    const andStride = Math.ceil(size / 32) * 4
    const and = Buffer.alloc(andStride * size)
    const body = Buffer.concat([header, xor, and])

    const entry = Buffer.alloc(16)
    entry[0] = size === 256 ? 0 : size
    entry[1] = size === 256 ? 0 : size
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(body.length, 8)
    entry.writeUInt32LE(offset, 12)

    entries.push(entry)
    bodies.push(body)
    offset += body.length
  }

  const dir = Buffer.alloc(6)
  dir.writeUInt16LE(0, 0)
  dir.writeUInt16LE(1, 2) // 1 = icon
  dir.writeUInt16LE(images.length, 4)

  return Buffer.concat([dir, ...entries, ...bodies])
}

/* ------------------------------------------------------------------ output */

const SUN = { bg: BG, fg: FLAME, hollow: false }
const BADGE = { bg: CLEAR, fg: WHITE, hollow: true }

const write = (rel, buf) => {
  const path = join(ROOT, rel)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, buf)
  console.log(`  ${rel}  ${(buf.length / 1024).toFixed(1)}kB`)
}

/**
 * **Two pixels, checked before anything is written.**
 *
 * The first run of this script produced a baby-blue square with a red sun and
 * looked, at a glance, like a deliberate icon. That is the failure worth
 * guarding: an arithmetic slip in the compositor does not crash, it just
 * renders wrong, and wrong-but-plausible survives a look and reaches a browser
 * tab.
 *
 * A corner is outside the mark entirely and must be exactly the background. A
 * point 20 units up the vertical ray is inside it and must be exactly the
 * flame. Both are fully opaque and away from any edge, so antialiasing cannot
 * blur them and an exact comparison is fair.
 */
function selfCheck() {
  const size = 64
  const span = 0.62
  const rgba = render(size, span, SUN)
  const at = (x, y) => [...rgba.subarray((y * size + x) * 4, (y * size + x) * 4 + 4)]

  const corner = at(1, 1)
  if (corner.join() !== BG.join()) {
    throw new Error(
      `corner is ${corner.join()}, expected the background ${BG.join()}. ` +
        `The compositor is wrong; do not trust the output.`,
    )
  }

  // Mark space (0, -20) back into pixels: the ray at two-thirds of its length.
  const unitsPerPixel = 80 / (size * span)
  const onRay = at(size / 2, Math.round(size / 2 - 20 / unitsPerPixel))
  if (onRay.join() !== FLAME.join()) {
    throw new Error(
      `a point on a ray is ${onRay.join()}, expected the flame ${FLAME.join()}. ` +
        `The compositor is wrong; do not trust the output.`,
    )
  }
}

selfCheck()
console.log("icons")

for (const [rel, size] of [
  ["public/icons/icon-192.png", 192],
  ["public/icons/icon-512.png", 512],
  ["app/apple-icon.png", 180],
]) {
  write(rel, png(size, render(size, 0.62, SUN)))
}

// 0.5, not 0.62: Android guarantees only the centre 80% of a maskable icon
// survives its crop, and a teardrop takes a bite out of one corner on top.
write("public/icons/icon-512-maskable.png", png(512, render(512, 0.5, SUN)))

write("public/icons/badge-72.png", png(72, render(72, 0.62, BADGE)))

// 0.78 rather than 0.62, and three sizes in one file. At 16px the rays are
// barely a pixel across, so the mark has to fill more of the square to read as
// anything at all.
write(
  "app/favicon.ico",
  ico([16, 32, 48].map((size) => ({ size, rgba: render(size, 0.78, SUN) }))),
)

console.log(
  "\nGeometry is copied from components/marks/marks.tsx (RAY, the 8 rotations,\n" +
    "and the r=5.5 centre). Colours are --ds-blue-fantastic and\n" +
    "--ds-burning-flame. Change either there and re-run this.\n",
)
