import {
  IsDefined,
} from 'class-validator';

export class ReqBookingDateDto {
  @IsDefined({ message: 'Booking date is required' })
  bookingDate: Date;
}
