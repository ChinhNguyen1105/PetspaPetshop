export class CartItemDto {
  id: number;

  quantity: number;

  productId: number | null;
  productName: string | null;
  productPrice: number | null;
  productImage: string | null;

  totalPrice: number | null;
}
