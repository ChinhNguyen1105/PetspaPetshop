import {
  IsDefined,
  IsNotEmpty,
} from 'class-validator';

export class ReqCreateBookingDto {
  @IsDefined({ message: 'User ID is required' })
  userId: string;

  @IsNotEmpty({ message: 'Service list cannot be empty' })
  serviceIds: number[];

  @IsDefined({ message: 'Booking date is required' })
  bookingDate: Date;

  @IsDefined({ message: 'Start time is required' })
  startTime: string;

  @IsDefined({ message: 'End time is required' })
  endTime: string;

  petId: number | null;
}
