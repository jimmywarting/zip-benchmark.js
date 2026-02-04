// Browser entry point for bundling zip libraries
import Reader from 'zip-go/lib/read.js'
import yauzl from 'yauzl'
import { Buffer } from 'buffer'

// Export for browser use
export { Reader, yauzl, Buffer }
