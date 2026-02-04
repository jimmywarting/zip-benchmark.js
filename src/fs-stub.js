// Empty fs stub for browser - yauzl.fromBuffer doesn't actually use fs
// Only the open/fromFd methods use fs, which we don't use in the browser
export const open = () => { throw new Error('fs.open not supported in browser') }
export const close = () => { throw new Error('fs.close not supported in browser') }
export const read = () => { throw new Error('fs.read not supported in browser') }
export const fstat = () => { throw new Error('fs.fstat not supported in browser') }
