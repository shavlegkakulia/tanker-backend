import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

export function TestSafeThrottle(options: Record<string, any>) {
  if (process.env.NODE_ENV === 'test') {
    return applyDecorators(); // დააბრუნე ცარიელი დეკორატორი ტესტის დროს
  }

  return applyDecorators(Throttle(options));
}
