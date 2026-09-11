import { HttpStatus } from '@nestjs/common';

export class ForbiddenException extends Error {
  private readonly status: HttpStatus;
  private readonly params?: string[];

  constructor(message: string);
  constructor(status: HttpStatus, message: string);
  constructor(message: string, params: string[]);
  constructor(
    status: HttpStatus,
    message: string,
    params: string[],
  );
  constructor(
    statusOrMessage: HttpStatus | string,
    messageOrParams?: string | string[],
    params?: string[],
  ) {
    let status: HttpStatus;
    let message: string;
    let exceptionParams: string[] | undefined;

    if (typeof statusOrMessage === 'number') {
      status = statusOrMessage as HttpStatus;
      message = messageOrParams as string;
      exceptionParams = params;
    } else {
      status = HttpStatus.FORBIDDEN;
      message = statusOrMessage;

      if (Array.isArray(messageOrParams)) {
        exceptionParams = messageOrParams;
      }
    }

    super(message);

    this.name = 'ForbiddenException';
    this.status = status;
    this.params = exceptionParams;
  }

  getStatus(): HttpStatus {
    return this.status;
  }

  getParams(): string[] | undefined {
    return this.params;
  }
}
