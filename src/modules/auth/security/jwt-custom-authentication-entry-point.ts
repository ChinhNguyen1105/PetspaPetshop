import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { RestData } from 'src/common/base/rest-data';

@Catch(UnauthorizedException)
export class JwtCustomAuthenticationEntryPoint
  implements ExceptionFilter
{
  catch(
    exception: UnauthorizedException,
    host: ArgumentsHost,
  ): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    console.log(
      `>>> EntryPoint blocked request: ${request.originalUrl}`,
    );

    console.log(
      `>>> Exception detail: ${exception.message}`,
    );

    const message =
      "You don't have permission to access this resource";

    response
      .status(HttpStatus.UNAUTHORIZED)
      .json(RestData.error(message));
  }
}
