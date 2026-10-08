import {
  IsNotEmpty,
} from 'class-validator';

export class ReqRecommendationDto {
  @IsNotEmpty({ message: 'Item ids are required' })
  itemIds: number[];
}
