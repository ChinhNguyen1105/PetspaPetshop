
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class ReqCreateBookingDto {
  @IsDefined({ message: 'User ID is required' })
  userId: string;

  @IsArray({ message: 'Service list must be an array' })
  @IsNotEmpty({ message: 'Service list cannot be empty' })
  serviceIds: number[];

  @IsDefined({ message: 'Booking date is required' })
  bookingDate: Date;

  @IsDefined({ message: 'Start time is required' })
  startTime: string;

  @IsDefined({ message: 'End time is required' })
  endTime: string;

  @IsOptional()
  @IsNumber({}, { message: 'Pet ID must be a number' })
  petId: number | null;
}

