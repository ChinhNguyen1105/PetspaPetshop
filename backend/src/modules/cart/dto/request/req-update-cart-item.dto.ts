import {
  IsDefined,
  IsInt,
  Min,
} from 'class-validator';

export class ReqUpdateCartItemDto {
  @IsDefined({ message: 'Item ID is required' })
  itemId: number;

  @IsDefined({ message: 'Quantity is required' })
  @IsInt()
  @Min(0, { message: 'Số lượng tối thiểu là 1' })
  quantity: number;
}
