import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { CategoryDto } from 'src/modules/catalogue/categories/dto/response/category.dto';
import { ReqCreateCategoryDto } from 'src/modules/catalogue/categories/dto/req-create-category.dto';
import { ReqUpdateCategoryDto } from 'src/modules/catalogue/categories/dto/request/req-update-category.dto';
import { Category } from 'src/modules/catalogue/categories/entities/category.entity';

export interface CategoryService {
  createCategory(req: ReqCreateCategoryDto): Promise<CategoryDto>;

  updateCategory(req: ReqUpdateCategoryDto): Promise<CategoryDto>;

  deleteCategory(id: number): Promise<CommonResponseDto>;

  getCategories(): Promise<CategoryDto[]>;

  getCategoryDetail(id: number): Promise<CategoryDto>;

  getCategoryById(id: number): Promise<Category>;
}
