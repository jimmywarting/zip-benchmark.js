import Reader from 'zip-go/lib/read.js'
import { openAsBlob } from 'node:fs'
import yauzl from 'yauzl'
import { promisify } from 'node:util'
import { createWriteStream, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const yauzlOpen = promisify(yauzl.open)

// Helper function for memory usage
function getMemoryUsage() {
  const usage = process.memoryUsage()
  return {
    rss: (usage.rss / 1024 / 1024).toFixed(2),
    heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(2),
    heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(2)
  }
}

// Test 1: Read central directory (metadata for all files)
async function testReadCentralDirectory(zipPath) {
  console.log('\n📋 Test 1: Read central directory')
  
  // zip-go
  const memBefore1 = getMemoryUsage()
  const start1 = performance.now()
  const blob = await openAsBlob(zipPath)
  let count1 = 0
  for await (const entry of Reader(blob)) {
    count1++
    // Read only metadata, no data
  }
  const end1 = performance.now()
  const memAfter1 = getMemoryUsage()
  
  // yauzl
  const memBefore2 = getMemoryUsage()
  const start2 = performance.now()
  let count2 = 0
  await new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err)
      
      zipfile.readEntry()
      zipfile.on('entry', (entry) => {
        count2++
        zipfile.readEntry()
      })
      zipfile.on('end', resolve)
      zipfile.on('error', reject)
    })
  })
  const end2 = performance.now()
  const memAfter2 = getMemoryUsage()
  
  console.log(`zip-go: ${(end1 - start1).toFixed(2)}ms, ${count1} entries, heap: ${memAfter1.heapUsed}MB`)
  console.log(`yauzl:  ${(end2 - start2).toFixed(2)}ms, ${count2} entries, heap: ${memAfter2.heapUsed}MB`)
  console.log(`Winner: ${end1 - start1 < end2 - start2 ? 'zip-go 🏆' : 'yauzl 🏆'}`)
}

// Test 2: Read all files to memory (arrayBuffer)
async function testReadAllToMemory(zipPath) {
  console.log('\n💾 Test 2: Read all files to memory')
  
  // zip-go
  global.gc && global.gc() // Force GC if --expose-gc is used
  const memBefore1 = getMemoryUsage()
  const start1 = performance.now()
  const blob = await openAsBlob(zipPath)
  const data1 = []
  for await (const entry of Reader(blob)) {
    if (!entry.directory) {
      const buffer = await entry.arrayBuffer()
      data1.push(buffer)
    }
  }
  const end1 = performance.now()
  const memAfter1 = getMemoryUsage()
  
  // yauzl
  global.gc && global.gc()
  const memBefore2 = getMemoryUsage()
  const start2 = performance.now()
  const data2 = []
  await new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err)
      
      zipfile.readEntry()
      zipfile.on('entry', (entry) => {
        if (entry.fileName.endsWith('/')) {
          zipfile.readEntry()
        } else {
          zipfile.openReadStream(entry, (err, stream) => {
            if (err) return reject(err)
            const chunks = []
            stream.on('data', chunk => chunks.push(chunk))
            stream.on('end', () => {
              data2.push(Buffer.concat(chunks))
              zipfile.readEntry()
            })
          })
        }
      })
      zipfile.on('end', resolve)
      zipfile.on('error', reject)
    })
  })
  const end2 = performance.now()
  const memAfter2 = getMemoryUsage()
  
  console.log(`zip-go: ${(end1 - start1).toFixed(2)}ms, ${data1.length} files, heap: ${memAfter1.heapUsed}MB`)
  console.log(`yauzl:  ${(end2 - start2).toFixed(2)}ms, ${data2.length} files, heap: ${memAfter2.heapUsed}MB`)
  console.log(`Winner: ${end1 - start1 < end2 - start2 ? 'zip-go 🏆' : 'yauzl 🏆'}`)
}

// Test 3: Stream to disk (most realistic)
async function testStreamToDisk(zipPath, outputDir) {
  console.log('\n💿 Test 3: Stream all files to disk')
  
  // Clean up and create output directories
  rmSync(outputDir + '-zipgo', { recursive: true, force: true })
  rmSync(outputDir + '-yauzl', { recursive: true, force: true })
  mkdirSync(outputDir + '-zipgo', { recursive: true })
  mkdirSync(outputDir + '-yauzl', { recursive: true })
  
  // zip-go
  const memBefore1 = getMemoryUsage()
  const start1 = performance.now()
  const blob = await openAsBlob(zipPath)
  let fileCount1 = 0
  for await (const entry of Reader(blob)) {
    if (!entry.directory) {
      const stream = entry.stream()
      const outputPath = join(outputDir + '-zipgo', entry.name)
      mkdirSync(join(outputPath, '..'), { recursive: true })
      
      const writeStream = createWriteStream(outputPath)
      await stream.pipeTo(new WritableStream({
        write(chunk) {
          return new Promise((resolve, reject) => {
            if (!writeStream.write(chunk)) {
              writeStream.once('drain', resolve)
            } else {
              resolve()
            }
          })
        },
        close() {
          return new Promise((resolve) => writeStream.end(resolve))
        }
      }))
      fileCount1++
    }
  }
  const end1 = performance.now()
  const memAfter1 = getMemoryUsage()
  
  // yauzl
  const memBefore2 = getMemoryUsage()
  const start2 = performance.now()
  let fileCount2 = 0
  await new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err)
      
      zipfile.readEntry()
      zipfile.on('entry', (entry) => {
        if (entry.fileName.endsWith('/')) {
          zipfile.readEntry()
        } else {
          zipfile.openReadStream(entry, (err, stream) => {
            if (err) return reject(err)
            const outputPath = join(outputDir + '-yauzl', entry.fileName)
            mkdirSync(join(outputPath, '..'), { recursive: true })
            
            const writeStream = createWriteStream(outputPath)
            stream.pipe(writeStream)
            writeStream.on('close', () => {
              fileCount2++
              zipfile.readEntry()
            })
          })
        }
      })
      zipfile.on('end', resolve)
      zipfile.on('error', reject)
    })
  })
  const end2 = performance.now()
  const memAfter2 = getMemoryUsage()
  
  console.log(`zip-go: ${(end1 - start1).toFixed(2)}ms, ${fileCount1} files, heap: ${memAfter1.heapUsed}MB`)
  console.log(`yauzl:  ${(end2 - start2).toFixed(2)}ms, ${fileCount2} files, heap: ${memAfter2.heapUsed}MB`)
  console.log(`Winner: ${end1 - start1 < end2 - start2 ? 'zip-go 🏆' : 'yauzl 🏆'}`)
  
  // Clean up
  rmSync(outputDir + '-zipgo', { recursive: true, force: true })
  rmSync(outputDir + '-yauzl', { recursive: true, force: true })
}

// Test 4: Read a specific file (random access)
async function testReadSpecificFile(zipPath, targetFile) {
  console.log('\n🎯 Test 4: Find and read a specific file')
  
  // zip-go
  const start1 = performance.now()
  const blob = await openAsBlob(zipPath)
  let found1 = null
  for await (const entry of Reader(blob)) {
    if (entry.name === targetFile) {
      found1 = await entry.text()
      break
    }
  }
  const end1 = performance.now()
  
  // yauzl
  const start2 = performance.now()
  let found2 = null
  await new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err)
      
      zipfile.readEntry()
      zipfile.on('entry', (entry) => {
        if (entry.fileName === targetFile) {
          zipfile.openReadStream(entry, (err, stream) => {
            if (err) return reject(err)
            const chunks = []
            stream.on('data', chunk => chunks.push(chunk))
            stream.on('end', () => {
              found2 = Buffer.concat(chunks).toString()
              zipfile.close()
              resolve()
            })
          })
        } else {
          zipfile.readEntry()
        }
      })
      zipfile.on('end', resolve)
      zipfile.on('error', reject)
    })
  })
  const end2 = performance.now()
  
  console.log(`zip-go: ${(end1 - start1).toFixed(2)}ms, found: ${!!found1}`)
  console.log(`yauzl:  ${(end2 - start2).toFixed(2)}ms, found: ${!!found2}`)
  console.log(`Winner: ${end1 - start1 < end2 - start2 ? 'zip-go 🏆' : 'yauzl 🏆'}`)
}

// Main function
async function runBenchmarks() {
  const zipPath = process.argv[2]
  const targetFile = process.argv[3]
  
  if (!zipPath) {
    console.log('Usage: node benchmark.js <path-to-zip> [specific-file-name]')
    process.exit(1)
  }
  
  console.log('🏁 Performance Test: yauzl vs zip-go')
  console.log('=====================================')
  console.log(`Test file: ${zipPath}`)
  
  await testReadCentralDirectory(zipPath)
  await testReadAllToMemory(zipPath)
  await testStreamToDisk(zipPath, './test-output')
  
  if (targetFile) {
    await testReadSpecificFile(zipPath, targetFile)
  }
  
  console.log('\n✅ All tests complete!')
}

runBenchmarks().catch(console.error)
