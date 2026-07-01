// Packages the built extension in `dist/` into a Chrome Web Store-ready zip.
// Dependency-free: builds the zip (deflate) by hand so `bun pack` needs no
// extra packages. Run `bun run build` first (the `pack` script does this).
import { deflateRawSync } from 'node:zlib'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const distDirectory = 'dist'

const crcTable = (() => {
  const table = new Uint32Array(256)

  for (let value = 0; value < 256; value += 1) {
    let remainder = value

    for (let bit = 0; bit < 8; bit += 1) {
      remainder =
        remainder & 1 ? 0xedb88320 ^ (remainder >>> 1) : remainder >>> 1
    }

    table[value] = remainder >>> 0
  }

  return table
})()

function crc32(buffer: Buffer): number {
  let remainder = 0xffffffff

  for (const byte of buffer) {
    remainder = crcTable[(remainder ^ byte) & 0xff] ^ (remainder >>> 8)
  }

  return (remainder ^ 0xffffffff) >>> 0
}

function walk(directory: string): string[] {
  const files: string[] = []

  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry)

    if (statSync(full).isDirectory()) {
      files.push(...walk(full))
    } else {
      files.push(full)
    }
  }

  return files
}

function dosDateTime(date: Date): { time: number; date: number } {
  const time =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    (date.getSeconds() >> 1)
  const day =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate()

  return { time, date: day }
}

interface Entry {
  name: string
  crc: number
  compressed: Buffer
  size: number
  offset: number
}

function pack(): void {
  const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as {
    version: string
  }
  const outputName = `svenska-matt-${manifest.version}.zip`
  const stamp = dosDateTime(new Date())

  const localParts: Buffer[] = []
  const entries: Entry[] = []
  let offset = 0

  for (const file of walk(distDirectory)) {
    const name = relative(distDirectory, file).split('\\').join('/')
    const contents = readFileSync(file)
    const compressed = deflateRawSync(contents)
    const crc = crc32(contents)

    const header = Buffer.alloc(30)
    header.writeUInt32LE(0x04034b50, 0)
    header.writeUInt16LE(20, 4)
    header.writeUInt16LE(0, 6)
    header.writeUInt16LE(8, 8)
    header.writeUInt16LE(stamp.time, 10)
    header.writeUInt16LE(stamp.date, 12)
    header.writeUInt32LE(crc, 14)
    header.writeUInt32LE(compressed.length, 18)
    header.writeUInt32LE(contents.length, 22)
    header.writeUInt16LE(Buffer.byteLength(name), 26)
    header.writeUInt16LE(0, 28)

    const nameBuffer = Buffer.from(name)

    localParts.push(header, nameBuffer, compressed)
    entries.push({
      name,
      crc,
      compressed,
      size: contents.length,
      offset
    })

    offset += header.length + nameBuffer.length + compressed.length
  }

  const centralParts: Buffer[] = []
  let centralSize = 0

  for (const entry of entries) {
    const header = Buffer.alloc(46)
    const nameBuffer = Buffer.from(entry.name)

    header.writeUInt32LE(0x02014b50, 0)
    header.writeUInt16LE(20, 4)
    header.writeUInt16LE(20, 6)
    header.writeUInt16LE(0, 8)
    header.writeUInt16LE(8, 10)
    header.writeUInt16LE(stamp.time, 12)
    header.writeUInt16LE(stamp.date, 14)
    header.writeUInt32LE(entry.crc, 16)
    header.writeUInt32LE(entry.compressed.length, 20)
    header.writeUInt32LE(entry.size, 24)
    header.writeUInt16LE(nameBuffer.length, 28)
    header.writeUInt32LE(entry.offset, 42)

    centralParts.push(header, nameBuffer)
    centralSize += header.length + nameBuffer.length
  }

  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralSize, 12)
  end.writeUInt32LE(offset, 16)

  writeFileSync(
    outputName,
    Buffer.concat([...localParts, ...centralParts, end])
  )

  console.log(`Wrote ${outputName} (${entries.length} files).`)
}

pack()
