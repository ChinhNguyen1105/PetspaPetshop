import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';

import { CategoryDto } from 'src/modules/catalogue/categories/dto/response/category.dto';
import { CategoryQueryDto } from 'src/modules/catalogue/categories/dto/request/category-query.dto';
import { ReqCreateCategoryDto } from 'src/modules/catalogue/categories/dto/request/req-create-category.dto';
import { ReqUpdateCategoryDto } from 'src/modules/catalogue/categories/dto/request/req-update-category.dto';

import { Category } from 'src/modules/catalogue/categories/entities/category.entity';

export interface CategoryService {
  createCategory(req: ReqCreateCategoryDto): Promise<CategoryDto>;

  updateCategory(req: ReqUpdateCategoryDto): Promise<CategoryDto>;

  deleteCategory(id: number): Promise<CommonResponseDto>;

  getCategories(query: CategoryQueryDto): Promise<ResultPaginationDto>;

  getCategoryDetail(id: number): Promise<CategoryDto>;

  getCategoryById(id: number): Promise<Category>;
}
