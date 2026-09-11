import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StaticResourcesWebConfiguration {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  getResourceLocation(): string {
    const resourceLocation =
      this.configService.get<string>(
        'hoang.upload-file.resource-location',
      );

    if (!resourceLocation) {
      throw new Error(
        'Missing configuration: hoang.upload-file.resource-location',
      );
    }

    return resourceLocation.endsWith('/')
      ? resourceLocation
      : `${resourceLocation}/`;
  }

  getResourceHandler(): string {
    return '/upload/*';
  }
}
