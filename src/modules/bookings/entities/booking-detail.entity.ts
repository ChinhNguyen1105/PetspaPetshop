import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Booking } from './booking.entity';
import { PetService } from '../../catalogue/services/entities/pet-service.entity';

@Entity('tbl_booking_details')
export class BookingDetail {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @ManyToOne(
    () => Booking,
    (booking) => booking.bookingDetails,
  )
  @JoinColumn({
    name: 'booking_id',
  })
  booking: Booking;

  @ManyToOne(
    () => PetService,
    (service) => service.bookingDetails,
  )
  @JoinColumn({
    name: 'service_id',
  })
  service: PetService;
}
