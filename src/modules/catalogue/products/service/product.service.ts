import { ResultPaginationDto } from 'src/common/dto/pagination/result-pagination.dto';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';
import { ReqCreateProductDto } from 'src/modules/catalogue/products/dto/request/req-create-product.dto';
import { ReqUpdateProductDto } from 'src/modules/catalogue/products/dto/request/req-update-product.dto';
import { ProductDto } from 'src/modules/catalogue/products/dto/response/product.dto';

export interface ProductService {
  createProduct(
    reqCreateProduct: ReqCreateProductDto,
  ): Promise<ProductDto>;

  updateProduct(
    reqUpdateProduct: ReqUpdateProductDto,
  ): Promise<ProductDto>;

  deleteProduct(id: number): Promise<CommonResponseDto>;

  getProductById(id: number): Promise<ProductDto>;

  getAllProduct(
    filter: string[],
    page: number,
    pageSize: number,
  ): Promise<ResultPaginationDto>;

  getRecommendedProductIds(
    productIds: number[],
  ): Promise<number[]>;
}
