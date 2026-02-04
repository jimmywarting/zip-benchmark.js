// Shims for Node.js APIs in the browser
import { Buffer } from 'buffer'
import process from 'process/browser.js'

// Set up globals
globalThis.Buffer = Buffer
globalThis.process = process

// Polyfill setImmediate for browser environments
// yauzl uses setImmediate which is Node.js-specific
if (typeof globalThis.setImmediate === 'undefined') {
  globalThis.setImmediate = function(callback, ...args) {
    return setTimeout(callback, 0, ...args)
  }
}

if (typeof globalThis.clearImmediate === 'undefined') {
  globalThis.clearImmediate = function(id) {
    return clearTimeout(id)
  }
}

export { Buffer, process }
