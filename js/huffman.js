import { PriorityQueue } from './priorityQueue.js';

/**
 * Huffman coding: build tree, generate codes, encode and decode text.
 */

/** Count character frequencies in a string. */
export function buildFrequencyMap(text) {
  const freq = {};
  for (const ch of text) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return freq;
}

/** Build a Huffman tree from a frequency map. Returns the root node. */
export function buildHuffmanTree(freqMap) {
  const pq = new PriorityQueue();

  for (const [char, freq] of Object.entries(freqMap)) {
    pq.enqueue({ char, freq, left: null, right: null });
  }

  // Edge case: single unique character
  if (pq.size === 1) {
    const only = pq.dequeue();
    return { char: null, freq: only.freq, left: only, right: null };
  }

  while (pq.size > 1) {
    const left = pq.dequeue();
    const right = pq.dequeue();
    pq.enqueue({
      char: null,
      freq: left.freq + right.freq,
      left,
      right,
    });
  }

  return pq.dequeue();
}

/** Generate Huffman codes by traversing the tree. Returns { char: bitString }. */
export function generateCodes(root) {
  const codes = {};

  function traverse(node, code) {
    if (!node) return;
    if (node.char !== null) {
      codes[node.char] = code || '0'; // single-char edge case
      return;
    }
    traverse(node.left, code + '0');
    traverse(node.right, code + '1');
  }

  traverse(root, '');
  return codes;
}

/** Encode text into a binary string using the code table. */
export function encode(text, codes) {
  let bits = '';
  for (const ch of text) {
    bits += codes[ch];
  }
  return bits;
}

/** Decode a binary string back to text using the Huffman tree root. */
export function decode(bits, root) {
  let result = '';
  let node = root;

  // Edge case: tree with single character (left child only)
  if (root.left && root.left.char !== null && root.right === null) {
    const ch = root.left.char;
    for (const b of bits) {
      result += ch;
    }
    return result;
  }

  for (const b of bits) {
    node = b === '0' ? node.left : node.right;
    if (node.char !== null) {
      result += node.char;
      node = root;
    }
  }
  return result;
}
