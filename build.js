#!/usr/bin/env node
import * as esbuild from 'esbuild'
import { readFile } from 'node:fs/promises'

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
console.log('✅ Build complete!')
