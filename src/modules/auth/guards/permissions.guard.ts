import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';

import { Request } from 'express';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { UserPrincipal } from 'src/modules/auth/security/user-principal';

import type { PermissionService } from 'src/modules/permissions/service/permission.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
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

  constructor(
    @Inject(PROVIDER_TOKEN.PERMISSION_SERVICE)
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

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

    const user = request.user as UserPrincipal | undefined;

    if (!user) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này!',
      );
    }

    const routePath = request.route?.path;

    if (!routePath) {
      return true;
    }

    const apiPath = this.normalizeApiPath(routePath);
    const method = request.method;
    const authorities = user.getAuthorities() ?? [];

    // ADMIN được phép truy cập mọi endpoint.
    if (authorities.includes('ADMIN')) {
      return true;
    }

    const permission = await this.permissionService.findByApiPathAndMethod(
      apiPath,
      method,
    );

    if (!permission) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này!',
      );
    }

    const hasPermission =
      permission.name !== null && authorities.includes(permission.name);

    if (!hasPermission) {
      throw new ForbiddenException(
        'Bạn không có đủ quyền thực hiện thao tác này!',
      );
    }

    return true;
  }

  private normalizeApiPath(routePath: string): string {
    if (routePath.startsWith('/api/v1')) {
      return routePath;
    }

    return `/api/v1${routePath.startsWith('/') ? '' : '/'}${routePath}`;
  }
}
