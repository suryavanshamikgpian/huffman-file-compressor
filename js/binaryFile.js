/**
 * Binary file utilities — packing/unpacking Huffman data into downloadable blobs.
 *
 * Compressed file format (.huff):
 *   [4 bytes]  - header length (uint32, big-endian)
 *   [N bytes]  - JSON header string (frequency map + padding bits count)
 *   [M bytes]  - packed binary data
 */

/**
 * Pack a bit-string and frequency map into a Uint8Array.
 * @param {string} bitString - The encoded bit-string (e.g. "01101...")
 * @param {Object} freqMap - Character frequency map
 * @returns {Uint8Array}
 */
export function pack(bitString, freqMap) {
  // Pad the bit-string to a multiple of 8
  const padding = (8 - (bitString.length % 8)) % 8;
  const padded = bitString + '0'.repeat(padding);

  // Build header
  const header = JSON.stringify({ freq: freqMap, padding });
  const headerBytes = new TextEncoder().encode(header);

  // Data bytes
  const dataLen = padded.length / 8;
  const totalLen = 4 + headerBytes.length + dataLen;
  const result = new Uint8Array(totalLen);

  // Write header length as 4-byte big-endian uint32
  const view = new DataView(result.buffer);
  view.setUint32(0, headerBytes.length, false);

  // Write header
  result.set(headerBytes, 4);

  // Write data bytes
  for (let i = 0; i < dataLen; i++) {
    const byteStr = padded.substring(i * 8, i * 8 + 8);
    result[4 + headerBytes.length + i] = parseInt(byteStr, 2);
  }

  return result;
}

/**
 * Unpack a Uint8Array back into a bit-string and frequency map.
 * @param {Uint8Array} data
 * @returns {{ bitString: string, freqMap: Object }}
 */
export function unpack(data) {
  const view = new DataView(data.buffer);
  const headerLen = view.getUint32(0, false);

  // Read header
  const headerBytes = data.slice(4, 4 + headerLen);
  const header = JSON.parse(new TextDecoder().decode(headerBytes));

  // Read data bytes → bit-string
  const dataStart = 4 + headerLen;
  let bitString = '';
  for (let i = dataStart; i < data.length; i++) {
    bitString += data[i].toString(2).padStart(8, '0');
  }

  // Remove padding
  if (header.padding > 0) {
    bitString = bitString.slice(0, -header.padding);
  }

  return { bitString, freqMap: header.freq };
}

/** Trigger a file download in the browser. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
