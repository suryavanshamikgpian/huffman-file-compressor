# Huffman File Compressor

A browser-based file compressor and decompressor using the **Huffman coding** algorithm. Built with plain HTML, Tailwind CSS, and vanilla JavaScript (ES modules).

## How It Works

1. **Upload** a text file (`.txt`, `.csv`, `.json`, etc.)
2. **Choose** to Compress or Decompress
3. **Download** the result automatically

### Compression

- Reads the text and counts character frequencies
- Builds a Huffman tree using a min-heap priority queue
- Generates optimal variable-length binary codes for each character
- Packs the encoded bits + frequency table into a `.huff` binary file

### Decompression

- Reads a `.huff` file and extracts the frequency table + encoded bits
- Rebuilds the Huffman tree from the stored frequencies
- Decodes the bit-string back into the original text
- Downloads the result as a `.txt` file

## Project Structure

```
huffman-file-compressor/
├── index.html            # Main page
├── style.css             # Base styles
├── app.js                # Entry point
├── js/
│   ├── priorityQueue.js  # Min-heap priority queue
│   ├── huffman.js        # Huffman tree, encode, decode
│   ├── binaryFile.js     # Binary packing/unpacking + download
│   └── ui.js             # DOM event handling
├── assets/
│   └── icon.svg          # Favicon
└── README.md
```

## Running Locally

Just open `index.html` in a modern browser. No build tools or server required.

> **Note:** If you open the file directly (`file://`), ES module imports may be blocked by CORS. Use a simple local server instead:
>
> ```bash
> npx -y serve .
> ```

## Algorithm Complexity

| Operation      | Time          | Space        |
|---------------|---------------|--------------|
| Frequency map | O(n)          | O(k)         |
| Build tree    | O(k log k)    | O(k)         |
| Generate codes| O(k)          | O(k)         |
| Encode        | O(n)          | O(n)         |
| Decode        | O(n)          | O(n)         |

Where `n` = text length, `k` = unique characters.

## .huff File Format

```
[4 bytes]   Header length (uint32, big-endian)
[N bytes]   JSON header: { freq: {...}, padding: <int> }
[M bytes]   Packed binary data (Huffman-encoded bits)
```

## License

MIT
