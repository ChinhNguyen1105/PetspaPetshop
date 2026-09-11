import { Injectable } from '@nestjs/common';

import { ReqCreateProductDto } from 'src/modules/catalogue/products/dto/request/req-create-product.dto';
import { ProductDto } from 'src/modules/catalogue/products/dto/response/product.dto';
import { Product } from 'src/modules/catalogue/products/entities/product.entity';

@Injectable()
export class ProductMapper {
  toProduct(reqCreateProduct: ReqCreateProductDto): Product {
    const product = new Product();

    product.name = reqCreateProduct.name;
    product.description = reqCreateProduct.description;
    product.price = reqCreateProduct.price;

    return product;
  }

  toProductDto(product: Product): ProductDto {
    const dto = new ProductDto();

    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.price = product.price;

    dto.categoryId = product.category?.id ?? null;
    dto.categoryName = product.category?.name ?? null;
    dto.stockQuantity = product.inventory?.quantity ?? null;

    dto.createdDate = product.createdDate;
    dto.lastModifiedDate = product.lastModifiedDate;

    return dto;
  }

  productDtos(products: Product[]): ProductDto[] {
    return products.map((product) => this.toProductDto(product));
  }
}
