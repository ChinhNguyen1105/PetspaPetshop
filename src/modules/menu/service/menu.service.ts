import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { ReqForMenuDto } from 'src/modules/menu/dto/request/req-for-menu.dto';
import { MenuDto } from 'src/modules/menu/dto/response/menu.dto';

export interface MenuService {
  createMenu(req: ReqForMenuDto): Promise<MenuDto>;

  updateMenu(req: ReqForMenuDto, id: number): Promise<MenuDto>;

  deleteMenu(id: number): Promise<CommonResponseDto>;

  getMenuById(id: number): Promise<MenuDto>;

  getMenuTree(): Promise<MenuDto[]>;

  getActiveMenus(): Promise<MenuDto[]>;

  getAllMenus(
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;
}
