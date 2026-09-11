import {
  IsDefined,
} from 'class-validator';

export class ReqUpdateServiceDto {
  @IsDefined({ message: 'Service ID is required' })
  id: number;

  name: string | null;

  description: string | null;

  basePrice: number | null;

  durationMin: number | null;

  categoryId: number | null;
}
