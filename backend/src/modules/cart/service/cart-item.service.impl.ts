import { Inject, Injectable, Logger } from '@nestjs/common';

import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { CommonResponseDto } from 'src/common/dto/common/common-response.dto';

import { ReqAddCartItemDto } from 'src/modules/cart/dto/request/req-add-cart-item.dto';
import { ReqUpdateCartItemDto } from 'src/modules/cart/dto/request/req-update-cart-item.dto';
import { CartItemDto } from 'src/modules/cart/dto/response/cart-item.dto';

import { CartItem } from 'src/modules/cart/entities/cart-item.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';

import { CartItemMapper } from 'src/modules/cart/mapper/cart-item.mapper';

import { CartItemRepository } from 'src/modules/cart/repositories/cart-item.repository';
import { CartRepository } from 'src/modules/cart/repositories/cart.repository';

import { InventoryRepository } from 'src/modules/inventory/repositories/inventory.repository';

import { ProductRepository } from 'src/modules/catalogue/products/repositories/product.repository';

import { UserRepository } from 'src/modules/users/repositories/user.repository';
import type { UserService } from 'src/modules/users/service/user.service';

import type { CartItemService } from 'src/modules/cart/service/cart-item.service';
import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
@Injectable()
export class CartItemServiceImpl implements CartItemService {
  private readonly logger = new Logger(CartItemServiceImpl.name);

  constructor(
    private readonly cartItemRepository: CartItemRepository,

    private readonly productRepository: ProductRepository,

    @Inject(PROVIDER_TOKEN.USER_SERVICE)
    private readonly userService: UserService,

    private readonly cartRepository: CartRepository,

    private readonly inventoryRepository: InventoryRepository,

    private readonly cartItemMapper: CartItemMapper,

    private readonly userRepository: UserRepository,
  ) {}

  async addCartItem(reqAddCartItem: ReqAddCartItemDto): Promise<CartItemDto> {
    this.logger.log(
      `[CART] Thêm sản phẩm ID: ${reqAddCartItem.productId} vào giỏ hàng`,
    );

    const currentUser = await this.userService.getUserLogin();

    let cart = await this.cartRepository.findByUserId(currentUser.id);

    if (!cart) {
      this.logger.log(
        `[CART] User ID: ${currentUser.id} chưa có giỏ hàng, tạo mới`,
      );

      const newCart = new Cart();
      newCart.user = currentUser;

      currentUser.cart = newCart;

      await this.userRepository.getRepository().save(currentUser);

      cart = await this.cartRepository.getRepository().save(newCart);
    }

    const product = await this.productRepository.getRepository().findOne({
      where: {
        id: reqAddCartItem.productId,
      },
      relations: {
        productImages: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product not found with ID: ${reqAddCartItem.productId}`,
      );
    }

    const inventory = await this.inventoryRepository.findByProductId(
      reqAddCartItem.productId,
    );

    if (!inventory) {
      throw new NotFoundException(
        `Inventory not found with Product ID: ${reqAddCartItem.productId}`,
      );
    }

    const inventoryQuantity = inventory.quantity ?? 0;

    if (inventoryQuantity < reqAddCartItem.quantity) {
      throw new BadRequestException(
        `Inventory quantity is not enough: ${inventoryQuantity}`,
      );
    }

    let cartItem = await this.cartItemRepository.findByCartIdAndProductId(
      cart.id,
      product.id,
    );

    if (cartItem) {
      const currentQuantity = cartItem.quantity ?? 0;

      const newQty = currentQuantity + reqAddCartItem.quantity;

      if (inventoryQuantity < newQty) {
        throw new BadRequestException(
          `Inventory quantity is not enough: ${inventoryQuantity}`,
        );
      }

      this.logger.log(
        `[CART] Cộng dồn quantity ${currentQuantity} → ${newQty}`,
      );

      cartItem.quantity = newQty;
    } else {
      this.logger.log(
        `[CART] Tạo mới CartItem cho Product ID: ${reqAddCartItem.productId}`,
      );

      cartItem = new CartItem();
      cartItem.cart = cart;
      cartItem.product = product;
      cartItem.quantity = reqAddCartItem.quantity;
    }

    await this.cartItemRepository.getRepository().save(cartItem);

    this.logger.log(
      `[CART] Lưu CartItem thành công | Product ID: ${reqAddCartItem.productId} | Quantity: ${cartItem.quantity}`,
    );

    return this.cartItemMapper.toDto(cartItem);
  }

  async updateCartItem(req: ReqUpdateCartItemDto): Promise<CartItemDto> {
    this.logger.log(
      `[CART] Cập nhật CartItem ID: ${req.itemId} | Quantity mới: ${req.quantity}`,
    );

    const cartItem = await this.cartItemRepository.getRepository().findOne({
      where: {
        id: req.itemId,
      },
      relations: {
        cart: {
          user: true,
        },
        product: {
          productImages: true,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`CartItem not found with ID: ${req.itemId}`);
    }

    const currentUser = await this.userService.getUserLogin();

    if (cartItem.cart?.user?.id !== currentUser.id) {
      throw new ForbiddenException(
        'You do not have permission to update this cart item',
      );
    }

    if (req.quantity === 0) {
      await this.cartItemRepository.getRepository().remove(cartItem);

      return null as unknown as CartItemDto;
    }

    const inventory = await this.inventoryRepository.findByProductId(
      cartItem.product.id,
    );

    if (!inventory) {
      throw new NotFoundException(
        `Inventory not found with Product ID: ${cartItem.product.id}`,
      );
    }

    const inventoryQuantity = inventory.quantity ?? 0;

    if (inventoryQuantity < req.quantity) {
      throw new BadRequestException(
        `Inventory quantity is not enough: ${inventoryQuantity}`,
      );
    }

    cartItem.quantity = req.quantity;

    await this.cartItemRepository.getRepository().save(cartItem);

    this.logger.log(`[CART] Cập nhật thành công CartItem ID: ${req.itemId}`);

    return this.cartItemMapper.toDto(cartItem);
  }

  async deleteCartItem(itemId: number): Promise<CommonResponseDto> {
    this.logger.log(`[CART] Xóa CartItem ID: ${itemId}`);

    const cartItem = await this.cartItemRepository.getRepository().findOne({
      where: {
        id: itemId,
      },
      relations: {
        cart: {
          user: true,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`CartItem not found with ID: ${itemId}`);
    }

    const currentUser = await this.userService.getUserLogin();

    if (cartItem.cart?.user?.id !== currentUser.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this cart item',
      );
    }

    await this.cartItemRepository.getRepository().remove(cartItem);

    this.logger.log(`[CART] Xóa thành công CartItem ID: ${itemId}`);

    return {
      status: true,
      message: 'Delete cart item successfully',
    };
  }
}
