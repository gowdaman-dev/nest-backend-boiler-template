import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject('AUTH_USER_SERVICE') private userService: any,
  ) {}

  generateTokens(user: any) {
    const payload = {
      sub: user.id,
      employeeId: user.employeeId,
      email: user.email,
      provider: user.provider,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '15m',
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async loginLocal(userId: string, password: string) {
    const user = await this.userService.validateUser(userId, password);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  async loginAzure(accessToken: string) {
    const azureUser = await this.getAzureUser(accessToken);

    const employeeId = azureUser.employeeId || azureUser.id;

    let user = await this.userService.findByEmployeeId(employeeId);

    if (!user) {
      user = await this.userService.createAzureUser({
        employeeId,
        email: azureUser.mail || azureUser.userPrincipalName,
        name: azureUser.displayName,
      });
    }

    return this.generateTokens(user);
  }

  private async getAzureUser(token: string) {
    const res = await fetch(
      'https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,employeeId',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) {
      throw new UnauthorizedException('Invalid Azure token');
    }

    return res.json();
  }
}
