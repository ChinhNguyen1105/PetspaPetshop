import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CheckoutDto {
  @IsArray()
  @IsNotEmpty()
  cartItemIds: string[]; // Selected cart item IDs

  @IsString()
  @IsNotEmpty()
  shippingAddressId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // VNPAY, COD

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  items: Array<{
    productId: string;
    quantity: number;
  }>;

  @IsString()
  @IsNotEmpty()
  shippingAddressId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}

export class OrderFilterDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  paymentStatus?: string;
}
