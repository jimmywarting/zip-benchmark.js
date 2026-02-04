# ZIP Benchmark

A benchmark comparing the performance of `zip-go` and `yauzl` ZIP libraries for Node.js.

## Installation

```bash
npm install
```

## Usage

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

## Tests

The benchmark runs four different tests:

### 1. 📋 Read Central Directory
Tests the speed of reading metadata for all entries in the ZIP file without extracting data.

### 2. 💾 Read All to Memory
Tests the performance of reading all files into memory as ArrayBuffers.

### 3. 💿 Stream to Disk
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
