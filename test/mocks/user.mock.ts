export const testUserMock = {
  username: 'testuser',
  email: 'test@example.com',
};

export const testUserMockWithPassword = {
  ...testUserMock,
  password: 'Password123!',
};

export const testUserMockWithId = {
  ...testUserMock,
  id: 1,
};

export const testUserMockWithIdAndPassword = {
  ...testUserMockWithId,
  password: 'Password123!',
};

export const testUserEntity = {
  ...testUserMockWithId,
  passwordHash: 'hashed_password_value',
};
