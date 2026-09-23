// Faithful TypeScript port of the PE-specific subset of thrember's EMBER2024 feature vector:
// HeaderFileInfo(74) + SectionInfo(224) + ImportsInfo(1282) + ExportsInfo(129) +
// DataDirectories(34) + RichHeader(33) + AuthenticodeSignature(8) + PEFormatWarnings(88) = 1872,
// combined with the shared GeneralFileInfo/ByteHistogram/ByteEntropyHistogram/StringExtractor
// (696, with is_pe=1) from ember-features.ts for the full 2568-float PE vector that
// /api/ml/scan-pe expects.
//
// Two blocks are deliberately simplified rather than fully replicated — both are small relative
// to the 2568-dim total and would need substantial additional format parsing for comparatively
// little signal:
//  - AuthenticodeSignature (8/2568): a full Authenticode/PKCS#7/X.509 parser (ASN.1 DER, signer
//    chains, countersignatures) is its own large project. This reports only whether a signature
//    is present (num_certs 0 or 1) and zeroes the rest (self_signed, chain depth, timestamps).
//  - PEFormatWarnings (88/2568): replicating pefile's own internal validation-warning triggers
//    would mean reimplementing much of its parser logic for warnings that mostly only fire on
//    malformed/corrupted headers. Reported as all-zero (the same value a cleanly-parsed file gets).
//
// See ember-features.ts for the shared non-PE blocks and murmurhash3.ts for the FeatureHasher
// port that SectionInfo/ImportsInfo/ExportsInfo/RichHeader rely on.

import { generalFileInfo, byteHistogram, byteEntropyHistogram, stringFeatures, shannonEntropyBits } from "./ember-features";
import { hashStrings, hashPairs } from "./murmurhash3";
import { parsePe, DATA_DIRECTORY_NAMES, type ParsedPe } from "./pe-parser";

export const EMBER_PE_FEATURE_DIM = 2568;

// --- HeaderFileInfo (dim 74) ---------------------------------------------------------------

const MACHINE_TYPES = [
  "IMAGE_FILE_MACHINE_UNKNOWN",
  "IMAGE_FILE_MACHINE_I386",
  "IMAGE_FILE_MACHINE_R3000",
  "IMAGE_FILE_MACHINE_R4000",
  "IMAGE_FILE_MACHINE_R10000",
  "IMAGE_FILE_MACHINE_WCEMIPSV2",
  "IMAGE_FILE_MACHINE_ALPHA",
  "IMAGE_FILE_MACHINE_SH3",
  "IMAGE_FILE_MACHINE_SH3DSP",
  "IMAGE_FILE_MACHINE_SH3E",
  "IMAGE_FILE_MACHINE_SH4",
  "IMAGE_FILE_MACHINE_SH5",
  "IMAGE_FILE_MACHINE_ARM",
  "IMAGE_FILE_MACHINE_THUMB",
  "IMAGE_FILE_MACHINE_ARMNT",
  "IMAGE_FILE_MACHINE_AM33",
  "IMAGE_FILE_MACHINE_POWERPC",
  "IMAGE_FILE_MACHINE_POWERPCFP",
  "IMAGE_FILE_MACHINE_IA64",
  "IMAGE_FILE_MACHINE_MIPS16",
  "IMAGE_FILE_MACHINE_ALPHA64",
  "IMAGE_FILE_MACHINE_AXP64",
  "IMAGE_FILE_MACHINE_MIPSFPU",
  "IMAGE_FILE_MACHINE_MIPSFPU16",
  "IMAGE_FILE_MACHINE_TRICORE",
  "IMAGE_FILE_MACHINE_CEF",
  "IMAGE_FILE_MACHINE_EBC",
  "IMAGE_FILE_MACHINE_RISCV32",
  "IMAGE_FILE_MACHINE_RISCV64",
  "IMAGE_FILE_MACHINE_RISCV128",
  "IMAGE_FILE_MACHINE_LOONGARCH32",
  "IMAGE_FILE_MACHINE_LOONGARCH64",
  "IMAGE_FILE_MACHINE_AMD64",
  "IMAGE_FILE_MACHINE_M32R",
  "IMAGE_FILE_MACHINE_ARM64",
  "IMAGE_FILE_MACHINE_CEE",
];

const MACHINE_VALUE_TO_NAME: Record<number, string> = {
  0x0: "IMAGE_FILE_MACHINE_UNKNOWN",
  0x14c: "IMAGE_FILE_MACHINE_I386",
  0x162: "IMAGE_FILE_MACHINE_R3000",
  0x166: "IMAGE_FILE_MACHINE_R4000",
  0x168: "IMAGE_FILE_MACHINE_R10000",
  0x169: "IMAGE_FILE_MACHINE_WCEMIPSV2",
  0x184: "IMAGE_FILE_MACHINE_ALPHA",
  0x1a2: "IMAGE_FILE_MACHINE_SH3",
  0x1a3: "IMAGE_FILE_MACHINE_SH3DSP",
  0x1a4: "IMAGE_FILE_MACHINE_SH3E",
  0x1a6: "IMAGE_FILE_MACHINE_SH4",
  0x1a8: "IMAGE_FILE_MACHINE_SH5",
  0x1c0: "IMAGE_FILE_MACHINE_ARM",
  0x1c2: "IMAGE_FILE_MACHINE_THUMB",
  0x1c4: "IMAGE_FILE_MACHINE_ARMNT",
  0x1d3: "IMAGE_FILE_MACHINE_AM33",
  0x1f0: "IMAGE_FILE_MACHINE_POWERPC",
  0x1f1: "IMAGE_FILE_MACHINE_POWERPCFP",
  0x200: "IMAGE_FILE_MACHINE_IA64",
  0x266: "IMAGE_FILE_MACHINE_MIPS16",
  0x284: "IMAGE_FILE_MACHINE_ALPHA64",
  0x366: "IMAGE_FILE_MACHINE_MIPSFPU",
  0x466: "IMAGE_FILE_MACHINE_MIPSFPU16",
  0x520: "IMAGE_FILE_MACHINE_TRICORE",
  0xcef: "IMAGE_FILE_MACHINE_CEF",
  0xebc: "IMAGE_FILE_MACHINE_EBC",
  0x5032: "IMAGE_FILE_MACHINE_RISCV32",
  0x5064: "IMAGE_FILE_MACHINE_RISCV64",
  0x5128: "IMAGE_FILE_MACHINE_RISCV128",
  0x6232: "IMAGE_FILE_MACHINE_LOONGARCH32",
  0x6264: "IMAGE_FILE_MACHINE_LOONGARCH64",
  0x8664: "IMAGE_FILE_MACHINE_AMD64",
  0x9041: "IMAGE_FILE_MACHINE_M32R",
  0xaa64: "IMAGE_FILE_MACHINE_ARM64",
  0xc0ee: "IMAGE_FILE_MACHINE_CEE",
};

const SUBSYSTEM_TYPES = [
  "IMAGE_SUBSYSTEM_UNKNOWN",
  "IMAGE_SUBSYSTEM_NATIVE",
  "IMAGE_SUBSYSTEM_WINDOWS_GUI",
  "IMAGE_SUBSYSTEM_WINDOWS_CUI",
  "IMAGE_SUBSYSTEM_OS2_CUI",
  "IMAGE_SUBSYSTEM_POSIX_CUI",
  "IMAGE_SUBSYSTEM_NATIVE_WINDOWS",
  "IMAGE_SUBSYSTEM_WINDOWS_CE_GUI",
  "IMAGE_SUBSYSTEM_EFI_APPLICATION",
  "IMAGE_SUBSYSTEM_EFI_BOOT_SERVICE_DRIVER",
  "IMAGE_SUBSYSTEM_EFI_RUNTIME_DRIVER",
  "IMAGE_SUBSYSTEM_EFI_ROM",
  "IMAGE_SUBSYSTEM_XBOX",
  "IMAGE_SUBSYSTEM_WINDOWS_BOOT_APPLICATION",
];

const SUBSYSTEM_VALUE_TO_NAME: Record<number, string> = {
  0: "IMAGE_SUBSYSTEM_UNKNOWN",
  1: "IMAGE_SUBSYSTEM_NATIVE",
  2: "IMAGE_SUBSYSTEM_WINDOWS_GUI",
  3: "IMAGE_SUBSYSTEM_WINDOWS_CUI",
  5: "IMAGE_SUBSYSTEM_OS2_CUI",
  7: "IMAGE_SUBSYSTEM_POSIX_CUI",
  8: "IMAGE_SUBSYSTEM_NATIVE_WINDOWS",
  9: "IMAGE_SUBSYSTEM_WINDOWS_CE_GUI",
  10: "IMAGE_SUBSYSTEM_EFI_APPLICATION",
  11: "IMAGE_SUBSYSTEM_EFI_BOOT_SERVICE_DRIVER",
  12: "IMAGE_SUBSYSTEM_EFI_RUNTIME_DRIVER",
  13: "IMAGE_SUBSYSTEM_EFI_ROM",
  14: "IMAGE_SUBSYSTEM_XBOX",
  16: "IMAGE_SUBSYSTEM_WINDOWS_BOOT_APPLICATION",
};

// List order matches ascending bit order exactly (RELOCS_STRIPPED=0x0001 through
// BYTES_REVERSED_HI=0x8000), so each flag's bit is just 1 << index.
const IMAGE_CHARACTERISTICS = [
  "RELOCS_STRIPPED",
  "EXECUTABLE_IMAGE",
  "LINE_NUMS_STRIPPED",
  "LOCAL_SYMS_STRIPPED",
  "AGGRESIVE_WS_TRIM",
  "LARGE_ADDRESS_AWARE",
  "16BIT_MACHINE",
  "BYTES_REVERSED_LO",
  "32BIT_MACHINE",
  "DEBUG_STRIPPED",
  "REMOVABLE_RUN_FROM_SWAP",
  "NET_RUN_FROM_SWAP",
  "SYSTEM",
  "DLL",
  "UP_SYSTEM_ONLY",
  "BYTES_REVERSED_HI",
];

// Same pattern: ascending bit order starting at 0x0020 (HIGH_ENTROPY_VA) through 0x8000
// (TERMINAL_SERVER_AWARE).
const DLL_CHARACTERISTICS = [
  "HIGH_ENTROPY_VA",
  "DYNAMIC_BASE",
  "FORCE_INTEGRITY",
  "NX_COMPAT",
  "NO_ISOLATION",
  "NO_SEH",
  "NO_BIND",
  "APPCONTAINER",
  "WDM_DRIVER",
  "GUARD_CF",
  "TERMINAL_SERVER_AWARE",
];
const DLL_CHARACTERISTICS_BASE_BIT = 0x0020;

const DOS_MEMBER_ORDER = [
  "e_magic",
  "e_cblp",
  "e_cp",
  "e_crlc",
  "e_cparhdr",
  "e_minalloc",
  "e_maxalloc",
  "e_ss",
  "e_sp",
  "e_csum",
  "e_ip",
  "e_cs",
  "e_lfarlc",
  "e_ovno",
  "e_oemid",
  "e_oeminfo",
  "e_lfanew",
];

function headerFileInfo(pe: ParsedPe): number[] {
  const machineName = MACHINE_VALUE_TO_NAME[pe.coff.machine] ?? "IMAGE_FILE_MACHINE_UNKNOWN";
  const subsystemName = SUBSYSTEM_VALUE_TO_NAME[pe.optional.subsystem] ?? "IMAGE_SUBSYSTEM_UNKNOWN";
  const machineIdx = Math.max(0, MACHINE_TYPES.indexOf(machineName));
  const subsystemIdx = Math.max(0, SUBSYSTEM_TYPES.indexOf(subsystemName));

  const imageCharacteristics = IMAGE_CHARACTERISTICS.map((_, i) => ((pe.coff.characteristics & (1 << i)) !== 0 ? 1 : 0));
  const dllCharacteristics = DLL_CHARACTERISTICS.map((_, i) => ((pe.optional.dllCharacteristics & (DLL_CHARACTERISTICS_BASE_BIT << i)) !== 0 ? 1 : 0));
  const dosValues = DOS_MEMBER_ORDER.map((k) => pe.dosMembers[k] ?? 0);

  return [
    pe.coff.timeDateStamp,
    pe.coff.numberOfSections,
    pe.coff.numberOfSymbols,
    pe.coff.sizeOfOptionalHeader,
    pe.coff.pointerToSymbolTable,
    machineIdx,
    subsystemIdx,
    pe.optional.majorImageVersion,
    pe.optional.minorImageVersion,
    pe.optional.majorLinkerVersion,
    pe.optional.minorLinkerVersion,
    pe.optional.majorOsVersion,
    pe.optional.minorOsVersion,
    pe.optional.majorSubsystemVersion,
    pe.optional.minorSubsystemVersion,
    pe.optional.sizeOfCode,
    pe.optional.sizeOfHeaders,
    pe.optional.sizeOfImage,
    pe.optional.sizeOfInitializedData,
    pe.optional.sizeOfUninitializedData,
    pe.optional.sizeOfStackReserve,
    pe.optional.sizeOfStackCommit,
    pe.optional.sizeOfHeapReserve,
    pe.optional.sizeOfHeapCommit,
    pe.optional.addressOfEntryPoint,
    pe.optional.baseOfCode,
    pe.optional.imageBase,
    pe.optional.sectionAlignment,
    pe.optional.checksum,
    pe.optional.numberOfRvaAndSizes,
    ...imageCharacteristics,
    ...dllCharacteristics,
    ...dosValues,
  ];
}

// --- DataDirectories (dim 34) --------------------------------------------------------------

function dataDirectoriesFeatures(pe: ParsedPe): number[] {
  const features = new Array(2 * DATA_DIRECTORY_NAMES.length + 2).fill(0);
  for (let i = 0; i < DATA_DIRECTORY_NAMES.length; i++) {
    const d = pe.optional.dataDirectories[i];
    if (!d) continue;
    features[2 * i] = d.size;
    features[2 * i + 1] = d.virtualAddress;
  }
  const hasRelocs = (pe.optional.dataDirectories[5]?.size ?? 0) > 0 ? 1 : 0;
  // has_dynamic_relocs needs a full Load Config Directory walk (IMAGE_DYNAMIC_RELOCATION_TABLE)
  // — a rare CFG-related feature reported as absent here rather than fully implemented, given
  // its small individual weight (this single boolean out of 2568 features).
  features[features.length - 2] = hasRelocs;
  features[features.length - 1] = 0;
  return features;
}

// --- SectionInfo (dim 224) -----------------------------------------------------------------

function sectionInfoFeatures(pe: ParsedPe, bytes: Uint8Array): number[] {
  const dim = 11 + 50 + 50 + 50 + 50 + 10 + 3;
  if (pe.sections.length === 0) return new Array(dim).fill(0);

  // Entry section: whichever section contains AddressOfEntryPoint, else the first executable one.
  let entryName = "";
  for (const s of pe.sections) {
    const size = Math.max(s.virtualSize, s.sizeOfRawData);
    if (pe.optional.addressOfEntryPoint >= s.virtualAddress && pe.optional.addressOfEntryPoint < s.virtualAddress + size) {
      entryName = s.name;
      break;
    }
  }
  if (!entryName) {
    const executable = pe.sections.find((s) => (s.characteristics & 0x20000000) !== 0);
    if (executable) entryName = executable.name;
  }

  function sectionEntropy(s: (typeof pe.sections)[number]): number {
    if (s.sizeOfRawData === 0 || s.pointerToRawData + s.sizeOfRawData > bytes.length) return 0;
    const data = bytes.subarray(s.pointerToRawData, s.pointerToRawData + s.sizeOfRawData);
    const counts = new Uint32Array(256);
    for (let i = 0; i < data.length; i++) counts[data[i]]++;
    return shannonEntropyBits(counts, data.length);
  }

  const sectionsData = pe.sections.map((s) => ({
    name: s.name,
    size: s.sizeOfRawData,
    entropy: sectionEntropy(s),
    vsize: s.virtualSize,
    sizeRatio: s.sizeOfRawData / bytes.length,
    vsizeRatio: s.sizeOfRawData / Math.max(s.virtualSize, 1),
    props: s.props,
  }));

  let overlayEntropy = 0;
  let overlaySizeRatio = 0;
  if (pe.overlaySize > 0 && bytes.length - pe.overlaySize >= 0) {
    const overlay = bytes.subarray(bytes.length - pe.overlaySize);
    const counts = new Uint32Array(256);
    for (let i = 0; i < overlay.length; i++) counts[overlay[i]]++;
    overlayEntropy = shannonEntropyBits(counts, overlay.length);
    overlaySizeRatio = pe.overlaySize / bytes.length;
  }

  const nSections = sectionsData.length;
  const nZeroSize = sectionsData.filter((s) => s.size === 0).length;
  const nEmptyName = sectionsData.filter((s) => s.name === "").length;
  const nRx = sectionsData.filter((s) => s.props.includes("MEM_READ") && s.props.includes("MEM_EXECUTE")).length;
  const nW = sectionsData.filter((s) => s.props.includes("MEM_WRITE")).length;
  const entropies = [...sectionsData.map((s) => s.entropy), overlayEntropy, 0];
  const sizeRatios = [...sectionsData.map((s) => s.sizeRatio), overlaySizeRatio, 0];
  const vsizeRatios = [...sectionsData.map((s) => s.vsizeRatio), 0];

  const general = [
    nSections,
    nZeroSize,
    nEmptyName,
    nRx,
    nW,
    Math.max(...entropies),
    Math.min(...entropies),
    Math.max(...sizeRatios),
    Math.min(...sizeRatios),
    Math.max(...vsizeRatios),
    Math.min(...vsizeRatios),
  ];

  const sectionSizesHashed = hashPairs(sectionsData.map((s) => [s.name, s.size] as [string, number]), 50);
  const sectionVsizeHashed = hashPairs(sectionsData.map((s) => [s.name, s.vsize] as [string, number]), 50);
  const sectionEntropyHashed = hashPairs(sectionsData.map((s) => [s.name, s.entropy] as [string, number]), 50);
  const characteristics = sectionsData.flatMap((s) => s.props.map((p) => `${s.name}:${p}`));
  const characteristicsHashed = hashStrings(characteristics, 50);
  const entryNameHashed = hashStrings([entryName], 10);

  return [
    ...general,
    ...sectionSizesHashed,
    ...sectionVsizeHashed,
    ...sectionEntropyHashed,
    ...characteristicsHashed,
    ...entryNameHashed,
    pe.overlaySize,
    overlaySizeRatio,
    overlayEntropy,
  ];
}

// --- ImportsInfo (dim 1282) ----------------------------------------------------------------

function importsInfoFeatures(pe: ParsedPe): number[] {
  const dim = 2 + 256 + 1024;
  if (pe.imports.length === 0) return new Array(dim).fill(0);

  const libraries = [...new Set(pe.imports.map((i) => i.dll.toLowerCase()))];
  const librariesHashed = hashStrings(libraries, 256, false);
  const importStrings = pe.imports.map((i) => `${i.dll.toLowerCase()}:${i.name}`);
  const importsHashed = hashStrings(importStrings, 1024, false);

  return [importStrings.length, libraries.length, ...librariesHashed, ...importsHashed];
}

// --- ExportsInfo (dim 129) -----------------------------------------------------------------

function exportsInfoFeatures(pe: ParsedPe): number[] {
  const dim = 1 + 128;
  if (pe.exports.length === 0) return new Array(dim).fill(0);
  const exportsHashed = hashStrings(pe.exports, 128);
  return [exportsHashed.length, ...exportsHashed];
}

// --- RichHeader (dim 33) --------------------------------------------------------------------

function richHeaderFeatures(pe: ParsedPe): number[] {
  const dim = 1 + 32;
  if (pe.richHeaderValues.length === 0) return new Array(dim).fill(0);
  const numberOfPairs = Math.floor(pe.richHeaderValues.length / 2);
  const pairs: [string, number][] = [];
  for (let i = 0; i + 1 < pe.richHeaderValues.length; i += 2) {
    pairs.push([String(pe.richHeaderValues[i]), pe.richHeaderValues[i + 1]]);
  }
  const hashed = hashPairs(pairs, 32);
  return [numberOfPairs, ...hashed];
}

// --- AuthenticodeSignature (dim 8, simplified — see module header) -------------------------

function authenticodeFeatures(pe: ParsedPe): number[] {
  const securityDir = pe.optional.dataDirectories[4];
  const numCerts = securityDir && securityDir.size > 0 ? 1 : 0;
  return [numCerts, 0, 0, 0, 0, 0, 0, 0];
}

// --- PEFormatWarnings (dim 88, simplified to all-zero — see module header) -----------------

function peFormatWarningsFeatures(): number[] {
  return new Array(87 + 1).fill(0);
}

export interface PeExtractionResult {
  isPe: boolean;
  features: number[];
}

/** Computes the full 2568-float EMBER2024 PE feature vector, or reports `isPe: false` if the
 *  file isn't a valid PE (caller should fall back to the 696-float non-PE vector instead). */
export function extractEmberPeFeatures(bytes: Uint8Array): PeExtractionResult {
  const pe = parsePe(bytes);
  if (!pe) return { isPe: false, features: [] };

  const features = [
    ...generalFileInfo(bytes, 1),
    ...byteHistogram(bytes),
    ...byteEntropyHistogram(bytes),
    ...stringFeatures(bytes),
    ...headerFileInfo(pe),
    ...sectionInfoFeatures(pe, bytes),
    ...importsInfoFeatures(pe),
    ...exportsInfoFeatures(pe),
    ...dataDirectoriesFeatures(pe),
    ...richHeaderFeatures(pe),
    ...authenticodeFeatures(pe),
    ...peFormatWarningsFeatures(),
  ];

  if (features.length !== EMBER_PE_FEATURE_DIM) {
    throw new Error(`PE feature vector length mismatch: got ${features.length}, expected ${EMBER_PE_FEATURE_DIM}`);
  }
  return { isPe: true, features };
}
