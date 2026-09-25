import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

export const API_PREFIX = 'api';
export const API_DEFAULT_VERSION = '1';

export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX, { exclude: ['health'] });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_DEFAULT_VERSION,
  });
}
