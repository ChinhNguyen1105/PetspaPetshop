import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import {
  UpdateUserProfileDto,
  CreateRoleDto,
  CreatePermissionDto,
} from './dtos/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<User> {
    const user = await this.getUserById(userId);

    if (updateUserProfileDto.fullName) {
      user.fullName = updateUserProfileDto.fullName;
    }
    if (updateUserProfileDto.phoneNumber) {
      user.phoneNumber = updateUserProfileDto.phoneNumber;
    }

    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`User profile updated: ${userId}`);
    return updatedUser;
  }

  async getAllUsers(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { users, total };
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new BadRequestException('Role already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    const savedRole = await this.roleRepository.save(role);
    this.logger.log(`Role created: ${savedRole.id}`);
    return savedRole;
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new BadRequestException('Role not found');
    }
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code },
    });

    if (existingPermission) {
      throw new BadRequestException('Permission already exists');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    const savedPermission = await this.permissionRepository.save(permission);
    this.logger.log(`Permission created: ${savedPermission.id}`);
    return savedPermission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<Role> {
    const role = await this.getRoleById(roleId);
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new BadRequestException('Permission not found');
    }

    if (!role.permissions) {
      role.permissions = [];
    }

    if (!role.permissions.find((p) => p.id === permissionId)) {
      role.permissions.push(permission);
      await this.roleRepository.save(role);
      this.logger.log(`Permission ${permissionId} assigned to role ${roleId}`);
    }

    return role;
  }
}
