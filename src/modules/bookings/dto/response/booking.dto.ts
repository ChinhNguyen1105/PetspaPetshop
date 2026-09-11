import { BookingStatus } from 'src/common/constants/booking-status.enum';
import { BookingDetailDto } from 'src/modules/bookings/dto/response/booking-detail.dto';

export class BookingDto {
  id: number;

  userId: string | null;
  userName: string | null;

  status: BookingStatus | null;
  actualPrice: number | null;
  bookingDate: Date | null;
  startTime: string | null;
  endTime: string | null;

  petId: number | null;
  petName: string | null;

  bookingDetails: BookingDetailDto[];

  createdDate: Date;
  lastModifiedDate: Date;

  orderId: number | null;
}
