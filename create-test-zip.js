#!/usr/bin/env node
import { writeFile } from 'node:fs/promises'
import JSZip from 'jszip'

// Create a simple ZIP file for benchmarking
async function createTestZip() {
  const zip = new JSZip()
  
  // Add some test files
  zip.file('hello.txt', 'Hello World!\n')
  zip.file('README.md', '# Test ZIP\n\nThis is a test zip file for benchmarking.\n\nIt contains multiple files for testing different scenarios.\n')
  zip.file('package.json', '{"name":"test","version":"1.0.0","description":"Test package"}\n')
  zip.file('test.js', 'console.log("Hello from JavaScript");\nconst data = [1, 2, 3, 4, 5];\nconsole.log(data);\n')
  zip.file('data.json', JSON.stringify({ 
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  }, null, 2))
  
  // Add a directory with files
  const folder = zip.folder('subfolder')
  folder.file('file.txt', 'File in subfolder\n')
  folder.file('another.txt', 'Another file in subfolder\n')
  
  // Generate the zip file
  const content = await zip.generateAsync({ 
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  })
  
  await writeFile('test.zip', content)
  
  console.log(`✅ Created test.zip (${content.length} bytes)`)
  console.log('   Files: hello.txt, README.md, package.json, test.js, data.json')
  console.log('   Folders: subfolder/ (with 2 files)')
}

createTestZip().catch(console.error)
