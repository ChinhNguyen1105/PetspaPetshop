import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { AddToCartDto, CheckoutDto } from './dtos/commerce.dto';
import { CatalogueService } from '../catalogue/catalogue.service';

@Injectable()
export class CommerceService {
  private readonly logger = new Logger(CommerceService.name);

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    private catalogueService: CatalogueService,
  ) {}

  // ===== CART METHODS =====
  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId, isActive: true },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        isActive: true,
      });
      await this.cartRepository.save(cart);
      this.logger.log(`Cart created for user: ${userId}`);
    }

    return cart;
  }

  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.catalogueService.getProductById(
      addToCartDto.productId,
    );

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Check if product already in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId: addToCartDto.productId },
    });

    if (cartItem) {
      cartItem.quantity += addToCartDto.quantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
        price: product.price,
      });
    }

    const saved = await this.cartItemRepository.save(cartItem);
    this.logger.log(
      `Product added to cart - User: ${userId}, Product: ${addToCartDto.productId}`,
    );
    return saved;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const items = await this.cartItemRepository.find({
      where: { cartId: cart.id },
      relations: ['product'],
    });

    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      cart,
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      totalPrice,
    };
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartItem | null> {
    const cart = await this.getOrCreateCart(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new BadRequestException('Cart item not found');
    }

    if (quantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
      this.logger.log(`Cart item removed: ${cartItemId}`);
      return null;
    }

    cartItem.quantity = quantity;
    const updated = await this.cartItemRepository.save(cartItem);
    this.logger.log(`Cart item updated: ${cartItemId}`);
    return updated;
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new BadRequestException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);
    this.logger.log(`Cart item removed: ${cartItemId}`);
  }

  // ===== ORDER METHODS =====
  async createOrder(userId: string, checkoutDto: CheckoutDto): Promise<Order> {
    const cart = await this.getOrCreateCart(userId);

    // Get selected cart items
    const cartItems = await this.cartItemRepository
      .createQueryBuilder('item')
      .whereInIds(checkoutDto.cartItemIds)
      .leftJoinAndSelect('item.product', 'product')
      .getMany();

    if (cartItems.length === 0) {
      throw new BadRequestException('No items selected for checkout');
    }

    // Verify all items belong to user's cart
    if (!cartItems.every((item) => item.cartId === cart.id)) {
      throw new BadRequestException('Invalid cart items');
    }

    // Calculate total price and verify stock
    let totalPrice = 0;
    for (const cartItem of cartItems) {
      const product = await this.catalogueService.getProductById(
        cartItem.productId,
      );
      if (product.stock < cartItem.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`,
        );
      }
      totalPrice += cartItem.price * cartItem.quantity;
    }

    // Create order
    const order = this.orderRepository.create({
      userId,
      totalPrice,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: checkoutDto.paymentMethod,
      notes: checkoutDto.notes,
      shippingAddressSnapshot: checkoutDto.shippingAddressId, // TODO: fetch actual address
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    for (const cartItem of cartItems) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceAtPurchase: cartItem.price,
      });
      await this.orderItemRepository.save(orderItem);

      // Remove from cart
      await this.cartItemRepository.remove(cartItem);
    }

    // Record status history
    const statusHistory = this.orderStatusHistoryRepository.create({
      order: savedOrder,
      oldStatus: undefined,
      newStatus: 'PENDING',
      changedBy: 'SYSTEM',
    });
    await this.orderStatusHistoryRepository.save(statusHistory);

    this.logger.log(`Order created: ${savedOrder.id} for user: ${userId}`);
    return savedOrder;
  }

  async getOrderById(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items', 'items.product', 'statusHistory'],
    });

    if (!order) {
      throw new BadRequestException(
        'Order not found or does not belong to you',
      );
    }

    return order;
  }

  async getUserOrders(userId: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      relations: ['items', 'items.product'],
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { orders, total };
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    reason?: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['statusHistory'],
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const oldStatus = order.status;
    order.status = newStatus;

    await this.orderRepository.save(order);

    // Record status change
    await this.orderStatusHistoryRepository.save({
      orderId,
      oldStatus,
      newStatus,
      reason,
      changedBy: 'ADMIN',
    });

    this.logger.log(
      `Order status updated: ${orderId} from ${oldStatus} to ${newStatus}`,
    );
    return order;
  }
}
