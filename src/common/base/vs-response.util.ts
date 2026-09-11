import { HttpStatus } from '@nestjs/common';
import { RestData } from 'src/common/base/rest-data';

export class VsResponseUtil {
  static success<T>(
    data: T,
  ): { statusCode: HttpStatus; body: RestData<T> } {
    return this.successWithStatus(HttpStatus.OK, data);
  }

  static successWithStatus<T>(
    status: HttpStatus,
    data: T,
  ): { statusCode: HttpStatus; body: RestData<T> } {
    const response = new RestData<T>(data);

    return {
      statusCode: status,
      body: response,
    };
  }

  static error<T>(
    status: HttpStatus,
    message: T,
  ): { statusCode: HttpStatus; body: RestData<T> } {
    const response = RestData.error(message);

    return {
      statusCode: status,
      body: response,
    };
  }
}
