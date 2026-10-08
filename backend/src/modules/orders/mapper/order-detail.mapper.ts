import { Injectable } from '@nestjs/common';

import { OrderDetail } from 'src/modules/orders/entities/order-detail.entity';
import { OrderDetailDto } from 'src/modules/orders/dto/response/order-detail.dto';
import { ProductImage } from 'src/modules/catalogue/products/entities/product-image.entity';

@Injectable()
export class OrderDetailMapper {
  toDto(orderDetail: OrderDetail): OrderDetailDto {
    const dto = new OrderDetailDto();

    dto.id = orderDetail.id;
    dto.quantity = orderDetail.quantity;
    dto.unitPrice = orderDetail.unitPrice;

    dto.productId = orderDetail.product?.id ?? null;
    dto.productName = orderDetail.product?.name ?? null;

    dto.productImage = this.getMainImageUrl(
      orderDetail.product?.productImages ?? [],
    );

    if (
      orderDetail.unitPrice != null &&
      orderDetail.quantity != null
    ) {
      dto.totalAmount =
        Number(orderDetail.unitPrice) * Number(orderDetail.quantity);
    } else {
      dto.totalAmount = null;
    }

    return dto;
  }

  toDtos(orderDetails: OrderDetail[]): OrderDetailDto[] {
    return orderDetails.map((orderDetail) => this.toDto(orderDetail));
  }

  private getMainImageUrl(
    productImages: ProductImage[],
  ): string | null {
    if (productImages.length === 0) {
      return null;
    }

    return (
      productImages.find(
        (image) =>
          image.isThumbnail === true &&
          image.imageUrl != null,
      )?.imageUrl ??
      productImages[0].imageUrl ??
      null
    );
  }
}
