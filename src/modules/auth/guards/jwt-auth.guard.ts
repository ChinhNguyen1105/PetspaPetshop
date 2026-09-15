import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Các route không yêu cầu JWT.
  private readonly publicRoutes = [
    { path: '/api/v1/auth/register', method: 'POST' },
    { path: '/api/v1/auth/login', method: 'POST' },

    { path: '/api/v1/categories', method: 'GET', prefix: true },
    { path: '/api/v1/services', method: 'GET', prefix: true },
    { path: '/api/v1/menus', method: 'GET', prefix: true },
    { path: '/api/v1/products', method: 'GET', prefix: true },
    { path: '/api/v1/product-images', method: 'GET', prefix: true },
    { path: '/upload', method: 'GET', prefix: true },

    { path: '/api/v1/bookings/occupied-times', method: 'GET' },
    { path: '/api/v1/service-images/service', method: 'GET', prefix: true },

    { path: '/api/v1/payment/vnpay/return', method: 'ALL' },
  ];

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // Browser gửi OPTIONS trước POST/PUT/PATCH... để kiểm tra CORS.
    // Không được yêu cầu JWT cho preflight request.
    if (request.method === 'OPTIONS') {
      return true;
    }

    const isPublic = this.publicRoutes.some((route) => {
      const pathMatches = route.prefix
        ? request.path.startsWith(route.path)
        : request.path === route.path;

      const methodMatches =
        route.method === 'ALL' || request.method === route.method;

      return pathMatches && methodMatches;
    });

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          success: false,
          message: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!',
        })
      );
    }

    return user;
  }
}
