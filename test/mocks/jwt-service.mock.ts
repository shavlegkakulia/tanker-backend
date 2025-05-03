export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked_token'),
  verifyAsync: jest.fn(),
};
