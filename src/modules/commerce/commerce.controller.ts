import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommerceService } from './commerce.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  CheckoutDto,
} from './dtos/commerce.dto';
import { ResponseDto, ListResponseDto } from '../../common/dtos/response.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly commerceService: CommerceService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@Req() req): Promise<ResponseDto<any>> {
    const result = await this.commerceService.getCart(req.user.sub);
    return new ResponseDto('SUCCESS', 'Cart retrieved', result);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addToCart(
    @Req() req,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<ResponseDto<any>> {
    const item = await this.commerceService.addToCart(
      req.user.sub,
      addToCartDto,
    );
    return new ResponseDto('SUCCESS', 'Product added to cart', {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    });
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateCartItem(
    @Req() req,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<ResponseDto<any>> {
    const item = await this.commerceService.updateCartItem(
      req.user.sub,
      id,
      updateCartItemDto.quantity,
    );
    if (!item) {
      return new ResponseDto('SUCCESS', 'Cart item updated', null);
    }
    return new ResponseDto('SUCCESS', 'Cart item updated', {
      id: item.id,
      quantity: item.quantity,
    });
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async removeFromCart(
    @Req() req,
    @Param('id') id: string,
  ): Promise<ResponseDto<null>> {
    await this.commerceService.removeFromCart(req.user.sub, id);
    return new ResponseDto('SUCCESS', 'Item removed from cart', null);
  }
}

@Controller('orders')
export class OrderController {
  constructor(private readonly commerceService: CommerceService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async checkout(
    @Req() req,
    @Body() checkoutDto: CheckoutDto,
  ): Promise<ResponseDto<any>> {
    const order = await this.commerceService.createOrder(
      req.user.sub,
      checkoutDto,
    );
    return new ResponseDto('SUCCESS', 'Order created successfully', {
      id: order.id,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserOrders(
    @Req() req,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<ListResponseDto<any>> {
    const { orders, total } = await this.commerceService.getUserOrders(
      req.user.sub,
      page,
      pageSize,
    );

    return new ListResponseDto(
      orders.map((o) => ({
        id: o.id,
        totalPrice: o.totalPrice,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
      page,
      pageSize,
      total,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(
    @Req() req,
    @Param('id') id: string,
  ): Promise<ResponseDto<any>> {
    const order = await this.commerceService.getOrderById(id, req.user.sub);
    return new ResponseDto('SUCCESS', 'Order retrieved', {
      id: order.id,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.product?.name,
        quantity: item.quantity,
        price: item.priceAtPurchase,
        subtotal: item.priceAtPurchase * item.quantity,
      })),
      statusHistory: order.statusHistory,
      createdAt: order.createdAt,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ): Promise<ResponseDto<any>> {
    const order = await this.commerceService.updateOrderStatus(
      id,
      body.status,
      body.reason,
    );
    return new ResponseDto('SUCCESS', 'Order status updated', {
      id: order.id,
      status: order.status,
      updatedAt: order.updatedAt,
    });
  }
}
