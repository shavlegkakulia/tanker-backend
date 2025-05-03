// jwt-auth.guard.spec.ts
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

// 📌 ვაკეთებთ Mock-ს AuthGuard-ის ნაცვლად
jest.mock('@nestjs/passport', () => ({
  AuthGuard: () =>
    class {
      canActivate = jest.fn(() => true);
    },
}));

describe('JwtAuthGuard', () => {
  it('should return true from canActivate', async () => {
    const guard = new JwtAuthGuard();

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
