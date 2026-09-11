import { Injectable } from '@nestjs/common';

import { CartItem } from 'src/modules/cart/entities/cart-item.entity';
import { CartItemDto } from 'src/modules/cart/dto/response/cart-item.dto';
import { ProductImage } from 'src/modules/catalogue/products/entities/product-image.entity';

@Injectable()
export class CartItemMapper {
  toDto(cartItem: CartItem): CartItemDto {
    const dto = new CartItemDto();

    dto.id = cartItem.id;
    dto.quantity = cartItem.quantity;

    dto.productId = cartItem.product?.id ?? null;
    dto.productName = cartItem.product?.name ?? null;
    dto.productPrice = cartItem.product?.price ?? null;

    dto.productImage = this.getMainImageUrl(
      cartItem.product?.productImages ?? [],
    );

    if (
      cartItem.product?.price != null &&
      cartItem.quantity != null
    ) {
      dto.totalPrice =
        Number(cartItem.product.price) * Number(cartItem.quantity);
    } else {
      dto.totalPrice = null;
    }

    return dto;
  }

  private getMainImageUrl(
    productImages: ProductImage[],
  ): string | null {
    if (productImages == null) {
      return null;
    }

    return (
      productImages.find(
        (img) => img.isThumbnail === true && img.imageUrl != null,
      )?.imageUrl ?? null
    );
  }
}
