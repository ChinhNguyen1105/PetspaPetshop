import { RestStatus } from 'src/common/base/rest-status.enum';

export class RestData<T> {
  status: RestStatus;
  message?: T;
  data?: T;

  constructor(data: T);
  constructor(status: RestStatus, message?: T, data?: T);
  constructor(
    statusOrData: RestStatus | T,
    message?: T,
    data?: T,
  ) {
    if (arguments.length >= 2) {
      this.status = statusOrData as RestStatus;
      this.message = message;
      this.data = data;
      return;
    }

    this.status = RestStatus.SUCCESS;
    this.data = statusOrData as T;
  }

  static error<T>(message: T): RestData<T> {
    return new RestData<T>(
      RestStatus.ERROR,
      message,
      undefined,
    );
  }
}
