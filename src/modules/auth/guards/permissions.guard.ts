import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách quyền yêu cầu từ Decorator gắn trên Controller/Route
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Nếu endpoint không yêu cầu quyền cụ thể, cho phép đi qua
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    
    // Lấy thông tin user đã được JwtAuthGuard đính kèm vào Request
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.role || !user.role.permissions) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này!');
    }
    
    // Ánh xạ danh sách mã quyền của user
    const userPermissions = user.role.permissions.map((p: any) => p.permissionName);
    
    // Kiểm tra user có ít nhất 1 quyền khớp với yêu cầu không
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasPermission) {
      throw new ForbiddenException('Bạn không có đủ quyền thực hiện thao tác này!');
    }
    
    return true;
  }
}
