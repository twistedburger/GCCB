const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('not wrapped in act')) return;
  originalError(...args);
};