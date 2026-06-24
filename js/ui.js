
import { buildFrequencyMap, buildHuffmanTree, generateCodes, encode, decode } from './huffman.js';
import { pack, unpack, downloadBlob } from './binaryFile.js';

let uploadedFile = null;

const $ = (id) => document.getElementById(id);

/** Initialise all UI event listeners. */
export function initUI() {
  const fileInput = $('file-input');
  const btnSubmit = $('btn-submit');
  const btnCompress = $('btn-compress');
  const btnDecompress = $('btn-decompress');
  const btnRestart = $('btn-restart');
  const status = $('status-text');

  // --- File selection ---
  fileInput.addEventListener('change', () => {
    uploadedFile = fileInput.files[0] || null;
    if (uploadedFile) {
      showStatus(`Selected: ${uploadedFile.name}`, 'info');
    }
  });

  btnSubmit.addEventListener('click', () => {
    if (!uploadedFile) {
      showStatus('Please choose a file first.', 'error');
      return;
    }
    showStatus(`"${uploadedFile.name}" ready — choose Compress or Decompress.`, 'info');
    // Enable action buttons visually
    btnCompress.disabled = false;
    btnDecompress.disabled = false;
  });

  // --- Compress ---
  btnCompress.addEventListener('click', async () => {
    if (!uploadedFile) {
      showStatus('Upload a file first.', 'error');
      return;
    }

    // Warn if file is smaller than 1 KB
    if (uploadedFile.size < 1024) {
      const proceed = await showWarning(uploadedFile.size);
      if (!proceed) return;
    }

    try {
      showStatus('Compressing…', 'info');

      const text = await readFileAsText(uploadedFile);
      if (text.length === 0) {
        showStatus('File is empty — nothing to compress.', 'error');
        return;
      }

      const freqMap = buildFrequencyMap(text);
      const tree = buildHuffmanTree(freqMap);
      const codes = generateCodes(tree);
      const bits = encode(text, codes);
      const packed = pack(bits, freqMap);

      const originalSize = new Blob([text]).size;
      const compressedSize = packed.byteLength;
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      const blob = new Blob([packed], { type: 'application/octet-stream' });
      const baseName = uploadedFile.name.replace(/\.[^.]+$/, '');
      downloadBlob(blob, `${baseName}.huff`);

      showStatus(
        `Compressed! ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${ratio}% smaller)`,
        'success'
      );
    } catch (err) {
      showStatus(`Error: ${err.message}`, 'error');
    }
  });

  // --- Decompress ---
  btnDecompress.addEventListener('click', async () => {
    if (!uploadedFile) {
      showStatus('Upload a .huff file first.', 'error');
      return;
    }
    try {
      showStatus('Decompressing…', 'info');

      const buffer = await readFileAsArrayBuffer(uploadedFile);
      const data = new Uint8Array(buffer);
      const { bitString, freqMap } = unpack(data);

      const tree = buildHuffmanTree(freqMap);
      const text = decode(bitString, tree);

      const blob = new Blob([text], { type: 'text/plain' });
      const baseName = uploadedFile.name.replace(/\.[^.]+$/, '');
      downloadBlob(blob, `${baseName}_decompressed.txt`);

      showStatus(
        `Decompressed! ${formatBytes(data.byteLength)} → ${formatBytes(new Blob([text]).size)}`,
        'success'
      );
    } catch (err) {
      showStatus(`Error: ${err.message}`, 'error');
    }
  });

  // --- Restart ---
  btnRestart.addEventListener('click', () => {
    uploadedFile = null;
    fileInput.value = '';
    showStatus('', 'info');
  });
}

// --- Helpers ---

function showStatus(msg, type) {
  const el = $('status-text');
  if (!el) return;
  el.textContent = msg;
  el.className = 'text-sm mt-2 min-h-[1.25rem] ';
  if (type === 'error') el.className += 'text-red-600';
  else if (type === 'success') el.className += 'text-green-700';
  else el.className += 'text-gray-500';
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function showWarning(sizeInBytes) {
  return new Promise((resolve) => {
    const modal = $('warning-modal');
    $('warning-title').textContent = `WARNING: The uploaded file is very small in size (${sizeInBytes} bytes) !`;
    $('warning-line1').textContent = 'The compressed file might be larger in size than the uncompressed file (compression ratio might be smaller than one).';
    $('warning-line2').textContent = 'Better compression ratios are achieved for larger file sizes!';
    $('warning-line3').textContent = '';

    const okBtn = $('warning-ok');
    modal.showModal();

    function handleOk() {
      okBtn.removeEventListener('click', handleOk);
      modal.close();
      resolve(true);
    }
    okBtn.addEventListener('click', handleOk);

    modal.addEventListener('cancel', () => {
      resolve(false);
    }, { once: true });
  });
}
