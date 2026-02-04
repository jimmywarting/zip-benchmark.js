// Shims for Node.js APIs in the browser
import { Buffer } from 'buffer'
import process from 'process/browser.js'

// Set up globals
globalThis.Buffer = Buffer
globalThis.process = process

export { Buffer, process }
