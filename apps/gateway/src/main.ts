import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import {
  ConsoleLogger,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
async function bootstrap() {
  const app = await NestFactory.create(GatewayModule, {
    logger: new ConsoleLogger({
      prefix: 'Gateway',
      colors: true,
      logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
      timestamp: true,
    }),
  });
  const scalarconfig = new DocumentBuilder()
    .setTitle('Enterprise API Gateway')
    .setDescription('The enterprise API gateway description')
    .setVersion('1.0')
    .addTag('enterprise')
    .addGlobalParameters({
      name: 'X-API-Version',
      in: 'header',
      required: true,
      schema: {
        type: 'string',
        example: '1',
      },
    })
    .build();
  const document = SwaggerModule.createDocument(app, scalarconfig);
  const config = app.get(ConfigService);
  app.enableCors({
    origin: config.get('ALLOWED_ORIGINS')!,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.use(
    '/reference',
    apiReference({
      theme: 'deepSpace',
      content: document,
      favicon: 'https://nestjs.com/img/logo-small.svg',
      metaData: {
        title: 'Enterprise API Reference',
        description:
          'A comprehensive API reference for enterprise applications built with NestJS.',
      },
      servers: [
        {
          url: 'http://localhost:4000',
          description: 'Local development server',
        },
        {
          url: 'https://api.yourdomain.com',
          description: 'Production server',
        },
      ],
      withDefaultFonts: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(helmet());
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'X-API-Version',
    defaultVersion: '1',
  });
  await app.listen(config.get('PORT')!);
}
bootstrap();
