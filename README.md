# ZIP Benchmark

A benchmark comparing the performance of `zip-go` and `yauzl` ZIP libraries for **Node.js** and **browsers**.

## Features

- 🚀 **Node.js benchmarks** - Traditional file-based testing
- 🌐 **Browser benchmarks** - Compare performance in browsers using esm.sh
- 📊 Multiple test scenarios (metadata, memory, disk, specific file)
- 💾 Memory usage tracking
- 🎯 Fair comparison with memory-based testing

## Installation

```bash
npm install
```

## Building

The browser benchmarks require bundled JavaScript files. Build them with:

```bash
npm run build
```

This creates bundled files in the `dist/` directory that include `zip-go`, `yauzl`, and all necessary Node.js polyfills for browser compatibility.

The bundled files are committed to the repository, so you only need to rebuild if you update dependencies or modify the build configuration.

## Usage

### Node.js Benchmarks

Run the benchmark with a ZIP file:

```bash
node benchmark.js <path-to-zip> [specific-file-name]
```

### Examples

Basic benchmark:
```bash
node benchmark.js ./test.zip
```

Include specific file test:
```bash
node benchmark.js ./test.zip README.md
```

Run with garbage collection exposed (for better memory measurements):
```bash
node --expose-gc benchmark.js ./test.zip
```

Quick test with included test.zip:
```bash
npm run bench:node
```

### Browser Benchmarks

The browser benchmarks allow you to test ZIP library performance directly in your browser.

#### Two Versions Available:

1. **Full Benchmark** (`browser-benchmark.html`) - Compares zip-go and yauzl using esm.sh
2. **Demo** (`browser-demo.html`) - Simple ZIP analyzer without external dependencies

#### Running the Browser Benchmarks

1. **Generate a test ZIP file** (optional, if you don't have one):
   ```bash
   npm run create-test-zip
   ```

2. **Start the local server**:
   ```bash
   npm run serve
   ```

3. **Open your browser**:
   - Online Demo: https://jimmywarting.github.io/zip-benchmark.js/browser-benchmark.html
   - Full benchmark: http://localhost:8080/browser-benchmark.html
   - Demo: http://localhost:8080/browser-demo.html

4. **Select a ZIP file** and click the appropriate button

#### Browser Testing Features

- 📦 **yauzl bundled** - Uses `fromBuffer()` method with bundled Node.js polyfills for browser compatibility
- 🌊 **zip-go native** - Works directly with browser File/Blob objects  
- 🧪 **Fair comparison** - Both libraries read from memory (File object vs ArrayBuffer)
- 🔬 **Browser-specific tests** - Tests optimized for browser environments
- 🎯 **Demo version** - Pure browser implementation with no external dependencies
- 🏗️ **No external CDNs** - All dependencies are bundled locally for reliability

#### Browser Testing Notes

- `yauzl` depends on Node.js built-ins, which are bundled as polyfills for browser compatibility
- `yauzl` uses `fromBuffer()` method to work with ArrayBuffer in browsers
- `zip-go` works natively with browser Blob/File objects
- Both read from memory for fair comparison (not from virtual filesystem)
- Libraries are bundled using esbuild - no external CDN dependencies
- The demo version (`browser-demo.html`) is a lightweight alternative that analyzes ZIP structure without external libraries

> **💡 Side Note:** This benchmark demonstrates what happens when you try to browserify packages built with Node.js dependencies. yauzl requires 51 npm packages and extensive polyfills (buffer, streams, zlib, etc.), resulting in a 4608% larger minified bundle. For better cross-platform compatibility, avoid using Buffer and Node.js streams in libraries intended for browser use. Build with browser-native APIs (Blob, File, ReadableStream) from the start.

## Tests

The benchmark runs four different tests:

### 1. 📋 Read Central Directory
Tests the speed of reading metadata for all entries in the ZIP file without extracting data.

### 2. 💾 Read All to Memory
Tests the performance of reading all files into memory as ArrayBuffers.

### 3. 💿 Stream to Disk (Node.js only)
Tests the real-world scenario of streaming all files to disk. This is the most realistic performance test.

### 4. 🎯 Read Specific File
Tests random access performance by finding and reading a specific file from the archive.

## Output

Each test displays:
- Execution time in milliseconds
- Number of entries/files processed
- Heap memory usage
- Winner of each test

Example output:
```
🏁 Performance Test: yauzl vs zip-go
=====================================
Test file: test.zip

📋 Test 1: Read central directory
zip-go: 2.66ms, 5 entries, heap: 4.68MB
yauzl:  5.38ms, 5 entries, heap: 4.53MB
Winner: zip-go 🏆

💾 Test 2: Read all files to memory
zip-go: 2.22ms, 4 files, heap: 3.97MB
yauzl:  4.11ms, 4 files, heap: 4.06MB
Winner: zip-go 🏆

💿 Test 3: Stream all files to disk
zip-go: 13.12ms, 4 files, heap: 5.07MB
yauzl:  5.02ms, 4 files, heap: 5.25MB
Winner: yauzl 🏆

🎯 Test 4: Find and read a specific file
zip-go: 0.76ms, found: true
yauzl:  1.07ms, found: true
Winner: zip-go 🏆

✅ All tests complete!
```

## Requirements

- Node.js >= 18.0.0

## License

MIT
