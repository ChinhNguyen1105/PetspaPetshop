import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { ReqUserUpdateProfileDto } from 'src/modules/users/dto/request/req-user-update-profile.dto';
import { UserCreateDto } from 'src/modules/users/dto/request/user-create.dto';
import { UserUpdateDto } from 'src/modules/users/dto/request/user-update.dto';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { UserDto } from 'src/modules/users/dto/response/user.dto';
import { User } from 'src/modules/users/entities/user.entity';

export interface UserService {
  getUserById(userId: string): Promise<UserDto>;

  createUser(userCreateDto: UserCreateDto): Promise<UserDto>;

  updateUser(userUpdateDto: UserUpdateDto): Promise<UserDto>;

  deleteUser(id: string): Promise<CommonResponseDto>;

  getAllUser(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;

  changeUserStatus(id: string): Promise<CommonResponseDto>;

  getUserLogin(): Promise<User>;

  getUserByEmail(email: string): Promise<User>;

  updateUserToken(token: string | null, email: string): Promise<void>;

  getUserWithRoleAndPermissions(id: string): Promise<User>;

  addAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<CommonResponseDto>;

  updateProfile(
    reqUserUpdateProfile: ReqUserUpdateProfileDto,
  ): Promise<UserDto>;

  getUserProfile(): Promise<UserDto>;
}
