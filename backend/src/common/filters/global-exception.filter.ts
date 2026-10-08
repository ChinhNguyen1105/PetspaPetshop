import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import {
  BadRequestException as CustomBadRequestException,
} from 'src/common/exceptions/bad-request.exception';
import {
  ConflictException as CustomConflictException,
} from 'src/common/exceptions/conflict.exception';
import {
  ForbiddenException as CustomForbiddenException,
} from 'src/common/exceptions/forbidden.exception';
import {
  InternalServerException as CustomInternalServerException,
} from 'src/common/exceptions/internal-server.exception';
import {
  InvalidException as CustomInvalidException,
} from 'src/common/exceptions/invalid.exception';
import {
  NotFoundException as CustomNotFoundException,
} from 'src/common/exceptions/not-found.exception';
import {
  UnauthorizedException as CustomUnauthorizedException,
} from 'src/common/exceptions/unauthorized.exception';
import {
  UploadFileException as CustomUploadFileException,
} from 'src/common/exceptions/upload-file.exception';
import { VsException } from 'src/common/exceptions/vs.exception';
import { RestData } from 'src/common/base/rest-data';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof CustomNotFoundException) {
      this.sendCustomException(response, exception);
      return;
    }

    if (exception instanceof CustomInvalidException) {
      this.sendCustomException(response, exception);
      return;
    }

    if (exception instanceof CustomBadRequestException) {
      this.sendCustomException(response, exception);
      return;
    }

    if (exception instanceof CustomInternalServerException) {
      this.sendCustomException(response, exception);
      return;
    }

    if (exception instanceof CustomUploadFileException) {
      this.sendCustomException(response, exception);
      return;
    }

    if (exception instanceof CustomUnauthorizedException) {
      this.sendCustomException(response, exception);
      return;
    }

    if (exception instanceof CustomForbiddenException) {
      this.sendCustomException(response, exception);
      return;
    }

    if (exception instanceof CustomConflictException) {
      this.sendCustomException(response, exception);
      return;
    }

    if (exception instanceof VsException) {
      this.sendVsException(response, exception);
      return;
    }

    if (exception instanceof HttpException) {
      this.handleHttpException(response, exception);
      return;
    }

    this.sendResponse(
      response,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
    );
  }

  private sendCustomException(
    response: Response,
    exception:
      | CustomNotFoundException
      | CustomInvalidException
      | CustomBadRequestException
      | CustomInternalServerException
      | CustomUploadFileException
      | CustomUnauthorizedException
      | CustomForbiddenException
      | CustomConflictException,
  ): void {
    this.sendResponse(
      response,
      exception.getStatus(),
      exception.message,
    );
  }

  private sendVsException(
    response: Response,
    exception: VsException,
  ): void {
    this.sendResponse(
      response,
      exception.getStatus(),
      exception.getErrMessage(),
    );
  }

  private handleHttpException(
    response: Response,
    exception: HttpException,
  ): void {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: unknown = exception.message;

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const responseObject = exceptionResponse as Record<string, unknown>;

      if (responseObject.message !== undefined) {
        message = responseObject.message;
      }
    }

    this.sendResponse(response, status, message);
  }

  private sendResponse(
    response: Response,
    status: number,
    message: unknown,
  ): void {
    const body = RestData.error(message);

    response.status(status).json(body);
  }
}
