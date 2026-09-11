import { createHmac } from 'node:crypto';
import { Request } from 'express';

export class VNPayUtil {
  hmacSHA512(key: string, data: string): string {
    try {
      if (key === null || key === undefined || data === null || data === undefined) {
        throw new Error('Key hoặc Data không được null');
      }

      return createHmac('sha512', key)
        .update(data, 'utf8')
        .digest('hex');
    } catch (error) {
      throw new Error('Lỗi tạo chữ ký VNPAY', {
        cause: error,
      });
    }
  }

  getCurrentIp(request: Request): string {
    let ip = request.header('X-Forwarded-For');

    if (
      ip === undefined ||
      ip === null ||
      ip.length === 0 ||
      ip.toLowerCase() === 'unknown'
    ) {
      ip = request.ip;
    }

    if (ip === '0:0:0:0:0:0:0:1' || ip === '::1') {
      ip = '127.0.0.1';
    }

    return ip ?? '';
  }
}
