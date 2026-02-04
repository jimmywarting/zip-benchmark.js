#!/usr/bin/env node
import * as esbuild from 'esbuild'
import { readFile, writeFile, stat } from 'node:fs/promises'

const packageJson = JSON.parse(await readFile('./package.json', 'utf-8'))

const sharedConfig = {
  entryPoints: ['src/browser-entry.js'],
  bundle: true,
  platform: 'browser',
  target: 'es2022',
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis'
  },
  // Polyfills for Node.js built-ins
  alias: {
    'fs': './src/fs-stub.js',
    'zlib': 'browserify-zlib',
    'stream': 'stream-browserify',
    'util': 'util',
    'events': 'events',
    'buffer': 'buffer'
  },
  inject: ['./src/shims.js']
}

// Build ESM version
await esbuild.build({
  ...sharedConfig,
  format: 'esm',
  outfile: 'dist/zip-benchmark.esm.js',
  banner: {
    js: `/**
 * zip-benchmark.js v${packageJson.version}
 * Browser bundle for zip-go and yauzl
 * @license MIT
 */`
  }
})

console.log('✅ Built dist/zip-benchmark.esm.js')

// Build IIFE version for direct script tag usage
await esbuild.build({
  ...sharedConfig,
  format: 'iife',
  globalName: 'ZipBenchmark',
  outfile: 'dist/zip-benchmark.iife.js',
  banner: {
    js: `/**
 * zip-benchmark.js v${packageJson.version}
 * Browser bundle for zip-go and yauzl
 * @license MIT
 */`
  }
})

console.log('✅ Built dist/zip-benchmark.iife.js')

// Build zip-go only bundle (minimal, no Node.js dependencies)
await esbuild.build({
  entryPoints: ['src/zipgo-only.js'],
  bundle: true,
  platform: 'browser',
  target: 'es2022',
  sourcemap: false,
  format: 'esm',
  outfile: 'dist/zipgo-only.js',
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis'
  }
})

const zipgoStats = await stat('dist/zipgo-only.js')
console.log(`✅ Built dist/zipgo-only.js (${zipgoStats.size} bytes)`)

// Build minified zip-go bundle
await esbuild.build({
  entryPoints: ['src/zipgo-only.js'],
  bundle: true,
  platform: 'browser',
  target: 'es2022',
  sourcemap: false,
  format: 'esm',
  outfile: 'dist/zipgo-only.min.js',
  minify: true,
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis'
  }
})

const zipgoMinStats = await stat('dist/zipgo-only.min.js')
console.log(`✅ Built dist/zipgo-only.min.js (${zipgoMinStats.size} bytes)`)

// Build yauzl only bundle (with all Node.js polyfills)
const yauzlResult = await esbuild.build({
  entryPoints: ['src/yauzl-only.js'],
  bundle: true,
  platform: 'browser',
  target: 'es2022',
  sourcemap: false,
  format: 'esm',
  outfile: 'dist/yauzl-only.js',
  metafile: true,
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis'
  },
  alias: {
    'fs': './src/fs-stub.js',
    'zlib': 'browserify-zlib',
    'stream': 'stream-browserify',
    'util': 'util',
    'events': 'events',
    'buffer': 'buffer'
  },
  inject: ['./src/shims.js']
})

const yauzlStats = await stat('dist/yauzl-only.js')
console.log(`✅ Built dist/yauzl-only.js (${yauzlStats.size} bytes)`)

// Build minified yauzl bundle
await esbuild.build({
  entryPoints: ['src/yauzl-only.js'],
  bundle: true,
  platform: 'browser',
  target: 'es2022',
  sourcemap: false,
  format: 'esm',
  outfile: 'dist/yauzl-only.min.js',
  minify: true,
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis'
  },
  alias: {
    'fs': './src/fs-stub.js',
    'zlib': 'browserify-zlib',
    'stream': 'stream-browserify',
    'util': 'util',
    'events': 'events',
    'buffer': 'buffer'
  },
  inject: ['./src/shims.js']
})

const yauzlMinStats = await stat('dist/yauzl-only.min.js')
console.log(`✅ Built dist/yauzl-only.min.js (${yauzlMinStats.size} bytes)`)

// Analyze dependencies from metafile
const yauzlInputs = Object.keys(yauzlResult.metafile.inputs)
  .filter(input => input.includes('node_modules'))
  .map(input => {
    const match = input.match(/node_modules\/([^\/]+)/)
    return match ? match[1] : null
  })
  .filter(Boolean)

const uniqueYauzlDeps = [...new Set(yauzlInputs)].sort()

console.log(`   Dependencies: ${uniqueYauzlDeps.length} packages`)

// Generate bundle size data for the browser benchmark
const bundleData = {
  zipgo: {
    size: zipgoStats.size,
    minified: zipgoMinStats.size,
    dependencies: [],
    npmPackages: []
  },
  yauzl: {
    size: yauzlStats.size,
    minified: yauzlMinStats.size,
    dependencies: [
      'buffer',
      'stream-browserify',
      'events',
      'util',
      'browserify-zlib',
      'process'
    ],
    npmPackages: uniqueYauzlDeps
  },
  penalty: zipgoStats.size > 0 ? ((yauzlStats.size - zipgoStats.size) / zipgoStats.size * 100).toFixed(1) : '0',
  penaltyMinified: zipgoMinStats.size > 0 ? ((yauzlMinStats.size - zipgoMinStats.size) / zipgoMinStats.size * 100).toFixed(1) : '0',
  generated: new Date().toISOString()
}

await writeFile('dist/bundle-sizes.json', JSON.stringify(bundleData, null, 2))
console.log('✅ Generated dist/bundle-sizes.json')

console.log('\n📊 Bundle Size Comparison:')
console.log(`   zip-go:  ${(zipgoStats.size / 1024).toFixed(2)} KB (minified: ${(zipgoMinStats.size / 1024).toFixed(2)} KB)`)
console.log(`   yauzl:   ${(yauzlStats.size / 1024).toFixed(2)} KB (minified: ${(yauzlMinStats.size / 1024).toFixed(2)} KB)`)
console.log(`   Penalty: ${bundleData.penalty}% larger (minified: ${bundleData.penaltyMinified}% larger)`)
console.log(`\n📦 yauzl brings in ${uniqueYauzlDeps.length} npm packages:`)
console.log(`   ${uniqueYauzlDeps.join(', ')}`)
console.log('\n✅ Build complete!')
