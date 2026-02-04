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
Test file: ./test.zip

📋 Test 1: Läs central directory
zip-go: 12.34ms, 100 entries, heap: 25.45MB
yauzl:  15.67ms, 100 entries, heap: 28.91MB
Winner: zip-go 🏆

💾 Test 2: Läs alla filer till minnet
zip-go: 234.56ms, 95 filer, heap: 45.67MB
yauzl:  267.89ms, 95 filer, heap: 48.23MB
Winner: zip-go 🏆

💿 Test 3: Stream alla filer till disk
zip-go: 345.67ms, 95 filer, heap: 35.12MB
yauzl:  378.90ms, 95 filer, heap: 36.78MB
Winner: zip-go 🏆

✅ Alla tester klara!
```

## Requirements

- Node.js >= 18.0.0

## License

MIT
