import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  it('should extract and validate payload correctly', async () => {
    const payload = {
      sub: 1,
      email: 'test@example.com',
    };

    const result = await strategy.validate(payload);
    expect(result).toEqual({
      userId: 1,
      email: 'test@example.com',
    });
  });
});
