import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
  private readonly params?: string[];

  constructor(message: string);
  constructor(status: HttpStatus, message: string);
  constructor(message: string, params: string[]);
  constructor(status: HttpStatus, message: string, params: string[]);
  constructor(
    statusOrMessage: HttpStatus | string,
    messageOrParams?: string | string[],
    params?: string[],
  ) {
    let status: HttpStatus;
    let message: string;
    let exceptionParams: string[] | undefined;

    if (typeof statusOrMessage === 'number') {
      status = statusOrMessage;
      message = messageOrParams as string;
      exceptionParams = params;
    } else {
      status = HttpStatus.BAD_REQUEST;
      message = statusOrMessage;

      if (Array.isArray(messageOrParams)) {
        exceptionParams = messageOrParams;
      }
    }

    super(
      {
        statusCode: status,
        message,
        error: status === HttpStatus.BAD_REQUEST ? 'Bad Request' : 'Error',
      },
      status,
    );

    this.name = 'BadRequestException';
    this.params = exceptionParams;
  }

  getParams(): string[] | undefined {
    return this.params;
  }
}
