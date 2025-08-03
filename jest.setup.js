// Polyfill setImmediate for Jest environment
// Winston requires setImmediate which is not available in jsdom
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => {
    return setTimeout(callback, 0, ...args);
  };
}

if (typeof clearImmediate === 'undefined') {
  global.clearImmediate = (id) => {
    return clearTimeout(id);
  };
}