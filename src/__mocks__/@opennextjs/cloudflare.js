module.exports = {
  getCloudflareContext: jest.fn(() => ({
    env: {
      DB: 'mock-d1-database'
    }
  }))
};
