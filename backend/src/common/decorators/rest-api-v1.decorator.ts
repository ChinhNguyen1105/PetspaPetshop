import { applyDecorators, Controller } from '@nestjs/common';

export function RestApiV1(): ClassDecorator {
  return applyDecorators(
    Controller('api/v1'),
  );
}
