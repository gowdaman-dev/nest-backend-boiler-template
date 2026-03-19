import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './authentication.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({})
export class AuthenticationModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthenticationModule,
      global: true,
      imports: [
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            secret: config.get('JWT_SECRET'),
            signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [
        AuthService,
        JwtStrategy,
        {
          provide: 'AUTH_OPTIONS',
          useValue: options,
        },
      ],
      exports: [AuthService, JwtModule],
    };
  }
}

export interface AuthModuleOptions {
  jwtSecret: string;
  jwtExpiresIn: string;
}
