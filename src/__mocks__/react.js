module.exports = {
  cache: jest.fn((fn) => fn), // Just return the function as-is for testing
};
