export const mockConfigService = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'JWT_REFRESH_SECRET':
        return 'test-refresh-secret';
      case 'JWT_REFRESH_EXPIRES_IN':
        return '7d';
      default:
        return null;
    }
  }),
};
