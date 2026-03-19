export interface AuthModuleOptions {
  jwtSecret: string;
  jwtExpiresIn: string;

  azure?: {
    tenantId: string;
    clientId: string;
  };
}
