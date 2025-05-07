import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const config = new DocumentBuilder()
    .setTitle('Tasker')
    .setDescription('API documentation')
    .setVersion('1.0.1')
    .addBearerAuth() // თუ JWT გაქვს
    .build();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // ✅ აუცილებელია რომ cookie იმუშაოს
  app.enableCors({
    origin: 'http://localhost:3000', // ან შენი ფრონტის დომენი
    credentials: true,
  });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // <<< ეს აუცილებლად უნდა იყოს ჩართული!
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.setGlobalPrefix('api/v1');
  await app.listen(3000);
}

bootstrap();
