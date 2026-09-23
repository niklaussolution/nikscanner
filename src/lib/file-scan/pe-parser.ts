// Minimal structural PE (Windows portable executable) parser — DOS/COFF/Optional headers,
// section table, RVA-to-file-offset resolution, import/export directories, and the Rich header.
// Standard, publicly documented Microsoft PE/COFF format; no external dependency (the Python
// reference extractor uses `pefile`, a pure-Python parser of this same public format).

export interface DataDirectoryEntry {
  virtualAddress: number;
  size: number;
}

export const DATA_DIRECTORY_NAMES = [
  "EXPORT",
  "IMPORT",
  "RESOURCE",
  "EXCEPTION",
  "SECURITY",
  "BASERELOC",
  "DEBUG",
  "COPYRIGHT",
  "GLOBALPTR",
  "TLS",
  "LOAD_CONFIG",
  "BOUND_IMPORT",
  "IAT",
  "DELAY_IMPORT",
  "COM_DESCRIPTOR",
  "RESERVED",
] as const;

const SECTION_CHARACTERISTIC_FLAGS: [number, string][] = [
  [0x00000020, "CNT_CODE"],
  [0x00000040, "CNT_INITIALIZED_DATA"],
  [0x00000080, "CNT_UNINITIALIZED_DATA"],
  [0x02000000, "MEM_DISCARDABLE"],
  [0x04000000, "MEM_NOT_CACHED"],
  [0x08000000, "MEM_NOT_PAGED"],
  [0x10000000, "MEM_SHARED"],
  [0x20000000, "MEM_EXECUTE"],
  [0x40000000, "MEM_READ"],
  [0x80000000, "MEM_WRITE"],
];

export interface PeSection {
  name: string;
  virtualSize: number;
  virtualAddress: number;
  sizeOfRawData: number;
  pointerToRawData: number;
  characteristics: number;
  props: string[];
}

export interface PeCoffHeader {
  machine: number;
  numberOfSections: number;
  timeDateStamp: number;
  numberOfSymbols: number;
  pointerToSymbolTable: number;
  sizeOfOptionalHeader: number;
  characteristics: number;
}

export interface PeOptionalHeader {
  magic: number;
  is64Bit: boolean;
  majorLinkerVersion: number;
  minorLinkerVersion: number;
  addressOfEntryPoint: number;
  baseOfCode: number;
  imageBase: number;
  sectionAlignment: number;
  majorImageVersion: number;
  minorImageVersion: number;
  majorOsVersion: number;
  minorOsVersion: number;
  majorSubsystemVersion: number;
  minorSubsystemVersion: number;
  sizeOfCode: number;
  sizeOfHeaders: number;
  sizeOfImage: number;
  sizeOfInitializedData: number;
  sizeOfUninitializedData: number;
  sizeOfStackReserve: number;
  sizeOfStackCommit: number;
  sizeOfHeapReserve: number;
  sizeOfHeapCommit: number;
  checksum: number;
  subsystem: number;
  dllCharacteristics: number;
  numberOfRvaAndSizes: number;
  dataDirectories: DataDirectoryEntry[];
}

export interface PeImport {
  dll: string;
  name: string;
}

export interface PeRichHeaderEntry {
  compid: number;
  count: number;
}

export interface ParsedPe {
  bytes: Uint8Array;
  peOffset: number;
  dosMembers: Record<string, number>;
  coff: PeCoffHeader;
  optional: PeOptionalHeader;
  sections: PeSection[];
  imports: PeImport[];
  exports: string[];
  richHeaderValues: number[];
  overlaySize: number;
  rvaToOffset(rva: number): number | null;
}

function readU16(b: Uint8Array, o: number): number {
  return o + 2 <= b.length ? b[o] | (b[o + 1] << 8) : 0;
}
function readU32(b: Uint8Array, o: number): number {
  return o + 4 <= b.length ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0 : 0;
}
/** Reads a 64-bit little-endian field as a JS number (safe: real-world PE address/size fields
 *  never approach 2^53). Used for PE32+'s 8-byte ImageBase/stack/heap fields, which `readU32`
 *  alone would silently truncate to their low 32 bits. */
function readU64AsNumber(b: Uint8Array, o: number): number {
  return readU32(b, o) + readU32(b, o + 4) * 0x100000000;
}
function readCString(b: Uint8Array, o: number, maxLen = 512): string {
  if (o < 0 || o >= b.length) return "";
  let end = o;
  while (end < b.length && end - o < maxLen && b[end] !== 0) end++;
  return new TextDecoder().decode(b.subarray(o, end));
}

const DOS_MEMBER_OFFSETS: [string, number][] = [
  ["e_magic", 0],
  ["e_cblp", 2],
  ["e_cp", 4],
  ["e_crlc", 6],
  ["e_cparhdr", 8],
  ["e_minalloc", 10],
  ["e_maxalloc", 12],
  ["e_ss", 14],
  ["e_sp", 16],
  ["e_csum", 18],
  ["e_ip", 20],
  ["e_cs", 22],
  ["e_lfarlc", 24],
  ["e_ovno", 26],
  ["e_oemid", 36],
  ["e_oeminfo", 38],
  ["e_lfanew", 60],
];

export function parsePe(bytes: Uint8Array): ParsedPe | null {
  if (bytes.length < 64 || bytes[0] !== 0x4d || bytes[1] !== 0x5a) return null; // "MZ"

  const dosMembers: Record<string, number> = {};
  for (const [name, offset] of DOS_MEMBER_OFFSETS) {
    dosMembers[name] = name === "e_lfanew" ? readU32(bytes, offset) : readU16(bytes, offset);
  }

  const peOffset = dosMembers.e_lfanew;
  if (peOffset <= 0 || peOffset + 24 > bytes.length) return null;
  if (readU32(bytes, peOffset) !== 0x00004550) return null; // "PE\0\0"

  const coffOffset = peOffset + 4;
  const coff: PeCoffHeader = {
    machine: readU16(bytes, coffOffset),
    numberOfSections: readU16(bytes, coffOffset + 2),
    timeDateStamp: readU32(bytes, coffOffset + 4),
    pointerToSymbolTable: readU32(bytes, coffOffset + 8),
    numberOfSymbols: readU32(bytes, coffOffset + 12),
    sizeOfOptionalHeader: readU16(bytes, coffOffset + 16),
    characteristics: readU16(bytes, coffOffset + 18),
  };

  const optOffset = coffOffset + 20;
  const magic = readU16(bytes, optOffset);
  const is64Bit = magic === 0x20b;
  // Standard fields are identical up to (and including) ImageBase, which is 4 bytes in PE32
  // (preceded by a 4-byte BaseOfData field PE32+ doesn't have) and 8 bytes in PE32+ — both
  // layouts land on the same offset (32) for everything after it.
  const imageBase = is64Bit ? readU64AsNumber(bytes, optOffset + 24) : readU32(bytes, optOffset + 28);
  const stackHeapBase = optOffset + 72;
  const fieldSize = is64Bit ? 8 : 4;
  const readWide = (o: number) => (is64Bit ? readU64AsNumber(bytes, o) : readU32(bytes, o));

  const numberOfRvaAndSizesOffset = stackHeapBase + fieldSize * 4 + 4;
  const numberOfRvaAndSizes = readU32(bytes, numberOfRvaAndSizesOffset);
  const dataDirOffset = numberOfRvaAndSizesOffset + 4;
  const dataDirectories: DataDirectoryEntry[] = [];
  for (let i = 0; i < 16; i++) {
    const o = dataDirOffset + i * 8;
    dataDirectories.push({ virtualAddress: readU32(bytes, o), size: readU32(bytes, o + 4) });
  }

  const optional: PeOptionalHeader = {
    magic,
    is64Bit,
    majorLinkerVersion: bytes[optOffset + 2] ?? 0,
    minorLinkerVersion: bytes[optOffset + 3] ?? 0,
    sizeOfCode: readU32(bytes, optOffset + 4),
    sizeOfInitializedData: readU32(bytes, optOffset + 8),
    sizeOfUninitializedData: readU32(bytes, optOffset + 12),
    addressOfEntryPoint: readU32(bytes, optOffset + 16),
    baseOfCode: readU32(bytes, optOffset + 20),
    imageBase,
    sectionAlignment: readU32(bytes, optOffset + 32),
    majorOsVersion: readU16(bytes, optOffset + 40),
    minorOsVersion: readU16(bytes, optOffset + 42),
    majorImageVersion: readU16(bytes, optOffset + 44),
    minorImageVersion: readU16(bytes, optOffset + 46),
    majorSubsystemVersion: readU16(bytes, optOffset + 48),
    minorSubsystemVersion: readU16(bytes, optOffset + 50),
    sizeOfImage: readU32(bytes, optOffset + 56),
    sizeOfHeaders: readU32(bytes, optOffset + 60),
    checksum: readU32(bytes, optOffset + 64),
    subsystem: readU16(bytes, optOffset + 68),
    dllCharacteristics: readU16(bytes, optOffset + 70),
    sizeOfStackReserve: readWide(stackHeapBase),
    sizeOfStackCommit: readWide(stackHeapBase + fieldSize),
    sizeOfHeapReserve: readWide(stackHeapBase + fieldSize * 2),
    sizeOfHeapCommit: readWide(stackHeapBase + fieldSize * 3),
    numberOfRvaAndSizes,
    dataDirectories,
  };

  const sectionTableOffset = optOffset + coff.sizeOfOptionalHeader;
  const sections: PeSection[] = [];
  for (let i = 0; i < coff.numberOfSections; i++) {
    const o = sectionTableOffset + i * 40;
    if (o + 40 > bytes.length) break;
    const nameBytes = bytes.subarray(o, o + 8);
    let nameLen = 0;
    while (nameLen < 8 && nameBytes[nameLen] !== 0) nameLen++;
    const name = new TextDecoder().decode(nameBytes.subarray(0, nameLen)).toLowerCase();
    const characteristics = readU32(bytes, o + 36);
    const props = SECTION_CHARACTERISTIC_FLAGS.filter(([bit]) => (characteristics & bit) !== 0).map(([, n]) => n);
    sections.push({
      name,
      virtualSize: readU32(bytes, o + 8),
      virtualAddress: readU32(bytes, o + 12),
      sizeOfRawData: readU32(bytes, o + 16),
      pointerToRawData: readU32(bytes, o + 20),
      characteristics,
      props,
    });
  }

  function rvaToOffset(rva: number): number | null {
    for (const s of sections) {
      const size = Math.max(s.virtualSize, s.sizeOfRawData);
      if (rva >= s.virtualAddress && rva < s.virtualAddress + size) {
        return s.pointerToRawData + (rva - s.virtualAddress);
      }
    }
    return null;
  }

  // Imports: walk IMAGE_IMPORT_DESCRIPTOR entries until an all-zero terminator, then each
  // module's thunk array until a zero entry. Ordinal-only imports (high bit set) are recorded
  // as "dll:ordinalN" the same way the reference extractor does.
  const imports: PeImport[] = [];
  const importDir = dataDirectories[1];
  if (importDir && importDir.size > 0) {
    let descOffset = rvaToOffset(importDir.virtualAddress);
    const thunkSize = is64Bit ? 8 : 4;
    const ordinalBit = is64Bit ? 0x80000000 : 0x80000000; // checked against the high 32 bits either way
    for (let guard = 0; guard < 1000 && descOffset !== null && descOffset + 20 <= bytes.length; guard++) {
      const originalFirstThunk = readU32(bytes, descOffset);
      const nameRva = readU32(bytes, descOffset + 12);
      const firstThunk = readU32(bytes, descOffset + 16);
      if (originalFirstThunk === 0 && nameRva === 0 && firstThunk === 0) break;

      const nameOffset = rvaToOffset(nameRva);
      const dllName = nameOffset !== null ? readCString(bytes, nameOffset, 256) : "";

      const thunkRva = originalFirstThunk !== 0 ? originalFirstThunk : firstThunk;
      let thunkOffset = rvaToOffset(thunkRva);
      for (let t = 0; t < 5000 && thunkOffset !== null && thunkOffset + thunkSize <= bytes.length; t++) {
        const low = readU32(bytes, thunkOffset);
        const high = is64Bit ? readU32(bytes, thunkOffset + 4) : 0;
        if (low === 0 && high === 0) break;
        const isOrdinal = is64Bit ? (high & 0x80000000) !== 0 : (low & ordinalBit) !== 0;
        if (isOrdinal) {
          imports.push({ dll: dllName, name: `${dllName}:ordinal${low & 0xffff}` });
        } else {
          const ibnOffset = rvaToOffset(low);
          const fnName = ibnOffset !== null ? readCString(bytes, ibnOffset + 2, 512) : "";
          if (fnName) imports.push({ dll: dllName, name: fnName });
        }
        thunkOffset += thunkSize;
      }
      descOffset += 20;
    }
  }

  // Exports: named exports only (the overwhelming majority in practice) — walk the
  // AddressOfNames RVA array.
  const exports: string[] = [];
  const exportDir = dataDirectories[0];
  if (exportDir && exportDir.size > 0) {
    const edOffset = rvaToOffset(exportDir.virtualAddress);
    if (edOffset !== null) {
      const numberOfNames = readU32(bytes, edOffset + 24);
      const addressOfNamesRva = readU32(bytes, edOffset + 32);
      const namesArrayOffset = rvaToOffset(addressOfNamesRva);
      if (namesArrayOffset !== null) {
        for (let i = 0; i < Math.min(numberOfNames, 20000); i++) {
          const nameRva = readU32(bytes, namesArrayOffset + i * 4);
          const nameOffset = rvaToOffset(nameRva);
          if (nameOffset !== null) {
            const name = readCString(bytes, nameOffset, 10000);
            if (name) exports.push(name);
          }
        }
      }
    }
  }

  // Rich header: an undocumented, XOR-obfuscated block of linker/toolchain metadata between
  // the DOS stub and the PE header. Search backward from peOffset for "Rich", read the XOR key
  // right after it, then scan backward for the XOR-encoded "DanS" start marker.
  const richHeaderValues: number[] = [];
  const richSearchStart = Math.max(0, peOffset - 512);
  let richPos = -1;
  for (let i = peOffset - 4; i >= richSearchStart; i--) {
    if (bytes[i] === 0x52 && bytes[i + 1] === 0x69 && bytes[i + 2] === 0x63 && bytes[i + 3] === 0x68) {
      richPos = i;
      break;
    }
  }
  if (richPos !== -1 && richPos + 8 <= bytes.length) {
    const key = readU32(bytes, richPos + 4);
    let dansPos = -1;
    for (let i = richPos - 4; i >= 0; i -= 4) {
      if ((readU32(bytes, i) ^ key) >>> 0 === 0x536e6144) {
        dansPos = i;
        break;
      }
    }
    if (dansPos !== -1) {
      // 3 zero-padding DWORDs immediately follow "DanS" before the actual (id, count) pairs.
      for (let o = dansPos + 16; o + 4 <= richPos; o += 4) {
        richHeaderValues.push((readU32(bytes, o) ^ key) >>> 0);
      }
    }
  }

  // Overlay: any trailing bytes past the highest (PointerToRawData + SizeOfRawData) across all
  // sections — data appended after the file's legitimate structure ends (installers bundling a
  // payload, or a common malware/packer technique).
  let highestSectionEnd = optional.sizeOfHeaders;
  for (const s of sections) highestSectionEnd = Math.max(highestSectionEnd, s.pointerToRawData + s.sizeOfRawData);
  const overlaySize = Math.max(0, bytes.length - highestSectionEnd);

  return { bytes, peOffset, dosMembers, coff, optional, sections, imports, exports, richHeaderValues, overlaySize, rvaToOffset };
}
