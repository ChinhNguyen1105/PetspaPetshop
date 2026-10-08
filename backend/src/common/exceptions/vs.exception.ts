import { HttpStatus } from '@nestjs/common';

export class VsException extends Error {
  private readonly errMessage: unknown;
  private readonly status: HttpStatus;
  private readonly params?: string[];

  constructor(errMessage: unknown);
  constructor(status: HttpStatus, errMessage: unknown);
  constructor(errMessage: unknown, params: string[]);
  constructor(
    status: HttpStatus,
    errMessage: unknown,
    params: string[],
  );
  constructor(
    statusOrMessage: HttpStatus | unknown,
    messageOrParams?: unknown,
    params?: string[],
  ) {
    let status: HttpStatus;
    let errMessage: unknown;
    let exceptionParams: string[] | undefined;

    if (typeof statusOrMessage === 'number') {
      status = statusOrMessage as HttpStatus;
      errMessage = messageOrParams;
      exceptionParams = params;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errMessage = statusOrMessage;

      if (Array.isArray(messageOrParams)) {
        exceptionParams = messageOrParams;
      }
    }

    super(typeof errMessage === 'string' ? errMessage : String(errMessage));

    this.name = 'VsException';
    this.status = status;
    this.errMessage = errMessage;
    this.params = exceptionParams;
  }

  getErrMessage(): unknown {
    return this.errMessage;
  }

  getStatus(): HttpStatus {
    return this.status;
  }

  getParams(): string[] | undefined {
    return this.params;
  }
}
