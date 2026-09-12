import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Tương đương cấu hình auth.requestMatchers(...).permitAll() trong Spring
  private readonly publicRoutes = [
    { path: '/api/v1/auth/register', method: 'POST' },
    { path: '/api/v1/auth/login', method: 'POST' },
    { path: '/api/v1/categories', method: 'GET', prefix: true },
    { path: '/api/v1/services', method: 'GET', prefix: true },
    { path: '/api/v1/menus', method: 'GET', prefix: true },
    { path: '/api/v1/products', method: 'GET', prefix: true },
    { path: '/api/v1/product-images', method: 'GET', prefix: true },
    { path: '/upload', method: 'GET', prefix: true },
    { path: '/api/v1/bookings/booked-times', method: 'GET' },
    { path: '/api/v1/pet-service-images/service-images', method: 'GET' },
    { path: '/api/v1/payments/handle-return', method: 'ALL' }, // Public Payment callback
  ];

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Kiểm tra xem request hiện tại có khớp với các public routes không
    const isPublic = this.publicRoutes.some(route => {
      const pathMatches = route.prefix 
        ? request.path.startsWith(route.path)
        : request.path === route.path;
        
      const methodMatches = route.method === 'ALL' || request.method === route.method;
      
      return pathMatches && methodMatches;
    });

    // Nếu khớp -> Bỏ qua bước kiểm tra Token (permitAll)
    if (isPublic) {
      return true; 
    }

    // Các request còn lại bắt buộc phải đi qua logic xác thực Token
    // Tương đương: auth.anyRequest().authenticated() & addFilterBefore(jwtPreFilter)
    return super.canActivate(context);
  }

  // Tương đương exceptionHandling().authenticationEntryPoint(jwtCustomAuthenticationEntryPoint)
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException({
        success: false,
        message: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!',
      });
    }
    return user;
  }
}
